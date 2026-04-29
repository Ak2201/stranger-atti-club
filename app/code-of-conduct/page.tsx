import Section from '@/components/Section';
import Link from 'next/link';
import { site } from '@/lib/site';

export const metadata = {
  title: 'Code of conduct',
  description:
    'Our promise to you, what we expect, what we do not tolerate, and how to ask for help.',
};

export default function CoC() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="paper absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-5 pb-8 pt-16 sm:pb-12 sm:pt-24">
          <p className="dot-accent font-display text-xs uppercase tracking-[0.25em] text-crimson sm:text-sm sm:tracking-[0.3em]">
            Safety first, always
          </p>
          <h1 className="balance mt-3 font-display text-[2.6rem] leading-tight sm:mt-4 sm:text-6xl lg:text-7xl">
            Code of conduct.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-soft sm:mt-6 sm:text-xl">
            Published on the website, included in every ticket confirmation,
            and read aloud at the start of every event.
          </p>
        </div>
      </section>

      <Section>
        <div className="space-y-12">
          <Block
            title="Our promise to you"
            body={[
              "You came alone, with a friend, or with someone new. Either way, you came to celebrate. Our job is to make sure you leave feeling lighter than you arrived — and certain that you'll come back.",
              "We don't promise a perfect night. We promise a safe one.",
            ]}
          />

          <BlockList
            title="What we expect from every attendee"
            items={[
              'Consent first, always. Ask before you photograph, hug, dance with, or sit beside someone.',
              "No means no, the first time. No explanation needed. Move on warmly.",
              "Personal questions are optional. Nobody owes you their job, age, marital status, caste, religion, or relationship history.",
              'No alcohol-pressuring, no drugs. Mocktails are equal citizens.',
              'No photos of others without permission, especially while dancing.',
              "Keep numbers private. Don't ask for, share, or screenshot anyone's contact without explicit yes.",
              'Respect the staff. Hosts, vibe-watchers, photographers are off-limits for advances during the event.',
            ]}
            tone="rule"
          />

          <BlockList
            title="What we do not tolerate"
            items={[
              "Unwanted physical contact, including 'playful' grabbing or prolonged hugs.",
              "Sexual, racist, casteist, sexist, ableist, or homophobic remarks — said as jokes or otherwise.",
              "Stalking behavior at the venue or after the event.",
              "Photographing someone after they have asked you to stop.",
              "Pressuring anyone to drink, stay later, share contact, or leave with you.",
              "Sharing event photos publicly that include people who asked not to be tagged.",
            ]}
            tone="ban"
          />

          <div className="rounded-3xl border-2 border-crimson bg-crimson/5 p-8">
            <p className="font-display text-2xl text-crimson">
              Violations result in
            </p>
            <p className="mt-3 text-ink-soft">
              Immediate removal from the event, ticket refund withheld,
              permanent ban from all future events, and — for serious incidents
              — escalation to local authorities. No debate at the venue.
            </p>
          </div>

          <Block
            title="How to ask for help"
            body={[
              <>
                We have <strong>vibe-watchers</strong> at every event wearing
                visible badges. They are trained to help without judgment.
              </>,
              "Tap any vibe-watcher on the shoulder and walk to a quieter corner with them.",
              <>
                Or say the word <strong>"jasmine"</strong> to any staff member
                — this is our discreet signal that you need help right now,
                no questions asked. We will quietly extract you from the
                situation.
              </>,
              <>
                Or message the host's WhatsApp number printed on your name tag.
                You will not be embarrassed. You will not be made to confront
                anyone. <strong>You will be believed.</strong>
              </>,
            ]}
          />

          <Block
            title="After the event"
            body={[
              <>
                If something happened that you couldn't raise on the night,
                message us within 7 days at{' '}
                <a className="text-crimson" href={`mailto:${site.email}`}>
                  {site.email}
                </a>{' '}
                or{' '}
                <a
                  className="text-crimson"
                  href={`https://wa.me/${site.whatsapp}`}
                >
                  WhatsApp
                </a>
                . We follow up. We ban where appropriate.
              </>,
              "We do not share the identity of reporters with the person being reported. Bans are permanent and cross-event.",
            ]}
          />

          <div className="rounded-3xl bg-cream-100 p-8 text-center">
            <p className="font-display text-2xl">Why we wrote this</p>
            <p className="mt-3 max-w-prose mx-auto text-ink-soft">
              Stranger-meetup events live or die on safety. One bad night ends
              a brand. We would rather lose a ticket-buyer than lose your
              trust. If you're reading this and thinking "this is a lot" —
              good. We want the people who find this comforting, not the
              people who find it inconvenient.
            </p>
            <p className="mt-4 font-display text-crimson">See you at the Sangeeth.</p>
          </div>
        </div>
      </Section>

      <div className="pb-16 text-center">
        <Link
          href="/events"
          className="fancy-link font-medium text-crimson"
        >
          Back to events →
        </Link>
      </div>
    </>
  );
}

function Block({
  title,
  body,
}: {
  title: string;
  body: React.ReactNode[];
}) {
  return (
    <div>
      <h2 className="font-display text-3xl">{title}</h2>
      <div className="mt-4 space-y-3 text-lg text-ink-soft">
        {body.map((b, i) => (
          <p key={i}>{b}</p>
        ))}
      </div>
    </div>
  );
}

function BlockList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'rule' | 'ban';
}) {
  return (
    <div>
      <h2 className="font-display text-3xl">{title}</h2>
      <ul className="mt-5 space-y-2.5">
        {items.map((it) => (
          <li
            key={it}
            className="flex gap-3 text-ink-soft"
          >
            <span
              className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                tone === 'rule' ? 'bg-leaf' : 'bg-crimson'
              }`}
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
