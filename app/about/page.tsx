import Section from '@/components/Section';
import Link from 'next/link';

export const metadata = { title: 'About · why we do this' };

export default function About() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="paper absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-5 pb-8 pt-16 sm:pb-12 sm:pt-24">
          <p className="dot-accent font-display text-xs uppercase tracking-[0.25em] text-crimson sm:text-sm sm:tracking-[0.3em]">
            Our manifesto
          </p>
          <h1 className="balance mt-3 font-display text-[2.4rem] leading-tight sm:mt-4 sm:text-6xl lg:text-7xl">
            One platform. A new theme every month.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-soft sm:mt-6 sm:text-xl">
            Chennai has a quiet loneliness problem. The Saturday-nights-at-home
            kind. The weddings-stop-happening-in-your-twenties kind. People who
            are doing fine — just not <em>celebrating</em>. We give them a
            different reason every month.
          </p>
        </div>
      </section>

      <Section>
        <div className="prose prose-lg max-w-prose space-y-6 text-ink-soft">
          <p>
            So we built a platform — not a single event format. Every month, a
            new theme. Same code of conduct, same warm room, different reasons
            to celebrate. One month it's a fake sangeeth. The next, a glow-up
            gala. The one after, a sunrise supper club on the beach.
          </p>
          <p>
            We pick formats that are <strong>celebratory</strong> — not
            satirical, not ironic. <strong>Accessible</strong> — solo-friendly,
            gentle, no networking pressure. <strong>Visual</strong> — because
            the photos are how we find next month's strangers.{' '}
            <strong>Safe</strong> — code of conduct, vibe-watchers, ratios
            enforced.
          </p>
          <p>
            We're new. We'll mess things up. We'll publish what we learn. The
            bet we're making is simple: <em>people will come back if they leave
            lighter than they arrived — and curious about what theme is next.</em>
          </p>
          <p className="font-display text-2xl text-ink">— The Stranger Atti Club team</p>
        </div>
      </Section>

      <Section
        eyebrow="What we believe"
        title="Four rules we don't bend."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {[
            [
              'Theme rotates monthly',
              'Never the same night twice. Sangeeth, glow-up, supper, sunrise — and more.',
            ],
            [
              'Solo is the default',
              'If a format only works in pairs, we redesign it.',
            ],
            [
              'Safety is the floor',
              'Vibe-watchers, code of conduct, enforced ratios. Always.',
            ],
            [
              'Photos are the product',
              'You should leave with something that fits in a Reel.',
            ],
          ].map(([t, d]) => (
            <div
              key={t}
              className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-7"
            >
              <p className="font-display text-2xl text-ink">{t}</p>
              <p className="mt-2 text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="bg-ink py-20 text-cream">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-marigold-300">
            Want in?
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">
            Pick the next celebration.
          </h2>
          <Link
            href="/events"
            className="mt-8 inline-block rounded-full bg-marigold-400 px-7 py-4 font-semibold text-ink hover:bg-marigold-300"
          >
            See upcoming events →
          </Link>
        </div>
      </section>
    </>
  );
}
