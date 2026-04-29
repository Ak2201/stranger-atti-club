/**
 * Runs once per Next.js process startup (including each Vercel cold start).
 * Boots the SQLite schema if it's missing — critical for Vercel's ephemeral
 * /tmp filesystem where the DB file gets recreated on every container.
 *
 * For Turso (real prod), the schema persists across restarts so this is a
 * cheap idempotent no-op.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  try {
    const { dbClient } = await import('./db');

    const ddl = [
      `CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL UNIQUE,
        emailVerified INTEGER,
        image TEXT,
        whatsapp TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        banned INTEGER NOT NULL DEFAULT 0,
        lastSeenAt INTEGER,
        createdAt INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS account (
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        providerAccountId TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        PRIMARY KEY (provider, providerAccountId),
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS session (
        sessionToken TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        expires INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS verificationToken (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires INTEGER NOT NULL,
        PRIMARY KEY (identifier, token)
      )`,
      `CREATE TABLE IF NOT EXISTS event (
        slug TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tagline TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL DEFAULT '',
        dateISO TEXT NOT NULL DEFAULT '',
        doors TEXT NOT NULL DEFAULT '7:00 PM',
        closes TEXT NOT NULL DEFAULT '11:00 PM',
        venue TEXT NOT NULL DEFAULT '',
        area TEXT NOT NULL DEFAULT '',
        city TEXT NOT NULL DEFAULT 'Chennai',
        capacity INTEGER NOT NULL DEFAULT 60,
        spotsLeft INTEGER NOT NULL DEFAULT 60,
        heroEmoji TEXT NOT NULL DEFAULT '✺',
        accent TEXT NOT NULL DEFAULT 'marigold',
        description TEXT NOT NULL DEFAULT '',
        dressCode TEXT NOT NULL DEFAULT '',
        whatYouDoJson TEXT NOT NULL DEFAULT '[]',
        whatYouWontJson TEXT NOT NULL DEFAULT '[]',
        scheduleJson TEXT NOT NULL DEFAULT '[]',
        faqJson TEXT NOT NULL DEFAULT '[]',
        tiersJson TEXT NOT NULL DEFAULT '[]',
        isPublished INTEGER NOT NULL DEFAULT 1,
        couponEnabled INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER,
        updatedAt INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS booking (
        id TEXT PRIMARY KEY,
        userId TEXT,
        eventSlug TEXT NOT NULL,
        tierId TEXT NOT NULL,
        amountInr INTEGER NOT NULL,
        contactName TEXT NOT NULL,
        contactPhone TEXT NOT NULL,
        contactEmail TEXT,
        razorpayOrderId TEXT,
        razorpayPaymentId TEXT,
        razorpayRefundId TEXT,
        paymentMethod TEXT NOT NULL DEFAULT 'razorpay',
        checkedInAt INTEGER,
        status TEXT NOT NULL DEFAULT 'confirmed',
        couponInitialInr INTEGER NOT NULL DEFAULT 0,
        couponRedeemedInr INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER,
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS waitlist (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        source TEXT,
        createdAt INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS expense (
        id TEXT PRIMARY KEY,
        eventSlug TEXT NOT NULL,
        category TEXT NOT NULL,
        amountInr INTEGER NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        receiptUrl TEXT,
        createdBy TEXT,
        createdAt INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS messageTemplate (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        channel TEXT NOT NULL,
        subject TEXT,
        body TEXT NOT NULL,
        createdAt INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS messageBlast (
        id TEXT PRIMARY KEY,
        eventSlug TEXT,
        audience TEXT NOT NULL,
        channel TEXT NOT NULL,
        subject TEXT,
        body TEXT NOT NULL,
        recipientCount INTEGER NOT NULL DEFAULT 0,
        sentBy TEXT,
        sentAt INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS teamInvite (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'admin',
        invitedBy TEXT,
        invitedAt INTEGER,
        acceptedAt INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS auditLog (
        id TEXT PRIMARY KEY,
        actorEmail TEXT NOT NULL,
        actorRole TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT,
        payloadJson TEXT,
        outcome TEXT NOT NULL DEFAULT 'ok',
        createdAt INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS redemption (
        id TEXT PRIMARY KEY,
        bookingId TEXT NOT NULL,
        amountInr INTEGER NOT NULL,
        note TEXT,
        station TEXT,
        vendorEmail TEXT NOT NULL,
        vendorRole TEXT NOT NULL,
        voidedAt INTEGER,
        voidedBy TEXT,
        voidReason TEXT,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (bookingId) REFERENCES booking(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS idx_redemption_booking ON redemption(bookingId)`,
      `CREATE INDEX IF NOT EXISTS idx_redemption_active  ON redemption(bookingId, voidedAt)`,
    ];

    for (const sql of ddl) {
      await dbClient.execute(sql);
    }

    // Seed sample events on first cold start so the public site isn't blank.
    const { seedIfEmpty } = await import('./lib/events-store');
    await seedIfEmpty();

    console.log('[instrumentation] DB ready');
  } catch (err) {
    console.error('[instrumentation] DB bootstrap failed:', err);
  }
}
