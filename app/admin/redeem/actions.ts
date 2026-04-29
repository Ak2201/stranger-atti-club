'use server';

import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { and, eq, like, or } from 'drizzle-orm';
import { requireRedeemAccess, isSuperAdmin } from '@/lib/auth-helpers';
import { logAction } from '@/lib/audit';
import { parseQrPayload, verifyBookingSignature } from '@/lib/qr';
import {
  lookupBookingForRedeem,
  redeemBookingCredit,
  voidRedemption as voidRedemptionLib,
  type LookupResult,
  type RedeemResult,
  type VoidResult,
} from '@/lib/coupons';

/**
 * Resolve a scanned QR to a booking + balance + recent redemptions.
 * Verifies HMAC server-side before any DB read.
 */
export async function lookupFromQr(
  qrPayload: string
): Promise<LookupResult | { ok: false; reason: 'invalid_qr'; message: string }> {
  await requireRedeemAccess();
  const parsed = parseQrPayload(qrPayload);
  if (!parsed) {
    return {
      ok: false,
      reason: 'invalid_qr',
      message: 'QR is not a Stranger Atti Club ticket.',
    };
  }
  if (!verifyBookingSignature(parsed.bookingId, parsed.signature)) {
    await logAction(
      'redemption.qr_bad_signature',
      parsed.bookingId,
      {},
      'denied'
    );
    return {
      ok: false,
      reason: 'invalid_qr',
      message: 'QR signature invalid — possibly tampered.',
    };
  }
  return lookupBookingForRedeem(parsed.bookingId);
}

/** Manual lookup by booking id, name fragment, or phone last-4. */
export async function lookupBySearch(
  query: string
): Promise<LookupResult | { ok: false; reason: 'invalid_qr'; message: string }> {
  await requireRedeemAccess();
  const q = query.trim();
  if (!q) {
    return {
      ok: false,
      reason: 'invalid_qr',
      message: 'Enter a name, phone, or booking id.',
    };
  }
  // First try exact id match
  const exact = await db
    .select({ id: schema.bookings.id })
    .from(schema.bookings)
    .where(eq(schema.bookings.id, q))
    .get();
  if (exact) return lookupBookingForRedeem(exact.id);

  // Otherwise prefix on id, contains on name, contains on phone
  const candidates = await db
    .select({ id: schema.bookings.id })
    .from(schema.bookings)
    .where(
      or(
        like(schema.bookings.id, `${q}%`),
        like(schema.bookings.contactName, `%${q}%`),
        like(schema.bookings.contactPhone, `%${q}%`)
      )
    )
    .limit(2)
    .all();
  if (candidates.length === 0) {
    return {
      ok: false,
      reason: 'invalid_qr',
      message: 'No booking matches that search.',
    };
  }
  if (candidates.length > 1) {
    return {
      ok: false,
      reason: 'invalid_qr',
      message: 'Multiple bookings match — be more specific (or scan the QR).',
    };
  }
  return lookupBookingForRedeem(candidates[0].id);
}

export async function redeem(input: {
  bookingId: string;
  amountInr: number;
  note?: string;
  station?: string;
}): Promise<RedeemResult> {
  const actor = await requireRedeemAccess();
  const result = await redeemBookingCredit({
    bookingId: input.bookingId,
    amountInr: input.amountInr,
    note: input.note,
    station: input.station,
    vendorEmail: actor.email,
    vendorRole: actor.role,
  });
  await logAction(
    result.ok ? 'redemption.success' : 'redemption.rejected',
    input.bookingId,
    {
      actor: actor.email,
      amountInr: input.amountInr,
      note: input.note,
      station: input.station,
      reason: result.ok ? undefined : result.reason,
    },
    result.ok ? 'ok' : 'denied'
  );
  if (result.ok) {
    revalidatePath('/admin/redeem');
    revalidatePath('/me');
    revalidatePath(`/admin/users`);
  }
  return result;
}

export async function voidRedemption(
  redemptionId: string
): Promise<VoidResult> {
  const actor = await requireRedeemAccess();
  const result = await voidRedemptionLib({
    redemptionId,
    byEmail: actor.email,
    byRole: actor.role,
    isSuperAdmin: isSuperAdmin(actor),
  });
  await logAction(
    result.ok ? 'redemption.void' : 'redemption.void_rejected',
    redemptionId,
    { actor: actor.email, reason: result.ok ? undefined : result.reason },
    result.ok ? 'ok' : 'denied'
  );
  if (result.ok) {
    revalidatePath('/admin/redeem');
    revalidatePath('/me');
  }
  return result;
}
