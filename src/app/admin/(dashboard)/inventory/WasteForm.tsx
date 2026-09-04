"use client";

import { useActionState } from "react";
import { recordWasteAction } from "@/lib/services/admin-inventory-service";
import type { InventoryFormState } from "@/lib/services/admin-inventory-service";
import { wasteReasonValues, WASTE_REASON_LABEL } from "@/lib/validation/waste";
import type { InventoryItem } from "@/lib/data/inventory";

const initialState: InventoryFormState = { error: null };

export function WasteForm({ items }: { items: InventoryItem[] }) {
  const [state, formAction, pending] = useActionState(recordWasteAction, initialState);

  if (items.length === 0) return null;

  return (
    <form action={formAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-semibold text-stone-900">Record waste</h2>
      <p className="text-xs text-stone-500">Spoiled, overproduced, or damaged ingredients — removes them from stock.</p>

      <div>
        <label htmlFor="waste-itemId" className="block text-sm font-medium text-stone-700">
          Ingredient
        </label>
        <select
          id="waste-itemId"
          name="itemId"
          required
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.unit})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="waste-quantity" className="block text-sm font-medium text-stone-700">
            Quantity
          </label>
          <input
            id="waste-quantity"
            name="quantity"
            type="number"
            min="0"
            step="0.1"
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-stone-700">
            Reason
          </label>
          <select
            id="reason"
            name="reason"
            defaultValue="spoilage"
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {wasteReasonValues.map((reason) => (
              <option key={reason} value={reason}>
                {WASTE_REASON_LABEL[reason]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-stone-700">
          Note (optional)
        </label>
        <input
          id="note"
          name="note"
          placeholder="e.g. Left out overnight"
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full border border-red-300 px-6 py-3 font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Record waste"}
      </button>
    </form>
  );
}
