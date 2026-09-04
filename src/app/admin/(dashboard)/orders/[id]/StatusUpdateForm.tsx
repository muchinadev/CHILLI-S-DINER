"use client";

import { useActionState } from "react";
import { updateOrderStatusAction, type UpdateOrderStatusState } from "@/lib/services/admin-order-service";
import { ADMIN_STATUS_LABEL } from "@/lib/orders/status-labels";
import type { OrderStatus } from "@/lib/data/orders";

const initialState: UpdateOrderStatusState = { error: null, success: false };

export function StatusUpdateForm({ orderId, nextOptions }: { orderId: string; nextOptions: OrderStatus[] }) {
  const [state, formAction, pending] = useActionState(updateOrderStatusAction, initialState);

  if (nextOptions.length === 0) return null;

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="orderId" value={orderId} />
      <p className="text-sm font-medium text-stone-700">Update status</p>
      <div className="flex flex-wrap gap-2">
        {nextOptions.map((option) => (
          <button
            key={option}
            type="submit"
            name="status"
            value={option}
            disabled={pending}
            className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand-dark transition hover:bg-brand-50 disabled:opacity-50"
          >
            {ADMIN_STATUS_LABEL[option]}
          </button>
        ))}
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}
