"use client";

import { useTransition } from "react";
import { applyRecipeCostAction } from "@/lib/services/admin-recipe-service";

export function ApplyCostButton({ productId, disabled }: { productId: string; disabled: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={() => startTransition(() => applyRecipeCostAction(productId))}
      className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
    >
      {pending ? "Applying..." : "Apply this cost to the meal"}
    </button>
  );
}
