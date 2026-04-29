import { listAllBookings } from '@/lib/admin-store';
import { requireAdmin, isSuperAdmin } from '@/lib/auth-helpers';
import RefundsTable from './RefundsTable';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · refunds' };

export default async function RefundsPage() {
  const user = await requireAdmin();
  const all = await listAllBookings();
  const queue = all.filter(
    (b) =>
      b.status === 'cancelled' ||
      b.status === 'refunded' ||
      b.status === 'noshow' ||
      b.status === 'confirmed'
  );
  const flagged = queue.filter(
    (b) => b.status === 'cancelled' || b.status === 'refunded'
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
          Refunds
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          Refund queue
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Cancel any confirmed booking. Once cancelled, it appears in the queue
          for super-admin to process the actual Razorpay refund.
        </p>
        {!isSuperAdmin(user) && (
          <p className="mt-3 inline-block rounded-full bg-marigold-100 px-3 py-1 text-xs text-marigold-700">
            You're an admin — cancellation is allowed, but only the super-admin
            can call the Razorpay refund.
          </p>
        )}
      </header>

      <section>
        <h2 className="mb-2 font-display text-lg">Awaiting refund</h2>
        <RefundsTable rows={flagged} canRefund={isSuperAdmin(user)} />
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg">All bookings</h2>
        <RefundsTable rows={queue} canRefund={isSuperAdmin(user)} />
      </section>
    </div>
  );
}
