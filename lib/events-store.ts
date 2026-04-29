import { db, schema } from '@/db';
import { events as seedEvents, type EventItem, type Tier } from '@/lib/events';
import { eq } from 'drizzle-orm';

/**
 * Async events-store abstraction.
 *
 * Demo mode (no DB): returns the hard-coded seed events from `lib/events.ts`,
 * and write operations are no-ops returning a "demo" sentinel so the admin UI
 * can render but doesn't fake persistence.
 *
 * Real mode: reads/writes the `event` table in libSQL via Drizzle.
 *
 * Nested structures (tiers, schedule, faq, whatYouDo/Wont) are stored as
 * JSON-encoded text in libSQL for simplicity — sufficient for the
 * single-org admin use case.
 */

export type WriteResult =
  | { ok: true; event: EventItem }
  | { ok: false; reason: 'demo' | 'not-found' | 'duplicate' | 'invalid'; message: string };

function rowToEvent(row: any): EventItem {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? '',
    date: row.date ?? '',
    dateISO: row.dateISO ?? '',
    couponEnabled: !!row.couponEnabled,
    doors: row.doors ?? '',
    closes: row.closes ?? '',
    venue: row.venue ?? '',
    area: row.area ?? '',
    city: row.city ?? 'Chennai',
    capacity: row.capacity ?? 60,
    spotsLeft: row.spotsLeft ?? row.capacity ?? 60,
    heroEmoji: row.heroEmoji ?? '✺',
    accent: row.accent ?? 'marigold',
    description: row.description ?? '',
    dressCode: row.dressCode ?? '',
    whatYouDo: safeJson<string[]>(row.whatYouDoJson, []),
    whatYouWont: safeJson<string[]>(row.whatYouWontJson, []),
    schedule: safeJson<EventItem['schedule']>(row.scheduleJson, []),
    faq: safeJson<EventItem['faq']>(row.faqJson, []),
    tiers: safeJson<Tier[]>(row.tiersJson, []),
  };
}

function eventToRow(ev: EventItem) {
  return {
    slug: ev.slug,
    name: ev.name,
    tagline: ev.tagline,
    date: ev.date,
    dateISO: ev.dateISO,
    doors: ev.doors,
    closes: ev.closes,
    venue: ev.venue,
    area: ev.area,
    city: ev.city,
    capacity: ev.capacity,
    spotsLeft: ev.spotsLeft,
    heroEmoji: ev.heroEmoji,
    accent: ev.accent,
    description: ev.description,
    dressCode: ev.dressCode,
    whatYouDoJson: JSON.stringify(ev.whatYouDo),
    whatYouWontJson: JSON.stringify(ev.whatYouWont),
    scheduleJson: JSON.stringify(ev.schedule),
    faqJson: JSON.stringify(ev.faq),
    tiersJson: JSON.stringify(ev.tiers),
    isPublished: true,
    couponEnabled: !!ev.couponEnabled,
  };
}

function safeJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export async function listEvents(): Promise<EventItem[]> {
  try {
    await ensureSeed();
    const rows = await db.select().from(schema.events).all();
    if (rows.length === 0) return seedEvents;
    return rows.map(rowToEvent);
  } catch (err) {
    console.warn('[events-store] DB read failed, falling back to seed:', err);
    return seedEvents;
  }
}

export async function getEvent(slug: string): Promise<EventItem | undefined> {
  try {
    await ensureSeed();
    const row = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .get();
    if (row) return rowToEvent(row);
    return seedEvents.find((e) => e.slug === slug);
  } catch (err) {
    console.warn('[events-store] DB read failed:', err);
    return seedEvents.find((e) => e.slug === slug);
  }
}

export async function createEvent(ev: EventItem): Promise<WriteResult> {
  try {
    const exists = await db
      .select({ slug: schema.events.slug })
      .from(schema.events)
      .where(eq(schema.events.slug, ev.slug))
      .get();
    if (exists) {
      return { ok: false, reason: 'duplicate', message: `Slug "${ev.slug}" already exists.` };
    }
    await db.insert(schema.events).values(eventToRow(ev));
    return { ok: true, event: ev };
  } catch (err: any) {
    return { ok: false, reason: 'invalid', message: err?.message || 'Insert failed' };
  }
}

export async function updateEvent(
  slug: string,
  ev: Partial<EventItem>
): Promise<WriteResult> {
  try {
    const existing = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .get();
    if (!existing) {
      return { ok: false, reason: 'not-found', message: `Event "${slug}" not found.` };
    }
    const merged = { ...rowToEvent(existing), ...ev, slug } as EventItem;
    await db
      .update(schema.events)
      .set({ ...eventToRow(merged), updatedAt: new Date() })
      .where(eq(schema.events.slug, slug));
    return { ok: true, event: merged };
  } catch (err: any) {
    return { ok: false, reason: 'invalid', message: err?.message || 'Update failed' };
  }
}

export async function deleteEvent(slug: string): Promise<WriteResult> {
  try {
    const existing = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .get();
    if (!existing) return { ok: false, reason: 'not-found', message: 'Not found.' };
    await db.delete(schema.events).where(eq(schema.events.slug, slug));
    return { ok: true, event: rowToEvent(existing) };
  } catch (err: any) {
    return { ok: false, reason: 'invalid', message: err?.message || 'Delete failed' };
  }
}

/** One-shot bootstrap: insert seed events into an empty DB. Idempotent. */
export async function seedIfEmpty() {
  const existing = await db.select().from(schema.events).all();
  if (existing.length > 0) return;
  for (const ev of seedEvents) {
    await db.insert(schema.events).values(eventToRow(ev));
  }
}

let seeded = false;
async function ensureSeed() {
  if (seeded) return;
  try {
    await seedIfEmpty();
    seeded = true;
  } catch (err) {
    // Tables may not exist yet; surface clearly.
    console.warn('[events-store] seed skipped:', (err as Error)?.message);
  }
}
