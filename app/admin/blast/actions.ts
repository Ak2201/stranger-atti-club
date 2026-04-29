'use server';

import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-helpers';
import { logAction } from '@/lib/audit';

type State = { error?: string; ok?: boolean; recipientCount?: number };

export async function saveTemplate(
  prev: State | null,
  form: FormData
): Promise<State> {
  const actor = await requireAdmin();
  const name = form.get('name')?.toString().trim() || '';
  const channel =
    (form.get('channel')?.toString() as 'whatsapp' | 'email') || 'whatsapp';
  const subject = form.get('subject')?.toString() || null;
  const body = form.get('body')?.toString().trim() || '';
  const id = form.get('id')?.toString() || null;

  if (!name || !body) return { error: 'Name and body are required.' };

  if (id) {
    await db
      .update(schema.messageTemplates)
      .set({ name, channel, subject, body })
      .where(eq(schema.messageTemplates.id, id));
    await logAction('template.update', id, { actor: actor.email });
  } else {
    await db
      .insert(schema.messageTemplates)
      .values({ name, channel, subject, body });
    await logAction('template.create', name, { actor: actor.email });
  }
  revalidatePath('/admin/blast');
  return { ok: true };
}

export async function deleteTemplate(id: string) {
  const actor = await requireAdmin();
  await db
    .delete(schema.messageTemplates)
    .where(eq(schema.messageTemplates.id, id));
  await logAction('template.delete', id, { actor: actor.email });
  revalidatePath('/admin/blast');
}

export async function recordBlast(input: {
  eventSlug: string;
  audience: 'confirmed' | 'waitlist' | 'past' | 'all';
  channel: 'whatsapp' | 'email';
  subject?: string;
  body: string;
  recipientCount: number;
}) {
  const actor = await requireAdmin();
  await db.insert(schema.messageBlasts).values({
    eventSlug: input.eventSlug,
    audience: input.audience,
    channel: input.channel,
    subject: input.subject || null,
    body: input.body,
    recipientCount: input.recipientCount,
    sentBy: actor.email,
  });
  await logAction('blast.send', input.eventSlug, {
    actor: actor.email,
    audience: input.audience,
    channel: input.channel,
    recipientCount: input.recipientCount,
  });
  revalidatePath('/admin/blast');
}
