import { getSession } from "@/lib/auth/session";
import { listCustomers } from "@/lib/data/customers";
import { formatKes, formatDateTime } from "@/lib/format";

function customerStatus(orderCount: number, lastOrderAt: string | null): { label: string; className: string } {
  if (orderCount === 0) return { label: "New", className: "bg-stone-100 text-stone-500" };
  if (!lastOrderAt) return { label: "New", className: "bg-stone-100 text-stone-500" };

  const daysSinceLastOrder = (Date.now() - new Date(lastOrderAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceLastOrder > 30) return { label: "Inactive", className: "bg-stone-100 text-stone-500" };
  if (orderCount >= 3) return { label: "Repeat", className: "bg-brand-100 text-brand-dark" };
  return { label: "Active", className: "bg-green-100 text-green-700" };
}

export default async function AdminCustomersPage() {
  const session = await getSession();
  const customers = await listCustomers(session!.businessId);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-stone-900">Customers</h1>

      {customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          No customers yet — they&apos;ll show up here after their first order.
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => {
            const status = customerStatus(customer.order_count, customer.last_order_at);
            return (
              <div key={customer.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-900">{customer.name}</p>
                    <p className="text-sm text-stone-500">{customer.phone}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-stone-500">
                    {customer.order_count} order{customer.order_count === 1 ? "" : "s"}
                  </span>
                  <span className="font-semibold text-stone-900">{formatKes(customer.total_spent)}</span>
                </div>
                {customer.last_order_at ? (
                  <p className="mt-1 text-xs text-stone-400">Last order {formatDateTime(customer.last_order_at)}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
