import { listEvents } from '@/lib/events-store';
import WalkInForm from './WalkInForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · walk-in booking' };

export default async function WalkInPage() {
  const events = await listEvents();

  return (
    <div className="space-y-6">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
          Walk-in
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          Add an offline booking
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          For someone paying cash or UPI at the door. We still generate a real
          booking row + QR ticket so they appear in attendees, finance, and
          can be checked in like everyone else.
        </p>
      </header>

      <WalkInForm events={events} />
    </div>
  );
}
