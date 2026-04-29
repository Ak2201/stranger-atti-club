import { listEvents } from '@/lib/events-store';
import { listExpenses } from '@/lib/expenses-store';
import ExpenseForm from './ExpenseForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · expenses' };

export default async function ExpensesPage() {
  const [events, expenses] = await Promise.all([
    listEvents(),
    listExpenses(),
  ]);
  const total = expenses.reduce((s, e) => s + e.amountInr, 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson">
          Expenses
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          Per-event spend
        </h1>
        <p className="mt-2 text-ink-soft">
          Log every cost so the per-event P&L on /admin/finance shows real
          margins.
        </p>
      </header>

      <ExpenseForm events={events} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total expenses" value={`₹${total.toLocaleString('en-IN')}`} />
        <Stat label="Categories" value={String(new Set(expenses.map((e) => e.category)).size)} />
        <Stat label="Events with spend" value={String(new Set(expenses.map((e) => e.eventSlug)).size)} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-marigold-200/60 bg-cream-50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="p-3">Event</th>
                <th className="p-3">Category</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
                <th className="p-3">Notes</th>
                <th className="p-3">Logged by</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink-mute">
                    No expenses logged yet.
                  </td>
                </tr>
              )}
              {expenses.map((e) => (
                <tr key={e.id} className="border-t border-marigold-100 text-sm">
                  <td className="p-3 text-ink-soft">{e.eventSlug}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-marigold-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-marigold-700">
                      {e.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-medium">
                    ₹{e.amountInr.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-ink-soft">{e.date}</td>
                  <td className="p-3 text-ink-soft">{e.notes || '—'}</td>
                  <td className="p-3 text-xs text-ink-mute">
                    {e.createdBy || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-4">
      <p className="text-[11px] uppercase tracking-wider text-ink-mute">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl text-ink">{value}</p>
    </div>
  );
}
