import Section from '@/components/Section';
import { site } from '@/lib/site';

export const metadata = { title: 'Privacy' };

export default function Privacy() {
  return (
    <Section eyebrow="The fine print" title="Privacy.">
      <div className="space-y-6 max-w-prose text-lg text-ink-soft">
        <p>
          <strong>What we collect:</strong> name, WhatsApp number, email, and
          payment confirmation from Razorpay. Plus event-day photos, only
          where you've consented.
        </p>
        <p>
          <strong>How we use it:</strong> to confirm your ticket, send the
          venue pin and dress code, follow up after the event, and let you
          know about the next one.
        </p>
        <p>
          <strong>Photos:</strong> we ask before any close-up shot. If you
          don't want to be photographed, tell us at check-in and we'll mark
          your name tag — staff and other attendees will know.
        </p>
        <p>
          <strong>What we don't do:</strong> sell your data, share your number
          with attendees, post photos publicly without checking with the
          people in them.
        </p>
        <p>
          <strong>Payments:</strong> handled entirely by Razorpay. We never
          see or store your card details.
        </p>
        <p>
          <strong>Delete my data:</strong> message{' '}
          <a className="text-crimson" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          . We delete within 7 days, except where retention is required by law
          (e.g. invoices for GST).
        </p>
      </div>
    </Section>
  );
}
