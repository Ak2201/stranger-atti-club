'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setBanned, setUserRole, deleteUser } from '../actions';

type Props = {
  userId: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin' | 'super_admin';
  banned: boolean;
  isSelf: boolean;
};

export default function UserActions({
  userId,
  email,
  name,
  role,
  banned,
  isSelf,
}: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const display = name || email;

  function handleRole(newRole: 'user' | 'admin' | 'super_admin') {
    if (!confirm(`Change ${display}'s role to ${newRole}?`)) return;
    startTransition(() => setUserRole(userId, newRole));
  }
  function handleBan(b: boolean) {
    const verb = b ? 'ban' : 'unban';
    if (!confirm(`${verb.charAt(0).toUpperCase() + verb.slice(1)} ${display}?`))
      return;
    startTransition(() => setBanned(userId, b));
  }
  function handleDelete() {
    if (
      !confirm(
        `Permanently delete ${display}? Their bookings remain (ownership is set to null). This cannot be undone.`
      )
    )
      return;
    startTransition(async () => {
      await deleteUser(userId);
      router.push('/admin/users');
    });
  }

  return (
    <section className="rounded-3xl border-2 border-crimson/30 bg-crimson/5 p-6">
      <h3 className="font-display text-xl text-crimson">Danger zone</h3>
      <p className="mt-2 text-sm text-ink-soft">
        Super-admin only. All actions are written to the audit log.
      </p>

      {isSelf && (
        <p className="mt-3 rounded-xl bg-crimson/10 px-3 py-2 text-xs text-crimson">
          This is your own account — actions are disabled here. Demote yourself
          via /admin/team if needed.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {role !== 'super_admin' && (
          <button
            onClick={() => handleRole('super_admin')}
            disabled={pending || isSelf}
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream disabled:opacity-50"
          >
            Promote to super admin
          </button>
        )}
        {role !== 'admin' && (
          <button
            onClick={() => handleRole('admin')}
            disabled={pending || isSelf}
            className="rounded-full border border-marigold-300 px-4 py-2 text-xs font-semibold text-ink disabled:opacity-50"
          >
            Set as admin
          </button>
        )}
        {role !== 'user' && (
          <button
            onClick={() => handleRole('user')}
            disabled={pending || isSelf}
            className="rounded-full bg-marigold-100 px-4 py-2 text-xs font-semibold text-ink disabled:opacity-50"
          >
            Revoke admin
          </button>
        )}
        <button
          onClick={() => handleBan(!banned)}
          disabled={pending || isSelf}
          className="rounded-full bg-crimson/10 px-4 py-2 text-xs font-semibold text-crimson disabled:opacity-50"
        >
          {banned ? 'Unban' : 'Ban from booking'}
        </button>
        <button
          onClick={handleDelete}
          disabled={pending || isSelf}
          className="rounded-full bg-crimson px-4 py-2 text-xs font-semibold text-cream disabled:opacity-50"
        >
          Delete account
        </button>
      </div>
    </section>
  );
}
