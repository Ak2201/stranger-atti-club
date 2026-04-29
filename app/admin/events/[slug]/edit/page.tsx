import { notFound } from 'next/navigation';
import Link from 'next/link';
import EventForm from '../../EventForm';
import DeleteEventButton from '../../DeleteEventButton';
import { updateEventAction } from '../../actions';
import { getEvent } from '@/lib/events-store';
import { listAttendeesForEvent } from '@/lib/admin-store';
import { isDemoMode } from '@/db';
import { requireAdmin, isSuperAdmin } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return { title: `Admin · edit ${params.slug}` };
}

export default async function EditEvent({
  params,
}: {
  params: { slug: string };
}) {
  const user = await requireAdmin();
  const ev = await getEvent(params.slug);
  if (!ev) notFound();

  const action = updateEventAction.bind(null, params.slug);
  const attendees = await listAttendeesForEvent(params.slug);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/events"
          className="text-sm text-ink-mute hover:text-crimson"
        >
          ← Events
        </Link>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          Edit · {ev.name}
        </h1>
        <p className="mt-2 text-ink-soft">
          Public URL:{' '}
          <Link
            href={`/events/${ev.slug}`}
            className="text-crimson hover:underline"
          >
            /events/{ev.slug}
          </Link>{' '}
          · Attendees:{' '}
          <Link
            href={`/admin/events/${ev.slug}/attendees`}
            className="text-crimson hover:underline"
          >
            View list →
          </Link>
        </p>
      </div>

      <EventForm
        mode="edit"
        action={action}
        initial={ev}
        isDemo={isDemoMode || !process.env.TURSO_DATABASE_URL}
      />

      <section className="rounded-3xl border-2 border-crimson/30 bg-crimson/5 p-6">
        <h3 className="font-display text-xl text-crimson">Danger zone</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Deleting an event is permanent. Existing bookings keep their data
          but lose the event reference (status preserved for history).
        </p>
        <div className="mt-4">
          {isSuperAdmin(user) ? (
            <DeleteEventButton
              slug={ev.slug}
              name={ev.name}
              bookingsCount={attendees.length}
            />
          ) : (
            <p
              className="cursor-help text-sm italic text-ink-mute"
              title="Super-admin only"
            >
              Delete event — super-admin only.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
