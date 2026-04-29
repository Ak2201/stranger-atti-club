'use server';

import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth-helpers';
import { logAction } from '@/lib/audit';

type State = { error?: string; ok?: boolean };

export async function createExpense(
  prev: State | null,
  form: FormData
): Promise<State> {
  const actor = await requireAdmin();

  const eventSlug = form.get('eventSlug')?.toString().trim() || '';
  const category = form.get('category')?.toString().trim() || '';
  const amountInr = Number(form.get('amountInr') || 0);
  const date = form.get('date')?.toString().trim() || '';
  const notes = form.get('notes')?.toString().trim() || null;
  const receiptUrl = form.get('receiptUrl')?.toString().trim() || null;

  if (!eventSlug || !category || !amountInr || !date) {
    return { error: 'Event, category, amount, and date are required.' };
  }

  await db.insert(schema.expenses).values({
    eventSlug,
    category: category as any,
    amountInr,
    date,
    notes,
    receiptUrl,
    createdBy: actor.email,
  });

  await logAction('expense.create', eventSlug, {
    actor: actor.email,
    category,
    amountInr,
  });

  revalidatePath('/admin/expenses');
  revalidatePath('/admin/finance');
  revalidatePath(`/admin/finance/${eventSlug}`);
  return { ok: true };
}

export async function deleteExpense(id: string) {
  // Deletion is destructive — super-admin only.
  const actor = await requireSuperAdmin();
  const row = await db
    .select()
    .from(schema.expenses)
    .where(eq(schema.expenses.id, id))
    .get();
  await db.delete(schema.expenses).where(eq(schema.expenses.id, id));
  await logAction('expense.delete', id, {
    actor: actor.email,
    eventSlug: row?.eventSlug,
    amountInr: row?.amountInr,
  });
  revalidatePath('/admin/expenses');
  revalidatePath('/admin/finance');
  if (row?.eventSlug) revalidatePath(`/admin/finance/${row.eventSlug}`);
}
