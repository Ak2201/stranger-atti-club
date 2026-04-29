import EventForm from '../EventForm';
import { createEventAction } from '../actions';
import { isDemoMode } from '@/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · new event' };

export default function NewEvent() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/events" className="text-sm text-ink-mute hover:text-crimson">
          ← Events
        </Link>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">New event</h1>
        <p className="mt-2 text-ink-soft">
          Spin up a new theme. Slug becomes the URL: <code>/events/{'{slug}'}</code>.
        </p>
      </div>

      <EventForm
        mode="create"
        action={createEventAction}
        isDemo={isDemoMode || !process.env.TURSO_DATABASE_URL}
        initial={{
          accent: 'marigold',
          heroEmoji: '✺',
          city: 'Chennai',
          capacity: 60,
          doors: '7:00 PM',
          closes: '11:00 PM',
          tiers: [
            {
              id: 'early',
              label: 'Early Bird',
              priceInr: 999,
              description: 'First 30 spots.',
            },
            {
              id: 'regular',
              label: 'Regular',
              priceInr: 1299,
              description: 'Standard ticket.',
            },
          ],
          schedule: [
            { time: '7:00 PM', block: 'Doors · welcome' },
            { time: '7:30 PM', block: 'Group photo · the main moment' },
            { time: '9:00 PM', block: 'Game · cake' },
            { time: '11:00 PM', block: 'Closing circle' },
          ],
          whatYouDo: ['Wear something celebratory'],
          whatYouWont: ['Be made to network'],
          faq: [
            {
              q: 'Can I come alone?',
              a: 'Yes — most people do. The format is built for solo attendees.',
            },
          ],
        }}
      />
    </div>
  );
}
