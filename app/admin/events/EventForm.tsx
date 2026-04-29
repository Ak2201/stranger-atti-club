'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import type { EventItem } from '@/lib/events';

type Action = (
  prev: { error?: string; ok?: boolean } | null,
  data: FormData
) => Promise<{ error?: string; ok?: boolean }>;

type Props = {
  mode: 'create' | 'edit';
  initial?: Partial<EventItem>;
  action: Action;
  isDemo?: boolean;
};

export default function EventForm({ mode, initial, action, isDemo }: Props) {
  const [state, formAction] = useFormState(action, null);
  const [whatYouDoJson, setWhatYouDoJson] = useState(
    JSON.stringify(initial?.whatYouDo || [], null, 2)
  );
  const [whatYouWontJson, setWhatYouWontJson] = useState(
    JSON.stringify(initial?.whatYouWont || [], null, 2)
  );
  const [scheduleJson, setScheduleJson] = useState(
    JSON.stringify(initial?.schedule || [], null, 2)
  );
  const [faqJson, setFaqJson] = useState(
    JSON.stringify(initial?.faq || [], null, 2)
  );
  const [tiersJson, setTiersJson] = useState(
    JSON.stringify(initial?.tiers || [], null, 2)
  );

  return (
    <form action={formAction} className="space-y-8">
      {isDemo && (
        <div className="rounded-2xl border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm text-crimson">
          Demo mode — connect Turso (set <code>TURSO_DATABASE_URL</code>) to
          actually save changes.
        </div>
      )}
      {state?.error && (
        <div className="rounded-2xl border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm text-crimson">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="rounded-2xl border border-leaf/30 bg-leaf/10 px-4 py-3 text-sm text-emerald-700">
          Saved.
        </div>
      )}

      <Card title="Identity">
        <Row>
          <Field label="Slug (URL)" required>
            <input
              name="slug"
              defaultValue={initial?.slug || ''}
              required
              readOnly={mode === 'edit'}
              placeholder="fake-sangeeth"
              className={inputClass + (mode === 'edit' ? ' opacity-60' : '')}
            />
          </Field>
          <Field label="Name" required>
            <input
              name="name"
              defaultValue={initial?.name || ''}
              required
              placeholder="Fake Sangeeth Night"
              className={inputClass}
            />
          </Field>
        </Row>
        <Field label="Tagline">
          <input
            name="tagline"
            defaultValue={initial?.tagline || ''}
            placeholder="A wedding for nobody. A dance floor for everyone."
            className={inputClass}
          />
        </Field>
        <Field label="Long description">
          <textarea
            name="description"
            defaultValue={initial?.description || ''}
            rows={4}
            className={inputClass}
          />
        </Field>
      </Card>

      <Card title="When & where">
        <Row>
          <Field label="Date (display)">
            <input
              name="date"
              defaultValue={initial?.date || ''}
              placeholder="Sat, May 24, 2026"
              className={inputClass}
            />
          </Field>
          <Field label="Date (ISO)">
            <input
              name="dateISO"
              type="date"
              defaultValue={initial?.dateISO || ''}
              className={inputClass}
            />
          </Field>
        </Row>
        <Row>
          <Field label="Doors">
            <input
              name="doors"
              defaultValue={initial?.doors || '7:00 PM'}
              className={inputClass}
            />
          </Field>
          <Field label="Closes">
            <input
              name="closes"
              defaultValue={initial?.closes || '11:00 PM'}
              className={inputClass}
            />
          </Field>
        </Row>
        <Row>
          <Field label="Venue">
            <input
              name="venue"
              defaultValue={initial?.venue || ''}
              className={inputClass}
            />
          </Field>
          <Field label="Area">
            <input
              name="area"
              defaultValue={initial?.area || ''}
              className={inputClass}
            />
          </Field>
        </Row>
        <Row>
          <Field label="City">
            <input
              name="city"
              defaultValue={initial?.city || 'Chennai'}
              className={inputClass}
            />
          </Field>
        </Row>
      </Card>

      <Card title="Capacity & visuals">
        <Row>
          <Field label="Capacity">
            <input
              name="capacity"
              type="number"
              min={1}
              defaultValue={initial?.capacity || 60}
              className={inputClass}
            />
          </Field>
          <Field label="Spots left">
            <input
              name="spotsLeft"
              type="number"
              min={0}
              defaultValue={initial?.spotsLeft ?? initial?.capacity ?? 60}
              className={inputClass}
            />
          </Field>
        </Row>
        <Row>
          <Field label="Hero glyph">
            <input
              name="heroEmoji"
              defaultValue={initial?.heroEmoji || '✺'}
              maxLength={3}
              className={inputClass}
            />
          </Field>
          <Field label="Accent colour">
            <select
              name="accent"
              defaultValue={initial?.accent || 'marigold'}
              className={inputClass}
            >
              <option value="marigold">Marigold</option>
              <option value="crimson">Crimson</option>
              <option value="leaf">Leaf</option>
            </select>
          </Field>
        </Row>
        <Field label="Dress code">
          <textarea
            name="dressCode"
            defaultValue={initial?.dressCode || ''}
            rows={2}
            className={inputClass}
          />
        </Field>
      </Card>

      <Card
        title="Bar / vendor credit"
        hint="When enabled, bartenders can scan attendee QRs at /admin/redeem and deduct from a per-ticket credit. Set per-tier amounts in the Tiers JSON below using the couponInr field."
      >
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="couponEnabled"
            value="on"
            defaultChecked={!!initial?.couponEnabled}
            className="h-5 w-5 rounded border-marigold-300"
          />
          <span className="text-sm">
            Enable redeemable bar/vendor credit on this event
          </span>
        </label>
      </Card>

      <Card
        title="Tiers (JSON)"
        hint='Array of { id, label, priceInr, description, couponInr? }. Example: [{"id":"vip","label":"VIP","priceInr":1999,"couponInr":500,"description":"Includes ₹500 bar credit"}]'
      >
        <textarea
          name="tiersJson"
          value={tiersJson}
          onChange={(e) => setTiersJson(e.target.value)}
          rows={6}
          className={inputClass + ' font-mono text-xs'}
        />
      </Card>

      <Card
        title="Schedule (JSON)"
        hint='Array of { time, block }. Example: [{"time":"7:00 PM","block":"Doors open"}]'
      >
        <textarea
          name="scheduleJson"
          value={scheduleJson}
          onChange={(e) => setScheduleJson(e.target.value)}
          rows={6}
          className={inputClass + ' font-mono text-xs'}
        />
      </Card>

      <Card title="What attendees will / won't (JSON arrays)">
        <Row>
          <Field label="What you will…">
            <textarea
              name="whatYouDoJson"
              value={whatYouDoJson}
              onChange={(e) => setWhatYouDoJson(e.target.value)}
              rows={5}
              className={inputClass + ' font-mono text-xs'}
            />
          </Field>
          <Field label="What you won't…">
            <textarea
              name="whatYouWontJson"
              value={whatYouWontJson}
              onChange={(e) => setWhatYouWontJson(e.target.value)}
              rows={5}
              className={inputClass + ' font-mono text-xs'}
            />
          </Field>
        </Row>
      </Card>

      <Card
        title="FAQ (JSON)"
        hint='Array of { q, a }. Example: [{"q":"Can I come alone?","a":"Yes — most people do."}]'
      >
        <textarea
          name="faqJson"
          value={faqJson}
          onChange={(e) => setFaqJson(e.target.value)}
          rows={6}
          className={inputClass + ' font-mono text-xs'}
        />
      </Card>

      <Submit mode={mode} />
    </form>
  );
}

function Submit({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-cream transition hover:bg-crimson-500 disabled:opacity-60"
      >
        {pending
          ? 'Saving…'
          : mode === 'create'
            ? 'Create event'
            : 'Save changes'}
      </button>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-marigold-200 bg-white px-4 py-3 text-ink outline-none focus:border-crimson';

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-6">
      <h3 className="font-display text-lg">{title}</h3>
      {hint && <p className="mt-1 text-xs text-ink-mute">{hint}</p>}
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
