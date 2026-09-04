import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getTodayOverview } from "@/lib/services/dashboard-service";
import { listLowStockItems } from "@/lib/data/inventory";
import { formatKes } from "@/lib/format";

export default async function AdminDashboardPage() {
  const session = await getSession();
  const [overview, lowStockItems] = await Promise.all([
    getTodayOverview(session!.businessId),
    listLowStockItems(session!.businessId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Today</h1>
        <p className="text-sm text-stone-500">{new Date().toLocaleDateString("en-KE", { dateStyle: "full" })}</p>
      </div>

      {overview.pending > 0 || lowStockItems.length > 0 ? (
        <div className="space-y-2">
          {overview.pending > 0 ? (
            <Link
              href="/admin/orders?status=new"
              className="block rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
            >
              ⚠️ {overview.pending} order{overview.pending === 1 ? "" : "s"} waiting on payment or confirmation
            </Link>
          ) : null}
          {lowStockItems.map((item) => (
            <Link
              key={item.id}
              href="/admin/inventory"
              className="block rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              ⚠️ {item.name} stock is low ({Number(item.quantity_available)} {item.unit} left, reorder at{" "}
              {Number(item.reorder_level)})
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Orders" value={String(overview.totalOrders)} />
        <StatCard label="Avg. order value" value={formatKes(overview.averageOrderValue)} />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-stone-900">Orders by status</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <StatusPill label="Pending" value={overview.pending} />
          <StatusPill label="Preparing" value={overview.preparing} />
          <StatusPill label="Ready" value={overview.ready} />
          <StatusPill label="Out for delivery" value={overview.outForDelivery} />
          <StatusPill label="Delivered" value={overview.delivered} />
          <StatusPill label="Cancelled" value={overview.cancelled} />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-stone-900">Revenue &amp; profit</h2>
        <dl className="space-y-2 text-sm">
          <Row label="Revenue" value={formatKes(overview.revenue)} />
          <Row label="Estimated costs" value={formatKes(overview.estimatedCosts)} />
          <Row label="Estimated profit" value={formatKes(overview.estimatedProfit)} emphasize />
        </dl>
        <p className="mt-3 text-xs text-stone-400">
          Revenue and cost figures are estimates from confirmed orders, not audited accounting totals.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xl font-bold text-stone-900">{value}</p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-stone-600">{label}</dt>
      <dd className={emphasize ? "text-base font-bold text-stone-900" : "font-medium text-stone-900"}>{value}</dd>
    </div>
  );
}
