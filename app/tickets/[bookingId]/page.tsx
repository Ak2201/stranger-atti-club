import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { getEvent } from '@/lib/events-store';
import { qrPayload, verifyBookingSignature } from '@/lib/qr';
import { site } from '@/lib/site';
import Qr from '@/components/Qr';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Your ticket',
  description: 'Show this QR at the door.',
};

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: { bookingId: string };
  searchParams: { t?: string };
}) {
  const { bookingId } = params;
  const sig = searchParams?.t;

  if (!verifyBookingSignature(bookingId, sig)) {
    return <Invalid reason="link" />;
  }

  const booking = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingId))
    .get();

  if (!booking) return <Invalid reason="not-found" />;

  const event = await getEvent(booking.eventSlug);
  const tier = event?.tiers.find((t) => t.id === booking.tierId);

  const isCancelled =
    booking.status === 'cancelled' || booking.status === 'refunded';
  const isAttended = booking.status === 'attended' || !!booking.checkedInAt;

  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      <div className="paper absolute inset-0" />
      <div className="relative mx-auto max-w-md px-5 py-10 sm:py-16">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.25em] text-ink-mute hover:text-crimson"
        >
          ← {site.name}
        </Link>

        <div className="mt-5 overflow-hidden rounded-3xl border border-marigold-200/60 bg-cream-50">
          <header className="bg-gradient-to-br from-marigold-300 via-marigold-400 to-crimson p-6 text-cream">
            <p className="font-display text-xs uppercase tracking-[0.25em]">
              Your ticket
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight">
              {event?.name || booking.eventSlug}
            </h1>
            <p className="mt-1 text-sm text-cream/90">
              {event?.date} · {event?.area}
            </p>
          </header>

          <div className="p-6">
            <div className="grid place-items-center">
              <Qr payload={qrPayload(booking.id)} size={260} />
            </div>

            {isCancelled && (
              <div className="mt-4 rounded-2xl border border-crimson/30 bg-crimson/5 p-4 text-center text-sm text-crimson">
                This booking has been{' '}
                {booking.status === 'refunded' ? 'refunded' : 'cancelled'}.
                The QR will be rejected at the door — message us if this is a
                mistake.
              </div>
            )}
            {isAttended && !isCancelled && (
              <div className="mt-4 rounded-2xl border border-leaf/40 bg-leaf/10 p-4 text-center text-sm text-emerald-700">
                Already checked in. Welcome back ✨
              </div>
            )}

            <dl className="mt-6 space-y-2 text-sm">
              <Row label="Attendee" value={booking.contactName} />
              <Row label="Tier" value={`${tier?.label || booking.tierId} · ₹${booking.amountInr}`} />
              <Row label="Booking ID" value={booking.id} mono />
              {event && (
                <Row
                  label="Doors / Closes"
                  value={`${event.doors} – ${event.closes}`}
                />
              )}
              {event?.dressCode && (
                <Row label="Dress code" value={event.dressCode.split('.')[0] + '.'} />
              )}
            </dl>

            <div className="mt-6 grid gap-2">
              <a
                href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi! Question about ticket ${booking.id}.`)}`}
                target="_blank"
                rel="noopener"
                className="rounded-full bg-leaf px-4 py-2.5 text-center text-sm font-semibold text-cream"
              >
                WhatsApp the host →
              </a>
              <p className="text-center text-xs text-ink-mute">
                Save this page to your home screen so you can pull it up quickly at the door.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 px-2 text-center text-xs text-ink-mute">
          The QR is signed and verified at the door. Sharing this link transfers
          the ticket — please don't share publicly.
        </p>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 border-b border-marigold-100 pb-2">
      <dt className="shrink-0 text-ink-mute">{label}</dt>
      <dd
        className={`text-right ${mono ? 'font-mono text-xs' : ''} text-ink`}
      >
        {value}
      </dd>
    </div>
  );
}

function Invalid({ reason }: { reason: 'link' | 'not-found' }) {
  return (
    <section className="relative min-h-[60vh]">
      <div className="paper absolute inset-0" />
      <div className="relative mx-auto max-w-md px-5 py-20 text-center">
        <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
          Hmm
        </p>
        <h1 className="mt-2 font-display text-3xl">
          {reason === 'link'
            ? "This ticket link doesn't look right."
            : "We can't find this booking."}
        </h1>
        <p className="mt-3 text-ink-soft">
          The link may have been edited or expired. Open the original WhatsApp
          message we sent, or message us:
        </p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <a
            href={`https://wa.me/${site.whatsapp}`}
            target="_blank"
            rel="noopener"
            className="rounded-full bg-crimson px-5 py-3 text-sm font-semibold text-cream"
          >
            WhatsApp us
          </a>
          <Link href="/" className="text-sm text-ink-mute hover:text-crimson">
            Back home
          </Link>
        </div>
      </div>
    </section>
  );
}
