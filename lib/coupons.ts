/**
 * Server-only redemption ledger for QR-bound bar/vendor credit.
 *
 * All mutations go through atomic compare-and-swap UPDATEs so two bartenders
 * scanning at the same instant cannot drive the balance negative.
 */

import { db, schema } from '@/db';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';

const SELF_VOID_WINDOW_MS = 60_000;

export type LookupResult =
  | {
      ok: true;
      booking: {
        id: string;
        eventSlug: string;
        eventName: string;
        contactName: string;
        tierId: string;
        status: string;
        couponInitialInr: number;
        couponRedeemedInr: number;
        couponRemainingInr: number;
      };
      eventCouponEnabled: boolean;
      recent: RedemptionRow[];
    }
  | {
      ok: false;
      reason:
        | 'not_found'
        | 'event_not_found'
        | 'coupons_disabled'
        | 'cancelled'
        | 'refunded'
        | 'no_credit';
      message: string;
    };

export type RedemptionRow = {
  id: string;
  bookingId: string;
  amountInr: number;
  note: string | null;
  station: string | null;
  vendorEmail: string;
  vendorRole: string;
  voidedAt: Date | null;
  voidedBy: string | null;
  voidReason: string | null;
  createdAt: Date;
};

function rowToRedemption(r: any): RedemptionRow {
  return {
    id: r.id,
    bookingId: r.bookingId,
    amountInr: r.amountInr,
    note: r.note,
    station: r.station,
    vendorEmail: r.vendorEmail,
    vendorRole: r.vendorRole,
    voidedAt: r.voidedAt ? new Date(Number(r.voidedAt)) : null,
    voidedBy: r.voidedBy,
    voidReason: r.voidReason,
    createdAt: new Date(Number(r.createdAt)),
  };
}

export async function lookupBookingForRedeem(
  bookingId: string
): Promise<LookupResult> {
  const b = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingId))
    .get();
  if (!b) {
    return { ok: false, reason: 'not_found', message: 'Booking not found.' };
  }
  const e = await db
    .select()
    .from(schema.events)
    .where(eq(schema.events.slug, b.eventSlug))
    .get();
  if (!e) {
    return {
      ok: false,
      reason: 'event_not_found',
      message: 'Event for this booking is missing.',
    };
  }
  if (b.status === 'cancelled') {
    return {
      ok: false,
      reason: 'cancelled',
      message: 'Booking cancelled — no redemption.',
    };
  }
  if (b.status === 'refunded') {
    return {
      ok: false,
      reason: 'refunded',
      message: 'Booking refunded — no redemption.',
    };
  }
  if (!e.couponEnabled) {
    return {
      ok: false,
      reason: 'coupons_disabled',
      message: 'Coupons are disabled for this event.',
    };
  }
  if ((b.couponInitialInr ?? 0) === 0) {
    return {
      ok: false,
      reason: 'no_credit',
      message: 'No bar credit on this ticket.',
    };
  }
  const recent = await listRecentRedemptions(b.id, 5);
  return {
    ok: true,
    booking: {
      id: b.id,
      eventSlug: b.eventSlug,
      eventName: e.name,
      contactName: b.contactName,
      tierId: b.tierId,
      status: b.status,
      couponInitialInr: b.couponInitialInr ?? 0,
      couponRedeemedInr: b.couponRedeemedInr ?? 0,
      couponRemainingInr:
        (b.couponInitialInr ?? 0) - (b.couponRedeemedInr ?? 0),
    },
    eventCouponEnabled: !!e.couponEnabled,
    recent,
  };
}

export async function listRecentRedemptions(
  bookingId: string,
  limit = 20
): Promise<RedemptionRow[]> {
  const rows = await db
    .select()
    .from(schema.redemptions)
    .where(eq(schema.redemptions.bookingId, bookingId))
    .orderBy(desc(schema.redemptions.createdAt))
    .limit(limit)
    .all();
  return rows.map(rowToRedemption);
}

export async function activeRedemptionTotal(
  bookingId: string
): Promise<number> {
  const r = await db
    .select({
      s: sql<number>`COALESCE(SUM(${schema.redemptions.amountInr}), 0)`,
    })
    .from(schema.redemptions)
    .where(
      and(
        eq(schema.redemptions.bookingId, bookingId),
        isNull(schema.redemptions.voidedAt)
      )
    )
    .get();
  return Number(r?.s ?? 0);
}

export type RedeemResult =
  | {
      ok: true;
      redemptionId: string;
      newRemaining: number;
    }
  | {
      ok: false;
      reason:
        | 'invalid_amount'
        | 'not_found'
        | 'cancelled'
        | 'coupons_disabled'
        | 'over_balance';
      message: string;
      remaining?: number;
    };

/**
 * Atomic redeem. Single UPDATE with CAS-style WHERE — no JS-side math.
 */
