import { listUsers } from '@/lib/users-store';
import UsersTable from './UsersTable';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · users' };

export default async function AdminUsers() {
  const users = await listUsers();
  const totalSpend = users.reduce((s, u) => s + u.lifetimeSpend, 0);
  const activeWindow = 1000 * 60 * 60 * 24 * 7;
  const now = Date.now();
  const active = users.filter(
    (u) => u.lastSeenAt && now - u.lastSeenAt.getTime() < activeWindow
  ).length;
  const admins = users.filter((u) => u.role !== 'user').length;
  const banned = users.filter((u) => u.banned).length;

  return (
    <div className="space-y-6">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
          Users
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          Everyone with an account
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Live list of every signed-up user — bookings, lifetime spend, last
          seen, role. Click into a user to see all their data including QR
          tickets.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Users total" value={String(users.length)} />
        <Stat label="Active (7d)" value={String(active)} accent="leaf" />
        <Stat label="Admins" value={String(admins)} />
        <Stat
          label="Lifetime revenue"
          value={`₹${totalSpend.toLocaleString('en-IN')}`}
        />
      </div>
      {banned > 0 && (
        <p className="text-xs text-crimson">{banned} banned</p>
      )}

      <UsersTable rows={users} />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'leaf';
}) {
  const accentClass =
    accent === 'leaf'
      ? 'border-leaf/40 bg-leaf/5'
      : 'border-marigold-200/60 bg-cream-50';
  return (
    <div className={`rounded-2xl border ${accentClass} p-4`}>
      <p className="text-[11px] uppercase tracking-wider text-ink-mute">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl text-ink">{value}</p>
    </div>
  );
}
