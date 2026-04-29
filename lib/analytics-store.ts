import { listAllBookings } from '@/lib/admin-store';
import { listEvents } from '@/lib/events-store';

/**
 * Sales velocity per event — for each event, the cumulative count of
 * confirmed bookings in 1-day buckets relative to the event date.
 */
export async function salesVelocity() {
  const [events, bookings] = await Promise.all([
    listEvents(),
    listAllBookings(),
  ]);

  return events
    .filter((e) => e.dateISO)
    .map((e) => {
      const eventDate = new Date(e.dateISO);
      const evBookings = bookings
        .filter(
          (b) =>
            b.eventSlug === e.slug &&
            (b.status === 'confirmed' || b.status === 'attended')
        )
        .map((b) => ({
          daysBefore: Math.max(
            0,
            Math.round(
              (eventDate.getTime() - new Date(b.createdAt).getTime()) /
                86400000
            )
          ),
        }))
        .sort((a, b) => b.daysBefore - a.daysBefore);

      // Bucket per day-before (0..maxDays). Cumulative.
      const maxDays = evBookings[0]?.daysBefore ?? 30;
      const points: { dBefore: number; cumulative: number }[] = [];
      let cumulative = 0;
      for (let d = maxDays; d >= 0; d--) {
        const arrivedThatDay = evBookings.filter(
          (x) => x.daysBefore === d
        ).length;
        cumulative += arrivedThatDay;
        points.push({ dBefore: d, cumulative });
      }
      return {
        slug: e.slug,
        name: e.name,
        capacity: e.capacity,
        points,
      };
    });
}

/**
 * Cohort retention: for each event, what % of its attendees also booked the
 * next event(s). Joined by attendee email.
 */
export async function cohortRetention() {
  const [events, bookings] = await Promise.all([
    listEvents(),
    listAllBookings(),
  ]);

  // Sort events by date ASC.
  const sorted = events
    .filter((e) => e.dateISO)
    .slice()
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));

  function emailsForEvent(slug: string): Set<string> {
    return new Set(
      bookings
        .filter(
          (b) =>
            b.eventSlug === slug &&
            (b.status === 'confirmed' || b.status === 'attended') &&
            b.contactEmail
        )
        .map((b) => b.contactEmail!.toLowerCase())
    );
  }

  // Build a matrix: for each cohort (row event), how many attendees showed up
  // at each subsequent event (column events).
  return sorted.map((cohort) => {
    const cohortEmails = emailsForEvent(cohort.slug);
    const followUps = sorted
      .filter((e) => e.dateISO > cohort.dateISO)
      .map((e) => {
        const overlap = [...emailsForEvent(e.slug)].filter((x) =>
          cohortEmails.has(x)
        ).length;
        return {
          slug: e.slug,
          name: e.name,
          attended: overlap,
          retentionPct:
            cohortEmails.size > 0
              ? Math.round((overlap / cohortEmails.size) * 100)
              : 0,
        };
      });
    return {
      slug: cohort.slug,
      name: cohort.name,
      cohortSize: cohortEmails.size,
      followUps,
    };
  });
}
