import Section from '@/components/Section';
import Link from 'next/link';

export const metadata = { title: 'Gallery · the strangers, the sangeeths' };

const accents = [
  'from-marigold-300 to-marigold-500',
  'from-crimson-300 to-crimson',
  'from-emerald-300 to-emerald-500',
  'from-marigold-400 to-crimson',
  'from-marigold-200 to-marigold-400',
  'from-crimson to-marigold-500',
];

const moments = [
  { caption: 'The mandap entry — Fake Sangeeth Vol. 1', kind: 'Fake Sangeeth' },
  { caption: 'Choreography teach, minute 4', kind: 'Fake Sangeeth' },
  { caption: 'Couple of the Night vote', kind: 'Fake Sangeeth' },
  { caption: 'Win of the night — they quit smoking', kind: 'Glow-Up Gala' },
  { caption: 'Dhol entry. Marigold petals. 9:12pm.', kind: 'Fake Sangeeth' },
  { caption: 'Open mic round 2', kind: 'Glow-Up Gala' },
  { caption: 'Closing circle. Phones down.', kind: 'Fake Sangeeth' },
  { caption: 'The thank-you letter station', kind: 'Glow-Up Gala' },
  { caption: 'Polaroid handoff at the door', kind: 'Fake Sangeeth' },
];

export default function Gallery() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="paper absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-5 pb-8 pt-16 sm:pb-12 sm:pt-24">
          <p className="dot-accent font-display text-xs uppercase tracking-[0.25em] text-crimson sm:text-sm sm:tracking-[0.3em]">
            Gallery
          </p>
          <h1 className="balance mt-3 font-display text-[2.4rem] leading-tight sm:mt-4 sm:text-6xl lg:text-7xl">
            The strangers, the sangeeths.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-soft sm:mt-6 sm:text-xl">
            Every event we've run, in moments. Photos drop here within 48
            hours of each event, with attendee captions.
          </p>
          <p className="mt-3 text-sm text-ink-mute italic">
            (Visuals here are placeholders until our first event runs. Captions are real.)
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {moments.map((m, i) => (
            <figure
              key={i}
              className={`lift relative overflow-hidden rounded-3xl bg-gradient-to-br ${accents[i % accents.length]} p-6 text-cream`}
              style={{ minHeight: 240 }}
            >
              <div className="paper absolute inset-0 opacity-30" />
              <div className="relative flex h-full flex-col justify-between">
                <span className="rounded-full bg-cream/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider w-fit">
                  {m.kind}
                </span>
                <figcaption className="font-display text-lg leading-snug">
                  {m.caption}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full bg-crimson px-7 py-4 font-semibold text-cream transition hover:bg-crimson-500"
          >
            Want to be in the next one? Book →
          </Link>
        </div>
      </Section>
    </>
  );
}
