# Stranger Atti Club — website + mobile apps

Next.js 14 (App Router) + Tailwind + Razorpay + PWA + Capacitor (APK/IPA).

One codebase, three deliverables:
- **Website** — deployed on Vercel free tier
- **PWA** — installs from any modern browser, works offline-shell
- **Native APK / IPA** — Capacitor wraps the live website into mobile apps

---

## 1. Run locally

```bash
cd web
npm install
cp .env.local.example .env.local   # fill in if you have Razorpay; otherwise placeholder mode works
npm run dev
```

Open http://localhost:3000 — the site runs end-to-end including a *demo* booking flow (placeholder mode).

---

## 2. Deploy the website (free)

### Option A — Vercel (recommended, the easiest free path)

1. Create a free Vercel account → [vercel.com](https://vercel.com)
2. Push this folder to a GitHub repo
3. In Vercel dashboard → "Add New Project" → import the repo
4. Add environment variables (from `.env.local.example`)
5. Deploy. You get `https://stranger-atti-club.vercel.app` for free, forever.
6. Optional: buy `strangeratticlub.in` at Cloudflare Registrar (~₹800/yr) and point it at Vercel.

### Option B — Netlify / Cloudflare Pages
Both work; same flow as Vercel. API routes work on all three.

---

## 3. Razorpay setup

The site runs in **placeholder mode** until you add Razorpay keys — useful for showing the design without an account.

When ready:

1. Sign up at [razorpay.com](https://razorpay.com) (free, takes ~5 minutes; KYC needed for live mode)
2. Dashboard → Settings → API Keys → generate **Test Mode** keys first
3. Add to `.env.local` (for local) and Vercel project env vars (for production):
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXX
   RAZORPAY_KEY_SECRET=YYYYYY
   ```
4. Test the booking flow with Razorpay's test cards — see [their docs](https://razorpay.com/docs/payments/payments/test-card-details/)
5. Once verified, regenerate **Live Mode** keys and swap them in.

The integration uses Razorpay Checkout SDK (UPI / Cards / NetBanking / Wallets) with server-side order creation + signature verification (the right way).

---

## 4. PWA — installable on iOS + Android browsers

Already wired:
- Web manifest at `public/manifest.webmanifest`
- Service worker at `public/sw.js` (offline shell)
- Apple touch icon + theme color in `app/layout.tsx`

To install on phone:
- **Android Chrome** → "Add to Home Screen" prompt appears
- **iOS Safari** → Share → "Add to Home Screen"

This is the **fastest free path to mobile apps** — most attendees will never need a native APK/IPA.

---

## 5. Native APK (Android) — fully free

Requirements:
- [Android Studio](https://developer.android.com/studio) (free, ~3GB)
- JDK 17 (Android Studio bundles one)

Steps:
```bash
cd web
npm install
npx cap add android        # one-time: scaffolds /android folder
npm run cap:android        # opens Android Studio
```

In Android Studio:
- **Build → Build Bundle(s) / APK(s) → Build APK(s)** → produces an unsigned debug APK in `android/app/build/outputs/apk/debug/`
- Sideload to any Android phone (enable "Install from unknown sources")

For Play Store:
- Generate a keystore: `keytool -genkey -v -keystore release-key.keystore -alias strangeratti -keyalg RSA -keysize 2048 -validity 10000`
- **Build → Generate Signed Bundle / APK** → AAB format
- One-time ₹2,000 (~$25) for Google Play Console account
- Upload AAB → review takes 1–7 days

---

## 6. Native IPA (iOS) — partial free path

Requirements:
- macOS with Xcode (free)
- Apple Developer Program: **₹8,900/yr (~$99)** — required to install on real iPhones or submit to App Store. Without it, you can only build for the iOS Simulator.

Steps:
```bash
cd web
npm install
npx cap add ios
npm run cap:ios        # opens Xcode
```

In Xcode:
- Set Team to your Apple Developer account
- Product → Archive → Distribute App → Ad Hoc / App Store Connect

**Honest note:** the only fully-free iOS distribution path is the Simulator, or asking testers to install via TestFlight (still needs a paid dev account). For most launches, the PWA "Add to Home Screen" route covers iPhone users for ₹0.

---

## 7. Project layout

```
web/
├── app/                       # Next.js App Router pages
│   ├── page.tsx               # Home
│   ├── events/
│   │   ├── page.tsx           # Events list
│   │   └── [slug]/page.tsx    # Event detail (booking)
│   ├── about/page.tsx
│   ├── code-of-conduct/page.tsx
│   ├── gallery/page.tsx
│   ├── corporate/page.tsx
│   ├── contact/page.tsx
│   ├── refund/page.tsx
│   ├── privacy/page.tsx
│   └── api/razorpay/
│       ├── order/route.ts     # creates Razorpay order
│       └── verify/route.ts    # verifies payment signature
├── components/
│   ├── Nav.tsx
│   ├── Footer.tsx
│   ├── Section.tsx
│   ├── EventCard.tsx
│   ├── Marquee.tsx
│   ├── BookingButton.tsx      # Razorpay Checkout client
│   └── PWARegister.tsx
├── lib/
│   ├── site.ts                # brand constants
│   └── events.ts              # event data — edit here to add events
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js                  # service worker
│   ├── favicon.svg
│   └── icons/                 # PWA + app icons
├── capacitor.config.ts        # mobile wrapper config
├── tailwind.config.ts
└── next.config.js
```

---

## 8. Add a new event

Edit `lib/events.ts` — add a new entry to the `events` array. The home page, listing, and detail page pick it up automatically. For now event data lives in code; once you have 5+ events, swap to a CMS like Sanity (free tier) or a Google Sheet via `papaparse`.

---

## 9. Sign in with Google + database

The site has Gmail-based login (Auth.js v5 + Google OAuth) and a free Turso (libSQL) database for persisting users and bookings. **Runs in demo mode out of the box** — sign-in works as a fake "Demo Atti" user, the `/me` page shows seeded sample bookings. Wire up the real services when you're ready:

### 9a. Google OAuth
1. https://console.cloud.google.com → New project ("Stranger Atti Club")
2. **APIs & Services → OAuth consent screen** → External → fill the basics
3. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (dev)
     - `https://YOUR_DOMAIN/api/auth/callback/google` (prod)
4. Copy Client ID + Secret into `.env.local`:
   ```
   AUTH_GOOGLE_ID=...apps.googleusercontent.com
   AUTH_GOOGLE_SECRET=...
   NEXT_PUBLIC_HAS_GOOGLE_AUTH=1
   ```
5. Generate `AUTH_SECRET` with: `openssl rand -hex 32` and paste into `.env.local`

### 9c. Admin access

Set `ADMIN_EMAILS` in `.env.local` to a comma-separated list of Gmail addresses that should get the admin role on sign-in. Example:

```
ADMIN_EMAILS=you@gmail.com,cofounder@gmail.com
```

When an admin signs in:
- Their `role` is set to `admin` in the `user` table
- Their session carries `user.role === 'admin'`
- "Admin Console" appears in the avatar dropdown
- They can visit `/admin` (gated; non-admins get redirected to `/me?error=not-admin`)

Admin Console gives access to:
- **/admin** — dashboard with totals, per-event sales, recent bookings
- **/admin/events** — list of events; create/edit/delete
- **/admin/events/[slug]/attendees** — every booking for one event with name, phone, email, ticket tier, amount paid, Razorpay payment ID
- **/admin/bookings** — global table with search + status filter + CSV export

In demo mode (no Google keys), the demo user is auto-promoted to admin so the UI is reachable without setup.

### 9b. Database

**The database is always real and writeable.** Two modes:

#### Dev — local SQLite (default, no setup)
On first `npm run dev`, the app uses a local file at `web/local.db` for all events, users, and bookings. Persists across server restarts. Bootstrap once with:

```bash
npx tsx db/migrate.ts
```

That creates the tables. Events auto-seed on first read. Every Razorpay-verified booking writes a real row. The admin console reads live data from this file.

To inspect the DB while developing:
```bash
sqlite3 local.db ".tables"
sqlite3 local.db "SELECT id, eventSlug, contactName, amountInr, status FROM booking ORDER BY createdAt DESC LIMIT 20"
```

#### Prod — Turso libSQL (free, no credit card)
Vercel's serverless filesystem is ephemeral, so production needs a hosted DB. Turso is the right fit (libSQL = SQLite over the wire, same Drizzle code).

1. Sign up at https://turso.tech
2. Install the CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
3. `turso auth login`
4. `turso db create stranger-atti-club`
5. `turso db show stranger-atti-club` → copy `URL`
6. `turso db tokens create stranger-atti-club` → copy auth token
7. Paste both into Vercel env vars (or `.env.local` to test):
   ```
   TURSO_DATABASE_URL=libsql://stranger-atti-club-XXXX.turso.io
   TURSO_AUTH_TOKEN=...
   ```
8. Bootstrap the schema once: `TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx db/migrate.ts`

No code changes required — same Drizzle queries, just a different connection string.

The `/me` page now shows real user bookings. Razorpay payment-verified bookings auto-persist when the DB is configured.

---

## 10. What's still TODO before going live

- [ ] Replace placeholder PNG icons in `public/icons/` with your real logo (export at 192/512/1024 from your designer)
- [ ] Set real Razorpay keys (test → live after KYC)
- [ ] Add real venue, dates, prices in `lib/events.ts`
- [ ] Replace `+91 9999999999` in `.env.local` with your WhatsApp business number
- [ ] Add WhatsApp / email confirmation hook in `app/api/razorpay/verify/route.ts` (Brevo + WATI free tiers)
- [ ] Add Plausible or GA4 analytics
- [ ] Run Lighthouse — target ≥95 on Performance, Accessibility, Best Practices, SEO

---

## 10. Free-tier cost summary

| Item | Cost |
|---|---|
| Hosting (Vercel free tier) | ₹0 |
| Subdomain `*.vercel.app` | ₹0 |
| Razorpay account | ₹0 (2% per txn) |
| PWA install | ₹0 |
| Android APK (sideload) | ₹0 |
| Brevo / WATI free tier | ₹0 |
| **Optional:** custom `.in` domain | ~₹800/yr |
| **Optional:** Google Play Console | ₹2,000 one-time |
| **Optional:** Apple Developer Program | ₹8,900/yr |

You can launch everything except a published iOS app for **₹0**, and add the paid pieces only once revenue from events justifies them.
