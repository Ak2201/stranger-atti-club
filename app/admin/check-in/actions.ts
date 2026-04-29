'use server';

import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-helpers';
import { logAction } from '@/lib/audit';
import { parseQrPayload, verifyBookingSignature } from '@/lib/qr';

export type CheckInResult =
  | {
      ok: true;
      bookingId: string;
      attendeeName: string;
      tier: string;
      eventSlug: string;
      checkedInAt: number;
      alreadyCheckedIn?: boolean;
      previousCheckIn?: number;
    }
  | { ok: false; reason: 'invalid' | 'not_found' | 'cancelled' | 'refunded'; message: string };

async function performCheckIn(bookingId: string): Promise<CheckInResult> {
  const booking = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingId))
    .get();

  if (!booking) {
    return { ok: false, reason: 'not_found', message: 'Booking not found.' };
  }
  if (booking.status === 'cancelled') {
    return {
      ok: false,
      reason: 'cancelled',
      message: 'Booking cancelled — escalate to host.',
    };
  }
  if (booking.status === 'refunded') {
    return {
      ok: false,
      reason: 'refunded',
      message: 'Booking refunded — entry rejected.',
    };
  }

  if (booking.checkedInAt) {
    return {
      ok: true,
      bookingId: booking.id,
      attendeeName: booking.contactName,
      tier: booking.tierId,
      eventSlug: booking.eventSlug,
      checkedInAt: Number(booking.checkedInAt),
      alreadyCheckedIn: true,
      previousCheckIn: Number(booking.checkedInAt),
    };
  }

  const now = new Date();
  await db
    .update(schema.bookings)
    .set({ checkedInAt: now, status: 'attended' })
    .where(eq(schema.bookings.id, booking.id));

  return {
    ok: true,
    bookingId: booking.id,
    attendeeName: booking.contactName,
    tier: booking.tierId,
    eventSlug: booking.eventSlug,
    checkedInAt: now.getTime(),
  };
}

export async function verifyAndCheckIn(qrPayload: string): Promise<CheckInResult> {
  const actor = await requireAdmin();
  const parsed = parseQrPayload(qrPayload);
  if (!parsed) {
    await logAction('checkin.qr_invalid', null, { qrPayload }, 'denied');
    return { ok: false, reason: 'invalid', message: 'QR is not a Stranger Atti Club ticket.' };
  }
  if (!verifyBookingSignature(parsed.bookingId, parsed.signature)) {
    await logAction('checkin.qr_bad_signature', parsed.bookingId, {}, 'denied');
    return { ok: false, reason: 'invalid', message: 'QR signature invalid — possibly tampered.' };
  }

  const result = await performCheckIn(parsed.bookingId);
  await logAction(
    result.ok && !result.alreadyCheckedIn
      ? 'checkin.success'
      : result.ok
        ? 'checkin.duplicate'
        : 'checkin.failed',
    parsed.bookingId,
    { actor: actor.email, reason: result.ok ? undefined : result.reason }
  );
  if (result.ok) revalidatePath('/admin/check-in');
  return result;
}

export async function manualCheckIn(bookingId: string): Promise<CheckInResult> {
  const actor = await requireAdmin();
  const result = await performCheckIn(bookingId);
  await logAction(
    result.ok && !result.alreadyCheckedIn
      ? 'checkin.manual_success'
      : 'checkin.manual_failed',
    bookingId,
    { actor: actor.email }
  );
  if (result.ok) revalidatePath('/admin/check-in');
  return result;
}

export async function undoCheckIn(bookingId: string) {
  const actor = await requireAdmin();
  await db
    .update(schema.bookings)
    .set({ checkedInAt: null, status: 'confirmed' })
    .where(eq(schema.bookings.id, bookingId));
  await logAction('checkin.undo', bookingId, { actor: actor.email });
  revalidatePath('/admin/check-in');
}

export async function bulkMarkAllConfirmedAttended(eventSlug: string) {
  const actor = await requireAdmin();
  const now = new Date();
  const rows = await db
    .select({ id: schema.bookings.id })
    .from(schema.bookings)
    .where(eq(schema.bookings.eventSlug, eventSlug))
    .all();
  let updated = 0;
  for (const r of rows) {
    const b = await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, r.id))
      .get();
    if (b?.status === 'confirmed' && !b.checkedInAt) {
      await db
        .update(schema.bookings)
        .set({ checkedInAt: now, status: 'attended' })
        .where(eq(schema.bookings.id, r.id));
      updated++;
    }
  }
  await logAction('checkin.bulk_attended', eventSlug, {
    actor: actor.email,
    updated,
  });
  revalidatePath('/admin/check-in');
  return { updated };
}
