'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth-helpers';
import { logAction } from '@/lib/audit';
import {
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
} from '@/lib/events-store';
import type { EventItem } from '@/lib/events';

function parseJson<T>(input: FormDataEntryValue | null, fallback: T): T {
  if (!input) return fallback;
  try {
    return JSON.parse(input.toString()) as T;
  } catch {
    return fallback;
  }
}

function getStr(form: FormData, key: string, fallback = ''): string {
  return form.get(key)?.toString().trim() || fallback;
}

function getNum(form: FormData, key: string, fallback = 0): number {
  const v = form.get(key);
  if (v == null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function buildEvent(form: FormData, prev?: EventItem): EventItem {
  const slug = getStr(form, 'slug', prev?.slug || '');
  return {
    slug,
    name: getStr(form, 'name', prev?.name || ''),
    tagline: getStr(form, 'tagline', prev?.tagline || ''),
    date: getStr(form, 'date', prev?.date || ''),
    dateISO: getStr(form, 'dateISO', prev?.dateISO || ''),
    couponEnabled: form.get('couponEnabled') != null,
    doors: getStr(form, 'doors', prev?.doors || '7:00 PM'),
    closes: getStr(form, 'closes', prev?.closes || '11:00 PM'),
    venue: getStr(form, 'venue', prev?.venue || ''),
    area: getStr(form, 'area', prev?.area || ''),
    city: getStr(form, 'city', prev?.city || 'Chennai'),
    capacity: getNum(form, 'capacity', prev?.capacity || 60),
    spotsLeft: getNum(form, 'spotsLeft', prev?.spotsLeft ?? prev?.capacity ?? 60),
    heroEmoji: getStr(form, 'heroEmoji', prev?.heroEmoji || '✺'),
    accent: (getStr(form, 'accent', prev?.accent || 'marigold') as EventItem['accent']),
    description: getStr(form, 'description', prev?.description || ''),
    dressCode: getStr(form, 'dressCode', prev?.dressCode || ''),
    whatYouDo: parseJson(form.get('whatYouDoJson'), prev?.whatYouDo || []),
    whatYouWont: parseJson(form.get('whatYouWontJson'), prev?.whatYouWont || []),
    schedule: parseJson(form.get('scheduleJson'), prev?.schedule || []),
    faq: parseJson(form.get('faqJson'), prev?.faq || []),
    tiers: parseJson(form.get('tiersJson'), prev?.tiers || []),
  };
}

export async function createEventAction(
  prevState: { error?: string } | null,
  formData: FormData
) {
  const actor = await requireAdmin();
  const ev = buildEvent(formData);
  if (!ev.slug || !ev.name) {
    return { error: 'Slug and name are required.' };
  }
  const result = await createEvent(ev);
  if (!result.ok) {
    await logAction('event.create', ev.slug, { error: result.message }, 'error');
    return { error: result.message };
  }
  await logAction('event.create', ev.slug, {
    actor: actor.email,
    name: ev.name,
  });
  revalidatePath('/admin/events');
  revalidatePath('/events');
  redirect(`/admin/events/${ev.slug}/edit`);
}

export async function updateEventAction(
  slug: string,
  prevState: { error?: string; ok?: boolean } | null,
  formData: FormData
) {
  const actor = await requireAdmin();
  const prev = await getEvent(slug);
  const ev = buildEvent(formData, prev);
  const result = await updateEvent(slug, ev);
  if (!result.ok) {
    await logAction(
      'event.update',
      slug,
      { error: result.message },
      'error'
    );
    return { error: result.message };
  }
  await logAction('event.update', slug, { actor: actor.email });
  revalidatePath('/admin/events');
  revalidatePath(`/admin/events/${slug}/edit`);
  revalidatePath(`/events/${slug}`);
  revalidatePath('/events');
  return { ok: true };
}

/** Destructive — super-admin only. */
export async function deleteEventAction(slug: string) {
  const actor = await requireSuperAdmin();
  const result = await deleteEvent(slug);
  if (!result.ok) {
    await logAction('event.delete', slug, { error: result.message }, 'error');
    return { error: result.message };
  }
  await logAction('event.delete', slug, { actor: actor.email });
  revalidatePath('/admin/events');
  revalidatePath('/events');
  redirect('/admin/events');
}
