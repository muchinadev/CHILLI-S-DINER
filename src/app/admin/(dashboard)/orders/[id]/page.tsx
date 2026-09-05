import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getAdminNextStatusOptions,
  getOrderItems,
  getOrderStatusHistory,
  getOrderWithCustomerById,
} from "@/lib/data/orders";
import { getAddressById } from "@/lib/data/customers";
import { getLatestPaymentForOrder } from "@/lib/data/payments";
import { formatKes, formatDateTime } from "@/lib/format";
import { ADMIN_STATUS_LABEL, statusBadgeClass } from "@/lib/orders/status-labels";
import { StatusUpdateForm } from "./StatusUpdateForm";
import { RecordCashPaymentForm } from "./RecordCashPaymentForm";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const order = await getOrderWithCustomerById(session!.businessId, id);
  if (!order) notFound();

  const [items, history, payment, address] = await Promise.all([
    getOrderItems(order.id),
    getOrderStatusHistory(order.id),
    getLatestPaymentForOrder(order.id),
    order.delivery_address_id ? getAddressById(order.delivery_address_id) : Promise.resolve(null),
  ]);

  const nextOptions = getAdminNextStatusOptions(order.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">{order.order_number}</h1>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
          {ADMIN_STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <StatusUpdateForm orderId={order.id} nextOptions={nextOptions} />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-stone-900">Customer</h2>
        <p className="text-sm text-stone-700">{order.customer_name}</p>
        <p className="text-sm text-stone-500">{order.customer_phone}</p>
        {address ? <p className="mt-2 text-sm text-stone-700">{address.address_text}</p> : null}
        {address?.instructions ? <p className="text-sm text-stone-500">{address.instructions}</p> : null}
        {order.fulfillment_type === "pickup" ? (
          <p className="mt-2 text-sm text-stone-700">Pickup order</p>
        ) : null}
        {order.notes ? <p className="mt-2 text-sm text-stone-500">Notes: {order.notes}</p> : null}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-stone-900">Items</h2>
        <ul className="space-y-1 text-sm text-stone-600">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.quantity} × {item.product_name_snapshot} @ {formatKes(item.unit_price_snapshot)}
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
            <span>{formatKes(order.delivery_fee)}</span>
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
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-stone-900">Payment</h2>
        <p className="text-sm text-stone-700">
          Status: <span className="font-medium">{order.payment_status}</span>
        </p>
        {payment ? (
          <>
            {payment.provider_reference ? (
              <p className="text-sm text-stone-500">Reference: {payment.provider_reference}</p>
            ) : null}
            <p className="text-sm text-stone-500">Provider: {payment.provider}</p>
          </>
        ) : null}
        {order.payment_status !== "paid" &&
        order.status !== "cancelled" &&
        order.status !== "failed" ? (
          <RecordCashPaymentForm orderId={order.id} total={Number(order.total)} />
        ) : null}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-stone-900">Status history</h2>
        <ul className="space-y-2 text-sm">
          {history.map((entry) => (
            <li key={entry.id} className="flex justify-between text-stone-600">
              <span>
                {entry.from_status ? `${entry.from_status} → ` : ""}
                {entry.to_status} <span className="text-stone-400">by {entry.changed_by}</span>
              </span>
              <span className="text-stone-400">{formatDateTime(entry.changed_at)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
