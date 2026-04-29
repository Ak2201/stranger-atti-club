import { db, schema } from '@/db';
import { desc, inArray } from 'drizzle-orm';

export async function listAdmins() {
  try {
    const rows = await db
      .select()
      .from(schema.users)
      .where(inArray(schema.users.role, ['admin', 'super_admin']))
      .all();
    return rows;
  } catch (err) {
    console.warn('[team-store] list admins failed:', err);
    return [];
  }
}

export async function listTeamInvites() {
  try {
    const rows = await db
      .select()
      .from(schema.teamInvites)
      .orderBy(desc(schema.teamInvites.invitedAt))
      .all();
    return rows;
  } catch (err) {
    console.warn('[team-store] list invites failed:', err);
    return [];
  }
}

export async function listAuditLog(limit = 100) {
  try {
    const rows = await db
      .select()
      .from(schema.auditLogs)
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(limit)
      .all();
    return rows;
  } catch (err) {
    console.warn('[team-store] audit log failed:', err);
    return [];
  }
}
