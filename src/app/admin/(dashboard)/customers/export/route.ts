import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listCustomers } from "@/lib/data/customers";
import { toCsv } from "@/lib/csv";
import { formatDateTime } from "@/lib/format";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customers = await listCustomers(session.businessId);

  const csv = toCsv(customers, [
    { header: "Name", value: (c) => c.name },
    { header: "Phone", value: (c) => c.phone },
    { header: "Orders", value: (c) => c.order_count },
    { header: "Total spent (KSh)", value: (c) => c.total_spent },
    { header: "Last order", value: (c) => (c.last_order_at ? formatDateTime(c.last_order_at) : "") },
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customers.csv"`,
    },
  });
}
