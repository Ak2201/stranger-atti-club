'use server';

import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { logAction } from '@/lib/audit';

type State = { error?: string; ok?: boolean };

export async function inviteTeamMember(
  prev: State | null,
  form: FormData
): Promise<State> {
  const actor = await requireSuperAdmin();
  const email = form.get('email')?.toString().trim().toLowerCase() || '';
  const role =
    (form.get('role')?.toString() as 'admin' | 'super_admin') || 'admin';
  if (!email) return { error: 'Email is required.' };

  try {
    await db
      .insert(schema.teamInvites)
      .values({ email, role, invitedBy: actor.email })
      .onConflictDoUpdate({
        target: schema.teamInvites.email,
        set: { role, invitedBy: actor.email },
      });
  } catch (err: any) {
    return { error: err?.message || 'Could not save invite.' };
  }

  // If the user already exists, promote immediately.
  await db
    .update(schema.users)
    .set({ role })
    .where(eq(schema.users.email, email));

  await logAction('team.invite', email, { actor: actor.email, role });
  revalidatePath('/admin/team');
  return { ok: true };
}

export async function setRole(
  userId: string,
  role: 'user' | 'admin' | 'super_admin'
) {
  const actor = await requireSuperAdmin();
  await db
    .update(schema.users)
    .set({ role })
    .where(eq(schema.users.id, userId));
  await logAction('team.set_role', userId, { actor: actor.email, role });
  revalidatePath('/admin/team');
}

export async function revokeAdmin(userId: string) {
  const actor = await requireSuperAdmin();
  await db
    .update(schema.users)
    .set({ role: 'user' })
    .where(eq(schema.users.id, userId));
  await logAction('team.revoke', userId, { actor: actor.email });
  revalidatePath('/admin/team');
}
