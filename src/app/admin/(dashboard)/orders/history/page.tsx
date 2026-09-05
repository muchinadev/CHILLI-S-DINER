import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { listOrdersByDate } from "@/lib/data/orders";
import { ADMIN_STATUS_LABEL, statusBadgeClass } from "@/lib/orders/status-labels";
import { formatKes, formatDateTime } from "@/lib/format";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDay(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export default async function AdminOrderHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayIso();

  const session = await getSession();
  const orders = await listOrdersByDate(session!.businessId, date);
  const isToday = date === todayIso();

  const revenue = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "failed")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">Order history</h1>
        <Link href="/admin/orders" className="text-sm font-semibold text-brand-dark">
          Live queue →
        </Link>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
        <Link
          href={`/admin/orders/history?date=${shiftDate(date, -1)}`}
          className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-semibold text-stone-600"
        >
          ← Prev
        </Link>
        <form action="/admin/orders/history" className="flex items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={date}
            max={todayIso()}
            className="rounded-lg border border-stone-200 px-2 py-1 text-sm text-stone-700"
          />
          <button type="submit" className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-semibold text-stone-600">
            Go
          </button>
        </form>
        {isToday ? (
          <span className="rounded-full px-3 py-1.5 text-sm font-semibold text-stone-300">Next →</span>
        ) : (
          <Link
            href={`/admin/orders/history?date=${shiftDate(date, 1)}`}
            className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-semibold text-stone-600"
          >
            Next →
          </Link>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
        <p className="text-sm text-stone-500">{formatDay(date)}</p>
        <div className="mt-2 flex items-center justify-center gap-6">
          <div>
            <p className="text-xs text-stone-500">Orders</p>
            <p className="text-lg font-bold text-stone-900">{orders.length}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Revenue</p>
            <p className="text-lg font-bold text-stone-900">{formatKes(revenue)}</p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          No orders on this day.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="block rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-stone-900">{order.order_number}</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                  {ADMIN_STATUS_LABEL[order.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-500">
                {order.customer_name} · {order.customer_phone}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-stone-500">{formatDateTime(order.created_at)}</span>
                <span className="font-semibold text-stone-900">{formatKes(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
