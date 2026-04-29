'use server';

import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth-helpers';
import { logAction } from '@/lib/audit';
import { razorpayRefund } from '@/lib/refunds';
import { activeRedemptionTotal } from '@/lib/coupons';

/** Admin can flag a booking for refund (mark cancelled), but not actually refund. */
export async function cancelBooking(bookingId: string) {
  const actor = await requireAdmin();

  // Block if any active redemptions exist (decision #1: block refunds once redeemed).
  const total = await activeRedemptionTotal(bookingId);
  if (total > 0) {
    await logAction(
      'booking.cancel',
      bookingId,
      { actor: actor.email, blocked: 'redemption_exists', total },
      'denied'
    );
    return {
      ok: false as const,
      error: `Cannot cancel — ₹${total} of bar credit already redeemed. Void all redemptions first.`,
    };
  }

  await db
    .update(schema.bookings)
    .set({ status: 'cancelled' })
    .where(eq(schema.bookings.id, bookingId));
  await logAction('booking.cancel', bookingId, { actor: actor.email });
  revalidatePath('/admin/refunds');
  revalidatePath('/admin/bookings');
  return { ok: true as const };
}

/** Super-admin only — calls Razorpay refund API + flips status. */
export async function initiateRefund(bookingId: string) {
  const actor = await requireSuperAdmin();

  // Block if any active redemptions exist.
  const totalRedeemed = await activeRedemptionTotal(bookingId);
  if (totalRedeemed > 0) {
    await logAction(
      'booking.refund',
      bookingId,
      {
        actor: actor.email,
        blocked: 'redemption_exists',
        total: totalRedeemed,
      },
      'denied'
    );
    return {
      ok: false as const,
      error: `Refund blocked — ₹${totalRedeemed} of bar credit redeemed. Void all redemptions first.`,
    };
  }

  const booking = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingId))
    .get();
  if (!booking) {
    await logAction(
      'booking.refund',
      bookingId,
      { actor: actor.email, reason: 'not_found' },
      'error'
    );
    return { ok: false as const, error: 'Booking not found.' };
  }

  const result = await razorpayRefund({
    paymentId: booking.razorpayPaymentId,
    amountInr: booking.amountInr,
  });

  if (!result.ok) {
    await logAction(
      'booking.refund',
      bookingId,
      { actor: actor.email, error: result.error },
      'error'
    );
    return { ok: false as const, error: result.error };
  }

  await db
    .update(schema.bookings)
    .set({ status: 'refunded', razorpayRefundId: result.refundId })
    .where(eq(schema.bookings.id, bookingId));

  await logAction('booking.refund', bookingId, {
    actor: actor.email,
    refundId: result.refundId,
    amountInr: booking.amountInr,
    demo: result.demo,
  });

  revalidatePath('/admin/refunds');
  revalidatePath('/admin/bookings');
  revalidatePath(`/admin/events/${booking.eventSlug}/attendees`);

  return { ok: true as const, refundId: result.refundId, demo: result.demo };
}
