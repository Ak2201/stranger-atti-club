import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEvent } from '@/lib/events-store';
import { listAttendeesForEvent } from '@/lib/admin-store';
import { requireAdmin, isSuperAdmin } from '@/lib/auth-helpers';
import AttendeesTable from '../../../bookings/AttendeesTable';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const ev = await getEvent(params.slug);
  return { title: `Admin · attendees · ${ev?.name || params.slug}` };
}

export default async function EventAttendees({
  params,
}: {
  params: { slug: string };
}) {
  const user = await requireAdmin();
  const ev = await getEvent(params.slug);
  if (!ev) notFound();

  const all = await listAttendeesForEvent(params.slug);
  const confirmed = all.filter((a) => a.status === 'confirmed');
  const cancelled = all.filter((a) => a.status === 'cancelled');
  const revenue = confirmed.reduce((s, a) => s + a.amountInr, 0);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/events"
          className="text-sm text-ink-mute hover:text-crimson"
        >
          ← Events
        </Link>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          Attendees · {ev.name}
        </h1>
        <p className="mt-2 text-ink-soft">
          {ev.date} · {ev.venue} · {ev.area}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Stat label="Confirmed" value={String(confirmed.length)} />
        <Stat label="Cancelled" value={String(cancelled.length)} />
        <Stat label="Capacity" value={`${confirmed.length} / ${ev.capacity}`} />
        <Stat
          label="Revenue (confirmed)"
          value={`₹${revenue.toLocaleString('en-IN')}`}
        />
      </div>

      <AttendeesTable
        rows={all}
        eventSlug={params.slug}
        eventName={ev.name}
        canDelete={isSuperAdmin(user)}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-5">
      <p className="text-[11px] uppercase tracking-wider text-ink-mute">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
    </div>
  );
}
