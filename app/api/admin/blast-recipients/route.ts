import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { buildRecipients } from '@/lib/messaging-store';

export async function GET(req: Request) {
  await requireAdmin();
  const url = new URL(req.url);
  const event = url.searchParams.get('event') || '';
  const audience =
    (url.searchParams.get('audience') as
      | 'confirmed'
      | 'past'
      | 'all'
      | 'waitlist') || 'confirmed';
  const recipients = await buildRecipients(event, audience);
  return NextResponse.json({ recipients });
}
