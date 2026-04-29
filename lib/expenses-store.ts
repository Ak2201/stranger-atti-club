import { db, schema } from '@/db';
import { desc, eq } from 'drizzle-orm';

export type ExpenseRow = {
  id: string;
  eventSlug: string;
  category: string;
  amountInr: number;
  date: string;
  notes: string | null;
  receiptUrl: string | null;
  createdBy: string | null;
  createdAt: Date | null;
};

export async function listExpenses(filters?: {
  eventSlug?: string;
  category?: string;
}): Promise<ExpenseRow[]> {
  try {
    const rows = await db
      .select()
      .from(schema.expenses)
      .orderBy(desc(schema.expenses.createdAt))
      .all();
    return rows
      .filter(
        (r) =>
          (!filters?.eventSlug || r.eventSlug === filters.eventSlug) &&
          (!filters?.category || r.category === filters.category)
      )
      .map((r) => ({
        ...r,
        amountInr: Number(r.amountInr),
        createdAt: r.createdAt ? new Date(Number(r.createdAt)) : null,
      })) as ExpenseRow[];
  } catch (err) {
    console.warn('[expenses-store] read failed:', err);
    return [];
  }
}

export async function totalExpensesByEvent(): Promise<Map<string, number>> {
  const rows = await listExpenses();
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.eventSlug, (map.get(r.eventSlug) || 0) + r.amountInr);
  }
  return map;
}

export async function totalExpensesForEvent(eventSlug: string): Promise<number> {
  const rows = await listExpenses({ eventSlug });
  return rows.reduce((s, r) => s + r.amountInr, 0);
}
