'use client';

import { useState, useTransition } from 'react';
import type { AttendeeRow } from '@/lib/admin-store';
import { initiateRefund, cancelBooking } from './actions';

type Props = {
  rows: AttendeeRow[];
  canRefund: boolean;
};

export default function RefundsTable({ rows: initial, canRefund }: Props) {
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleCancel(id: string) {
    startTransition(async () => {
      const result = await cancelBooking(id);
      if (result?.ok === false) {
        setFeedback(`Failed: ${result.error}`);
        return;
      }
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))
      );
      setFeedback('Cancelled.');
    });
  }

  function handleRefund(id: string, amount: number) {
    if (!confirm(`Refund ₹${amount}? This calls Razorpay and is irreversible.`))
      return;
    startTransition(async () => {
      const result = await initiateRefund(id);
      if (result.ok) {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'refunded' } : r))
        );
        setFeedback(
          `Refunded · ${result.refundId}${result.demo ? ' (demo mode)' : ''}`
        );
      } else {
        setFeedback(`Failed: ${result.error}`);
      }
    });
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-6 text-sm text-ink-mute">
        No bookings flagged for refund or cancelled. When you cancel a booking
        on the bookings page, it shows up here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="rounded-2xl border border-leaf/40 bg-leaf/10 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-marigold-200/60 bg-cream-50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="p-3">Attendee</th>
                <th className="p-3">Event</th>
                <th className="p-3">Tier</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Razorpay</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-marigold-100 text-sm">
                  <td className="p-3">
                    <p className="font-medium">{r.contactName}</p>
                    <p className="text-[11px] text-ink-mute">{r.contactPhone}</p>
                  </td>
                  <td className="p-3 text-ink-soft">{r.eventSlug}</td>
                  <td className="p-3 text-ink-soft">{r.tierId}</td>
                  <td className="p-3 font-medium">
                    ₹{r.amountInr.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="p-3 font-mono text-[11px] text-ink-mute">
                    {r.razorpayPaymentId || '—'}
                  </td>
                  <td className="p-3 text-right">
                    {r.status === 'cancelled' && canRefund && (
                      <button
                        onClick={() => handleRefund(r.id, r.amountInr)}
                        disabled={pending}
                        className="rounded-full bg-crimson px-3 py-1.5 text-[11px] font-semibold text-cream hover:bg-crimson-500 disabled:opacity-50"
                      >
                        Refund ₹{r.amountInr}
                      </button>
                    )}
                    {r.status === 'cancelled' && !canRefund && (
                      <span
                        className="cursor-help text-[11px] italic text-ink-mute"
                        title="Super-admin only — escalate to owner"
                      >
                        Refund (super-admin)
                      </span>
                    )}
                    {r.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(r.id)}
                        disabled={pending}
                        className="rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-cream hover:bg-crimson disabled:opacity-50"
                      >
                        Mark cancelled
                      </button>
                    )}
                    {r.status === 'refunded' && (
                      <span className="text-[11px] text-emerald-700">
                        Refunded
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    confirmed: { bg: 'bg-leaf/15', text: 'text-emerald-700' },
    attended: { bg: 'bg-marigold-100', text: 'text-marigold-700' },
    cancelled: { bg: 'bg-crimson/10', text: 'text-crimson' },
    refunded: { bg: 'bg-ink/5', text: 'text-ink-mute' },
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
