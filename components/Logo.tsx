/**
 * Stranger Atti Club logo mark.
 *
 * Marigold mandala: 12 petals (one for each month / new theme every month),
 * crimson outer ring, cream center holding two crimson dots — the two
 * strangers who become atti (best friends in Tamil).
 *
 * Two variants:
 *  - "badge"  — crimson disc background, marigold petals on top. Used in the
 *               nav / footer / anywhere on the cream page background.
 *  - "tile"   — crimson rounded-square bg, used for app icons + OG image.
 */
type Variant = 'badge' | 'tile';

type Props = {
  size?: number;
  variant?: Variant;
  className?: string;
  title?: string;
};

const PETAL_ROTATIONS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

export function LogoMark({
  size = 40,
  variant = 'badge',
  className = '',
  title = 'Stranger Atti Club',
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <radialGradient id="sac-petal" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#F4C66B" />
          <stop offset="55%" stopColor="#E8A33D" />
          <stop offset="100%" stopColor="#B97A1F" />
        </radialGradient>
        <radialGradient id="sac-bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#C72929" />
          <stop offset="100%" stopColor="#7A1414" />
        </radialGradient>
      </defs>

      {/* Background */}
      {variant === 'tile' ? (
        <rect width="100" height="100" rx="22" fill="url(#sac-bg)" />
      ) : (
        <circle cx="50" cy="50" r="49" fill="url(#sac-bg)" />
      )}

      {/* 12 petals (monthly themes) */}
      <g transform="translate(50 50)">
        {PETAL_ROTATIONS.map((rot) => (
          <ellipse
            key={rot}
            cx="0"
            cy="-30"
            rx="4"
            ry="12"
            fill="url(#sac-petal)"
            transform={`rotate(${rot})`}
          />
        ))}

        {/* Inner ring of small petals between the big ones */}
        {PETAL_ROTATIONS.map((rot) => (
          <ellipse
            key={`inner-${rot}`}
            cx="0"
            cy="-22"
            rx="1.8"
            ry="5"
            fill="#FBE3A7"
            opacity="0.85"
            transform={`rotate(${rot + 15})`}
          />
        ))}

        {/* Cream center disc — the warm room */}
        <circle r="15" fill="#FFF8E7" />
        <circle r="15" fill="none" stroke="#B22222" strokeWidth="0.8" opacity="0.35" />

        {/* The two strangers — head + shoulders silhouettes */}
        <g fill="#B22222">
          {/* Left stranger */}
          <circle cx="-5" cy="-5" r="2.6" />
          <path d="M -9 6 L -9 0.5 Q -9 -2.5 -5 -2.5 Q -1 -2.5 -1 0.5 L -1 6 Z" />
          {/* Right stranger */}
          <circle cx="5" cy="-5" r="2.6" />
          <path d="M 1 6 L 1 0.5 Q 1 -2.5 5 -2.5 Q 9 -2.5 9 0.5 L 9 6 Z" />
        </g>

        {/* Tiny marigold spark above their heads — the moment they meet */}
        <g fill="#E8A33D">
          <circle cx="0" cy="-9" r="0.9" />
          <circle cx="-1.6" cy="-9.6" r="0.5" opacity="0.7" />
          <circle cx="1.6" cy="-9.6" r="0.5" opacity="0.7" />
        </g>
      </g>
    </svg>
  );
}

/** Horizontal lockup: mark + wordmark. Used in the footer. */
export function LogoLockup({
  size = 36,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} variant="badge" />
      <span className="font-display text-xl tracking-tight text-ink">
        Stranger Atti Club
      </span>
    </span>
  );
}
