'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { UserSummary } from '@/lib/users-store';

const ACTIVE_WINDOW_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export default function UsersTable({ rows }: { rows: UserSummary[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'admins' | 'banned'>(
    'all'
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    return rows.filter((u) => {
      if (filter === 'active') {
        if (!u.lastSeenAt || now - u.lastSeenAt.getTime() > ACTIVE_WINDOW_MS)
          return false;
      }
      if (filter === 'admins') {
        if (u.role === 'user') return false;
      }
      if (filter === 'banned') {
        if (!u.banned) return false;
      }
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.whatsapp || '').toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    });
  }, [rows, query, filter]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name / email / WhatsApp / id"
          className="min-w-0 flex-1 basis-full rounded-xl border border-marigold-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-crimson sm:basis-[260px]"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-xl border border-marigold-200 bg-white px-4 py-2.5 text-sm"
        >
          <option value="all">All users</option>
          <option value="active">Active (last 7 days)</option>
          <option value="admins">Admins + super admins</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-marigold-200/60 bg-cream-50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Bookings</th>
                <th className="p-3">Lifetime spend</th>
                <th className="p-3">Last seen</th>
                <th className="p-3">Joined</th>
                <th className="p-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-ink-mute">
                    No users match.
                  </td>
                </tr>
              )}
              {filtered.map((u) => {
                const initials = (u.name || u.email)
                  .split(/\s+/)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
                const isActive =
                  u.lastSeenAt &&
                  Date.now() - u.lastSeenAt.getTime() < ACTIVE_WINDOW_MS;
                return (
                  <tr key={u.id} className="border-t border-marigold-100 text-sm">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.image}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-crimson text-[11px] font-bold text-cream">
                            {initials}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium">
                            {u.name || u.email}
                            {u.banned && (
                              <span className="ml-2 rounded-full bg-crimson/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-crimson">
                                Banned
                              </span>
                            )}
                          </p>
                          <p className="truncate text-[11px] text-ink-mute">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <RolePill role={u.role} />
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{u.bookingsCount}</p>
                      <p className="text-[10px] text-ink-mute">
                        {u.confirmedCount}c · {u.attendedCount}a ·{' '}
                        {u.upcomingCount} upcoming
                      </p>
                    </td>
                    <td className="p-3 font-medium">
                      ₹{u.lifetimeSpend.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-xs text-ink-mute">
                      {u.lastSeenAt ? (
                        <span
                          className={
                            isActive ? 'text-emerald-700' : 'text-ink-mute'
                          }
                        >
                          {timeAgo(u.lastSeenAt)}
                          {isActive && (
                            <span className="ml-1 text-[10px]">●</span>
                          )}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-xs text-ink-mute">
                      {u.createdAt
                        ? u.createdAt.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-crimson hover:underline"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-ink-mute">
        {filtered.length} of {rows.length} users shown.
      </p>
    </section>
  );
}

function RolePill({ role }: { role: 'user' | 'admin' | 'super_admin' }) {
  const map: Record<string, { bg: string; text: string }> = {
    user: { bg: 'bg-marigold-100', text: 'text-marigold-700' },
    admin: { bg: 'bg-marigold-200', text: 'text-marigold-800' },
    super_admin: { bg: 'bg-crimson', text: 'text-cream' },
  };
  const s = map[role];
  return (
    <span
      className={`inline-flex items-center rounded-full ${s.bg} ${s.text} px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider`}
    >
      {role.replace('_', ' ')}
    </span>
  );
}

function timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
