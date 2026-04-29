import Link from 'next/link';
import { site } from '@/lib/site';
import { LogoMark } from '@/components/Logo';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-marigold-200/60 bg-cream-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={36} variant="badge" />
            <span className="font-display text-xl">{site.name}</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink-mute">
            {site.tagline} Stranger-meetup events in {site.city}.
          </p>
        </div>

        <div>
          <p className="font-display text-sm uppercase tracking-widest text-ink-mute">
            Explore
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/events" className="hover:text-crimson">
                Upcoming events
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-crimson">
                Past events
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-crimson">
                Our manifesto
              </Link>
            </li>
            <li>
              <Link href="/corporate" className="hover:text-crimson">
                For teams
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm uppercase tracking-widest text-ink-mute">
            Trust
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/code-of-conduct" className="hover:text-crimson">
                Code of conduct
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-crimson">
                Get help
              </Link>
            </li>
            <li>
              <Link href="/refund" className="hover:text-crimson">
                Refund policy
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-crimson">
                Privacy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm uppercase tracking-widest text-ink-mute">
            Talk to us
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={`https://wa.me/${site.whatsapp}`}
                target="_blank"
                rel="noopener"
                className="hover:text-crimson"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-crimson">
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={`https://instagram.com/${site.instagram}`}
                target="_blank"
                rel="noopener"
                className="hover:text-crimson"
              >
                @{site.instagram}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-marigold-200/50">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-2 px-5 py-5 text-xs text-ink-mute sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Made with marigolds in {site.city}.
          </p>
          <p className="italic">Reply to every DM within 4 hours. Almost always faster.</p>
        </div>
      </div>
    </footer>
  );
}
