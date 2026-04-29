import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser, isAdmin, isVendor, hasRedeemAccess } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

type NavItem = {
  href: string;
  label: string;
  icon: string;
  /** Only show this item for these roles. Default: admin + super_admin only. */
  roles?: Array<'admin' | 'super_admin' | 'vendor'>;
};
type NavSection = { heading: string; items: NavItem[] };

const ALL_ADMIN: Array<'admin' | 'super_admin' | 'vendor'> = ['admin', 'super_admin'];
const REDEEM_STAFF: Array<'admin' | 'super_admin' | 'vendor'> = [
  'admin',
  'super_admin',
  'vendor',
];

const adminNav: NavSection[] = [
  {
    heading: 'Operations',
    items: [
      { href: '/admin', label: 'Dashboard', icon: '✺', roles: ALL_ADMIN },
      { href: '/admin/check-in', label: 'Check-in', icon: '◐', roles: REDEEM_STAFF },
      { href: '/admin/redeem', label: 'Redeem', icon: '🍷', roles: REDEEM_STAFF },
      { href: '/admin/walk-in', label: 'Walk-in', icon: '＋', roles: ALL_ADMIN },
      { href: '/admin/refunds', label: 'Refunds', icon: '↩', roles: ALL_ADMIN },
    ],
  },
  {
    heading: 'Business',
    items: [
      { href: '/admin/events', label: 'Events', icon: '✦', roles: ALL_ADMIN },
      { href: '/admin/bookings', label: 'Bookings', icon: '◉', roles: ALL_ADMIN },
      { href: '/admin/users', label: 'Users', icon: '☻', roles: ALL_ADMIN },
      { href: '/admin/blast', label: 'Communications', icon: '⌬', roles: ALL_ADMIN },
      { href: '/admin/finance', label: 'Finance', icon: '₹', roles: ALL_ADMIN },
      { href: '/admin/analytics', label: 'Analytics', icon: '⚲', roles: ALL_ADMIN },
    ],
  },
  {
    heading: 'Team',
    items: [
      { href: '/admin/team', label: 'Team & audit', icon: '⚙', roles: ALL_ADMIN },
    ],
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/signin?from=/admin');
  if (!hasRedeemAccess(user)) redirect('/me?error=not-staff');

  const role = user.role as 'admin' | 'super_admin' | 'vendor';
  const roleLabel =
    role === 'super_admin'
      ? 'Super admin'
      : role === 'vendor'
        ? 'Vendor'
        : 'Admin';

  // Filter nav by role
  const visibleSections = adminNav
    .map((s) => ({
      ...s,
      items: s.items.filter((it) => (it.roles ?? ALL_ADMIN).includes(role)),
    }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="mx-auto grid max-w-7xl gap-0 px-0 lg:grid-cols-[260px_1fr] lg:gap-0 lg:px-5">
      <aside className="hidden border-r border-marigold-200/60 bg-cream-50 lg:block">
        <div className="sticky top-20 px-5 py-8">
          <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
            Admin Console
          </p>
          <p className="mt-1 font-display text-xl text-ink">
            {user.name?.split(' ')[0] || 'Admin'}
          </p>
          <p className="text-xs text-ink-mute">{user.email}</p>
          <span
            className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              role === 'super_admin'
                ? 'bg-crimson text-cream'
                : role === 'vendor'
                  ? 'bg-leaf/20 text-emerald-800'
                  : 'bg-marigold-100 text-marigold-700'
            }`}
          >
            {roleLabel}
          </span>

          <nav className="mt-8 space-y-6">
            {visibleSections.map((section) => (
              <div key={section.heading}>
                <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.2em] text-ink-mute">
                  {section.heading}
                </p>
                <div className="space-y-1">
                  {section.items.map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-cream-100 hover:text-crimson"
                    >
                      <span className="text-marigold-500">{it.icon}</span>
                      {it.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl border border-marigold-200/60 bg-cream p-4 text-xs text-ink-mute">
            <p className="font-display text-sm text-ink">Heads up</p>
            <p className="mt-1">
              Treat attendee phone numbers + emails like wedding RSVPs. Don't
              export, share, or screenshot off this dashboard.
            </p>
          </div>
        </div>
      </aside>

      <div className="px-5 py-6 lg:py-10">
        {/* Mobile admin tab bar */}
        <nav className="mb-6 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden">
          {visibleSections.flatMap((s) => s.items).map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="shrink-0 rounded-full border border-marigold-200 bg-cream-50 px-4 py-2 text-xs font-semibold text-ink-soft hover:border-crimson hover:text-crimson"
            >
              {it.icon} {it.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
