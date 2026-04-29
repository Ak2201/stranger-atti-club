/**
 * Razorpay refund — wraps the live API and falls back to a demo mode that
 * just flips status without an external call when keys are placeholders.
 */

export type RefundResult =
  | { ok: true; refundId: string; demo?: boolean }
  | { ok: false; error: string };

export async function razorpayRefund({
  paymentId,
  amountInr,
}: {
  paymentId: string | null | undefined;
  amountInr: number;
}): Promise<RefundResult> {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const placeholder =
    !keyId ||
    !keySecret ||
    keyId.includes('REPLACE_ME') ||
    keySecret.includes('REPLACE_ME');

  if (placeholder || !paymentId || paymentId.startsWith('pay_demo_')) {
    return {
      ok: true,
      demo: true,
      refundId: 'rfnd_demo_' + Math.random().toString(36).slice(2, 12),
    };
  }

  try {
    const Razorpay = (await import('razorpay')).default;
    const rzp = new Razorpay({ key_id: keyId!, key_secret: keySecret! });
    const refund = await rzp.payments.refund(paymentId, {
      amount: amountInr * 100,
      speed: 'normal',
    });
    return { ok: true, refundId: refund.id };
  } catch (err: any) {
    console.error('[refunds] razorpay refund failed:', err);
    return { ok: false, error: err?.message || 'Refund API call failed.' };
  }
}
