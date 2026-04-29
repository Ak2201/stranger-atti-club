import { listAllBookings } from '@/lib/admin-store';
import { requireAdmin, isSuperAdmin } from '@/lib/auth-helpers';
import AttendeesTable from './AttendeesTable';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · all bookings' };

export default async function AdminBookings() {
  const user = await requireAdmin();
  const rows = await listAllBookings();

  return (
    <div className="space-y-6">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
          Bookings
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          Every paid ticket, ever.
        </h1>
        <p className="mt-2 text-ink-soft">
          Search by name, phone, email, or Razorpay payment ID. Click a phone
          number to open WhatsApp.
        </p>
      </header>

      <AttendeesTable rows={rows} canDelete={isSuperAdmin(user)} />
    </div>
  );
}
