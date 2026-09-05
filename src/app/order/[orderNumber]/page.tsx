import { notFound } from "next/navigation";
import Link from "next/link";
import { getDefaultBusinessId } from "@/lib/data/business";
import { getOrderByNumber, getOrderItems } from "@/lib/data/orders";
import { formatKes, formatDateTime } from "@/lib/format";
import { CUSTOMER_STATUS_LABEL, TRACKING_STEPS, TERMINAL_NEGATIVE_STATUSES } from "@/lib/orders/status-labels";
import { StorefrontShell } from "@/components/customer/StorefrontShell";
import { AutoRefresh } from "./AutoRefresh";

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const businessId = await getDefaultBusinessId();
  const order = await getOrderByNumber(businessId, orderNumber);
  if (!order) notFound();

  const items = await getOrderItems(order.id);
  const isNegative = TERMINAL_NEGATIVE_STATUSES.includes(order.status);
  const currentStepIndex = TRACKING_STEPS.indexOf(order.status);
  const shouldPoll = order.status === "new" || order.status === "payment_pending";

  return (
    <StorefrontShell>
      <AutoRefresh shouldPoll={shouldPoll} />
      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Order {order.order_number}</p>
          <h1 className="mt-1 text-xl font-bold text-stone-900">{CUSTOMER_STATUS_LABEL[order.status]}</h1>
          {order.status === "payment_pending" ? (
            <p className="mt-2 text-sm text-stone-600">
              Check your phone and enter your M-Pesa PIN to approve the payment prompt. This page updates
              automatically.
            </p>
          ) : null}
          {order.status === "failed" ? (
            <p className="mt-2 text-sm text-red-600">
              Payment was unsuccessful. Please place a new order and try again.
            </p>
          ) : null}
        </div>

        {!isNegative ? (
          <ol className="mt-6 space-y-3">
            {TRACKING_STEPS.map((step, index) => {
              const reached = currentStepIndex >= index;
              return (
                <li key={step} className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      reached ? "bg-brand text-white" : "bg-stone-200 text-stone-500"
                    }`}
                  >
                    {reached ? "✓" : index + 1}
                  </span>
                  <span className={reached ? "font-medium text-stone-900" : "text-stone-400"}>
                    {CUSTOMER_STATUS_LABEL[step]}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : null}

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
          <h2 className="mb-3 font-semibold text-stone-900">Order summary</h2>
          <ul className="space-y-1 text-sm text-stone-600">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.quantity} × {item.product_name_snapshot}
                </span>
                <span>{formatKes(item.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t border-stone-100 pt-3 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>{formatKes(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Delivery fee</span>
              <span>{Number(order.delivery_fee) > 0 ? formatKes(order.delivery_fee) : "Free"}</span>
            </div>
            {Number(order.discount) > 0 ? (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span>-{formatKes(order.discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-base font-bold text-stone-900">
              <span>Total</span>
              <span>{formatKes(order.total)}</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-stone-400">Placed {formatDateTime(order.created_at)}</p>
        </section>

        <Link href="/" className="mt-6 inline-block font-semibold text-brand">
          ← Back to menu
        </Link>
      </main>
    </StorefrontShell>
  );
}
