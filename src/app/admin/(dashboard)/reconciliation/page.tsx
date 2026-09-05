import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getDailyReconciliation } from "@/lib/data/reconciliation";
import { formatKes } from "@/lib/format";

const PROVIDER_LABEL: Record<string, string> = {
  mock: "M-Pesa (test mode)",
  mpesa: "M-Pesa",
  cash: "Cash",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default async function AdminReconciliationPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayIso();

  const session = await getSession();
  const summary = await getDailyReconciliation(session!.businessId, date);

  const isToday = date === todayIso();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Cash reconciliation</h1>
        <p className="text-sm text-stone-500">What should have come in today vs. what&apos;s actually confirmed.</p>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
        <Link
          href={`/admin/reconciliation?date=${shiftDate(date, -1)}`}
          className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-semibold text-stone-600"
        >
          ← Prev
        </Link>
        <form action="/admin/reconciliation" className="flex items-center gap-2">
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
            href={`/admin/reconciliation?date=${shiftDate(date, 1)}`}
            className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-semibold text-stone-600"
          >
            Next →
          </Link>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-xs text-stone-500">Expected</p>
            <p className="text-lg font-bold text-stone-900">{formatKes(summary.expectedTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Confirmed received</p>
            <p className="text-lg font-bold text-stone-900">{formatKes(summary.confirmedTotal)}</p>
          </div>
        </div>
        <div
          className={`mt-3 rounded-xl p-3 text-center text-sm font-semibold ${
            summary.variance <= 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {summary.variance <= 0
            ? "All expected income is accounted for"
            : `${formatKes(summary.variance)} not yet confirmed`}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-stone-900">By payment method</h2>
        {summary.byMethod.length === 0 ? (
          <p className="text-sm text-stone-500">No confirmed payments this day.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {summary.byMethod.map((method) => (
              <li key={method.provider} className="flex items-center justify-between">
                <span className="text-stone-700">
                  {PROVIDER_LABEL[method.provider] ?? method.provider}{" "}
                  <span className="text-stone-400">({method.count})</span>
                </span>
                <span className="font-semibold text-stone-900">{formatKes(method.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-stone-900">Outstanding orders</h2>
        {summary.outstandingOrders.length === 0 ? (
          <p className="text-sm text-stone-500">Nothing outstanding — everything is paid up.</p>
        ) : (
          <ul className="space-y-2">
            {summary.outstandingOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded-xl bg-amber-50 p-3 text-sm"
                >
                  <span>
                    <span className="font-semibold text-stone-900">{order.order_number}</span>{" "}
                    <span className="text-stone-500">· {order.customer_name}</span>
                  </span>
                  <span className="font-semibold text-amber-700">{formatKes(order.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
