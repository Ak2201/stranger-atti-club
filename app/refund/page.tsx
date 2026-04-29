import Section from '@/components/Section';

export const metadata = { title: 'Refund policy' };

export default function Refund() {
  return (
    <Section eyebrow="The fine print" title="Refund policy.">
      <div className="space-y-6 max-w-prose text-lg text-ink-soft">
        <p>
          <strong>Full refund</strong> up to 72 hours before the event start
          time. Initiate via WhatsApp; the refund hits your original payment
          method within 5–7 working days.
        </p>
        <p>
          <strong>Within 72 hours</strong> of the event, tickets become
          non-refundable but are <strong>fully transferable</strong> — message
          us with your replacement attendee's name and WhatsApp, and we'll
          update the booking.
        </p>
        <p>
          <strong>No-shows</strong> aren't refunded. The seat, the food, the
          photographer have already been paid for.
        </p>
        <p>
          <strong>Event cancelled by us</strong> (rare — only for force
          majeure): full refund + a complimentary ticket to the next event.
        </p>
        <p>
          <strong>Code of conduct violations</strong>: ticket forfeited, no
          refund, permanent ban across all our events.
        </p>
      </div>
    </Section>
  );
}
