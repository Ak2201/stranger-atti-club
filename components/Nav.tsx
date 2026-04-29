'use client';

import Link from 'next/link';
import { useState } from 'react';
import { nav, site } from '@/lib/site';
import { LogoMark } from '@/components/Logo';
import UserMenu from '@/components/UserMenu';

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-marigold-100/60 bg-cream/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="transition-transform group-hover:rotate-[18deg]">
            <LogoMark size={38} variant="badge" />
          </span>
          <span className="font-display text-xl tracking-tight text-ink">
            {site.name}
          </span>
        </Link>

        <ul className="hidden items-center gap-6 lg:flex xl:gap-7">
          {nav.slice(1).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="fancy-link text-sm font-medium text-ink-soft hover:text-crimson"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/events/fake-sangeeth"
              className="rounded-full bg-crimson px-4 py-2 text-sm font-semibold text-cream shadow-sm transition hover:bg-crimson-500"
            >
              Book a ticket
            </Link>
          </li>
          <li>
            <UserMenu />
          </li>
        </ul>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-marigold-200 bg-cream-50 text-ink"
        >
          <span className="relative block h-3 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 bg-ink transition ${
                open ? 'translate-y-1.5 rotate-45' : ''
              }`}
            />
            <span
              className={`absolute left-0 top-2.5 h-0.5 w-5 bg-ink transition ${
                open ? '-translate-y-1 -rotate-45' : ''
              }`}
            />
          </span>
        </button>
      </nav>

      {open && (
        <div className="lg:hidden">
          <ul className="border-t border-marigold-100/60 bg-cream px-5 py-4">
            {nav.map((item) => (
              <li key={item.href} className="py-2">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block text-base font-medium text-ink-soft hover:text-crimson"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <Link
                href="/events/fake-sangeeth"
                onClick={() => setOpen(false)}
                className="inline-block rounded-full bg-crimson px-5 py-2.5 text-sm font-semibold text-cream"
              >
                Book a ticket
              </Link>
            </li>
            <li className="pt-3">
              <UserMenu />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
