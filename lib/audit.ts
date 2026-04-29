import { db, schema } from '@/db';
import { getSessionUser } from '@/lib/auth-helpers';

export type AuditOutcome = 'ok' | 'denied' | 'error';

/**
 * Write a single row to the audit log. Best-effort — never throws, never
 * blocks the calling action. Action strings are dotted: "event.update",
 * "booking.refund", "team.promote", etc.
 */
export async function logAction(
  action: string,
  target?: string | null,
  payload?: any,
  outcome: AuditOutcome = 'ok'
) {
  try {
    const actor = await getSessionUser();
    await db.insert(schema.auditLogs).values({
      actorEmail: actor?.email || 'system',
      actorRole: actor?.role || 'system',
      action,
      target: target ?? null,
      payloadJson: payload ? JSON.stringify(payload).slice(0, 4000) : null,
      outcome,
    });
  } catch (err) {
    console.warn('[audit] write failed:', err);
  }
}

/**
 * Wrap a Server Action so every call writes an audit log row, capturing the
 * outcome (ok / error). Use sparingly — for the most security-sensitive
 * actions only. For normal logs, call `logAction()` inline.
 */
export function withAudit<TArgs extends any[], TResult>(
  action: string,
  fn: (...args: TArgs) => Promise<TResult>,
  resolveTarget?: (args: TArgs) => string | undefined
) {
  return async (...args: TArgs): Promise<TResult> => {
    const target = resolveTarget?.(args);
    try {
      const result = await fn(...args);
      await logAction(action, target, { args: safeArgs(args) }, 'ok');
      return result;
    } catch (err: any) {
      await logAction(
        action,
        target,
        { args: safeArgs(args), error: err?.message },
        'error'
      );
      throw err;
    }
  };
}

function safeArgs(args: any[]): any {
  // Drop FormData entries (would be unhelpful in payloadJson).
  return args.map((a) =>
    a instanceof FormData ? Object.fromEntries(a.entries()) : a
  );
}
