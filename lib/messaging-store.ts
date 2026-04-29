import { db, schema } from '@/db';
import { desc, eq } from 'drizzle-orm';
import { listAttendeesForEvent } from '@/lib/admin-store';
import { ticketUrl } from '@/lib/qr';
import { site } from '@/lib/site';

export type Template = {
  id: string;
  name: string;
  channel: 'whatsapp' | 'email';
  subject: string | null;
  body: string;
  createdAt: Date | null;
};

export async function listTemplates(): Promise<Template[]> {
  try {
    const rows = await db
      .select()
      .from(schema.messageTemplates)
      .orderBy(desc(schema.messageTemplates.createdAt))
      .all();
    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt ? new Date(Number(r.createdAt)) : null,
    })) as Template[];
  } catch (err) {
    console.warn('[messaging-store] list failed:', err);
    return [];
  }
}

export async function listBlasts() {
  try {
    return await db
      .select()
      .from(schema.messageBlasts)
      .orderBy(desc(schema.messageBlasts.sentAt))
      .all();
  } catch (err) {
    console.warn('[messaging-store] list blasts failed:', err);
    return [];
  }
}

export type Recipient = {
  bookingId: string;
  name: string;
  phone: string;
  email: string | null;
  ticketUrl: string;
};

export async function buildRecipients(
  eventSlug: string,
  audience: 'confirmed' | 'waitlist' | 'past' | 'all'
): Promise<Recipient[]> {
  if (audience === 'waitlist') return [];
  const rows = await listAttendeesForEvent(eventSlug);
  const filtered = rows.filter((r) => {
    if (audience === 'all') return true;
    if (audience === 'confirmed')
      return r.status === 'confirmed' || r.status === 'attended';
    if (audience === 'past') return r.status === 'attended';
    return true;
  });
  return filtered.map((r) => ({
    bookingId: r.id,
    name: r.contactName,
    phone: r.contactPhone.replace(/[^\d]/g, ''),
    email: r.contactEmail,
    ticketUrl: ticketUrl(r.id),
  }));
}

export function renderTemplate(
  body: string,
  vars: { name: string; eventName: string; venuePin?: string; ticketUrl: string }
): string {
  return body
    .replaceAll('{{name}}', vars.name)
    .replaceAll('{{eventName}}', vars.eventName)
    .replaceAll('{{venuePin}}', vars.venuePin || '(see event detail)')
    .replaceAll('{{ticketUrl}}', vars.ticketUrl);
}

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export const SAMPLE_TEMPLATES = [
  {
    name: 'T-7 announce',
    channel: 'whatsapp' as const,
    body: `Hi {{name}}! 👋\n\n{{eventName}} is one week away. Quick reminders:\n• Doors at 7pm\n• Dress: anything wedding-ish\n• Your QR ticket: {{ticketUrl}}\n\nCan't wait to celebrate with you.\n\n— Stranger Atti Club`,
  },
  {
    name: 'T-2 venue pin',
    channel: 'whatsapp' as const,
    body: `Hi {{name}}! 🌼\n\nTwo days to {{eventName}}!\n\n📍 Venue pin: {{venuePin}}\n🚗 Parking: street + paid lot 50m away\n👗 Dress code reminder — anything wedding-ish\n🎟 QR ticket (show at door): {{ticketUrl}}\n\nDM us if anything's unclear.`,
  },
  {
    name: 'Day-of last-minute',
    channel: 'whatsapp' as const,
    body: `Hi {{name}}! Tonight's the night — see you at 7 sharp.\nVenue: {{venuePin}}\nTicket: {{ticketUrl}}`,
  },
  {
    name: 'Post-event NPS',
    channel: 'whatsapp' as const,
    body: `Hi {{name}} 🌼 thanks for coming to {{eventName}}!\n\nOne quick question: on a scale of 0-10, how likely are you to recommend us to a friend?\n\nAlso — what surprised you most? (your one-liners shape the next event 💛)`,
  },
];
