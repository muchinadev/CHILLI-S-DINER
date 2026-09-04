"use client";

import { useTransition } from "react";
import { removeRecipeIngredientAction } from "@/lib/services/admin-recipe-service";

export function RemoveIngredientButton({ id, productId }: { id: string; productId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => removeRecipeIngredientAction(id, productId))}
      className="text-xs font-medium text-red-600 disabled:opacity-50"
    >
      {pending ? "..." : "Remove"}
    </button>
  );
}
