"use client";

import { useActionState } from "react";
import { recordPurchaseAction, type InventoryFormState } from "@/lib/services/admin-inventory-service";
import type { InventoryItem } from "@/lib/data/inventory";

const initialState: InventoryFormState = { error: null };

export function PurchaseForm({ items }: { items: InventoryItem[] }) {
  const [state, formAction, pending] = useActionState(recordPurchaseAction, initialState);

  if (items.length === 0) return null;

  return (
    <form action={formAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-semibold text-stone-900">Record a purchase</h2>
      <p className="text-xs text-stone-500">This adds to stock and logs the expense automatically.</p>

      <div>
        <label htmlFor="itemId" className="block text-sm font-medium text-stone-700">
          Ingredient
        </label>
        <select
          id="itemId"
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
          <label htmlFor="quantity" className="block text-sm font-medium text-stone-700">
            Quantity bought
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            step="0.1"
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="totalCost" className="block text-sm font-medium text-stone-700">
            Total paid (KSh)
          </label>
          <input
            id="totalCost"
            name="totalCost"
            type="number"
            min="0"
            step="1"
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Record purchase"}
      </button>
    </form>
  );
}
