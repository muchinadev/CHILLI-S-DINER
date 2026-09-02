"use client";

import { useTransition } from "react";
import { toggleProductActiveAction } from "@/lib/services/admin-menu-service";

export function ToggleActiveButton({ productId, isActive }: { productId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleProductActiveAction(productId, !isActive))}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
        isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
      }`}
    >
      {isActive ? "Active" : "Sold out"}
    </button>
  );
}
