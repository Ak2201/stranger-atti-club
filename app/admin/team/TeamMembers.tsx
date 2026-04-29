'use client';

import { useTransition, useState } from 'react';
import { setRole, revokeAdmin } from './actions';

type Member = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

export default function TeamMembers({
  members,
  currentEmail,
  canMutate,
}: {
  members: Member[];
  currentEmail: string;
  canMutate: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleSetRole(
    id: string,
    role: 'admin' | 'super_admin',
    name: string
  ) {
    if (!confirm(`Set ${name}'s role to ${role}?`)) return;
    startTransition(async () => {
      await setRole(id, role);
      setFeedback(`${name} → ${role}`);
    });
  }

  function handleRevoke(id: string, name: string) {
    if (!confirm(`Revoke ${name}'s admin access?`)) return;
    startTransition(async () => {
      await revokeAdmin(id);
      setFeedback(`${name} revoked.`);
    });
  }

  if (members.length === 0) {
    return (
      <p className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-5 text-sm text-ink-mute">
        No admins yet (other than env-var bootstrapped accounts).
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {feedback && (
        <div className="rounded-xl border border-leaf/40 bg-leaf/10 px-3 py-2 text-sm text-emerald-700">
          {feedback}
        </div>
      )}
      <ul className="overflow-hidden rounded-2xl border border-marigold-200/60 bg-cream-50">
        {members.map((m) => {
          const isYou = m.email === currentEmail;
          return (
            <li
              key={m.id}
              className="flex flex-wrap items-center gap-3 border-b border-marigold-100 p-4 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-base">
                  {m.name || m.email}{' '}
                  {isYou && (
                    <span className="ml-2 text-xs text-ink-mute">(you)</span>
                  )}
                </p>
                <p className="text-xs text-ink-mute">{m.email}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  m.role === 'super_admin'
                    ? 'bg-crimson text-cream'
                    : 'bg-marigold-100 text-marigold-700'
                }`}
              >
                {m.role.replace('_', ' ')}
              </span>

              {canMutate && !isYou && (
                <div className="flex gap-2">
                  {m.role !== 'super_admin' && (
                    <button
                      onClick={() =>
                        handleSetRole(
                          m.id,
                          'super_admin',
                          m.name || m.email
                        )
                      }
                      disabled={pending}
                      className="rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-cream"
                    >
                      Promote
                    </button>
                  )}
                  {m.role === 'super_admin' && (
                    <button
                      onClick={() =>
                        handleSetRole(m.id, 'admin', m.name || m.email)
                      }
                      disabled={pending}
                      className="rounded-full border border-marigold-300 px-3 py-1.5 text-[11px] font-semibold text-ink"
                    >
                      Demote
                    </button>
                  )}
                  <button
                    onClick={() => handleRevoke(m.id, m.name || m.email)}
                    disabled={pending}
                    className="rounded-full bg-crimson/10 px-3 py-1.5 text-[11px] font-semibold text-crimson"
                  >
                    Revoke
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
