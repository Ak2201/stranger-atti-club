type Series = {
  slug: string;
  name: string;
  capacity: number;
  points: { dBefore: number; cumulative: number }[];
};

const COLORS = ['#B22222', '#E8A33D', '#6B8E5A', '#7A1414', '#C72929'];

export default function SalesVelocityChart({ series }: { series: Series[] }) {
  if (series.length === 0) {
    return (
      <p className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-5 text-sm text-ink-mute">
        No event data yet. Sell some tickets and the curve appears here.
      </p>
    );
  }

  // Normalize to common x-domain (max days-before across all series).
  const xMax = Math.max(
    ...series.flatMap((s) => s.points.map((p) => p.dBefore)),
    7
  );
  const yMax = Math.max(
    ...series.flatMap((s) => s.points.map((p) => p.cumulative)),
    1
  );

  const W = 700;
  const H = 280;
  const PAD = { top: 16, right: 16, bottom: 36, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  function x(d: number) {
    // 0 days before = right edge (event day); xMax = left edge (announcement)
    return PAD.left + ((xMax - d) / xMax) * innerW;
  }
  function y(c: number) {
    return PAD.top + innerH - (c / yMax) * innerH;
  }

  return (
    <div className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-4">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          className="font-sans text-[11px]"
        >
          {/* Y axis grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={PAD.left + innerW}
                y1={PAD.top + innerH * (1 - t)}
                y2={PAD.top + innerH * (1 - t)}
                stroke="#F5D689"
                strokeDasharray="2 4"
              />
              <text
                x={PAD.left - 6}
                y={PAD.top + innerH * (1 - t) + 4}
                textAnchor="end"
                fill="#6B6B6B"
              >
                {Math.round(yMax * t)}
              </text>
            </g>
          ))}
          {/* X axis label */}
          <text
            x={PAD.left}
            y={H - 8}
            fill="#6B6B6B"
            fontSize="10"
          >
            {xMax} days before event
          </text>
          <text
            x={PAD.left + innerW}
            y={H - 8}
            textAnchor="end"
            fill="#6B6B6B"
            fontSize="10"
          >
            event day
          </text>

          {series.map((s, i) => {
            const color = COLORS[i % COLORS.length];
            const path = s.points
              .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${x(p.dBefore)} ${y(p.cumulative)}`)
              .join(' ');
            return (
              <g key={s.slug}>
                <path d={path} stroke={color} strokeWidth="2" fill="none" />
                {/* Capacity line */}
                <line
                  x1={PAD.left}
                  x2={PAD.left + innerW}
                  y1={y(s.capacity)}
                  y2={y(s.capacity)}
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  opacity="0.4"
                />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        {series.map((s, i) => (
          <span key={s.slug} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2 w-3 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
