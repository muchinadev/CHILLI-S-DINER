import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listRecentExpenses } from "@/lib/data/expenses";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expenses = await listRecentExpenses(session.businessId, 30);

  const csv = toCsv(expenses, [
    { header: "Date", value: (e) => new Date(e.expense_date).toLocaleDateString("en-CA") },
    { header: "Category", value: (e) => e.category_name ?? "Uncategorized" },
    { header: "Description", value: (e) => e.description ?? "" },
    { header: "Payment method", value: (e) => e.payment_method ?? "" },
    { header: "Amount (KSh)", value: (e) => e.amount },
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="expenses-last-30-days.csv"`,
    },
  });
}
