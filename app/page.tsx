import Link from 'next/link';
import Section from '@/components/Section';
import Marquee from '@/components/Marquee';
import EventCard from '@/components/EventCard';
import { listEvents } from '@/lib/events-store';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';

const testimonials = [
  {
    quote:
      'I came alone, left with seven new friends and a marigold in my hair.',
    name: 'Priya · 26 · Software engineer',
  },
  {
    quote:
      "I'd cancelled two events that week. This was the only one I went to and I'm still talking about it.",
    name: 'Karthik · 29 · New to Chennai',
  },
  {
    quote:
      "It felt like being at a wedding where you actually knew nobody — but everyone was rooting for you.",
    name: 'Aishu · 24 · Designer',
  },
];

export default async function Home() {
  const events = await listEvents();
  const next = events[0];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="paper absolute inset-0" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-marigold-200/60 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-crimson/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-14 sm:pb-20 sm:pt-20 lg:pt-28">
          <p className="dot-accent font-display text-xs uppercase tracking-[0.25em] text-crimson sm:text-sm sm:tracking-[0.3em]">
            {site.city} · stranger-meets · a new theme every month
          </p>

          <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-leaf/40 bg-leaf/10 px-3 py-1 text-xs font-semibold text-leaf">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-leaf opacity-70" />
              <span className="relative h-2 w-2 rounded-full bg-leaf" />
            </span>
            No networking pressure — ever
          </span>

          <h1 className="balance mt-4 font-display text-[2.6rem] leading-[1.05] text-ink sm:mt-5 sm:text-6xl lg:text-7xl">
            Celebrations{' '}
            <span className="block sm:inline">
              <span className="shimmer-text">without</span> an occasion.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft sm:mt-6 sm:text-xl">
            A common platform for stranger-meets in Chennai. New theme every
            month, same warm room — sangeeths, glow-ups, supper clubs, sunrise
            dances. Different vibe each time, never the same night twice.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link
              href={`/events/${next.slug}`}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-crimson px-7 py-4 text-base font-semibold text-cream shadow-lg shadow-crimson/20 transition hover:bg-crimson-500"
            >
              Book the next event
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="#how"
              className="fancy-link inline-flex items-center justify-center gap-2 px-2 py-2 font-medium text-ink-soft hover:text-crimson sm:py-4"
            >
              How this works
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 sm:grid-cols-4">
            {[
              ['100+', 'on the waitlist'],
              ['1', 'format active'],
              ['Many', 'themes ahead'],
              ['0', 'incidents — ever'],
            ].map(([k, v]) => (
              <div
                key={v}
                className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-4"
              >
                <p className="font-display text-xl text-ink sm:text-2xl">{k}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider text-ink-mute sm:text-xs">
                  {v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Marquee
        items={[
          'A new theme every month',
          'Solo-friendly by design',
          '50/50 ratio enforced',
          'Photographer included',
          'Code of conduct, enforced',
          'UPI checkout in 30 seconds',
        ]}
      />

      {/* NEXT EVENT FEATURE */}
      <Section
        eyebrow="The next one"
        title={next.name}
        intro={next.description}
      >
        <div className="grid gap-6 sm:gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-marigold-200/60 bg-gradient-to-br from-marigold-300 via-marigold-400 to-crimson p-7 text-cream sm:p-10">
            <div className="paper absolute inset-0 opacity-30" />
            <div className="relative">
              <p className="font-display text-xs uppercase tracking-[0.25em] sm:text-sm">
                {next.area} · {next.city}
              </p>
              <p className="mt-2 font-display text-3xl sm:text-4xl">{next.date}</p>
              <p className="mt-2 text-cream/90">
                {next.doors} – {next.closes}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
                <Link
                  href={`/events/${next.slug}`}
                  className="inline-flex justify-center rounded-full bg-cream px-6 py-3 font-semibold text-crimson transition hover:bg-cream-100"
                >
                  See full event &amp; book
                </Link>
                <span className="text-sm text-cream/85">
                  {next.spotsLeft} of {next.capacity} spots left
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-6 sm:p-8">
            <h3 className="font-display text-xl sm:text-2xl">What you'll do</h3>
            <ul className="mt-4 space-y-2">
              {next.whatYouDo.map((it) => (
                <li
                  key={it}
                  className="flex gap-3 text-ink-soft"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" />
                  {it}
                </li>
              ))}
            </ul>
            <h3 className="mt-6 font-display text-xl sm:mt-8 sm:text-2xl">
              What you won't
            </h3>
            <ul className="mt-4 space-y-2">
              {next.whatYouWont.map((it) => (
                <li
                  key={it}
                  className="flex gap-3 text-ink-soft"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-marigold-400" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section
        id="how"
        eyebrow="How this works"
        title="Four steps. No networking. Lots of marigolds."
      >
        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            ['01', 'Book a ticket', 'UPI in 30 seconds. Razorpay handles it.'],
            [
              '02',
              'Get the brief',
              'WhatsApp message with dress code, venue pin, what to expect.',
            ],
            [
              '03',
              'Show up',
              "Alone, with a friend, or with your roommate — all three are normal.",
            ],
            [
              '04',
              'Leave lighter',
              'Photos within 48 hours. First dibs on next month.',
            ],
          ].map(([n, t, d]) => (
            <li
              key={n}
              className="lift rounded-3xl border border-marigold-200/60 bg-cream-50 p-7"
            >
              <p className="font-display text-3xl text-crimson">{n}</p>
              <p className="mt-3 font-display text-xl">{t}</p>
              <p className="mt-2 text-sm text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* TESTIMONIALS */}
      <Section eyebrow="Said by strangers" title="Why people come back.">
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="lift relative rounded-3xl border border-marigold-200/60 bg-cream-50 p-7"
            >
              <span
                className="absolute -top-5 left-6 grid h-10 w-10 place-items-center rounded-full bg-crimson font-display text-xl text-cream"
                aria-hidden
              >
                ❝
              </span>
              <blockquote className="mt-2 font-display text-xl leading-snug text-ink">
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 text-sm text-ink-mute">
                — {t.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* SAFETY */}
      <Section
        eyebrow="Why people trust us"
        title="Safety isn't a footnote here."
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-crimson/20 bg-cream-50 p-8">
            <h3 className="font-display text-2xl">Vibe-watchers, every event</h3>
            <p className="mt-3 text-ink-soft">
              Two trained volunteers wearing visible badges, briefed on our
              code of conduct. Tap any of them for help — no questions asked.
            </p>
            <p className="mt-3 text-ink-soft">
              Discreet help-word printed on every name tag. Say it; we
              extract you from the situation, quietly.
            </p>
          </div>
          <div className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-8">
            <h3 className="font-display text-2xl">A 50/50 ratio, enforced</h3>
            <p className="mt-3 text-ink-soft">
              We cap tickets to keep the room balanced. Skewed events get
              uncomfortable; balanced events stay warm.
            </p>
            <p className="mt-3 text-ink-soft">
              Zero-tolerance for harassment. One strike, refunded ticket,
              permanent ban across all events.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <Link
            href="/code-of-conduct"
            className="fancy-link font-medium text-crimson"
          >
            Read our code of conduct →
          </Link>
        </div>
      </Section>

      {/* OTHER EVENTS */}
      <Section eyebrow="Coming up after" title="More celebrations on the books.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.slug} event={e} />
          ))}
        </div>
      </Section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-ink py-14 text-cream sm:py-20">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-crimson/40 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-marigold-500/40 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-5 text-center">
          <p className="font-display text-xs uppercase tracking-[0.25em] text-marigold-300 sm:text-sm sm:tracking-[0.3em]">
            One last thing
          </p>
          <h2 className="balance mt-3 font-display text-3xl leading-tight sm:mt-4 sm:text-5xl lg:text-6xl">
            People who decided last week they'd rather not stay home.
          </h2>
          <p className="mt-5 text-base text-cream/80 sm:mt-6 sm:text-lg">
            That's who comes. That could be you, this Saturday.
          </p>
          <Link
            href={`/events/${next.slug}`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-marigold-400 px-7 py-4 font-semibold text-ink transition hover:bg-marigold-300 sm:mt-10 sm:px-8"
          >
            Book the next event
            <span>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
