"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-[var(--background)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-stone-900">
          🌶️ Chilli&apos;s Diner
        </Link>
        <Link
          href="/cart"
          className="relative flex items-center gap-1 rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          Cart
          {itemCount > 0 ? (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-orange-700">
              {itemCount}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
