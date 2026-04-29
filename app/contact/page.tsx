import Section from '@/components/Section';
import { site } from '@/lib/site';

export const metadata = { title: 'Contact · talk to a human' };

export default function Contact() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="paper absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-5 pb-8 pt-16 sm:pb-12 sm:pt-24">
          <p className="dot-accent font-display text-xs uppercase tracking-[0.25em] text-crimson sm:text-sm sm:tracking-[0.3em]">
            Talk to a human
          </p>
          <h1 className="balance mt-3 font-display text-[2.4rem] leading-tight sm:mt-4 sm:text-6xl lg:text-7xl">
            We reply in under 4 hours.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-soft sm:mt-6 sm:text-xl">
            Usually faster. If it's safety-related, mark your message URGENT
            and we'll prioritize.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          <Card
            label="WhatsApp (fastest)"
            value={`+91 ${site.whatsapp}`}
            href={`https://wa.me/${site.whatsapp}`}
          />
          <Card
            label="Email"
            value={site.email}
            href={`mailto:${site.email}`}
          />
          <Card
            label="Instagram DM"
            value={`@${site.instagram}`}
            href={`https://instagram.com/${site.instagram}`}
          />
        </div>

        <div className="mt-16 rounded-3xl border border-crimson/30 bg-crimson/5 p-8">
          <p className="font-display text-2xl text-crimson">
            Safety concern from an event?
          </p>
          <p className="mt-3 text-ink-soft">
            Message us within 7 days at any of the channels above with the
            subject "URGENT". We follow up. We do not share the identity of
            reporters with the person being reported. Bans are permanent and
            cross-event.
          </p>
        </div>
      </Section>
    </>
  );
}

function Card({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="lift block rounded-3xl border border-marigold-200/60 bg-cream-50 p-7"
    >
      <p className="text-xs uppercase tracking-wider text-ink-mute">{label}</p>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
      <p className="mt-3 text-sm text-crimson">Open →</p>
    </a>
  );
}
