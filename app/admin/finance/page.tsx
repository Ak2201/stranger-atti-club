import Link from 'next/link';
import { listEvents } from '@/lib/events-store';
import { listAllBookings } from '@/lib/admin-store';
import { totalExpensesByEvent } from '@/lib/expenses-store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · finance' };

const RAZORPAY_FEE_PCT = 0.02;
const GST_PCT = 0.18;

export default async function FinancePage() {
  const [events, bookings, expensesByEvent] = await Promise.all([
    listEvents(),
    listAllBookings(),
    totalExpensesByEvent(),
  ]);

  const confirmed = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'attended'
  );
  const refunded = bookings.filter((b) => b.status === 'refunded');

  const grossThisMonth = confirmed
    .filter((b) => sameMonth(new Date(b.createdAt), new Date()))
    .reduce((s, b) => s + b.amountInr, 0);

  const grossYTD = confirmed
    .filter((b) => sameYear(new Date(b.createdAt), new Date()))
    .reduce((s, b) => s + b.amountInr, 0);

  const refundedYTD = refunded.reduce((s, b) => s + b.amountInr, 0);
  const grossAll = confirmed.reduce((s, b) => s + b.amountInr, 0);
  const fees = Math.round(grossAll * RAZORPAY_FEE_PCT);
  const gstEstimate = Math.round((grossAll / (1 + GST_PCT)) * GST_PCT);
  const refundRate =
    bookings.length > 0
      ? Math.round((refunded.length / bookings.length) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
          Finance
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          The money picture
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Razorpay fees ~{Math.round(RAZORPAY_FEE_PCT * 100)}%. GST estimate
          assumes the ticket price is inclusive of {Math.round(GST_PCT * 100)}%.
        </p>
      </header>

      <section>
        <h2 className="mb-3 font-display text-lg">This month</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Gross revenue" value={`₹${grossThisMonth.toLocaleString('en-IN')}`} />
          <Stat label="YTD gross" value={`₹${grossYTD.toLocaleString('en-IN')}`} />
          <Stat label="YTD refunds" value={`₹${refundedYTD.toLocaleString('en-IN')}`} />
          <Stat label="Refund rate" value={`${refundRate}%`} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg">Estimated outflows</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat
            label={`Razorpay fees (~${Math.round(RAZORPAY_FEE_PCT * 100)}%)`}
            value={`₹${fees.toLocaleString('en-IN')}`}
          />
          <Stat
            label={`GST collected (~${Math.round(GST_PCT * 100)}% of gross)`}
            value={`₹${gstEstimate.toLocaleString('en-IN')}`}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg">Per-event P&amp;L</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {events.map((e) => {
            const evBookings = confirmed.filter((b) => b.eventSlug === e.slug);
            const gross = evBookings.reduce((s, b) => s + b.amountInr, 0);
            const expenses = expensesByEvent.get(e.slug) || 0;
            const fees = Math.round(gross * RAZORPAY_FEE_PCT);
            const net = gross - expenses - fees;
            const margin = gross > 0 ? Math.round((net / gross) * 100) : 0;
            return (
              <Link
                key={e.slug}
                href={`/admin/finance/${e.slug}`}
                className="lift block rounded-2xl border border-marigold-200/60 bg-cream-50 p-5 hover:border-crimson"
              >
                <div className="flex items-baseline justify-between">
                  <p className="font-display text-lg">{e.name}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      net >= 0
                        ? 'bg-leaf/15 text-emerald-700'
                        : 'bg-crimson/10 text-crimson'
                    }`}
                  >
                    {net >= 0 ? `+${margin}%` : `${margin}%`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-mute">{e.date}</p>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <Mini label="Gross" value={`₹${gross.toLocaleString('en-IN')}`} />
                  <Mini label="Expenses" value={`₹${expenses.toLocaleString('en-IN')}`} />
                  <Mini label="Net" value={`₹${net.toLocaleString('en-IN')}`} highlight />
                </dl>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-4">
      <p className="text-[11px] uppercase tracking-wider text-ink-mute">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl text-ink">{value}</p>
    </div>
  );
}

function Mini({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-ink-mute">
        {label}
      </dt>
      <dd
        className={`font-display ${highlight ? 'text-base text-ink' : 'text-sm text-ink-soft'}`}
      >
        {value}
      </dd>
    </div>
  );
}

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function sameYear(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear();
}
