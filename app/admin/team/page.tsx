import { requireAdmin, isSuperAdmin } from '@/lib/auth-helpers';
import { listAdmins, listAuditLog, listTeamInvites } from '@/lib/team-store';
import InviteForm from './InviteForm';
import TeamMembers from './TeamMembers';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · team & audit' };

export default async function TeamPage() {
  const user = await requireAdmin();
  const canMutate = isSuperAdmin(user);
  const [members, invites, audit] = await Promise.all([
    listAdmins(),
    listTeamInvites(),
    listAuditLog(80),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
          Team
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          Who has the keys
        </h1>
        {!canMutate && (
          <p className="mt-3 inline-block rounded-full bg-marigold-100 px-3 py-1 text-xs text-marigold-700">
            Read-only — only super-admins can change roles or invite. Contact
            the owner.
          </p>
        )}
      </header>

      <section>
        <h2 className="mb-3 font-display text-lg">Admins</h2>
        <TeamMembers
          members={members.map((m) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            role: m.role,
          }))}
          currentEmail={user.email}
          canMutate={canMutate}
        />
      </section>

      {canMutate && (
        <section>
          <h2 className="mb-3 font-display text-lg">Invite a teammate</h2>
          <InviteForm />
        </section>
      )}

      {invites.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg">Pending invites</h2>
          <ul className="overflow-hidden rounded-2xl border border-marigold-200/60 bg-cream-50">
            {invites.map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between border-b border-marigold-100 p-4 last:border-b-0"
              >
                <div>
                  <p className="font-medium">{i.email}</p>
                  <p className="text-[11px] text-ink-mute">
                    {i.acceptedAt ? 'accepted' : 'awaiting first sign-in'}
                  </p>
                </div>
                <span className="rounded-full bg-marigold-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-marigold-700">
                  {i.role}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg">Audit log</h2>
        <div className="overflow-hidden rounded-2xl border border-marigold-200/60 bg-cream-50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-ink-mute">
                <tr>
                  <th className="p-3">When</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {audit.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-ink-mute">
                      No actions logged yet.
                    </td>
                  </tr>
                )}
                {audit.map((a) => (
                  <tr key={a.id} className="border-t border-marigold-100 text-sm">
                    <td className="p-3 text-xs text-ink-mute">
                      {a.createdAt
                        ? new Date(Number(a.createdAt)).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="p-3 text-ink-soft">{a.actorEmail}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          a.actorRole === 'super_admin'
                            ? 'bg-crimson/10 text-crimson'
                            : 'bg-marigold-100 text-marigold-700'
                        }`}
                      >
                        {a.actorRole.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">{a.action}</td>
                    <td className="p-3 font-mono text-xs text-ink-mute">
                      {a.target || '—'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          a.outcome === 'ok'
                            ? 'bg-leaf/15 text-emerald-700'
                            : a.outcome === 'denied'
                              ? 'bg-crimson/10 text-crimson'
                              : 'bg-ink/5 text-ink-mute'
                        }`}
                      >
                        {a.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
