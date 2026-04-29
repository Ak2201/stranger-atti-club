import { NextResponse } from 'next/server';
import { getEvent } from '@/lib/events-store';

export async function POST(req: Request) {
  try {
    const { eventSlug, tierId, contact } = await req.json();
    const event = await getEvent(eventSlug);
    const tier = event?.tiers.find((t) => t.id === tierId);

    if (!event || !tier) {
      return NextResponse.json(
        { error: 'Invalid event or tier' },
        { status: 400 }
      );
    }

    if (!contact?.name || !contact?.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const placeholder =
      !keyId ||
      !keySecret ||
      keyId.includes('REPLACE_ME') ||
      keySecret.includes('REPLACE_ME');

    if (placeholder) {
      // Placeholder mode — return a mock order so the UI flow can be demo'd.
      // Replace env vars in .env.local to switch to real Razorpay.
      return NextResponse.json({
        id: 'order_demo_' + Math.random().toString(36).slice(2, 12),
        amount: tier.priceInr * 100,
        currency: 'INR',
        placeholder: true,
      });
    }

    // Real Razorpay path — dynamic import keeps Edge bundles small.
    const Razorpay = (await import('razorpay')).default;
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await rzp.orders.create({
      amount: tier.priceInr * 100, // paise
      currency: 'INR',
      receipt: `${event.slug}-${tier.id}-${Date.now()}`,
      notes: {
        event_slug: event.slug,
        tier_id: tier.id,
        attendee_name: contact.name,
        attendee_phone: contact.phone,
        attendee_email: contact.email || '',
      },
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    console.error('[razorpay/order]', err);
    return NextResponse.json(
      { error: err?.message || 'Order creation failed' },
      { status: 500 }
    );
  }
}
