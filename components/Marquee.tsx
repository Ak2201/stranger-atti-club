type Props = {
  items: string[];
};

export default function Marquee({ items }: Props) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-crimson/20 bg-crimson py-2.5 text-cream sm:py-3">
      <div className="ticker-track gap-8 whitespace-nowrap font-display text-base sm:gap-12 sm:text-lg">
        {doubled.map((it, i) => (
          <span key={i} className="px-4 sm:px-6">
            <span aria-hidden className="mr-4 text-marigold-300 sm:mr-6">
              ✺
            </span>
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
