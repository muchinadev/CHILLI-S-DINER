"use client";

import { useActionState } from "react";
import {
  confirmCashPaymentAction,
  type ConfirmCashPaymentState,
} from "@/lib/services/admin-payment-service";
import { formatKes } from "@/lib/format";

const initialState: ConfirmCashPaymentState = { error: null, success: false };

export function RecordCashPaymentForm({ orderId, total }: { orderId: string; total: number }) {
  const [state, formAction, pending] = useActionState(confirmCashPaymentAction, initialState);

  return (
    <form action={formAction} className="mt-3 space-y-2 border-t border-stone-100 pt-3">
      <input type="hidden" name="orderId" value={orderId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Recording…" : `Record cash payment of ${formatKes(total)}`}
      </button>
      <p className="text-xs text-stone-400">Use this once you've physically collected cash for this order.</p>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}
