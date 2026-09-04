"use client";

import { useTransition } from "react";
import { togglePromotionActiveAction } from "@/lib/services/admin-promotion-service";

export function ToggleActiveButton({ promotionId, isActive }: { promotionId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => togglePromotionActiveAction(promotionId, !isActive))}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
        isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
      }`}
    >
      {isActive ? "Active" : "Disabled"}
    </button>
  );
}
