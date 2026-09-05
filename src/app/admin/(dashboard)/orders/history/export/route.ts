import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listOrdersByDate } from "@/lib/data/orders";
import { toCsv } from "@/lib/csv";
import { formatDateTime } from "@/lib/format";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dateParam = request.nextUrl.searchParams.get("date");
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayIso();

  const orders = await listOrdersByDate(session.businessId, date);

  const csv = toCsv(orders, [
    { header: "Order number", value: (o) => o.order_number },
    { header: "Date", value: (o) => formatDateTime(o.created_at) },
    { header: "Customer", value: (o) => o.customer_name },
    { header: "Phone", value: (o) => o.customer_phone },
    { header: "Fulfillment", value: (o) => o.fulfillment_type },
    { header: "Status", value: (o) => o.status },
    { header: "Payment status", value: (o) => o.payment_status },
    { header: "Subtotal (KSh)", value: (o) => o.subtotal },
    { header: "Delivery fee (KSh)", value: (o) => o.delivery_fee },
    { header: "Discount (KSh)", value: (o) => o.discount },
    { header: "Total (KSh)", value: (o) => o.total },
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${date}.csv"`,
    },
  });
}
