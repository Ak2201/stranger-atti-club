'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import type { EventItem } from '@/lib/events';
import { createWalkInBooking } from './actions';

type Props = {
  events: EventItem[];
};

export default function WalkInForm({ events }: Props) {
  const [state, action] = useFormState(createWalkInBooking, null);
  const [eventSlug, setEventSlug] = useState(events[0]?.slug || '');

  const event = events.find((e) => e.slug === eventSlug);
  const tiers = event?.tiers || [];

  if (state?.bookingId && state?.ticketUrl) {
    return (
      <div className="rounded-3xl border-2 border-leaf bg-emerald-50 p-7">
        <p className="font-display text-2xl text-emerald-800">
          Walk-in confirmed 🌼
        </p>
        <p className="mt-2 text-emerald-900">
          Booking ID:{' '}
          <code className="font-mono text-xs">{state.bookingId}</code>
        </p>
        <a
          href={state.ticketUrl}
          target="_blank"
          rel="noopener"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream"
        >
          Open QR ticket → (show on attendee's phone)
        </a>
        <button
          onClick={() => location.reload()}
          className="ml-3 mt-4 text-sm text-ink-mute hover:text-crimson"
        >
          Add another walk-in
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      {state?.error && (
        <div className="rounded-2xl border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm text-crimson">
          {state.error}
        </div>
      )}

      <Card title="Event">
        <Field label="Event" required>
          <select
            name="eventSlug"
            value={eventSlug}
            onChange={(e) => setEventSlug(e.target.value)}
            required
            className={inputClass}
          >
            {events.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.name} — {e.date}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tier" required>
          <select name="tierId" required className={inputClass}>
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} (₹{t.priceInr})
              </option>
            ))}
          </select>
        </Field>
      </Card>

      <Card title="Attendee">
        <Row>
          <Field label="Name" required>
            <input
              name="name"
              required
              autoComplete="off"
              className={inputClass}
            />
          </Field>
          <Field label="Phone" required>
            <input
              name="phone"
              required
              inputMode="tel"
              placeholder="+91 9X XXX XXX XX"
              className={inputClass}
            />
          </Field>
        </Row>
        <Field label="Email (optional)">
          <input
            name="email"
            type="email"
            autoComplete="off"
            className={inputClass}
          />
        </Field>
      </Card>

      <Card title="Payment">
        <Row>
          <Field label="Method" required>
            <select
              name="paymentMethod"
              required
              defaultValue="cash"
              className={inputClass}
            >
              <option value="cash">Cash</option>
              <option value="upi_offline">UPI (off-platform)</option>
              <option value="comp">Comp (free)</option>
            </select>
          </Field>
          <Field label="Amount paid (INR)">
            <input
              name="amountInr"
              type="number"
              min={0}
              placeholder="Defaults to tier price"
              className={inputClass}
            />
          </Field>
        </Row>
      </Card>

      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-cream transition hover:bg-crimson-500 disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Confirm walk-in & generate QR'}
    </button>
  );
}

const inputClass =
  'w-full rounded-xl border border-marigold-200 bg-white px-4 py-3 text-ink outline-none focus:border-crimson';

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-6">
      <h3 className="font-display text-lg">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block flex-1">
      <span className="mb-1 block text-xs uppercase tracking-wider text-ink-mute">
        {label}
        {required && ' *'}
      </span>
      {children}
    </label>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
