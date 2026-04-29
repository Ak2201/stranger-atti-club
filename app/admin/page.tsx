import Link from 'next/link';
import { adminStats } from '@/lib/admin-store';
import { listEvents } from '@/lib/events-store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · dashboard' };

export default async function AdminDashboard() {
  const [stats, events] = await Promise.all([adminStats(), listEvents()]);

  return (
    <div className="space-y-10">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
          Dashboard
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          What's happening
        </h1>
        <p className="mt-2 text-ink-soft">
          Live snapshot of bookings, revenue, and upcoming events.
        </p>
      </header>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Bookings (confirmed)" value={String(stats.confirmedBookings)} />
          <Stat
            label="Revenue (confirmed)"
            value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
          />
          <Stat label="Cancellations" value={String(stats.cancelledBookings)} />
          <Stat label="Live events" value={String(events.length)} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl">Per-event</h2>
          <Link
            href="/admin/events"
            className="text-sm text-crimson hover:underline"
          >
            Manage events →
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-marigold-200/60 bg-cream-50">
          <table className="w-full">
            <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="p-4">Event</th>
                <th className="p-4">Date</th>
                <th className="p-4">Sold</th>
                <th className="p-4">Revenue</th>
                <th className="p-4 text-right">View</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const s = stats.byEvent.get(e.slug) || { count: 0, revenue: 0 };
                return (
                  <tr
                    key={e.slug}
                    className="border-t border-marigold-100 text-sm"
                  >
                    <td className="p-4">
                      <p className="font-display text-base">{e.name}</p>
                      <p className="text-xs text-ink-mute">{e.area}</p>
                    </td>
                    <td className="p-4 text-ink-soft">{e.date}</td>
                    <td className="p-4">
                      {s.count}/{e.capacity}
                    </td>
                    <td className="p-4">
                      ₹{s.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/events/${e.slug}/attendees`}
                        className="text-crimson hover:underline"
                      >
                        Attendees →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl">Recent bookings</h2>
        <div className="overflow-hidden rounded-2xl border border-marigold-200/60 bg-cream-50">
          <table className="w-full">
            <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="p-4">Attendee</th>
                <th className="p-4">Event</th>
                <th className="p-4">Tier</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Booked</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((b) => (
                <tr
                  key={b.id}
                  className="border-t border-marigold-100 text-sm"
                >
                  <td className="p-4">
                    <p className="font-medium">{b.contactName}</p>
                    <p className="text-xs text-ink-mute">{b.contactPhone}</p>
                  </td>
                  <td className="p-4 text-ink-soft">{b.eventSlug}</td>
                  <td className="p-4 text-ink-soft">{b.tierId}</td>
                  <td className="p-4">₹{b.amountInr.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <StatusPill status={b.status} />
                  </td>
                  <td className="p-4 text-xs text-ink-mute">
                    {b.createdAt.toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-5">
      <p className="text-[11px] uppercase tracking-wider text-ink-mute">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
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
