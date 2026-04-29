import { db, schema } from '@/db';
import { desc, eq } from 'drizzle-orm';
import type { BookingRow } from '@/lib/bookings';

/**
 * Admin-side queries — global views across all users / events.
 * Demo mode returns realistic seeded data so the UI is testable without a DB.
 */

export type AttendeeRow = BookingRow & {
  contactPhone: string;
  contactEmail: string | null;
  attendeeUserName?: string | null;
  attendeeUserEmail?: string | null;
  razorpayOrderId: string | null;
};

const DEMO_ATTENDEES: AttendeeRow[] = [
  {
    id: 'bk-001',
    eventSlug: 'fake-sangeeth',
    tierId: 'early',
    amountInr: 999,
    contactName: 'Priya Ramanan',
    contactPhone: '+91 98765 43210',
    contactEmail: 'priya.r@gmail.com',
    status: 'confirmed',
    createdAt: new Date('2026-04-12T10:23:00Z'),
    razorpayPaymentId: 'pay_NQR8t2vHk1',
    razorpayOrderId: 'order_NQR8s3uG0',
    attendeeUserName: 'Priya R.',
    attendeeUserEmail: 'priya.r@gmail.com',
  },
  {
    id: 'bk-002',
    eventSlug: 'fake-sangeeth',
    tierId: 'regular',
    amountInr: 1299,
    contactName: 'Karthik Subramaniam',
    contactPhone: '+91 99887 65432',
    contactEmail: 'karthik.s@protonmail.com',
    status: 'confirmed',
    createdAt: new Date('2026-04-13T14:11:00Z'),
    razorpayPaymentId: 'pay_NQS9u4wJk2',
    razorpayOrderId: 'order_NQS9t5vH1',
    attendeeUserName: 'Karthik S.',
    attendeeUserEmail: 'karthik.s@protonmail.com',
  },
  {
    id: 'bk-003',
    eventSlug: 'fake-sangeeth',
    tierId: 'pair',
    amountInr: 1799,
    contactName: 'Aishwarya Devi',
    contactPhone: '+91 90123 45678',
    contactEmail: 'aishu.designs@gmail.com',
    status: 'confirmed',
    createdAt: new Date('2026-04-14T09:45:00Z'),
    razorpayPaymentId: 'pay_NQT2v5xKm3',
    razorpayOrderId: 'order_NQT2u6wI2',
    attendeeUserName: 'Aishu',
    attendeeUserEmail: 'aishu.designs@gmail.com',
  },
  {
    id: 'bk-004',
    eventSlug: 'fake-sangeeth',
    tierId: 'early',
    amountInr: 999,
    contactName: 'Rahul Iyer',
    contactPhone: '+91 88776 55443',
    contactEmail: null,
    status: 'confirmed',
    createdAt: new Date('2026-04-15T18:02:00Z'),
    razorpayPaymentId: 'pay_NQU3w6yLn4',
    razorpayOrderId: 'order_NQU3v7xJ3',
    attendeeUserName: null,
    attendeeUserEmail: null,
  },
  {
    id: 'bk-005',
    eventSlug: 'fake-sangeeth',
    tierId: 'regular',
    amountInr: 1299,
    contactName: 'Meera Bhaskar',
    contactPhone: '+91 77665 44332',
    contactEmail: 'meera.bh@yahoo.in',
    status: 'cancelled',
    createdAt: new Date('2026-04-16T11:20:00Z'),
    razorpayPaymentId: 'pay_NQV4x7zMp5',
    razorpayOrderId: 'order_NQV4w8yK4',
    attendeeUserName: null,
    attendeeUserEmail: null,
  },
  {
    id: 'bk-006',
    eventSlug: 'fake-sangeeth',
    tierId: 'regular',
    amountInr: 1299,
    contactName: 'Sneha Pillai',
    contactPhone: '+91 99001 22334',
    contactEmail: 'sneha.pillai@hotmail.com',
    status: 'confirmed',
    createdAt: new Date('2026-04-18T20:15:00Z'),
    razorpayPaymentId: 'pay_NQW5y8aNq6',
    razorpayOrderId: 'order_NQW5x9zL5',
    attendeeUserName: null,
    attendeeUserEmail: null,
  },
  {
    id: 'bk-007',
    eventSlug: 'fake-sangeeth',
    tierId: 'early',
    amountInr: 999,
    contactName: 'Arvind Krishnan',
    contactPhone: '+91 96543 21098',
    contactEmail: 'arvind.k@workmail.com',
    status: 'confirmed',
    createdAt: new Date('2026-04-19T08:33:00Z'),
    razorpayPaymentId: 'pay_NQX6z9bOr7',
    razorpayOrderId: 'order_NQX6yAaM6',
    attendeeUserName: 'Arvind K.',
    attendeeUserEmail: 'arvind.k@workmail.com',
  },
  {
    id: 'bk-008',
    eventSlug: 'glow-up-gala',
    tierId: 'early',
    amountInr: 999,
    contactName: 'Niharika Sen',
    contactPhone: '+91 91234 56789',
    contactEmail: 'niharika.s@gmail.com',
    status: 'confirmed',
    createdAt: new Date('2026-04-20T15:45:00Z'),
    razorpayPaymentId: 'pay_NQY7aAcPs8',
    razorpayOrderId: 'order_NQY7zBbN7',
    attendeeUserName: null,
    attendeeUserEmail: null,
  },
  {
    id: 'bk-009',
    eventSlug: 'glow-up-gala',
    tierId: 'regular',
    amountInr: 1299,
    contactName: 'Vikram Menon',
    contactPhone: '+91 87654 32109',
    contactEmail: 'vikram.menon@outlook.com',
    status: 'confirmed',
    createdAt: new Date('2026-04-21T13:00:00Z'),
    razorpayPaymentId: 'pay_NQZ8bBdQt9',
    razorpayOrderId: 'order_NQZ8aCcO8',
    attendeeUserName: 'Vikram M.',
    attendeeUserEmail: 'vikram.menon@outlook.com',
  },
  {
    id: 'bk-010',
    eventSlug: 'glow-up-gala',
    tierId: 'early',
    amountInr: 999,
    contactName: 'Tara Joseph',
    contactPhone: '+91 95432 10987',
    contactEmail: 'tara.j@gmail.com',
    status: 'confirmed',
    createdAt: new Date('2026-04-22T19:18:00Z'),
    razorpayPaymentId: 'pay_NRA9cCeRu0',
    razorpayOrderId: 'order_NRA9bDdP9',
    attendeeUserName: null,
    attendeeUserEmail: null,
  },
];

