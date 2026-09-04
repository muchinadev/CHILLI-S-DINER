"use client";

import { useActionState, useState } from "react";
import { createPromotionAction, type PromotionFormState } from "@/lib/services/admin-promotion-service";

const initialState: PromotionFormState = { error: null };

export function PromotionForm() {
  const [state, formAction, pending] = useActionState(createPromotionAction, initialState);
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");

  return (
    <form action={formAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-semibold text-stone-900">New promo code</h2>

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-stone-700">
          Code
        </label>
        <input
          id="code"
          name="code"
          placeholder="e.g. WELCOME10"
          required
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base uppercase focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="discountType" className="block text-sm font-medium text-stone-700">
            Discount type
          </label>
          <select
            id="discountType"
            name="discountType"
            value={discountType}
            onChange={(event) => setDiscountType(event.target.value as "percent" | "fixed")}
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="percent">Percent off</option>
            <option value="fixed">KSh off</option>
          </select>
        </div>
        <div>
          <label htmlFor="discountValue" className="block text-sm font-medium text-stone-700">
            {discountType === "percent" ? "Percent" : "Amount (KSh)"}
          </label>
          <input
            id="discountValue"
            name="discountValue"
            type="number"
            min="0"
            step={discountType === "percent" ? "1" : "1"}
            max={discountType === "percent" ? 100 : undefined}
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="maxUses" className="block text-sm font-medium text-stone-700">
            Max uses (optional)
          </label>
          <input
            id="maxUses"
            name="maxUses"
            type="number"
            min="1"
            step="1"
            placeholder="Unlimited"
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="expiresAt" className="block text-sm font-medium text-stone-700">
            Expires (optional)
          </label>
          <input
            id="expiresAt"
            name="expiresAt"
            type="date"
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-stone-700">
          Description (optional)
        </label>
        <input
          id="description"
          name="description"
          placeholder="e.g. New customer welcome offer"
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
        {pending ? "Saving..." : "Create code"}
      </button>
    </form>
  );
}
