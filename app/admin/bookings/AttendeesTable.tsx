'use client';

import { useMemo, useState, useTransition } from 'react';
import type { AttendeeRow } from '@/lib/admin-store';
import { deleteBookingAction } from './actions';

type Props = {
  rows: AttendeeRow[];
  eventSlug?: string;
  eventName?: string;
  canDelete?: boolean;
};

export default function AttendeesTable({
  rows: initial,
  eventSlug,
  eventName,
  canDelete = false,
}: Props) {
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `Permanently delete ${name}'s booking (${id})? This expunges the row — use Refund for normal cancellations.`
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteBookingAction(id);
      if (result.ok) {
        setRows((prev) => prev.filter((r) => r.id !== id));
        setFeedback(`Deleted ${name}'s booking.`);
      } else {
        setFeedback(`Failed: ${result.error}`);
      }
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== 'all' && r.status !== status) return false;
      if (!q) return true;
      return (
        r.contactName.toLowerCase().includes(q) ||
        r.contactPhone.toLowerCase().includes(q) ||
        (r.contactEmail || '').toLowerCase().includes(q) ||
        (r.razorpayPaymentId || '').toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    });
  }, [rows, query, status]);

  function downloadCsv() {
    const headers = [
      'Booking ID',
      'Event',
      'Tier',
      'Amount (INR)',
      'Status',
      'Attendee',
      'Phone',
      'Email',
      'User Account',
      'Razorpay Payment ID',
      'Razorpay Order ID',
      'Booked At',
    ];
    const cell = (v: string | number) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      headers.join(','),
      ...filtered.map((r) =>
        [
          cell(r.id),
          cell(r.eventSlug),
          cell(r.tierId),
          cell(r.amountInr),
          cell(r.status),
          cell(r.contactName),
          cell(r.contactPhone),
          cell(r.contactEmail || ''),
          cell(r.attendeeUserEmail || ''),
          cell(r.razorpayPaymentId || ''),
          cell(r.razorpayOrderId || ''),
          cell(new Date(r.createdAt).toISOString()),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = eventSlug
      ? `attendees-${eventSlug}-${stamp}.csv`
      : `bookings-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-4">
      {feedback && (
        <div className="rounded-2xl border border-leaf/40 bg-leaf/10 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name / phone / email / payment ID"
          className="min-w-0 flex-1 basis-full rounded-xl border border-marigold-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-crimson sm:basis-[260px]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-marigold-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-crimson"
        >
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="attended">Attended</option>
          <option value="cancelled">Cancelled</option>
          <option value="noshow">No-show</option>
        </select>
        <button
          onClick={downloadCsv}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-crimson"
        >
          Export CSV ({filtered.length})
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-marigold-200/60 bg-cream-50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="p-3">Booking</th>
                <th className="p-3">Attendee</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                {!eventSlug && <th className="p-3">Event</th>}
                <th className="p-3">Tier</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Coupon used</th>
                <th className="p-3">Status</th>
                <th className="p-3">Razorpay</th>
                <th className="p-3">Booked</th>
                {canDelete && <th className="p-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      (eventSlug ? 10 : 11) + (canDelete ? 1 : 0)
                    }
                    className="p-8 text-center text-ink-mute"
                  >
                    No bookings match.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-marigold-100 text-sm">
                  <td className="p-3 font-mono text-xs text-ink-mute">
                    <span className="block max-w-[120px] truncate">{r.id}</span>
                  </td>
                  <td className="p-3">
                    <p className="max-w-[160px] truncate font-medium">
                      {r.contactName}
                    </p>
                    {r.attendeeUserEmail && (
                      <p className="max-w-[160px] truncate text-[11px] text-ink-mute">
                        Linked: {r.attendeeUserEmail}
                      </p>
                    )}
                  </td>
                  <td className="p-3">
                    <a
                      href={`https://wa.me/${r.contactPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener"
                      className="text-ink hover:text-crimson"
                    >
                      {r.contactPhone}
                    </a>
                  </td>
                  <td className="p-3 text-ink-soft">
                    {r.contactEmail ? (
                      <a
                        href={`mailto:${r.contactEmail}`}
                        className="hover:text-crimson"
                      >
                        {r.contactEmail}
                      </a>
                    ) : (
                      <span className="text-ink-mute">—</span>
                    )}
                  </td>
                  {!eventSlug && (
                    <td className="p-3 text-ink-soft">{r.eventSlug}</td>
                  )}
                  <td className="p-3 text-ink-soft">{r.tierId}</td>
                  <td className="p-3 font-medium">
                    ₹{r.amountInr.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <CouponUsage
                      initial={r.couponInitialInr}
                      redeemed={r.couponRedeemedInr}
                    />
                  </td>
                  <td className="p-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="p-3 font-mono text-[11px] text-ink-mute">
                    {r.razorpayPaymentId || '—'}
                  </td>
                  <td className="p-3 text-xs text-ink-mute">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  {canDelete && (
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(r.id, r.contactName)}
                        disabled={pending}
                        className="rounded-full bg-crimson/10 px-2.5 py-1 text-[11px] font-semibold text-crimson hover:bg-crimson hover:text-cream disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-ink-mute">
        {filtered.length} of {rows.length} bookings shown
        {eventName ? ` for ${eventName}` : ''}.
      </p>
    </section>
  );
}

function CouponUsage({
  initial,
  redeemed,
}: {
  initial: number | undefined;
  redeemed: number | undefined;
}) {
  const i = initial ?? 0;
  const r = redeemed ?? 0;
  if (i === 0)
    return <span className="text-[11px] text-ink-mute">—</span>;
  const pct = Math.min(100, Math.round((r / i) * 100));
  return (
    <div className="min-w-[110px]">
      <p className="font-mono text-[11px]">
        ₹{r}/<span className="text-ink-mute">₹{i}</span>
      </p>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-marigold-100">
        <div
          className={`h-full ${pct > 80 ? 'bg-crimson' : pct > 50 ? 'bg-marigold-400' : 'bg-leaf'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    confirmed: { bg: 'bg-leaf/15', text: 'text-emerald-700' },
    attended: { bg: 'bg-marigold-100', text: 'text-marigold-700' },
    cancelled: { bg: 'bg-crimson/10', text: 'text-crimson' },
    noshow: { bg: 'bg-ink/5', text: 'text-ink-mute' },
  };
  const s = map[status] || map.cancelled;
  return (
    <span
      className={`inline-flex items-center rounded-full ${s.bg} ${s.text} px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider`}
    >
      {status}
    </span>
  );
}
