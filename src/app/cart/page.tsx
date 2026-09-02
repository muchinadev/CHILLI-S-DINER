"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { formatKes } from "@/lib/format";
import { SiteHeader } from "@/components/customer/SiteHeader";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-32 pt-6">
        <h1 className="mb-4 text-xl font-bold text-stone-900">Your Cart</h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
            <p>Your cart is empty.</p>
            <Link href="/" className="mt-3 inline-block font-semibold text-orange-600">
              Browse the menu
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3">
                <div className="flex-1">
                  <p className="font-semibold text-stone-900">{item.name}</p>
                  <p className="text-sm text-stone-500">{formatKes(item.unitPrice)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="h-8 w-8 rounded-full border border-stone-300 text-lg font-semibold text-stone-700"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-medium">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={item.quantity >= item.availableQty}
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="h-8 w-8 rounded-full border border-stone-300 text-lg font-semibold text-stone-700 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => removeItem(item.productId)}
                  className="ml-1 text-sm font-medium text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {items.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white p-4">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <div>
              <p className="text-xs text-stone-500">Subtotal</p>
              <p className="text-lg font-bold text-stone-900">{formatKes(subtotal)}</p>
            </div>
            <Link
              href="/checkout"
              className="rounded-full bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
