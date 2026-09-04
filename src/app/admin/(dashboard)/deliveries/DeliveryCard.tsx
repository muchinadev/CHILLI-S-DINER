"use client";

import { useActionState } from "react";
import {
  assignDriverAction,
  updateDeliveryStatusAction,
  type DeliveryFormState,
} from "@/lib/services/admin-delivery-service";
import type { DeliveryStatus, DeliveryWithOrder } from "@/lib/data/deliveries";
import { formatKes } from "@/lib/format";

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  pending: "Awaiting rider",
  assigned: "Rider assigned",
  picked_up: "Picked up",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  failed: "Failed",
};

const STATUS_BADGE: Record<DeliveryStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  assigned: "bg-brand-100 text-brand-dark",
  picked_up: "bg-brand-100 text-brand-dark",
  out_for_delivery: "bg-brand-100 text-brand-dark",
  delivered: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const NEXT_STATUS: Partial<Record<DeliveryStatus, DeliveryStatus[]>> = {
  assigned: ["picked_up", "failed"],
  picked_up: ["out_for_delivery", "failed"],
  out_for_delivery: ["delivered", "failed"],
};

const initialState: DeliveryFormState = { error: null };

export function DeliveryCard({ delivery }: { delivery: DeliveryWithOrder }) {
  const [assignState, assignFormAction, assignPending] = useActionState(assignDriverAction, initialState);
  const [statusState, statusFormAction, statusPending] = useActionState(updateDeliveryStatusAction, initialState);

  const nextOptions = NEXT_STATUS[delivery.status] ?? [];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-stone-900">{delivery.order_number}</p>
          <p className="text-sm text-stone-500">{delivery.customer_name} · {delivery.customer_phone}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[delivery.status]}`}>
          {STATUS_LABEL[delivery.status]}
        </span>
      </div>

      {delivery.address_text ? <p className="mt-2 text-sm text-stone-700">{delivery.address_text}</p> : null}
      {delivery.instructions ? <p className="text-sm text-stone-500">{delivery.instructions}</p> : null}
      <p className="mt-1 text-xs text-stone-400">Delivery fee {formatKes(delivery.delivery_fee)}</p>

      {delivery.driver_name ? (
        <p className="mt-2 text-sm text-stone-700">
          Rider: <span className="font-medium">{delivery.driver_name}</span>
        </p>
      ) : delivery.status === "pending" ? (
        <form action={assignFormAction} className="mt-3 flex gap-2">
          <input type="hidden" name="deliveryId" value={delivery.id} />
          <input
            type="text"
            name="driverName"
            placeholder="Rider name"
            required
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            type="submit"
            disabled={assignPending}
            className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {assignPending ? "..." : "Assign"}
          </button>
        </form>
      ) : null}
      {assignState.error ? <p className="mt-1 text-xs text-red-600">{assignState.error}</p> : null}

      {nextOptions.length > 0 ? (
        <form action={statusFormAction} className="mt-3 flex flex-wrap gap-2">
          <input type="hidden" name="deliveryId" value={delivery.id} />
          <input type="hidden" name="orderId" value={delivery.order_id} />
          {nextOptions.map((option) => (
            <button
              key={option}
              type="submit"
              name="status"
              value={option}
              disabled={statusPending}
              className="rounded-full border border-brand px-3 py-1.5 text-xs font-semibold text-brand-dark transition hover:bg-brand-50 disabled:opacity-50"
            >
              {STATUS_LABEL[option]}
            </button>
          ))}
        </form>
      ) : null}
      {statusState.error ? <p className="mt-1 text-xs text-red-600">{statusState.error}</p> : null}
    </div>
  );
}
