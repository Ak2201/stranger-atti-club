import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUser, listBookingsForUser } from '@/lib/users-store';
import { getEvent } from '@/lib/events-store';
import { listAuditLog } from '@/lib/team-store';
import { requireAdmin, isSuperAdmin } from '@/lib/auth-helpers';
import { qrPayload, ticketUrl } from '@/lib/qr';
import Qr from '@/components/Qr';
import UserActions from './UserActions';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const u = await getUser(params.id);
  return { title: `Admin · ${u?.name || u?.email || params.id}` };
}

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const me = await requireAdmin();
  const u = await getUser(params.id);
  if (!u) notFound();

  const bookings = await listBookingsForUser(params.id);
  const events = await Promise.all(
    Array.from(new Set(bookings.map((b) => b.eventSlug))).map((s) =>
      getEvent(s).then((e) => [s, e] as const)
    )
  );
  const eventBySlug = new Map(events);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => {
    const ev = eventBySlug.get(b.eventSlug);
    return (
      ev &&
      ev.dateISO >= today &&
      (b.status === 'confirmed' || b.status === 'attended')
    );
  });
  const past = bookings.filter((b) => {
    const ev = eventBySlug.get(b.eventSlug);
    return ev && ev.dateISO < today;
  });
  const cancelled = bookings.filter(
    (b) => b.status === 'cancelled' || b.status === 'refunded'
  );
  const lifetimeSpend = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'attended')
    .reduce((s, b) => s + b.amountInr, 0);

  const audit = (await listAuditLog(200)).filter((a) => a.target === u.id);

  const initials = (u.name || u.email)
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/users"
          className="text-sm text-ink-mute hover:text-crimson"
        >
          ← Users
        </Link>
      </div>

      {/* Identity */}
      <section className="overflow-hidden rounded-3xl border border-marigold-200/60 bg-cream-50">
        <div className="grid gap-6 p-6 sm:grid-cols-[120px_1fr] sm:p-8">
          <div>
            {u.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={u.image}
                alt=""
                className="h-24 w-24 rounded-full border-2 border-marigold-300 object-cover"
              />
            ) : (
              <span className="grid h-24 w-24 place-items-center rounded-full bg-crimson font-display text-3xl text-cream">
                {initials}
              </span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-display text-3xl text-ink">
                {u.name || u.email}
              </h1>
              <RolePill role={u.role} />
              {u.banned && (
                <span className="rounded-full bg-crimson/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-crimson">
                  Banned
                </span>
              )}
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Row label="Email" value={u.email} />
              <Row label="WhatsApp" value={u.whatsapp || '—'} />
              <Row label="User ID" value={u.id} mono />
              <Row
                label="Joined"
                value={
                  u.createdAt
                    ? u.createdAt.toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'
                }
              />
              <Row
                label="Last seen"
                value={
                  u.lastSeenAt
                    ? u.lastSeenAt.toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never'
                }
              />
              <Row
                label="Lifetime spend"
                value={`₹${lifetimeSpend.toLocaleString('en-IN')}`}
              />
            </dl>
          </div>
        </div>
      </section>

      {/* Booking summary */}
      <section className="grid gap-3 sm:grid-cols-4">
        <Stat label="Upcoming" value={String(upcoming.length)} />
        <Stat label="Past attended" value={String(past.length)} />
        <Stat label="Cancelled / refunded" value={String(cancelled.length)} />
        <Stat label="Bookings total" value={String(bookings.length)} />
      </section>

      {/* Upcoming with QRs */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-xl">Upcoming tickets</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((b) => {
              const ev = eventBySlug.get(b.eventSlug);
              return (
                <li
                  key={b.id}
                  className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-5"
                >
                  <p className="font-display text-base">
                    {ev?.name || b.eventSlug}
                  </p>
                  <p className="text-xs text-ink-mute">
                    {ev?.date} · {b.tierId} · ₹{b.amountInr}
                  </p>
                  <div className="mt-3 grid place-items-center">
                    <Qr payload={qrPayload(b.id)} size={160} />
                  </div>
                  <p className="mt-2 break-all text-center font-mono text-[10px] text-ink-mute">
                    {b.razorpayPaymentId ?? b.id}
                  </p>
                  <a
                    href={ticketUrl(b.id)}
                    target="_blank"
                    rel="noopener"
                    className="mt-2 block w-full rounded-full bg-ink px-3 py-2 text-center text-xs font-semibold text-cream hover:bg-crimson"
                  >
                    Open ticket →
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* All bookings table */}
      <section>
        <h2 className="mb-3 font-display text-xl">All bookings</h2>
        {bookings.length === 0 ? (
          <p className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-5 text-sm text-ink-mute">
            No bookings on this account yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-marigold-200/60 bg-cream-50">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-ink-mute">
                  <tr>
                    <th className="p-3">Booking</th>
                    <th className="p-3">Event</th>
                    <th className="p-3">Tier</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Coupon</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Razorpay</th>
                    <th className="p-3">Booked</th>
                    <th className="p-3 text-right">Ticket</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      className="border-t border-marigold-100 text-sm"
                    >
                      <td className="p-3 font-mono text-[11px] text-ink-mute">
                        {b.id.slice(0, 8)}…
                      </td>
                      <td className="p-3 text-ink-soft">{b.eventSlug}</td>
                      <td className="p-3 text-ink-soft">{b.tierId}</td>
                      <td className="p-3 font-medium">
                        ₹{b.amountInr.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {((b as any).couponInitialInr ?? 0) > 0
                          ? `₹${(b as any).couponRedeemedInr ?? 0}/₹${(b as any).couponInitialInr}`
                          : '—'}
                      </td>
                      <td className="p-3">
                        <StatusPill status={b.status} />
                      </td>
                      <td className="p-3 font-mono text-[10px] text-ink-mute">
                        {b.razorpayPaymentId || '—'}
                      </td>
                      <td className="p-3 text-xs text-ink-mute">
                        {b.createdAt
                          ? new Date(Number(b.createdAt)).toLocaleDateString(
                              'en-IN',
                              { day: 'numeric', month: 'short' }
                            )
                          : '—'}
                      </td>
                      <td className="p-3 text-right">
                        <a
                          href={ticketUrl(b.id)}
                          target="_blank"
                          rel="noopener"
                          className="text-crimson hover:underline"
                        >
                          Open →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Audit log filtered to this user */}
      {audit.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-xl">Audit log</h2>
          <ul className="overflow-hidden rounded-2xl border border-marigold-200/60 bg-cream-50">
            {audit.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-3 border-b border-marigold-100 p-3 text-xs last:border-b-0"
              >
                <span className="text-ink-mute">
                  {a.createdAt
                    ? new Date(Number(a.createdAt)).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </span>
                <span className="font-mono">{a.action}</span>
                <span className="text-ink-mute">by {a.actorEmail}</span>
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    a.outcome === 'ok'
                      ? 'bg-leaf/15 text-emerald-700'
                      : 'bg-crimson/10 text-crimson'
                  }`}
                >
                  {a.outcome}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Super-admin destructive actions */}
      {isSuperAdmin(me) && (
        <UserActions
          userId={u.id}
          email={u.email}
          name={u.name}
          role={u.role}
          banned={u.banned}
          isSelf={u.email === me.email}
        />
      )}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-ink-mute">
        {label}
      </dt>
      <dd
        className={`mt-0.5 break-all ${mono ? 'font-mono text-xs' : 'text-sm'} text-ink`}
      >
        {value}
      </dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-4">
      <p className="text-[11px] uppercase tracking-wider text-ink-mute">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl text-ink">{value}</p>
    </div>
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
      className={`rounded-full ${s.bg} ${s.text} px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider`}
    >
      {role.replace('_', ' ')}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    confirmed: { bg: 'bg-leaf/15', text: 'text-emerald-700' },
    attended: { bg: 'bg-marigold-100', text: 'text-marigold-700' },
    cancelled: { bg: 'bg-crimson/10', text: 'text-crimson' },
    refunded: { bg: 'bg-ink/5', text: 'text-ink-mute' },
    noshow: { bg: 'bg-ink/5', text: 'text-ink-mute' },
  };
  const s = map[status] || map.cancelled;
  return (
    <span
      className={`inline-flex items-center rounded-full ${s.bg} ${s.text} px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider`}
    >
      {status}
    </span>
  );
}
