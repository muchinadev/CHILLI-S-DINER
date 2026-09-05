import { getSession } from "@/lib/auth/session";
import { listExpenseCategories, listRecentExpenses } from "@/lib/data/expenses";
import { formatKes } from "@/lib/format";
import { round2 } from "@/lib/services/pricing";
import { ExpenseForm } from "./ExpenseForm";

export default async function AdminExpensesPage() {
  const session = await getSession();
  const [categories, expenses] = await Promise.all([
    listExpenseCategories(session!.businessId),
    listRecentExpenses(session!.businessId, 30),
  ]);

  const totalLast30Days = round2(expenses.reduce((sum, expense) => sum + Number(expense.amount), 0));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">Expenses</h1>
        <a
          href="/admin/expenses/export"
          className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 shadow-sm"
        >
          ⬇ Export CSV
        </a>
      </div>

      <ExpenseForm categories={categories} />

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Last 30 days</h2>
          <span className="font-bold text-stone-900">{formatKes(totalLast30Days)}</span>
        </div>

        {expenses.length === 0 ? (
          <p className="text-sm text-stone-500">No expenses recorded yet.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {expenses.map((expense) => (
              <li key={expense.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {expense.category_name ?? "Uncategorized"}
                    {expense.description ? ` · ${expense.description}` : ""}
                  </p>
                  <p className="text-xs text-stone-400">
                    {new Date(expense.expense_date).toLocaleDateString("en-KE", { dateStyle: "medium" })} ·{" "}
                    {expense.payment_method}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-stone-900">{formatKes(expense.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
