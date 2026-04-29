import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/auth';
import { db, schema } from '@/db';
import { getEvent } from '@/lib/events-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventSlug,
      tierId,
      contact,
    } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const placeholder = !keySecret || keySecret.includes('REPLACE_ME');

    if (!placeholder) {
      const expected = crypto
        .createHmac('sha256', keySecret!)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expected !== razorpay_signature) {
        return NextResponse.json(
          { ok: false, error: 'Invalid signature' },
          { status: 400 }
        );
      }
    }

    // Persist the booking — link to the signed-in user when present.
    const event = await getEvent(eventSlug);
    const tier = event?.tiers.find((t) => t.id === tierId);
    let bookingId: string | null = null;
    let ticketUrl: string | null = null;

    if (event && tier) {
      try {
        const session = await auth();
        const sessionUserId = (session?.user as { id?: string } | undefined)?.id;
        // Skip FK link only for the synthetic fallback id (DB-down case).
        const userId =
          sessionUserId && sessionUserId !== 'demo-user' ? sessionUserId : null;
        bookingId = crypto.randomUUID();
        const couponInitialInr =
          event.couponEnabled && typeof tier.couponInr === 'number'
            ? Math.max(0, Math.floor(tier.couponInr))
            : 0;
        await db.insert(schema.bookings).values({
          id: bookingId,
          userId,
          eventSlug,
          tierId,
          amountInr: tier.priceInr,
          contactName: contact?.name ?? '',
          contactPhone: contact?.phone ?? '',
          contactEmail: contact?.email ?? null,
          razorpayOrderId: razorpay_order_id ?? null,
          razorpayPaymentId: razorpay_payment_id ?? null,
          paymentMethod: 'razorpay',
          status: 'confirmed',
          couponInitialInr,
          couponRedeemedInr: 0,
        });
        const { ticketUrl: makeTicketUrl } = await import('@/lib/qr');
        ticketUrl = makeTicketUrl(bookingId);
      } catch (dbErr) {
        // Don't fail the user's payment if DB write fails — log + continue.
        console.error('[bookings.insert]', dbErr);
      }
    }

    return NextResponse.json({
      ok: true,
      paymentId: razorpay_payment_id,
      bookingId,
      ticketUrl,
    });
  } catch (err: any) {
    console.error('[razorpay/verify]', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
