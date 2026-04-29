'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { inviteTeamMember } from './actions';

export default function InviteForm() {
  const [state, action] = useFormState(inviteTeamMember, null);
  return (
    <form action={action} className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-6">
      <h3 className="font-display text-lg">Invite a teammate</h3>
      <p className="mt-1 text-xs text-ink-mute">
        On their first sign-in (with this email via Google), the role is auto-set.
      </p>
      {state?.error && (
        <div className="mt-3 rounded-xl border border-crimson/30 bg-crimson/5 px-3 py-2 text-sm text-crimson">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="mt-3 rounded-xl border border-leaf/40 bg-leaf/10 px-3 py-2 text-sm text-emerald-700">
          Invite saved.
        </div>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
        <input
          name="email"
          type="email"
          required
          placeholder="them@gmail.com"
          className="rounded-xl border border-marigold-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-crimson"
        />
        <select
          name="role"
          defaultValue="admin"
          className="rounded-xl border border-marigold-200 bg-white px-4 py-2.5 text-sm"
        >
          <option value="admin">Admin</option>
          <option value="super_admin">Super admin</option>
        </select>
        <Submit />
      </div>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-crimson px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Invite'}
    </button>
  );
}
