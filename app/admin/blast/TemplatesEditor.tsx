'use client';

import { useFormState } from 'react-dom';
import { useState, useTransition } from 'react';
import type { Template } from '@/lib/messaging-store';
import { saveTemplate, deleteTemplate } from './actions';

export default function TemplatesEditor({
  templates,
  samples,
}: {
  templates: Template[];
  samples: { name: string; channel: 'whatsapp' | 'email'; body: string }[];
}) {
  const [editing, setEditing] = useState<Partial<Template> | null>(null);
  const [state, action] = useFormState(saveTemplate, null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-6">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-lg">Saved templates</h3>
          <button
            onClick={() =>
              setEditing({ name: '', channel: 'whatsapp', body: '' })
            }
            className="rounded-full bg-crimson px-4 py-1.5 text-xs font-semibold text-cream"
          >
            + New template
          </button>
        </div>
        {templates.length === 0 ? (
          <p className="mt-3 text-sm text-ink-mute">
            None yet. Try one of the starter templates below.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {templates.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-marigold-100 bg-cream p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base">{t.name}</p>
                  <p className="line-clamp-1 text-[11px] text-ink-mute">
                    {t.body}
                  </p>
                </div>
                <button
                  onClick={() => setEditing(t)}
                  className="text-xs text-ink hover:text-crimson"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${t.name}"?`)) {
                      startTransition(() => deleteTemplate(t.id));
                    }
                  }}
                  disabled={pending}
                  className="text-xs text-crimson hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {samples.length > 0 && templates.length === 0 && (
        <div className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-6">
          <h3 className="font-display text-lg">Starter templates</h3>
          <p className="mt-1 text-xs text-ink-mute">
            Click to seed. You can edit after.
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {samples.map((s) => (
              <li
                key={s.name}
                className="rounded-xl border border-marigold-100 bg-cream p-3"
              >
                <p className="font-display text-sm">{s.name}</p>
                <p className="mt-1 line-clamp-3 whitespace-pre-line text-[11px] text-ink-mute">
                  {s.body}
                </p>
                <button
                  onClick={() => setEditing(s)}
                  className="mt-2 text-xs text-crimson hover:underline"
                >
                  Use this →
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editing && (
        <form action={action} className="space-y-4 rounded-3xl border border-crimson/30 bg-cream-50 p-6">
          <input type="hidden" name="id" value={editing.id || ''} />
          <h3 className="font-display text-lg">
            {editing.id ? 'Edit template' : 'New template'}
          </h3>
          {state?.error && (
            <div className="rounded-2xl border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm text-crimson">
              {state.error}
            </div>
          )}
          {state?.ok && (
            <div className="rounded-2xl border border-leaf/40 bg-leaf/10 px-4 py-3 text-sm text-emerald-700">
              Saved.
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" required>
              <input
                name="name"
                defaultValue={editing.name || ''}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Channel" required>
              <select
                name="channel"
                defaultValue={editing.channel || 'whatsapp'}
                className={inputClass}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </Field>
          </div>
          <Field label="Subject (email only)">
            <input
              name="subject"
              defaultValue={editing.subject || ''}
              className={inputClass}
            />
          </Field>
          <Field label="Body" required>
            <textarea
              name="body"
              defaultValue={editing.body || ''}
              rows={8}
              required
              className={`${inputClass} font-mono text-sm`}
            />
          </Field>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-full bg-crimson px-5 py-2.5 text-sm font-semibold text-cream"
            >
              Save template
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-sm text-ink-mute hover:text-crimson"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
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
