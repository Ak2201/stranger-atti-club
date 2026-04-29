'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db, schema } from '@/db';
import { requireAdmin } from '@/lib/auth-helpers';
import { logAction } from '@/lib/audit';
import { ticketUrl } from '@/lib/qr';
import { getEvent } from '@/lib/events-store';

type State = { error?: string; bookingId?: string; ticketUrl?: string };

export async function createWalkInBooking(
  prev: State | null,
  form: FormData
): Promise<State> {
  const actor = await requireAdmin();

  const eventSlug = form.get('eventSlug')?.toString().trim() || '';
  const tierId = form.get('tierId')?.toString().trim() || '';
  const name = form.get('name')?.toString().trim() || '';
  const phone = form.get('phone')?.toString().trim() || '';
  const email = form.get('email')?.toString().trim() || null;
  const paymentMethod =
    (form.get('paymentMethod')?.toString() as
      | 'cash'
      | 'upi_offline'
      | 'comp') || 'cash';
  const amountInr = Number(form.get('amountInr') || 0);

  if (!eventSlug || !tierId || !name || !phone) {
    return { error: 'Event, tier, name and phone are required.' };
  }

  const event = await getEvent(eventSlug);
  const tier = event?.tiers.find((t) => t.id === tierId);
  if (!event || !tier) return { error: 'Invalid event or tier.' };

  const finalAmount =
    Number.isFinite(amountInr) && amountInr > 0 ? amountInr : tier.priceInr;

  const id = crypto.randomUUID();
  try {
    const couponInitialInr =
      event.couponEnabled && typeof tier.couponInr === 'number'
        ? Math.max(0, Math.floor(tier.couponInr))
        : 0;
    await db.insert(schema.bookings).values({
      id,
      userId: null,
      eventSlug,
      tierId,
      amountInr: finalAmount,
      contactName: name,
      contactPhone: phone,
      contactEmail: email,
      razorpayOrderId: null,
      razorpayPaymentId: null,
      paymentMethod,
      status: 'confirmed',
      couponInitialInr,
      couponRedeemedInr: 0,
    });
  } catch (err: any) {
    await logAction(
      'booking.walk_in_create',
      eventSlug,
      { error: err?.message },
      'error'
    );
    return { error: err?.message || 'Could not save the walk-in.' };
  }

  await logAction('booking.walk_in_create', id, {
    eventSlug,
    tierId,
    name,
    phone,
    paymentMethod,
    amountInr: finalAmount,
    actor: actor.email,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/bookings');
  revalidatePath(`/admin/events/${eventSlug}/attendees`);

  return { bookingId: id, ticketUrl: ticketUrl(id) };
}
