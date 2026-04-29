'use server';

import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { logAction } from '@/lib/audit';

export async function setBanned(userId: string, banned: boolean) {
  const actor = await requireSuperAdmin();
  await db
    .update(schema.users)
    .set({ banned })
    .where(eq(schema.users.id, userId));
  await logAction(banned ? 'user.ban' : 'user.unban', userId, {
    actor: actor.email,
  });
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
}

export async function setUserRole(
  userId: string,
  role: 'user' | 'admin' | 'super_admin'
) {
  const actor = await requireSuperAdmin();
  await db
    .update(schema.users)
    .set({ role })
    .where(eq(schema.users.id, userId));
  await logAction('user.set_role', userId, {
    actor: actor.email,
    role,
  });
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath('/admin/team');
}

export async function deleteUser(userId: string) {
  const actor = await requireSuperAdmin();
  // Bookings keep their data via ON DELETE SET NULL (defined in schema).
  await db.delete(schema.users).where(eq(schema.users.id, userId));
  await logAction('user.delete', userId, { actor: actor.email });
  revalidatePath('/admin/users');
}
