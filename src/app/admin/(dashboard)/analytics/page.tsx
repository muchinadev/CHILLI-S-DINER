import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getAnalyticsForRange } from "@/lib/services/analytics-service";
import { formatKes } from "@/lib/format";
import { DailyBarChart } from "./DailyBarChart";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const days = period === "month" ? 30 : 7;

  const session = await getSession();
  const analytics = await getAnalyticsForRange(session!.businessId, days);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-stone-900">Analytics</h1>

      <div className="flex gap-2">
        <Link
          href="/admin/analytics?period=week"
          className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold ${
            days === 7 ? "bg-brand text-white" : "bg-white text-stone-600"
          }`}
        >
          Last 7 days
        </Link>
        <Link
          href="/admin/analytics?period=month"
          className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold ${
            days === 30 ? "bg-brand text-white" : "bg-white text-stone-600"
          }`}
        >
          Last 30 days
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Revenue" value={formatKes(analytics.revenue)} />
        <StatCard label="Orders" value={String(analytics.orderCount)} />
        <StatCard label="Avg. order value" value={formatKes(analytics.averageOrderValue)} />
        <StatCard label="Estimated profit" value={formatKes(analytics.estimatedProfit)} />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-stone-900">Revenue by day</h2>
        <DailyBarChart data={analytics.dailyBreakdown} />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-stone-900">Best-selling meals</h2>
        {analytics.topMeals.length === 0 ? (
          <p className="text-sm text-stone-500">No completed orders in this period yet.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {analytics.topMeals.map((meal, index) => (
              <li key={meal.name} className="flex items-center justify-between gap-3 py-2">
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {index + 1}. {meal.name}
                  </p>
                  <p className="text-xs text-stone-400">{meal.portions} sold</p>
                </div>
                <span className="shrink-0 font-semibold text-stone-900">{formatKes(meal.revenue)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-stone-400">
        Revenue and profit figures are estimates from confirmed orders, not audited accounting totals.
      </p>
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
