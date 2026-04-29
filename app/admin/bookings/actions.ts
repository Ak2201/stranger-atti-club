'use server';

import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { logAction } from '@/lib/audit';

/**
 * Permanently delete a booking row. Super-admin only.
 * Different from cancel/refund — those preserve the row for audit/refund history.
 * Use this only to expunge bad-data rows.
 */
export async function deleteBookingAction(bookingId: string) {
  const actor = await requireSuperAdmin();
  const row = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingId))
    .get();

  if (!row) {
    await logAction(
      'booking.delete',
      bookingId,
      { actor: actor.email, reason: 'not_found' },
      'error'
    );
    return { ok: false, error: 'Booking not found.' };
  }

  await db.delete(schema.bookings).where(eq(schema.bookings.id, bookingId));
  await logAction('booking.delete', bookingId, {
    actor: actor.email,
    eventSlug: row.eventSlug,
    contactName: row.contactName,
    amountInr: row.amountInr,
  });

  revalidatePath('/admin/bookings');
  revalidatePath('/admin/refunds');
  revalidatePath(`/admin/events/${row.eventSlug}/attendees`);
  return { ok: true };
}
