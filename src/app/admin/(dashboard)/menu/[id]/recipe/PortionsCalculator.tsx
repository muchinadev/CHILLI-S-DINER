"use client";

import { useState } from "react";
import { formatKes } from "@/lib/format";

export function PortionsCalculator({
  sellingPrice,
  ingredientCostPerPortion,
}: {
  sellingPrice: number;
  ingredientCostPerPortion: number;
}) {
  const [portions, setPortions] = useState(20);
  const profitPerPortion = sellingPrice - ingredientCostPerPortion;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-1 font-semibold text-stone-900">If I sell...</h2>
      <p className="mb-3 text-xs text-stone-500">A quick estimate — ingredients only, not packaging or delivery.</p>

      <label htmlFor="portions" className="block text-sm font-medium text-stone-700">
        Portions
      </label>
      <input
        id="portions"
        type="number"
        min="0"
        step="1"
        value={portions}
        onChange={(event) => setPortions(Math.max(0, Number(event.target.value) || 0))}
        className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />

      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone-600">Revenue</dt>
          <dd className="font-medium text-stone-900">{formatKes(portions * sellingPrice)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-stone-600">Ingredient cost</dt>
          <dd className="font-medium text-stone-900">{formatKes(portions * ingredientCostPerPortion)}</dd>
        </div>
        <div className="flex justify-between text-base font-bold text-stone-900">
          <dt>Gross profit</dt>
          <dd>{formatKes(portions * profitPerPortion)}</dd>
        </div>
      </dl>
    </div>
  );
}
