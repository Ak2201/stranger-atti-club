'use client';

import { useState, useTransition } from 'react';
import type { EventItem } from '@/lib/events';
import type { Recipient, Template } from '@/lib/messaging-store';
import { recordBlast } from './actions';

type Props = {
  events: EventItem[];
  templates: Template[];
};

const AUDIENCES = [
  { value: 'confirmed', label: 'Confirmed attendees' },
  { value: 'past', label: 'Past attendees' },
  { value: 'all', label: 'All bookings (incl. cancelled)' },
] as const;

export default function Composer({ events, templates }: Props) {
  const [eventSlug, setEventSlug] = useState(events[0]?.slug || '');
  const [audience, setAudience] = useState<
    'confirmed' | 'past' | 'all' | 'waitlist'
  >('confirmed');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadRecipients() {
    setFeedback(null);
    const res = await fetch(
      `/api/admin/blast-recipients?event=${encodeURIComponent(eventSlug)}&audience=${encodeURIComponent(audience)}`,
      { cache: 'no-store' }
    );
    const json = (await res.json()) as { recipients: Recipient[] };
    setRecipients(json.recipients);
  }

  function applyTemplate(t: Template) {
    setBody(t.body);
  }

  async function logSend() {
    startTransition(async () => {
      await recordBlast({
        eventSlug,
        audience,
        channel: 'whatsapp',
        body,
        recipientCount: recipients.length,
      });
      setFeedback(`Blast logged (${recipients.length} recipients).`);
    });
  }

  const eventName =
    events.find((e) => e.slug === eventSlug)?.name || 'this event';

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-6">
        <h3 className="font-display text-lg">1. Pick the audience</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Event">
            <select
              value={eventSlug}
              onChange={(e) => setEventSlug(e.target.value)}
              className={inputClass}
            >
              {events.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.name} — {e.date}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Audience">
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as any)}
              className={inputClass}
            >
              {AUDIENCES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={loadRecipients}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream"
          >
            Load recipients
          </button>
          <span className="text-sm text-ink-mute">
            {recipients.length} recipient{recipients.length === 1 ? '' : 's'} loaded
          </span>
        </div>
      </section>

      <section className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-6">
        <h3 className="font-display text-lg">2. Pick a template</h3>
        {templates.length === 0 ? (
          <p className="mt-2 text-sm text-ink-mute">
            No templates saved yet. Use the Templates tab.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                className="rounded-full border border-marigold-200 bg-white px-3 py-1.5 text-xs hover:border-crimson hover:text-crimson"
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-6">
        <h3 className="font-display text-lg">3. Compose</h3>
        <p className="mt-1 text-xs text-ink-mute">
          Variables: <code>{'{{name}}'}</code>, <code>{'{{eventName}}'}</code>,{' '}
          <code>{'{{venuePin}}'}</code>, <code>{'{{ticketUrl}}'}</code>
        </p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          placeholder={`Hi {{name}}! Quick reminder for ${eventName}...`}
          className={`mt-3 ${inputClass} font-mono text-sm`}
        />
      </section>

      {recipients.length > 0 && body && (
        <section className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h3 className="font-display text-lg">4. Send</h3>
              <p className="text-xs text-ink-mute">
                Free path: open each WhatsApp link and tap send. Brevo/WATI
                automation hooks come once env vars are set.
              </p>
            </div>
            <button
              onClick={logSend}
              disabled={pending}
              className="rounded-full bg-leaf px-4 py-2 text-sm font-semibold text-cream disabled:opacity-60"
            >
              {pending ? 'Logging…' : 'Mark as sent'}
            </button>
          </div>
          {feedback && (
            <p className="mt-2 text-sm text-emerald-700">{feedback}</p>
          )}

          <ul className="mt-4 space-y-2">
            {recipients.map((r) => {
              const rendered = body
                .replaceAll('{{name}}', r.name)
                .replaceAll('{{eventName}}', eventName)
                .replaceAll('{{venuePin}}', '(see event detail)')
                .replaceAll('{{ticketUrl}}', r.ticketUrl);
              return (
                <li
                  key={r.bookingId}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-marigold-100 bg-cream p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-[11px] text-ink-mute">+91 {r.phone}</p>
                  </div>
                  <a
                    href={`https://wa.me/${r.phone}?text=${encodeURIComponent(rendered)}`}
                    target="_blank"
                    rel="noopener"
                    className="rounded-full bg-leaf px-3 py-1.5 text-[11px] font-semibold text-cream"
                  >
                    Send via WhatsApp →
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-marigold-200 bg-white px-4 py-3 text-ink outline-none focus:border-crimson';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-ink-mute">
        {label}
      </span>
      {children}
    </label>
  );
}
