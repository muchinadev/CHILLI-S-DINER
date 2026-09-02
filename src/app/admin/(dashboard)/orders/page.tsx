import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { listOrders, type OrderStatus } from "@/lib/data/orders";
import { ADMIN_STATUS_LABEL, statusBadgeClass } from "@/lib/orders/status-labels";
import { formatKes, formatDateTime } from "@/lib/format";

const FILTERS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Payment pending", value: "payment_pending" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
  { label: "Out for delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await getSession();
  const activeFilter = (status as OrderStatus | undefined) ?? undefined;
  const orders = await listOrders(session!.businessId, { status: activeFilter });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-stone-900">Orders</h1>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((filter) => {
          const href = filter.value === "all" ? "/admin/orders" : `/admin/orders?status=${filter.value}`;
          const active = (filter.value === "all" && !activeFilter) || filter.value === activeFilter;
          return (
            <Link
              key={filter.value}
              href={href}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                active ? "bg-orange-600 text-white" : "bg-white text-stone-600"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          No orders here yet.
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
