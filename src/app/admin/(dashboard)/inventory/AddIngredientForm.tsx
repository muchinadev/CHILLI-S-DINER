"use client";

import { useActionState, useState } from "react";
import { createInventoryItemAction, type InventoryFormState } from "@/lib/services/admin-inventory-service";

const initialState: InventoryFormState = { error: null };

export function AddIngredientForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createInventoryItemAction, initialState);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-stone-300 bg-white p-4 text-sm font-semibold text-brand"
      >
        + Add a new ingredient
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-semibold text-stone-900">New ingredient</h2>

      <div>
        <label htmlFor="ing-name" className="block text-sm font-medium text-stone-700">
          Name
        </label>
        <input
          id="ing-name"
          name="name"
          required
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-stone-700">
            Unit
          </label>
          <input
            id="unit"
            name="unit"
            placeholder="kg, litre, piece"
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="quantityAvailable" className="block text-sm font-medium text-stone-700">
            Starting stock
          </label>
          <input
            id="quantityAvailable"
            name="quantityAvailable"
            type="number"
            min="0"
            step="0.1"
            required
            defaultValue={0}
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="reorderLevel" className="block text-sm font-medium text-stone-700">
            Reorder level
          </label>
          <input
            id="reorderLevel"
            name="reorderLevel"
            type="number"
            min="0"
            step="0.1"
            required
            defaultValue={0}
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="costPerUnit" className="block text-sm font-medium text-stone-700">
            Cost per unit (KSh)
          </label>
          <input
            id="costPerUnit"
            name="costPerUnit"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={0}
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <div>
        <label htmlFor="supplier" className="block text-sm font-medium text-stone-700">
          Supplier (optional)
        </label>
        <input
          id="supplier"
          name="supplier"
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-full border border-stone-300 px-6 py-3 font-semibold text-stone-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Saving..." : "Add ingredient"}
        </button>
      </div>
    </form>
  );
}
