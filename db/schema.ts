import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import type { AdapterAccountType } from 'next-auth/adapters';

/**
 * Auth.js (NextAuth v5) standard schema for SQLite/libSQL.
 * Reference: https://authjs.dev/getting-started/adapters/drizzle
 */
export const users = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  whatsapp: text('whatsapp'),
  role: text('role', { enum: ['user', 'admin', 'super_admin', 'vendor'] })
    .notNull()
    .default('user'),
  banned: integer('banned', { mode: 'boolean' }).notNull().default(false),
  lastSeenAt: integer('lastSeenAt', { mode: 'timestamp_ms' }),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date()),
});

export const accounts = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    pk: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  })
);

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
});

export const verificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
  },
  (vt) => ({
    pk: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

/* ---- Stranger Atti Club domain tables ---- */

export const events = sqliteTable('event', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  tagline: text('tagline').notNull().default(''),
  date: text('date').notNull().default(''),
  dateISO: text('dateISO').notNull().default(''),
  doors: text('doors').notNull().default('7:00 PM'),
  closes: text('closes').notNull().default('11:00 PM'),
  venue: text('venue').notNull().default(''),
  area: text('area').notNull().default(''),
  city: text('city').notNull().default('Chennai'),
  capacity: integer('capacity').notNull().default(60),
  spotsLeft: integer('spotsLeft').notNull().default(60),
  heroEmoji: text('heroEmoji').notNull().default('✺'),
  accent: text('accent', { enum: ['marigold', 'crimson', 'leaf'] })
    .notNull()
    .default('marigold'),
  description: text('description').notNull().default(''),
  dressCode: text('dressCode').notNull().default(''),
  // JSON-encoded arrays — kept as text for libSQL compat
  whatYouDoJson: text('whatYouDoJson').notNull().default('[]'),
  whatYouWontJson: text('whatYouWontJson').notNull().default('[]'),
  scheduleJson: text('scheduleJson').notNull().default('[]'),
  faqJson: text('faqJson').notNull().default('[]'),
  tiersJson: text('tiersJson').notNull().default('[]'),
  isPublished: integer('isPublished', { mode: 'boolean' })
    .notNull()
    .default(true),
  couponEnabled: integer('couponEnabled', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date()),
});

export const bookings = sqliteTable('booking', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').references(() => users.id, { onDelete: 'set null' }),
  eventSlug: text('eventSlug').notNull(),
  tierId: text('tierId').notNull(),
  amountInr: integer('amountInr').notNull(),
  contactName: text('contactName').notNull(),
  contactPhone: text('contactPhone').notNull(),
  contactEmail: text('contactEmail'),
  razorpayOrderId: text('razorpayOrderId'),
  razorpayPaymentId: text('razorpayPaymentId'),
  razorpayRefundId: text('razorpayRefundId'),
  paymentMethod: text('paymentMethod', {
    enum: ['razorpay', 'cash', 'upi_offline', 'comp'],
  })
    .notNull()
    .default('razorpay'),
  checkedInAt: integer('checkedInAt', { mode: 'timestamp_ms' }),
  status: text('status', {
    enum: ['confirmed', 'cancelled', 'attended', 'noshow', 'refunded'],
  })
    .notNull()
    .default('confirmed'),
  couponInitialInr: integer('couponInitialInr').notNull().default(0),
  couponRedeemedInr: integer('couponRedeemedInr').notNull().default(0),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date()),
});

export const redemptions = sqliteTable('redemption', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookingId: text('bookingId')
    .notNull()
    .references(() => bookings.id, { onDelete: 'cascade' }),
  amountInr: integer('amountInr').notNull(),
  note: text('note'),
  station: text('station'),
  vendorEmail: text('vendorEmail').notNull(),
  vendorRole: text('vendorRole').notNull(),
  voidedAt: integer('voidedAt', { mode: 'timestamp_ms' }),
  voidedBy: text('voidedBy'),
  voidReason: text('voidReason'),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const expenses = sqliteTable('expense', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventSlug: text('eventSlug').notNull(),
  category: text('category', {
    enum: [
      'venue',
      'decor',
      'dj',
      'photographer',
      'food_beverage',
      'choreographer',
      'marketing',
      'contingency',
      'other',
    ],
  }).notNull(),
  amountInr: integer('amountInr').notNull(),
  date: text('date').notNull(),
  notes: text('notes'),
  receiptUrl: text('receiptUrl'),
  createdBy: text('createdBy'),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date()),
});

export const messageTemplates = sqliteTable('messageTemplate', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  channel: text('channel', { enum: ['whatsapp', 'email'] }).notNull(),
  subject: text('subject'),
  body: text('body').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date()),
});

export const messageBlasts = sqliteTable('messageBlast', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventSlug: text('eventSlug'),
  audience: text('audience', {
    enum: ['confirmed', 'waitlist', 'past', 'all'],
  }).notNull(),
  channel: text('channel', { enum: ['whatsapp', 'email'] }).notNull(),
  subject: text('subject'),
  body: text('body').notNull(),
  recipientCount: integer('recipientCount').notNull().default(0),
  sentBy: text('sentBy'),
  sentAt: integer('sentAt', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date()),
});

export const teamInvites = sqliteTable('teamInvite', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  role: text('role', { enum: ['admin', 'super_admin'] })
    .notNull()
    .default('admin'),
  invitedBy: text('invitedBy'),
  invitedAt: integer('invitedAt', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date()),
  acceptedAt: integer('acceptedAt', { mode: 'timestamp_ms' }),
});

export const auditLogs = sqliteTable('auditLog', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  actorEmail: text('actorEmail').notNull(),
  actorRole: text('actorRole').notNull(),
  action: text('action').notNull(),
  target: text('target'),
  payloadJson: text('payloadJson'),
  outcome: text('outcome', { enum: ['ok', 'denied', 'error'] })
    .notNull()
    .default('ok'),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date()),
});

export const waitlist = sqliteTable('waitlist', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull(),
  source: text('source'),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date()),
});
