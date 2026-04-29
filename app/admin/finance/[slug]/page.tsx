import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEvent } from '@/lib/events-store';
import { listAttendeesForEvent } from '@/lib/admin-store';
import { listExpenses } from '@/lib/expenses-store';

export const dynamic = 'force-dynamic';

const RAZORPAY_FEE_PCT = 0.02;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return { title: `Admin · finance · ${params.slug}` };
}

export default async function EventFinancePage({
  params,
}: {
  params: { slug: string };
}) {
  const ev = await getEvent(params.slug);
  if (!ev) notFound();

  const [bookings, expenses] = await Promise.all([
    listAttendeesForEvent(params.slug),
    listExpenses({ eventSlug: params.slug }),
  ]);

  const confirmed = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'attended'
  );
  const refunded = bookings.filter((b) => b.status === 'refunded');

  const gross = confirmed.reduce((s, b) => s + b.amountInr, 0);
  const refundedAmt = refunded.reduce((s, b) => s + b.amountInr, 0);
  const fees = Math.round(gross * RAZORPAY_FEE_PCT);
  const totalExpenses = expenses.reduce((s, e) => s + e.amountInr, 0);
  const net = gross - fees - totalExpenses;
  const margin = gross > 0 ? Math.round((net / gross) * 100) : 0;

  const couponInitial = confirmed.reduce(
    (s, b) => s + (b.couponInitialInr ?? 0),
    0
  );
  const couponRedeemed = confirmed.reduce(
    (s, b) => s + (b.couponRedeemedInr ?? 0),
    0
  );
  const couponOutstanding = couponInitial - couponRedeemed;

  // Group expenses by category
  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    byCategory.set(e.category, (byCategory.get(e.category) || 0) + e.amountInr);
  }

  return (
    <div className="space-y-8">
      <header>
        <Link
          href="/admin/finance"
          className="text-sm text-ink-mute hover:text-crimson"
        >
          ← Finance
        </Link>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          {ev.name} · P&amp;L
        </h1>
        <p className="mt-2 text-ink-soft">
          {ev.date} · {ev.area}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Gross" value={`₹${gross.toLocaleString('en-IN')}`} />
        <Stat label="Razorpay fees" value={`₹${fees.toLocaleString('en-IN')}`} />
        <Stat label="Expenses" value={`₹${totalExpenses.toLocaleString('en-IN')}`} />
        <Stat
          label={`Net (${margin}%)`}
          value={`₹${net.toLocaleString('en-IN')}`}
          accent={net >= 0 ? 'leaf' : 'crimson'}
        />
      </section>

      {couponInitial > 0 && (
        <section className="grid gap-3 sm:grid-cols-3">
          <Stat
            label="Coupons issued"
            value={`₹${couponInitial.toLocaleString('en-IN')}`}
          />
          <Stat
            label="Coupons redeemed"
            value={`₹${couponRedeemed.toLocaleString('en-IN')}`}
          />
          <Stat
            label="Liability outstanding"
            value={`₹${couponOutstanding.toLocaleString('en-IN')}`}
            accent={couponOutstanding > 0 ? 'crimson' : 'leaf'}
          />
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg">Expense breakdown</h2>
        {byCategory.size === 0 ? (
          <p className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-5 text-sm text-ink-mute">
            No expenses logged for this event yet.{' '}
            <Link href="/admin/expenses" className="text-crimson hover:underline">
              Log one →
            </Link>
          </p>
        ) : (
          <ul className="rounded-2xl border border-marigold-200/60 bg-cream-50">
            {[...byCategory.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amt]) => (
                <li
                  key={cat}
                  className="flex items-center justify-between border-b border-marigold-100 p-4 last:border-b-0"
                >
                  <span className="capitalize">{cat.replace(/_/g, ' ')}</span>
                  <span className="font-display">
                    ₹{amt.toLocaleString('en-IN')}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-5">
        <p className="text-xs text-ink-mute">
          Capacity: {confirmed.length} / {ev.capacity} ·
          Refunded: ₹{refundedAmt.toLocaleString('en-IN')} from {refunded.length} bookings
        </p>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'leaf' | 'crimson';
}) {
  const accentClass =
    accent === 'leaf'
      ? 'border-leaf/40 bg-leaf/5'
      : accent === 'crimson'
        ? 'border-crimson/30 bg-crimson/5'
        : 'border-marigold-200/60 bg-cream-50';
  return (
    <div className={`rounded-2xl border ${accentClass} p-4`}>
      <p className="text-[11px] uppercase tracking-wider text-ink-mute">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl text-ink">{value}</p>
    </div>
  );
}
