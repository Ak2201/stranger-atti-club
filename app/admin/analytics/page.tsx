import { salesVelocity, cohortRetention } from '@/lib/analytics-store';
import SalesVelocityChart from './SalesVelocityChart';
import CohortTable from './CohortTable';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · analytics' };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab =
    searchParams?.tab === 'cohorts'
      ? 'cohorts'
      : searchParams?.tab === 'funnel'
        ? 'funnel'
        : 'velocity';

  const [velocity, cohorts] = await Promise.all([
    tab === 'velocity' ? salesVelocity() : Promise.resolve([]),
    tab === 'cohorts' ? cohortRetention() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
          Analytics
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          What the numbers say
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          The first two charts work off your real bookings. Funnel needs an
          analytics integration (Plausible / GA) to track page views.
        </p>
      </header>

      <nav className="flex gap-2">
        <TabLink active={tab === 'velocity'} href="/admin/analytics">
          Sales velocity
        </TabLink>
        <TabLink active={tab === 'cohorts'} href="/admin/analytics?tab=cohorts">
          Cohorts
        </TabLink>
        <TabLink active={tab === 'funnel'} href="/admin/analytics?tab=funnel">
          Funnel
        </TabLink>
      </nav>

      {tab === 'velocity' && (
        <section>
          <p className="mb-3 text-sm text-ink-soft">
            Cumulative confirmed bookings as the event date approaches. Dashed
            line = capacity.
          </p>
          <SalesVelocityChart series={velocity} />
        </section>
      )}

      {tab === 'cohorts' && (
        <section>
          <p className="mb-3 text-sm text-ink-soft">
            For each event, what % of its attendees came back for later
            events. Joined by attendee email.
          </p>
          <CohortTable cohorts={cohorts} />
        </section>
      )}

      {tab === 'funnel' && (
        <section className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-6">
          <p className="font-display text-lg">Booking funnel</p>
          <p className="mt-2 text-sm text-ink-soft">
            Tracking site visits → ticket-page views → checkout → paid requires
            connecting an analytics tool.
          </p>
          <p className="mt-3 text-xs text-ink-mute">
            Recommended: Plausible (free, privacy-first) or GA4. Add a script
            tag in <code>app/layout.tsx</code> and import the daily counts here.
          </p>
        </section>
      )}
    </div>
  );
}

function TabLink({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        active
          ? 'bg-ink text-cream'
          : 'border border-marigold-200 bg-cream-50 text-ink-soft hover:text-crimson'
      }`}
    >
      {children}
    </a>
  );
}
