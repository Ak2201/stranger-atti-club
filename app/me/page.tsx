import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getBookingsForUser, splitBookings } from '@/lib/bookings';
import { site } from '@/lib/site';
import Section from '@/components/Section';
import Qr from '@/components/Qr';
import { qrPayload, ticketUrl } from '@/lib/qr';
import type { BookingWithEvent } from '@/lib/bookings';

export const metadata = { title: 'My events · profile' };
export const dynamic = 'force-dynamic';

export default async function Me() {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin?from=/me');
  }

  const userId = (session.user as { id?: string }).id;
  const all = await getBookingsForUser(userId);
  const { upcoming, past } = splitBookings(all);

  // Group multiple tickets to the same event so the page is scannable.
  const upcomingByEvent = new Map<string, BookingWithEvent[]>();
  for (const b of upcoming) {
    const arr = upcomingByEvent.get(b.eventSlug) || [];
    arr.push(b);
    upcomingByEvent.set(b.eventSlug, arr);
  }

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="paper absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-5 pb-8 pt-16 sm:pb-12 sm:pt-24">
          <p className="dot-accent font-display text-xs uppercase tracking-[0.25em] text-crimson sm:text-sm sm:tracking-[0.3em]">
            Your events
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {session.user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt=""
                className="h-14 w-14 rounded-full border-2 border-marigold-300 object-cover"
              />
            )}
            <div>
              <h1 className="font-display text-3xl leading-tight sm:text-5xl">
                Hi, {session.user.name?.split(' ')[0] || 'Atti'}.
              </h1>
              <p className="text-ink-mute">{session.user.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <Section
        eyebrow={
          upcoming.length > 1
            ? `${upcoming.length} tickets`
            : 'Your next event'
        }
        title={
          upcoming.length === 0 ? 'Nothing booked yet.' : ''
        }
      >
        {upcoming.length > 0 ? (
          <div className="space-y-6">
            {[...upcomingByEvent.entries()].map(([slug, bookings]) => (
              <NextEventHero
                key={slug}
                bookings={bookings}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-8">
            <p className="text-ink-soft">
              You haven't booked an upcoming event. We're running a new theme
              every month — pick one and we'll save you a seat.
            </p>
            <Link
              href="/events"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3 font-semibold text-cream"
            >
              See upcoming events →
            </Link>
          </div>
        )}
      </Section>

      {/* PAST */}
      <Section
        eyebrow="Your history"
        title={past.length ? "Events you've been to." : 'No history yet.'}
        intro={
          past.length
            ? "We're keeping a record so you remember the nights you almost stayed home for."
            : "Once you've attended an event with us, it'll show up here. With photos."
        }
      >
        {past.length > 0 && (
          <ul className="space-y-4">
            {past.map((b) => (
              <PastEventRow key={b.id} booking={b} />
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

function NextEventHero({ bookings }: { bookings: BookingWithEvent[] }) {
  // All bookings here are for the same event.
  const ev = bookings[0].event;
  const totalSpend = bookings.reduce((s, b) => s + b.amountInr, 0);
  const totalCouponInitial = bookings.reduce(
    (s, b) => s + (b.couponInitialInr ?? 0),
    0
  );
  const totalCouponRedeemed = bookings.reduce(
    (s, b) => s + (b.couponRedeemedInr ?? 0),
    0
  );
  const totalCouponRemaining = totalCouponInitial - totalCouponRedeemed;
  const showCoupon = totalCouponInitial > 0;
  const couponPct = showCoupon
    ? Math.max(0, (totalCouponRemaining / totalCouponInitial) * 100)
    : 0;
  const couponAccent =
    couponPct > 50 ? 'bg-leaf' : couponPct > 20 ? 'bg-marigold-400' : 'bg-crimson';

  return (
    <div className="overflow-hidden rounded-3xl border border-marigold-200/60">
      <div className="relative grid gap-0 lg:grid-cols-[1.2fr_1fr]">
        <div
          className={`relative p-7 text-cream sm:p-10 bg-gradient-to-br ${
            ev.accent === 'marigold'
              ? 'from-marigold-300 via-marigold-400 to-crimson'
              : ev.accent === 'crimson'
                ? 'from-crimson-300 via-crimson to-crimson-500'
                : 'from-emerald-300 via-emerald-400 to-emerald-600'
          }`}
        >
          <div className="paper absolute inset-0 opacity-30" />
          <div className="relative">
            <p className="font-display text-xs uppercase tracking-[0.25em] sm:text-sm">
              {ev.area} · {ev.city}
            </p>
            <p className="mt-3 font-display text-3xl sm:text-5xl">{ev.name}</p>
            <p className="mt-2 text-cream/90">{ev.tagline}</p>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <DetailLine label="When" value={`${ev.date} · ${ev.doors}`} />
              <DetailLine label="Venue" value={ev.venue} />
              <DetailLine
                label={bookings.length === 1 ? 'Tier' : `${bookings.length} tickets`}
                value={
                  bookings.length === 1
                    ? `${ev.tiers.find((t) => t.id === bookings[0].tierId)?.label || bookings[0].tierId} · ₹${bookings[0].amountInr}`
                    : `Total ₹${totalSpend.toLocaleString('en-IN')}`
                }
              />
              <DetailLine label="Dress code" value={ev.dressCode.split('.')[0] + '.'} />
            </dl>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/events/${ev.slug}`}
                className="rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-crimson hover:bg-cream-100"
              >
                Event page
              </Link>
              <a
                href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
                  `Hi! Quick question about my booking${
                    bookings.length === 1 ? '' : 's'
                  } for ${ev.name}.`
                )}`}
                target="_blank"
                rel="noopener"
                className="rounded-full bg-leaf px-5 py-2.5 text-sm font-semibold text-cream hover:opacity-90"
              >
                WhatsApp us →
              </a>
            </div>

            {showCoupon && (
              <div className="mt-6 rounded-2xl border border-cream/40 bg-cream/15 p-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.25em] text-cream/85">
                  Bar credit included
                </p>
                <p className="mt-1 font-display text-3xl text-cream">
                  ₹{totalCouponRemaining.toLocaleString('en-IN')}
                  <span className="ml-2 text-sm text-cream/70">
                    of ₹{totalCouponInitial.toLocaleString('en-IN')} left
                  </span>
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cream/30">
                  <div
                    className={`h-full ${couponAccent}`}
                    style={{ width: `${couponPct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-cream/80">
                  Show this QR at the bar — staff will deduct from your credit.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-cream-50 p-7 sm:p-10">
          <p className="font-display text-sm uppercase tracking-[0.25em] text-crimson">
            {bookings.length === 1
              ? 'Your QR ticket'
              : `Your ${bookings.length} QR tickets`}
          </p>
          <p className="mt-1 text-xs text-ink-mute">
            One QR per ticket. Show each at the door — staff scans them in.
          </p>

          <div className="mt-4 space-y-5">
            {bookings.map((b, i) => {
              const tier = ev.tiers.find((t) => t.id === b.tierId);
              return (
                <div
                  key={b.id}
                  className="rounded-2xl border border-marigold-100 bg-cream p-4"
                >
                  {bookings.length > 1 && (
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                      Ticket {i + 1} of {bookings.length}
                    </p>
                  )}
                  <div className="grid place-items-center">
                    <Qr payload={qrPayload(b.id)} size={180} />
                  </div>
                  <p className="mt-2 text-center text-xs text-ink-soft">
                    {tier?.label || b.tierId} · ₹{b.amountInr}
                  </p>
                  <p className="mt-1 break-all text-center font-mono text-[10px] text-ink-mute">
                    {b.razorpayPaymentId ?? b.id}
                  </p>
                  <a
                    href={ticketUrl(b.id)}
                    target="_blank"
                    rel="noopener"
                    className="mt-2 block w-full rounded-full bg-ink px-3 py-2 text-center text-xs font-semibold text-cream hover:bg-crimson"
                  >
                    Open ticket →
                  </a>
                </div>
              );
            })}
          </div>

          <ul className="mt-5 space-y-2 text-xs text-ink-soft">
            <li className="flex gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-crimson" />
              WhatsApp reminder 48 hours before with venue pin
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-crimson" />
              Free ticket transfer up to 72 hours before
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function PastEventRow({ booking }: { booking: BookingWithEvent }) {
  const ev = booking.event;
  const tierLabel =
    ev.tiers.find((t) => t.id === booking.tierId)?.label || booking.tierId;

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-marigold-200/60 bg-cream-50 p-5 sm:flex-row sm:items-center sm:gap-5">
      <div
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${
          ev.accent === 'marigold'
            ? 'from-marigold-300 to-marigold-500'
            : ev.accent === 'crimson'
              ? 'from-crimson-300 to-crimson'
              : 'from-emerald-300 to-emerald-500'
        }`}
      >
        <span className="font-display text-3xl text-cream/90">
          {ev.heroEmoji}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-display text-lg text-ink">{ev.name}</p>
        <p className="text-sm text-ink-mute">
          {ev.date} · {ev.area} · {tierLabel}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <StatusPill status={booking.status} />
        <Link
          href={`/gallery?event=${ev.slug}`}
          className="hidden text-sm font-medium text-crimson hover:underline sm:inline"
        >
          Photos →
        </Link>
      </div>
    </li>
  );
}

function StatusPill({ status }: { status: BookingWithEvent['status'] }) {
  const map: Record<BookingWithEvent['status'], { bg: string; text: string; label: string }> = {
    confirmed: { bg: 'bg-marigold-100', text: 'text-marigold-700', label: 'Confirmed' },
    attended: { bg: 'bg-leaf/15', text: 'text-emerald-700', label: 'Attended' },
    cancelled: { bg: 'bg-crimson/10', text: 'text-crimson', label: 'Cancelled' },
    refunded: { bg: 'bg-ink/5', text: 'text-ink-mute', label: 'Refunded' },
    noshow: { bg: 'bg-ink/5', text: 'text-ink-mute', label: 'No-show' },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full ${s.bg} ${s.text} px-3 py-1 text-[11px] font-semibold uppercase tracking-wider`}
    >
      {s.label}
    </span>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-cream/70">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
