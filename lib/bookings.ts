import { db, schema } from '@/db';
import { events, type EventItem } from '@/lib/events';
import { eq, desc } from 'drizzle-orm';

export type BookingRow = {
  id: string;
  eventSlug: string;
  tierId: string;
  amountInr: number;
  contactName: string;
  status: 'confirmed' | 'cancelled' | 'attended' | 'noshow' | 'refunded';
  createdAt: Date;
  razorpayPaymentId: string | null;
  couponInitialInr?: number;
  couponRedeemedInr?: number;
};

export type BookingWithEvent = BookingRow & { event: EventItem };

/**
 * Demo / placeholder events that have already happened.
 * Used to populate "past attended" history for the demo user when the DB isn't set up.
 */
const PAST_EVENT_STUBS: Record<string, EventItem> = {
  'demo-fake-sangeeth-mar': {
    ...events[0],
    slug: 'demo-fake-sangeeth-mar',
    name: 'Fake Sangeeth Night · Vol. 1',
    tagline: 'Where it all started.',
    date: 'Sat, Mar 22, 2026',
    dateISO: '2026-03-22',
    spotsLeft: 0,
  },
  'demo-glow-up-feb': {
    ...events[1],
    slug: 'demo-glow-up-feb',
    name: 'Glow-Up Gala · Vol. 0',
    tagline: 'The pilot — 24 strangers, 24 wins.',
    date: 'Sat, Feb 15, 2026',
    dateISO: '2026-02-15',
    spotsLeft: 0,
  },
};

/**
 * Hard-coded demo bookings shown when no DB is wired up — so the /me page
 * has something to render in placeholder mode.
 */
const DEMO_BOOKINGS: BookingRow[] = [
  {
    id: 'demo-bk-3',
    eventSlug: 'fake-sangeeth',
    tierId: 'early',
    amountInr: 999,
    contactName: 'Demo Atti',
    status: 'confirmed',
    createdAt: new Date('2026-04-10T10:00:00Z'),
    razorpayPaymentId: 'pay_demo_upcoming1',
  },
  {
    id: 'demo-bk-2',
    eventSlug: 'demo-fake-sangeeth-mar',
    tierId: 'regular',
    amountInr: 1299,
    contactName: 'Demo Atti',
    status: 'attended',
    createdAt: new Date('2026-03-01T10:00:00Z'),
    razorpayPaymentId: 'pay_demo_past1',
  },
  {
    id: 'demo-bk-1',
    eventSlug: 'demo-glow-up-feb',
    tierId: 'early',
    amountInr: 999,
    contactName: 'Demo Atti',
    status: 'attended',
    createdAt: new Date('2026-02-01T10:00:00Z'),
    razorpayPaymentId: 'pay_demo_past2',
  },
];

function lookupEvent(slug: string): EventItem | undefined {
  return events.find((e) => e.slug === slug) || PAST_EVENT_STUBS[slug];
}

function attachEvent(b: BookingRow): BookingWithEvent | null {
  const event = lookupEvent(b.eventSlug);
  if (!event) return null;
  return { ...b, event };
}

export async function getBookingsForUser(
  userId: string | null | undefined
): Promise<BookingWithEvent[]> {
  if (!userId) return [];

  try {
    const rows = await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.userId, userId))
      .orderBy(desc(schema.bookings.createdAt));

    return rows
      .map((r) => attachEvent(r as BookingRow))
      .filter((b): b is BookingWithEvent => b !== null);
  } catch (err) {
    console.warn('[bookings] DB read failed:', err);
    return [];
  }
}

export function splitBookings(all: BookingWithEvent[]) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = all
    .filter((b) => b.event.dateISO >= today && b.status === 'confirmed')
    .sort((a, b) => a.event.dateISO.localeCompare(b.event.dateISO));
  const past = all
    .filter((b) => b.event.dateISO < today)
    .sort((a, b) => b.event.dateISO.localeCompare(a.event.dateISO));
  return { upcoming, past };
}
