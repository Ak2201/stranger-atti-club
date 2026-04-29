import Link from 'next/link';
import type { EventItem } from '@/lib/events';

const accentMap = {
  marigold: 'bg-marigold-100 text-marigold-700 border-marigold-200',
  crimson: 'bg-crimson-50 text-crimson-500 border-crimson-100',
  leaf: 'bg-emerald-50 text-emerald-700 border-emerald-100',
} as const;

export default function EventCard({ event }: { event: EventItem }) {
  const fromPrice = Math.min(...event.tiers.map((t) => t.priceInr));
  const pct = Math.round(
    ((event.capacity - event.spotsLeft) / event.capacity) * 100
  );
  return (
    <Link
      href={`/events/${event.slug}`}
      className="lift group block overflow-hidden rounded-3xl border border-marigold-200/60 bg-cream-50"
    >
      <div
        className={`relative grid h-36 place-items-center bg-gradient-to-br sm:h-44 ${
          event.accent === 'marigold'
            ? 'from-marigold-300 to-marigold-500'
            : event.accent === 'crimson'
              ? 'from-crimson-300 to-crimson'
              : 'from-emerald-300 to-emerald-500'
        }`}
      >
        <div className="absolute inset-0 paper opacity-40" />
        <span className="font-display text-6xl text-cream/90 sm:text-7xl">
          {event.heroEmoji}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-cream/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft sm:right-4 sm:top-4 sm:px-3 sm:text-[11px]">
          {event.spotsLeft}/{event.capacity} left
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-wider text-ink-mute sm:text-xs">
          <span>{event.area}</span>
          <span aria-hidden>·</span>
          <span>{event.date}</span>
        </div>
        <h3 className="mt-2 font-display text-xl text-ink group-hover:text-crimson sm:text-2xl">
          {event.name}
        </h3>
        <p className="mt-2 text-sm text-ink-soft">{event.tagline}</p>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-marigold-100 sm:mt-5">
          <div
            className="h-full bg-crimson"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 sm:mt-5">
          <p className="text-sm text-ink-soft">
            From{' '}
            <span className="font-semibold text-ink">₹{fromPrice}</span>
          </p>
          <span className="shrink-0 rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-cream group-hover:bg-crimson sm:px-4">
            View &amp; book →
          </span>
        </div>
      </div>
    </Link>
  );
}
