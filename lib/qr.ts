import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'dev-only-secret-please-change';

/**
 * QR-ticket payload format: `bookingId.signature`
 *
 * The signature is the first 16 hex chars of HMAC-SHA256 of bookingId + AUTH_SECRET.
 * Truncated to keep the QR readable on phone screens. 64 bits of entropy is far more
 * than enough — an attacker can't brute force it without the secret.
 *
 * Why include in URL: the public ticket page `/tickets/[bookingId]?t=[sig]`
 * doesn't require auth. The signature IS the auth.
 */
export function signBookingId(bookingId: string): string {
  return crypto
    .createHmac('sha256', SECRET)
    .update(bookingId)
    .digest('hex')
    .slice(0, 16);
}

export function verifyBookingSignature(
  bookingId: string,
  signature: string | null | undefined
): boolean {
  if (!signature) return false;
  const expected = signBookingId(bookingId);
  // Constant-time compare to avoid timing attacks.
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function ticketUrl(bookingId: string, baseUrl?: string): string {
  const base =
    baseUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/tickets/${bookingId}?t=${signBookingId(bookingId)}`;
}

/**
 * QR payload — what the QR code actually encodes. We use the full URL so a
 * camera scanner that auto-opens URLs (most do) takes the user to the ticket
 * page directly. The admin scanner extracts bookingId + signature from the URL.
 */
export function qrPayload(bookingId: string, baseUrl?: string): string {
  return ticketUrl(bookingId, baseUrl);
}

/** Parse a scanned QR and return the bookingId + signature, or null if invalid. */
export function parseQrPayload(payload: string): {
  bookingId: string;
  signature: string;
} | null {
  try {
    const url = new URL(payload);
    const match = url.pathname.match(/^\/tickets\/([^/]+)$/);
    const bookingId = match?.[1];
    const signature = url.searchParams.get('t');
    if (!bookingId || !signature) return null;
    return { bookingId, signature };
  } catch {
    return null;
  }
}
