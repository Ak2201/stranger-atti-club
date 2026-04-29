import { requireRedeemAccess, isSuperAdmin } from '@/lib/auth-helpers';
import RedeemScanner from './RedeemScanner';
import RedeemPanel from './RedeemPanel';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · redeem' };

export default async function RedeemPage() {
  const me = await requireRedeemAccess();

  return (
    <div className="space-y-6">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
          Bar / vendor station
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Redeem credit</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Scan an attendee's QR (or search by name / phone) and deduct from
          their bar credit. Every action is logged.{' '}
          {!isSuperAdmin(me) && (
            <span className="text-ink-mute">
              You can self-undo your own redemption within 60 seconds. Older
              corrections need a super-admin.
            </span>
          )}
        </p>
      </header>

      <section>
        <h2 className="mb-2 font-display text-lg">Scan QR</h2>
        <RedeemScanner />
      </section>

      <RedeemPanel
        isSuperAdmin={isSuperAdmin(me)}
        currentEmail={me.email}
      />
    </div>
  );
}
