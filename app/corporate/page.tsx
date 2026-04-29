import Section from '@/components/Section';
import { site } from '@/lib/site';

export const metadata = {
  title: 'For teams · throw your team a sangeeth',
};

export default function Corporate() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="paper absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-5 pb-8 pt-16 sm:pb-12 sm:pt-24">
          <p className="dot-accent font-display text-xs uppercase tracking-[0.25em] text-crimson sm:text-sm sm:tracking-[0.3em]">
            For teams
          </p>
          <h1 className="balance mt-3 font-display text-[2.4rem] leading-tight sm:mt-4 sm:text-6xl lg:text-7xl">
            Throw your team a sangeeth.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-soft sm:mt-6 sm:text-xl">
            We run public events for 60 strangers a month. We also bring the
            format in-house — to your team offsite, annual day, or product
            launch. It's the offsite people actually look forward to.
          </p>
        </div>
      </section>

      <Section eyebrow="What we offer" title="Three formats. Each cured for teams.">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: '01',
              t: 'Office Sangeeth',
              d: '90-minute version — choreographed dance + cake + photos. Ideal for 30–80 people, 2 hours.',
            },
            {
              n: '02',
              t: 'Team Glow-Up Gala',
              d: 'Open-mic celebration of team wins. Everyone shares a 60-second win, room cheers. 60–90 minutes.',
            },
            {
              n: '03',
              t: 'Custom format',
              d: 'We co-design with your HR/people team — for product launches, offsites, retention events.',
            },
          ].map((x) => (
            <div
              key={x.n}
              className="lift rounded-3xl border border-marigold-200/60 bg-cream-50 p-7"
            >
              <p className="font-display text-3xl text-crimson">{x.n}</p>
              <p className="mt-3 font-display text-2xl">{x.t}</p>
              <p className="mt-3 text-ink-soft">{x.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Pricing" title="₹2.5L–4L per event.">
        <p className="max-w-prose text-lg text-ink-soft">
          Final number depends on headcount, venue, and customization. We
          handle decor, choreography, photography, MC, and end-to-end run of
          show. Your HR team handles the calendar invite. That's it.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['Up to 50 people', '₹2.5L', 'Standard format, our venue or yours'],
            ['51–100 people', '₹3.2L', 'Larger setup, two MCs, two photographers'],
            ['101+ people', '₹4L+', 'Custom build, multi-zone'],
          ].map(([h, p, d]) => (
            <div
              key={h}
              className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-6"
            >
              <p className="text-xs uppercase tracking-wider text-ink-mute">{h}</p>
              <p className="mt-1 font-display text-3xl">{p}</p>
              <p className="mt-2 text-sm text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Get in touch"
        title="Tell us about your team."
        intro="We reply in under 4 hours during work hours. Most quotes go out same-day."
      >
        <form
          action={`mailto:${site.email}?subject=Corporate event inquiry`}
          method="post"
          encType="text/plain"
          className="grid gap-4 rounded-3xl border border-marigold-200/60 bg-cream-50 p-7 sm:grid-cols-2"
        >
          <Input name="company" label="Company" required />
          <Input name="contact" label="Your name" required />
          <Input name="email" label="Work email" type="email" required />
          <Input name="phone" label="WhatsApp" />
          <Input name="headcount" label="Headcount" />
          <Input name="date" label="Target date" />
          <Input name="budget" label="Budget range" />
          <Input name="format" label="Preferred format (optional)" />
          <label className="sm:col-span-2 block">
            <span className="mb-1 block text-xs uppercase tracking-wider text-ink-mute">
              Anything else we should know?
            </span>
            <textarea
              name="notes"
              rows={4}
              className="w-full rounded-xl border border-marigold-200 bg-white px-4 py-3 text-ink outline-none focus:border-crimson"
            />
          </label>
          <button
            type="submit"
            className="sm:col-span-2 rounded-2xl bg-crimson px-6 py-4 font-semibold text-cream transition hover:bg-crimson-500"
          >
            Send inquiry →
          </button>
        </form>
      </Section>
    </>
  );
}

function Input({
  name,
  label,
  type = 'text',
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-ink-mute">
        {label}
        {required && ' *'}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full rounded-xl border border-marigold-200 bg-white px-4 py-3 text-ink outline-none focus:border-crimson"
      />
    </label>
  );
}
