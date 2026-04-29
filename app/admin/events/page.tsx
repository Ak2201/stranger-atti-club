import Link from 'next/link';
import { listEvents } from '@/lib/events-store';
import { listAllBookings } from '@/lib/admin-store';
import { requireAdmin, isSuperAdmin } from '@/lib/auth-helpers';
import DeleteEventButton from './DeleteEventButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · events' };

export default async function AdminEvents() {
  const user = await requireAdmin();
  const canDelete = isSuperAdmin(user);
  const [events, allBookings] = await Promise.all([
    listEvents(),
    listAllBookings(),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
            Events
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">
            Manage events
          </h1>
          <p className="mt-2 text-ink-soft">
            Add, edit, or unpublish themes. Click into an event to see who's
            booked.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-full bg-crimson px-5 py-3 text-sm font-semibold text-cream transition hover:bg-crimson-500"
        >
          + New event
        </Link>
      </header>

      <div className="overflow-hidden rounded-2xl border border-marigold-200/60 bg-cream-50">
       <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-ink-mute">
            <tr>
              <th className="p-4">Event</th>
              <th className="p-4">Date</th>
              <th className="p-4">Venue</th>
              <th className="p-4">Sold</th>
              <th className="p-4">Revenue</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => {
              const bookings = allBookings.filter(
                (b) => b.eventSlug === e.slug && b.status === 'confirmed'
              );
              const revenue = bookings.reduce((s, b) => s + b.amountInr, 0);
              return (
                <tr key={e.slug} className="border-t border-marigold-100 text-sm">
                  <td className="p-4">
                    <p className="font-display text-base">{e.name}</p>
                    <p className="text-xs text-ink-mute">/{e.slug}</p>
                  </td>
                  <td className="p-4 text-ink-soft">{e.date}</td>
                  <td className="p-4 text-ink-soft">
                    {e.venue}
                    <span className="text-ink-mute"> · {e.area}</span>
                  </td>
                  <td className="p-4">
                    {bookings.length}/{e.capacity}
                  </td>
                  <td className="p-4">
                    ₹{revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3 text-sm">
                      <Link
                        href={`/admin/events/${e.slug}/attendees`}
                        className="text-crimson hover:underline"
                      >
                        Attendees
                      </Link>
                      <Link
                        href={`/admin/events/${e.slug}/edit`}
                        className="text-ink hover:underline"
                      >
                        Edit
                      </Link>
                      {canDelete ? (
                        <DeleteEventButton
                          slug={e.slug}
                          name={e.name}
                          bookingsCount={
                            allBookings.filter((b) => b.eventSlug === e.slug)
                              .length
                          }
                        />
                      ) : (
                        <span
                          className="cursor-help italic text-ink-mute"
                          title="Super-admin only"
                        >
                          Delete
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
       </div>
      </div>
    </div>
  );
}
