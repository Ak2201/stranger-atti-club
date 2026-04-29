import { db, schema } from '@/db';
import { desc, eq, sql } from 'drizzle-orm';

export type UserRow = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'user' | 'admin' | 'super_admin';
  banned: boolean;
  whatsapp: string | null;
  lastSeenAt: Date | null;
  createdAt: Date | null;
};

export type UserSummary = UserRow & {
  bookingsCount: number;
  confirmedCount: number;
  attendedCount: number;
  cancelledCount: number;
  refundedCount: number;
  lifetimeSpend: number;
  upcomingCount: number;
};

function rowToUser(r: any): UserRow {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    image: r.image,
    role: r.role,
    banned: !!r.banned,
    whatsapp: r.whatsapp ?? null,
    lastSeenAt: r.lastSeenAt ? new Date(Number(r.lastSeenAt)) : null,
    createdAt: r.createdAt ? new Date(Number(r.createdAt)) : null,
  };
}

export async function listUsers(): Promise<UserSummary[]> {
  try {
    const users = await db.select().from(schema.users).all();
    const bookings = await db.select().from(schema.bookings).all();
    const today = new Date().toISOString().slice(0, 10);

    // Need event dateISO to compute "upcoming"
    const events = await db.select().from(schema.events).all();
    const dateBySlug = new Map(events.map((e) => [e.slug, e.dateISO]));

    return users
      .map((u) => {
        const userBookings = bookings.filter((b) => b.userId === u.id);
        const confirmed = userBookings.filter((b) => b.status === 'confirmed');
        const attended = userBookings.filter((b) => b.status === 'attended');
        const cancelled = userBookings.filter((b) => b.status === 'cancelled');
        const refunded = userBookings.filter((b) => b.status === 'refunded');
        const lifetimeSpend = userBookings
          .filter((b) => b.status === 'confirmed' || b.status === 'attended')
          .reduce((s, b) => s + b.amountInr, 0);
        const upcomingCount = confirmed.filter((b) => {
          const d = dateBySlug.get(b.eventSlug);
          return d && d >= today;
        }).length;
        return {
          ...rowToUser(u),
          bookingsCount: userBookings.length,
          confirmedCount: confirmed.length,
          attendedCount: attended.length,
          cancelledCount: cancelled.length,
          refundedCount: refunded.length,
          lifetimeSpend,
          upcomingCount,
        };
      })
      .sort(
        (a, b) =>
          (b.lastSeenAt?.getTime() ?? 0) - (a.lastSeenAt?.getTime() ?? 0)
      );
  } catch (err) {
    console.warn('[users-store] list failed:', err);
    return [];
  }
}

export async function getUser(id: string): Promise<UserRow | null> {
  try {
    const row = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .get();
    return row ? rowToUser(row) : null;
  } catch {
    return null;
  }
}

export async function listBookingsForUser(userId: string) {
  try {
    return await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.userId, userId))
      .orderBy(desc(schema.bookings.createdAt))
      .all();
  } catch {
    return [];
  }
}
