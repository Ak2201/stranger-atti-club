'use client';

import { useState } from 'react';
import type { EventItem, Tier } from '@/lib/events';
import { site } from '@/lib/site';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Props = {
  event: EventItem;
  tier: Tier;
};

export default function BookingButton({ event, tier }: Props) {
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<
    | { kind: 'idle' }
    | { kind: 'error'; message: string }
    | {
        kind: 'success';
        paymentId: string;
        bookingId: string | null;
        ticketUrl: string | null;
      }
  >({ kind: 'idle' });

  async function handlePay() {
    if (!contact.name || !contact.phone) {
      setStatus({
        kind: 'error',
        message: 'Name and phone are required so we can confirm your ticket.',
      });
      return;
    }

    setLoading(true);
    setStatus({ kind: 'idle' });

    try {
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventSlug: event.slug,
          tierId: tier.id,
          contact,
        }),
      });

      if (!orderRes.ok) {
        const body = await orderRes.json().catch(() => ({}));
        throw new Error(body.error || 'Could not create order');
      }
      const order = await orderRes.json();

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId || keyId.includes('REPLACE_ME')) {
        // Placeholder mode — call verify directly to actually persist a row
        // and get a real ticket URL back.
        const verifyRes = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: order.id,
            razorpay_payment_id:
              'pay_demo_' + Math.random().toString(36).slice(2, 12),
            razorpay_signature: 'placeholder',
            eventSlug: event.slug,
            tierId: tier.id,
            contact,
          }),
        });
        const verifyJson = await verifyRes.json().catch(() => ({}));
        setStatus({
          kind: 'success',
          paymentId: verifyJson.paymentId || 'demo',
          bookingId: verifyJson.bookingId || null,
          ticketUrl: verifyJson.ticketUrl || null,
        });
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: site.name,
        description: `${event.name} — ${tier.label}`,
        prefill: {
          name: contact.name,
          contact: contact.phone,
          email: contact.email,
        },
        notes: {
          event_slug: event.slug,
          tier_id: tier.id,
        },
        theme: { color: '#B22222' },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              eventSlug: event.slug,
              tierId: tier.id,
              contact,
            }),
          });
          if (verifyRes.ok) {
            const verifyJson = await verifyRes.json().catch(() => ({}));
            setStatus({
              kind: 'success',
              paymentId: response.razorpay_payment_id,
              bookingId: verifyJson.bookingId || null,
              ticketUrl: verifyJson.ticketUrl || null,
            });
          } else {
            setStatus({
              kind: 'error',
              message: 'Payment received but verification failed. Please WhatsApp us.',
            });
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch (err: any) {
      setStatus({ kind: 'error', message: err.message || 'Something went wrong.' });
      setLoading(false);
    }
  }

  if (status.kind === 'success') {
    const ticketLine = status.ticketUrl
      ? `\n\nMy QR ticket: ${status.ticketUrl}`
      : '';
    const waMessage = encodeURIComponent(
      `Hi! Confirming my booking for ${event.name} — ${tier.label} (₹${tier.priceInr}). Payment ID: ${status.paymentId}. Name: ${contact.name}.${ticketLine}`
    );
    return (
      <div className="rounded-3xl border-2 border-leaf bg-emerald-50 p-7">
        <p className="font-display text-2xl text-emerald-800">
          You're in! 🌼
        </p>
        <p className="mt-2 text-emerald-900">
          Reference: <code className="font-mono text-sm">{status.paymentId}</code>.
        </p>
        {status.ticketUrl && (
          <a
            href={status.ticketUrl}
            target="_blank"
            rel="noopener"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream transition hover:bg-crimson"
          >
            View your QR ticket →
          </a>
        )}
        <p className="mt-3 text-sm text-emerald-900/80">
          Save the QR ticket page to your phone, and tap below to WhatsApp us
          — we'll reply with the venue pin, dress code, and your event-day
          lifeline contact.
        </p>
        <a
          href={`https://wa.me/${site.whatsapp}?text=${waMessage}`}
          target="_blank"
          rel="noopener"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-3 text-sm font-semibold text-cream transition hover:opacity-90"
        >
          Send confirmation on WhatsApp →
        </a>
        <p className="mt-3 text-xs text-emerald-900/70">
          Save +91 {site.whatsapp.replace(/^91/, '').replace(/(\d{5})(\d{5})/, '$1 $2')} — that's your event-day lifeline.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-2xl bg-crimson px-6 py-4 font-semibold text-cream transition hover:bg-crimson-500"
        >
          Book {tier.label} — ₹{tier.priceInr}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wider text-ink-mute">
                Your name *
              </span>
              <input
                value={contact.name}
                onChange={(e) =>
                  setContact({ ...contact, name: e.target.value })
                }
                className="w-full rounded-xl border border-marigold-200 bg-white px-4 py-3 text-ink outline-none focus:border-crimson"
                placeholder="Priya R."
                autoComplete="name"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wider text-ink-mute">
                WhatsApp number *
              </span>
              <input
                value={contact.phone}
                onChange={(e) =>
                  setContact({ ...contact, phone: e.target.value })
                }
                className="w-full rounded-xl border border-marigold-200 bg-white px-4 py-3 text-ink outline-none focus:border-crimson"
                placeholder="+91 98xxx xxxxx"
                inputMode="tel"
                autoComplete="tel"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wider text-ink-mute">
              Email (for receipt)
            </span>
            <input
              value={contact.email}
              onChange={(e) =>
                setContact({ ...contact, email: e.target.value })
              }
              className="w-full rounded-xl border border-marigold-200 bg-white px-4 py-3 text-ink outline-none focus:border-crimson"
              placeholder="you@email.com"
              type="email"
              autoComplete="email"
            />
          </label>

          {status.kind === 'error' && (
            <p className="rounded-xl bg-crimson/10 px-4 py-3 text-sm text-crimson">
              {status.message}
            </p>
          )}

          <button
            disabled={loading}
            onClick={handlePay}
            className="w-full rounded-2xl bg-crimson px-6 py-4 font-semibold text-cream transition hover:bg-crimson-500 disabled:opacity-60"
          >
            {loading
              ? 'Opening Razorpay…'
              : `Pay ₹${tier.priceInr} via UPI / Card`}
          </button>
          <p className="text-center text-xs text-ink-mute">
            Secured by Razorpay · UPI · Cards · NetBanking · Wallets
          </p>
        </div>
      )}
    </div>
  );
}
