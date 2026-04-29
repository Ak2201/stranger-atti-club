import { listEvents } from '@/lib/events-store';
import { listTemplates, SAMPLE_TEMPLATES } from '@/lib/messaging-store';
import Composer from './Composer';
import TemplatesEditor from './TemplatesEditor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · communications' };

export default async function BlastPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const [events, templates] = await Promise.all([
    listEvents(),
    listTemplates(),
  ]);
  const tab = searchParams?.tab === 'templates' ? 'templates' : 'compose';

  return (
    <div className="space-y-6">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
          Communications
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          Send a blast
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Free path: generate per-attendee WhatsApp deep-links and click each
          one. Once Brevo / WATI keys land, this same composer queues automated
          sends.
        </p>
      </header>

      <nav className="flex gap-2">
        <TabLink active={tab === 'compose'} href="/admin/blast">
          Compose
        </TabLink>
        <TabLink active={tab === 'templates'} href="/admin/blast?tab=templates">
          Templates
        </TabLink>
      </nav>

      {tab === 'compose' ? (
        <Composer events={events} templates={templates} />
      ) : (
        <TemplatesEditor
          templates={templates}
          samples={SAMPLE_TEMPLATES}
        />
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
