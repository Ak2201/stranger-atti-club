'use client';

import { useMemo, useState, useTransition } from 'react';
import type { AttendeeRow } from '@/lib/admin-store';
import {
  manualCheckIn,
  undoCheckIn,
  bulkMarkAllConfirmedAttended,
} from './actions';

type Props = {
  rows: AttendeeRow[];
  eventSlug: string;
};

export default function CheckInList({ rows: initial, eventSlug }: Props) {
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState('');
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.contactName.toLowerCase().includes(q) ||
        r.contactPhone.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }, [rows, query]);

  function applyResult(bookingId: string, partial: Partial<AttendeeRow>) {
    setRows((prev) =>
      prev.map((r) => (r.id === bookingId ? { ...r, ...partial } : r))
    );
  }

  function handleCheckIn(bookingId: string) {
    startTransition(async () => {
      const result = await manualCheckIn(bookingId);
      if (result.ok) {
        applyResult(bookingId, {
          status: 'attended',
        } as Partial<AttendeeRow>);
      }
    });
  }

  function handleUndo(bookingId: string) {
    startTransition(async () => {
      await undoCheckIn(bookingId);
      applyResult(bookingId, {
        status: 'confirmed',
      } as Partial<AttendeeRow>);
    });
  }

  function handleBulkMark() {
    if (
      !window.confirm(
        'Mark every confirmed attendee as attended? Use only at end of night.'
      )
    )
      return;
    startTransition(async () => {
      await bulkMarkAllConfirmedAttended(eventSlug);
      setRows((prev) =>
        prev.map((r) =>
          r.status === 'confirmed'
            ? ({ ...r, status: 'attended' } as AttendeeRow)
            : r
        )
      );
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, phone (last 4), or booking ID"
          className="min-w-[260px] flex-1 rounded-xl border border-marigold-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-crimson"
        />
        <button
          onClick={handleBulkMark}
          disabled={pending}
          className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream hover:bg-crimson disabled:opacity-60"
        >
          Mark all confirmed → attended
        </button>
      </div>

      <ul className="space-y-2">
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-6 text-center text-sm text-ink-mute">
            No matching attendees.
          </li>
        )}
        {filtered.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-marigold-200/60 bg-cream-50 p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-display text-base">{r.contactName}</p>
              <p className="text-xs text-ink-mute">
                {r.contactPhone} · {r.tierId} · ₹{r.amountInr}
              </p>
            </div>
            {r.status === 'attended' ? (
              <>
                <span className="rounded-full bg-leaf/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  Attended
                </span>
                <button
                  onClick={() => handleUndo(r.id)}
                  disabled={pending}
                  className="text-xs text-ink-mute hover:text-crimson"
                >
                  Undo
                </button>
              </>
            ) : r.status === 'cancelled' || r.status === 'refunded' ? (
              <span className="rounded-full bg-crimson/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-crimson">
                {r.status}
              </span>
            ) : (
              <button
                onClick={() => handleCheckIn(r.id)}
                disabled={pending}
                className="rounded-full bg-crimson px-4 py-2 text-xs font-semibold text-cream hover:bg-crimson-500 disabled:opacity-60"
              >
                Check in
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
