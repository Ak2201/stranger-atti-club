'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { EventItem } from '@/lib/events';
import { createExpense } from './actions';

const CATEGORIES = [
  'venue',
  'decor',
  'dj',
  'photographer',
  'food_beverage',
  'choreographer',
  'marketing',
  'contingency',
  'other',
];

export default function ExpenseForm({ events }: { events: EventItem[] }) {
  const [state, action] = useFormState(createExpense, null);

  return (
    <form action={action} className="space-y-4 rounded-3xl border border-marigold-200/60 bg-cream-50 p-6">
      {state?.error && (
        <div className="rounded-2xl border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm text-crimson">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="rounded-2xl border border-leaf/40 bg-leaf/10 px-4 py-3 text-sm text-emerald-700">
          Expense logged.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Event" required>
          <select name="eventSlug" required className={inputClass}>
            {events.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category" required>
          <select name="category" required className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount (INR)" required>
          <input
            name="amountInr"
            type="number"
            min={0}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Date" required>
          <input
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className={inputClass}
          />
        </Field>
        <Field label="Receipt URL (optional)">
          <input name="receiptUrl" type="url" className={inputClass} />
        </Field>
        <Field label="Notes (optional)">
          <input name="notes" className={inputClass} />
        </Field>
      </div>

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
      {pending ? 'Saving…' : 'Log expense'}
    </button>
  );
}

const inputClass =
  'w-full rounded-xl border border-marigold-200 bg-white px-4 py-3 text-ink outline-none focus:border-crimson';

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
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-ink-mute">
        {label}
        {required && ' *'}
      </span>
      {children}
    </label>
  );
}