export async function redeemBookingCredit(input: {
  bookingId: string;
  amountInr: number;
  note?: string | null;
  station?: string | null;
  vendorEmail: string;
  vendorRole: string;
}): Promise<RedeemResult> {
  const amount = Math.floor(Number(input.amountInr || 0));
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      reason: 'invalid_amount',
      message: 'Amount must be a positive whole number of rupees.',
    };
  }

  // Pre-flight read so we can return precise reasons when the CAS fails.
  const lookup = await lookupBookingForRedeem(input.bookingId);
  if (!lookup.ok) {
    return {
      ok: false,
      reason:
        lookup.reason === 'not_found'
          ? 'not_found'
          : lookup.reason === 'coupons_disabled'
            ? 'coupons_disabled'
            : lookup.reason === 'cancelled' || lookup.reason === 'refunded'
              ? 'cancelled'
              : 'over_balance',
      message: lookup.message,
    };
  }

  // Atomic CAS — only succeeds if remaining can absorb the amount.
  const result = await db.run(
    sql`UPDATE booking
        SET couponRedeemedInr = couponRedeemedInr + ${amount}
        WHERE id = ${input.bookingId}
          AND status IN ('confirmed','attended')
          AND couponRedeemedInr + ${amount} <= couponInitialInr`
  );
  // libSQL returns rowsAffected on the result.
  const rowsAffected = (result as any).rowsAffected ?? 0;
  if (rowsAffected === 0) {
    // Re-read to compute the actual remaining for an accurate error
    const fresh = await db
      .select({
        i: schema.bookings.couponInitialInr,
        r: schema.bookings.couponRedeemedInr,
        s: schema.bookings.status,
      })
      .from(schema.bookings)
      .where(eq(schema.bookings.id, input.bookingId))
      .get();
    const remaining = (fresh?.i ?? 0) - (fresh?.r ?? 0);
    if (fresh?.s !== 'confirmed' && fresh?.s !== 'attended') {
      return {
        ok: false,
        reason: 'cancelled',
        message: 'Booking is not in a redeemable status.',
      };
    }
    return {
      ok: false,
      reason: 'over_balance',
      message: `Exceeds remaining balance (₹${remaining} left).`,
      remaining,
    };
  }

  // Insert ledger row
  const id = crypto.randomUUID();
  await db.insert(schema.redemptions).values({
    id,
    bookingId: input.bookingId,
    amountInr: amount,
    note: input.note ?? null,
    station: input.station ?? null,
    vendorEmail: input.vendorEmail,
    vendorRole: input.vendorRole,
    createdAt: new Date(),
  });

  const newRemaining =
    lookup.booking.couponRemainingInr - amount;
  return { ok: true, redemptionId: id, newRemaining };
}

export type VoidResult =
  | { ok: true; restored: number; bookingId: string }
  | {
      ok: false;
      reason:
        | 'not_found'
        | 'already_voided'
        | 'window_closed'
        | 'forbidden';
      message: string;
    };

/**
 * Void a redemption.
 *  - within 60s + same vendor → allowed for vendor/admin/super_admin
 *  - outside 60s OR different vendor → caller must already have super_admin
 *    (caller should call requireSuperAdmin() before invoking this for that path)
 */
export async function voidRedemption(input: {
  redemptionId: string;
  byEmail: string;
  byRole: string;
  isSuperAdmin: boolean;
}): Promise<VoidResult> {
  const row = await db
    .select()
    .from(schema.redemptions)
    .where(eq(schema.redemptions.id, input.redemptionId))
    .get();
  if (!row) {
    return { ok: false, reason: 'not_found', message: 'Redemption not found.' };
  }
  if (row.voidedAt) {
    return {
      ok: false,
      reason: 'already_voided',
      message: 'Already voided.',
    };
  }

  const ageMs = Date.now() - Number(row.createdAt);
  const sameVendor =
    row.vendorEmail.toLowerCase() === input.byEmail.toLowerCase();
  const inSelfWindow = ageMs < SELF_VOID_WINDOW_MS;
  const allowed = input.isSuperAdmin || (sameVendor && inSelfWindow);

  if (!allowed) {
    return {
      ok: false,
      reason: sameVendor ? 'window_closed' : 'forbidden',
      message: sameVendor
        ? '60-second self-void window has closed. Ask a super-admin.'
        : 'Only the original vendor (within 60s) or a super-admin can void this.',
    };
  }

  // Atomic decrement: only succeeds if the booking still has at least the amount redeemed.
  const dec = await db.run(
    sql`UPDATE booking
        SET couponRedeemedInr = couponRedeemedInr - ${row.amountInr}
        WHERE id = ${row.bookingId}
          AND couponRedeemedInr >= ${row.amountInr}`
  );
  if (((dec as any).rowsAffected ?? 0) === 0) {
    return {
      ok: false,
      reason: 'already_voided',
      message: 'Balance reconciliation failed (booking may be out of sync).',
    };
  }

  await db
    .update(schema.redemptions)
    .set({
      voidedAt: new Date(),
      voidedBy: input.byEmail,
      voidReason: inSelfWindow && sameVendor ? 'self_under_60s' : 'super_admin',
    })
    .where(eq(schema.redemptions.id, row.id));

  return {
    ok: true,
    restored: row.amountInr,
    bookingId: row.bookingId,
  };
}

/** Used by /me and admin surfaces. */
export async function couponSummary(bookingId: string) {
  const b = await db
    .select({
      i: schema.bookings.couponInitialInr,
      r: schema.bookings.couponRedeemedInr,
    })
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingId))
    .get();
  if (!b) return null;
  const initial = b.i ?? 0;
  const redeemed = b.r ?? 0;
  return {
    initial,
    redeemed,
    remaining: initial - redeemed,
    has: initial > 0,
  };
}