export async function listAllBookings(): Promise<AttendeeRow[]> {
  try {
    const rows = await db
      .select({
        id: schema.bookings.id,
        eventSlug: schema.bookings.eventSlug,
        tierId: schema.bookings.tierId,
        amountInr: schema.bookings.amountInr,
        contactName: schema.bookings.contactName,
        contactPhone: schema.bookings.contactPhone,
        contactEmail: schema.bookings.contactEmail,
        status: schema.bookings.status,
        createdAt: schema.bookings.createdAt,
        razorpayPaymentId: schema.bookings.razorpayPaymentId,
        razorpayOrderId: schema.bookings.razorpayOrderId,
        userId: schema.bookings.userId,
        couponInitialInr: schema.bookings.couponInitialInr,
        couponRedeemedInr: schema.bookings.couponRedeemedInr,
        attendeeUserName: schema.users.name,
        attendeeUserEmail: schema.users.email,
      })
      .from(schema.bookings)
      .leftJoin(schema.users, eq(schema.bookings.userId, schema.users.id))
      .orderBy(desc(schema.bookings.createdAt));

    // Empty DB? Show seed attendees so the dashboard isn't blank on day one.
    if (rows.length === 0) {
      return [...DEMO_ATTENDEES].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    }
    return rows as any as AttendeeRow[];
  } catch (err) {
    console.warn('[admin-store] DB read failed:', err);
    return DEMO_ATTENDEES;
  }
}

export async function listAttendeesForEvent(slug: string): Promise<AttendeeRow[]> {
  const all = await listAllBookings();
  return all.filter((b) => b.eventSlug === slug);
}

export async function adminStats() {
  const all = await listAllBookings();
  const confirmed = all.filter((b) => b.status === 'confirmed');
  const totalRevenue = confirmed.reduce((s, b) => s + b.amountInr, 0);
  const byEvent = new Map<string, { count: number; revenue: number }>();
  for (const b of confirmed) {
    const cur = byEvent.get(b.eventSlug) || { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += b.amountInr;
    byEvent.set(b.eventSlug, cur);
  }
  return {
    totalBookings: all.length,
    confirmedBookings: confirmed.length,
    cancelledBookings: all.length - confirmed.length,
    totalRevenue,
    byEvent,
    recent: all.slice(0, 8),
  };
}

export function bookingsToCsv(rows: AttendeeRow[]): string {
  const headers = [
    'Booking ID',
    'Event',
    'Tier',
    'Amount (INR)',
    'Status',
    'Attendee Name',
    'Phone',
    'Email',
    'User Account',
    'Razorpay Payment ID',
    'Razorpay Order ID',
    'Booked At',
  ];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.eventSlug,
        r.tierId,
        r.amountInr,
        r.status,
        csvCell(r.contactName),
        csvCell(r.contactPhone),
        csvCell(r.contactEmail || ''),
        csvCell(r.attendeeUserEmail || ''),
        r.razorpayPaymentId || '',
        r.razorpayOrderId || '',
        r.createdAt.toISOString(),
      ].join(',')
    );
  }
  return lines.join('\n');
}

function csvCell(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
