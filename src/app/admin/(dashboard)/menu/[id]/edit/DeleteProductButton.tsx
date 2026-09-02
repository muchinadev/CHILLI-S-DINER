"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/lib/services/admin-menu-service";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!window.confirm("Delete this meal? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteProductAction(productId);
      router.push("/admin/menu");
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleDelete}
      className="w-full rounded-full border border-red-300 px-6 py-3 text-sm font-semibold text-red-600 disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete meal"}
    </button>
  );
}
