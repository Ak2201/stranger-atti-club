import { notFound } from 'next/navigation';
import Link from 'next/link';
import Section from '@/components/Section';
import BookingButton from '@/components/BookingButton';
import Qr from '@/components/Qr';
import { listEvents, getEvent } from '@/lib/events-store';
import { site } from '@/lib/site';
import { auth } from '@/auth';
import { getBookingsForUser } from '@/lib/bookings';
import { qrPayload, ticketUrl } from '@/lib/qr';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const events = await listEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const ev = await getEvent(params.slug);
  if (!ev) return { title: 'Event not found' };
  return { title: ev.name, description: ev.tagline };
}

export default async function EventDetail({
  params,
}: {
  params: { slug: string };
}) {
  const ev = await getEvent(params.slug);
  if (!ev) notFound();

  const fromPrice = Math.min(...ev.tiers.map((t) => t.priceInr));
  const pct = Math.round(((ev.capacity - ev.spotsLeft) / ev.capacity) * 100);

  // If signed in, surface this user's tickets to this event right at the top.
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const userBookings = userId
    ? (await getBookingsForUser(userId)).filter(
        (b) =>
          b.eventSlug === ev.slug &&
          (b.status === 'confirmed' || b.status === 'attended')
      )
    : [];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="paper absolute inset-0" />
        <div
          className={`absolute -left-24 top-10 h-72 w-72 rounded-full blur-3xl ${
            ev.accent === 'marigold'
              ? 'bg-marigold-200/60'
              : ev.accent === 'crimson'
                ? 'bg-crimson/20'
                : 'bg-emerald-200/60'
          }`}
        />
        <div className="relative mx-auto max-w-6xl px-5 pb-6 pt-14 sm:pb-8 sm:pt-20">
          <Link
            href="/events"
            className="text-sm text-ink-mute hover:text-crimson"
          >
            ← All events
          </Link>
          <p className="mt-5 dot-accent font-display text-xs uppercase tracking-[0.25em] text-crimson sm:mt-6 sm:text-sm sm:tracking-[0.3em]">
            {ev.area} · {ev.city}
          </p>
          <h1 className="balance mt-3 font-display text-[2.4rem] leading-tight text-ink sm:text-6xl lg:text-7xl">
            {ev.name}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft sm:mt-4 sm:text-xl">
            {ev.tagline}
          </p>

          <div className="mt-7 grid gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-4 sm:p-5">
              <p className="text-[11px] uppercase tracking-wider text-ink-mute sm:text-xs">
                When
              </p>
              <p className="mt-1 font-display text-lg sm:text-xl">{ev.date}</p>
              <p className="text-sm text-ink-soft">
                {ev.doors} – {ev.closes}
              </p>
            </div>
            <div className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-4 sm:p-5">
              <p className="text-[11px] uppercase tracking-wider text-ink-mute sm:text-xs">
                Where
              </p>
              <p className="mt-1 font-display text-lg sm:text-xl">{ev.venue}</p>
              <p className="text-sm text-ink-soft">{ev.area}, {ev.city}</p>
            </div>
            <div className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-4 sm:p-5">
              <p className="text-[11px] uppercase tracking-wider text-ink-mute sm:text-xs">
                Spots
              </p>
              <p className="mt-1 font-display text-lg sm:text-xl">
                {ev.spotsLeft} / {ev.capacity} left
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-marigold-100">
                <div
                  className="h-full bg-crimson"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USER'S TICKETS TO THIS EVENT */}
      {userBookings.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pt-10">
          <div className="rounded-3xl border-2 border-leaf bg-emerald-50 p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="font-display text-xs uppercase tracking-[0.25em] text-emerald-700 sm:text-sm">
                  You're in
                </p>
                <h2 className="mt-1 font-display text-2xl text-emerald-800 sm:text-3xl">
                  {userBookings.length === 1
                    ? 'You have a ticket to this event'
                    : `You have ${userBookings.length} tickets to this event`}
                </h2>
              </div>
              <Link
                href="/me"
                className="text-sm font-medium text-emerald-700 hover:underline"
              >
                Manage on /me →
              </Link>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userBookings.map((b, i) => {
                const tier = ev.tiers.find((t) => t.id === b.tierId);
                return (
                  <li
                    key={b.id}
                    className="rounded-2xl border border-emerald-200 bg-cream-50 p-4"
                  >
                    {userBookings.length > 1 && (
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                        Ticket {i + 1} of {userBookings.length}
                      </p>
                    )}
                    <div className="grid place-items-center">
                      <Qr payload={qrPayload(b.id)} size={160} />
                    </div>
                    <p className="mt-2 text-center text-sm font-medium">
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
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-xs text-emerald-900/80">
              Want another ticket? Book again below — each booking gets its
              own QR.
            </p>
          </div>
        </section>
      )}

      {/* DESCRIPTION + BOOKING */}
      <section className="has-mobile-cta mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:gap-10 sm:py-16 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8 sm:space-y-10">
          <div>
            <h2 className="font-display text-3xl">What is this?</h2>
            <p className="mt-4 text-lg text-ink-soft">{ev.description}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-xl">You will</h3>
              <ul className="mt-4 space-y-2">
                {ev.whatYouDo.map((it) => (
                  <li key={it} className="flex gap-3 text-ink-soft">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-xl">You won't</h3>
              <ul className="mt-4 space-y-2">
                {ev.whatYouWont.map((it) => (
                  <li key={it} className="flex gap-3 text-ink-soft">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-marigold-400" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-6 sm:p-7">
            <h3 className="font-display text-xl">Schedule</h3>
            <ul className="mt-4 divide-y divide-marigold-100">
              {ev.schedule.map((s) => (
                <li
                  key={s.time}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <span className="w-20 shrink-0 font-display text-crimson sm:w-24">
                    {s.time}
                  </span>
                  <span className="text-ink-soft">{s.block}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xl">What to wear</h3>
            <p className="mt-3 text-ink-soft">{ev.dressCode}</p>
          </div>

          <div>
            <h3 className="font-display text-xl">FAQ</h3>
            <div className="mt-4 space-y-3">
              {ev.faq.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-marigold-200/60 bg-cream-50 p-5"
                >
                  <summary className="cursor-pointer list-none font-display text-lg text-ink marker:hidden flex items-center justify-between">
                    <span>{f.q}</span>
                    <span className="ml-4 text-crimson transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Booking sticky */}
        <aside id="book">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-6">
              <p className="text-xs uppercase tracking-wider text-ink-mute">
                Tickets
              </p>
              <p className="mt-1 font-display text-2xl text-ink">
                From ₹{fromPrice}
              </p>
              <p className="text-sm text-ink-soft">
                {ev.spotsLeft} spots left of {ev.capacity}
              </p>
            </div>
            {ev.tiers.map((t) => (
              <BookingTier key={t.id} event={ev} tier={t} />
            ))}
            <p className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-4 text-xs text-ink-mute">
              Full refund up to 72 hours before. After that, transfer to a
              friend — message us on{' '}
              <a
                className="text-crimson"
                href={`https://wa.me/${site.whatsapp}`}
              >
                WhatsApp
              </a>
              .
            </p>
          </div>
        </aside>
      </section>

      {/* Sticky mobile bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-marigold-200/70 bg-cream/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-base text-ink">
              {ev.name}
            </p>
            <p className="text-xs text-ink-mute">
              From ₹{fromPrice} · {ev.spotsLeft} of {ev.capacity} left
            </p>
          </div>
          <a
            href="#book"
            className="shrink-0 rounded-full bg-crimson px-5 py-3 text-sm font-semibold text-cream"
          >
            Book ↓
          </a>
        </div>
      </div>
    </>
  );
}

function BookingTier({
  event,
  tier,
}: {
  event: Awaited<ReturnType<typeof getEvent>>;
  tier: any;
}) {
  if (!event) return null;
  return (
    <div className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-5">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-lg">{tier.label}</p>
        <p className="font-display text-xl">₹{tier.priceInr}</p>
      </div>
      <p className="mt-1 text-sm text-ink-soft">{tier.description}</p>
      <div className="mt-4">
        <BookingButton event={event} tier={tier} />
      </div>
    </div>
  );
}
