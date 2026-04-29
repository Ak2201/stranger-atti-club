import { listEvents } from '@/lib/events-store';
import { listAllBookings } from '@/lib/admin-store';
import QrScanner from './QrScanner';
import CheckInList from './CheckInList';
import EventPicker from './EventPicker';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · check-in' };

type SP = { event?: string };

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const events = await listEvents();
  const today = new Date().toISOString().slice(0, 10);
  // Default to the soonest upcoming event; fallback to first event in list.
  const upcoming = events
    .filter((e) => e.dateISO >= today)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const defaultSlug =
    searchParams?.event || upcoming[0]?.slug || events[0]?.slug;
  const event = events.find((e) => e.slug === defaultSlug);
  const all = await listAllBookings();
  const rows = all.filter((b) => b.eventSlug === defaultSlug);

  const checkedIn = rows.filter((r) => r.status === 'attended').length;
  const confirmed = rows.filter((r) => r.status === 'confirmed').length;
  const cancelled = rows.filter(
    (r) => r.status === 'cancelled' || r.status === 'refunded'
  ).length;

  return (
    <div className="space-y-6">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
          Door · check-in
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          {event?.name || 'No event'}
        </h1>
        <p className="mt-2 text-ink-soft">
          {event?.date} · {event?.area}
        </p>
        {events.length > 1 && (
          <div className="mt-3">
            <EventPicker
              events={events.map((e) => ({
                slug: e.slug,
                name: e.name,
                date: e.date,
              }))}
              defaultSlug={defaultSlug || ''}
            />
          </div>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Checked in" value={`${checkedIn} / ${event?.capacity ?? 0}`} accent="leaf" />
        <Stat label="Awaiting" value={String(confirmed)} accent="marigold" />
        <Stat label="Cancelled / refunded" value={String(cancelled)} accent="crimson" />
      </div>

      <section>
        <h2 className="mb-2 font-display text-lg">Scan QR</h2>
        <QrScanner />
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg">Search & manual check-in</h2>
        <CheckInList rows={rows} eventSlug={defaultSlug || ''} />
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
  accent: 'leaf' | 'marigold' | 'crimson';
}) {
  const accentBg =
    accent === 'leaf'
      ? 'border-leaf/40 bg-leaf/5'
      : accent === 'marigold'
        ? 'border-marigold-200 bg-marigold-50'
        : 'border-crimson/30 bg-crimson/5';
  return (
    <div className={`rounded-2xl border ${accentBg} p-4`}>
      <p className="text-[11px] uppercase tracking-wider text-ink-mute">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl text-ink">{value}</p>
    </div>
  );
}
