"use client";

import { useActionState } from "react";
import { addRecipeIngredientAction, type RecipeFormState } from "@/lib/services/admin-recipe-service";
import type { InventoryItem } from "@/lib/data/inventory";

const initialState: RecipeFormState = { error: null };

export function AddIngredientLineForm({ productId, items }: { productId: string; items: InventoryItem[] }) {
  const [state, formAction, pending] = useActionState(addRecipeIngredientAction, initialState);

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-4 text-sm text-stone-500">
        You don&apos;t have any ingredients in Inventory yet. Add some there first, then come back here.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-semibold text-stone-900">Add an ingredient</h2>
      <input type="hidden" name="productId" value={productId} />

      <div>
        <label htmlFor="inventoryItemId" className="block text-sm font-medium text-stone-700">
          Ingredient
        </label>
        <select
          id="inventoryItemId"
          name="inventoryItemId"
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

      <div>
        <label htmlFor="quantityRequired" className="block text-sm font-medium text-stone-700">
          Quantity per portion
        </label>
        <input
          id="quantityRequired"
          name="quantityRequired"
          type="number"
          min="0"
          step="0.01"
          required
          placeholder="e.g. 0.25"
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
        className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Add ingredient"}
      </button>
    </form>
  );
}
