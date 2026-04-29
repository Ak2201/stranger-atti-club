import Section from '@/components/Section';
import EventCard from '@/components/EventCard';
import { listEvents } from '@/lib/events-store';

export const metadata = { title: 'Upcoming events' };
export const dynamic = 'force-dynamic';

export default async function EventsIndex() {
  const all = await listEvents();
  // Hide past events from the public listing — they're book-able by accident otherwise.
  const today = new Date().toISOString().slice(0, 10);
  const events = all
    .filter((e) => !e.dateISO || e.dateISO >= today)
    .sort((a, b) => (a.dateISO || '').localeCompare(b.dateISO || ''));
  return (
    <Section
      eyebrow="What's coming up"
      title="One event a month. Sometimes two."
      intro="They sell out — book early. Solo-friendly. 50/50 ratio. Code of conduct enforced."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <EventCard key={e.slug} event={e} />
        ))}
      </div>
    </Section>
  );
}
