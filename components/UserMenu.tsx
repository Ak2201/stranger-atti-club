'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

const HAS_GOOGLE_HINT =
  typeof process !== 'undefined' &&
  !!process.env.NEXT_PUBLIC_HAS_GOOGLE_AUTH;

export default function UserMenu({ compact = false }: { compact?: boolean }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (status === 'loading') {
    return (
      <span className="inline-block h-9 w-9 animate-pulse rounded-full bg-marigold-100" />
    );
  }

  if (!session) {
    return (
      <Link
        href="/signin"
        className={`inline-flex items-center gap-2 rounded-full border border-marigold-300 bg-cream-50 px-4 py-2 text-sm font-semibold text-ink transition hover:border-crimson hover:text-crimson ${
          compact ? '' : ''
        }`}
      >
        <GoogleGlyph />
        Sign in
      </Link>
    );
  }

  const user = session.user!;
  const isAdmin = (user as { role?: string }).role === 'admin';
  const initials = (user.name || user.email || 'A')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-full border border-marigold-200 bg-cream-50 py-1 pl-1 pr-3 text-sm font-medium text-ink hover:border-crimson"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-crimson text-[11px] font-bold text-cream">
            {initials}
          </span>
        )}
        <span className="max-w-[100px] truncate">
          {user.name?.split(' ')[0] || 'You'}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-marigold-200 bg-cream-50 shadow-xl">
          <div className="border-b border-marigold-100 p-3">
            <p className="font-display text-sm">{user.name}</p>
            <p className="truncate text-xs text-ink-mute">{user.email}</p>
          </div>
          <Link
            href="/me"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm hover:bg-cream-100"
          >
            My tickets &amp; events
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-t border-marigold-100 px-4 py-2.5 text-sm font-semibold text-crimson hover:bg-crimson/5"
            >
              <span>Admin Console</span>
              <span className="rounded-full bg-crimson/10 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                Admin
              </span>
            </Link>
          )}
          <button
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: '/' });
            }}
            className="w-full border-t border-marigold-100 px-4 py-2.5 text-left text-sm text-crimson hover:bg-crimson/5"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.69-1.56 2.69-3.86 2.69-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.92v2.34A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.96H.92A9 9 0 0 0 0 9c0 1.45.35 2.83.92 4.04l3.03-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .92 4.96L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
