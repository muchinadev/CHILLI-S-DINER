"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { formatKes } from "@/lib/format";
import { checkoutAction, type CheckoutState } from "@/lib/services/order-service";

const initialState: CheckoutState = { error: null };
const DELIVERY_FEE = 150;

export function CheckoutForm() {
  const { items, subtotal } = useCart();
  const [state, formAction, pending] = useActionState(checkoutAction, initialState);
  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup">("delivery");

  const deliveryFee = fulfillmentType === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
        <p>Your cart is empty.</p>
        <Link href="/" className="mt-3 inline-block font-semibold text-brand">
          Browse the menu
        </Link>
      </div>
    );
  }

  const cartPayload = JSON.stringify(
    items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="cart" value={cartPayload} />

      <section className="rounded-2xl border border-stone-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-stone-900">Your order</h2>
        <ul className="space-y-1 text-sm text-stone-600">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span>{formatKes(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-stone-100 pt-3 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>{formatKes(subtotal)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Delivery fee</span>
            <span>{deliveryFee > 0 ? formatKes(deliveryFee) : "Free"}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-stone-900">
            <span>Total</span>
            <span>{formatKes(total)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-stone-900">Your details</h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-stone-700">
              Phone number (M-Pesa)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0712345678"
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-stone-900">Delivery</h2>
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setFulfillmentType("delivery")}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-semibold ${
              fulfillmentType === "delivery"
                ? "border-brand bg-brand-50 text-brand-dark"
                : "border-stone-300 text-stone-600"
            }`}
          >
            Delivery
          </button>
          <button
            type="button"
            onClick={() => setFulfillmentType("pickup")}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-semibold ${
              fulfillmentType === "pickup"
                ? "border-brand bg-brand-50 text-brand-dark"
                : "border-stone-300 text-stone-600"
            }`}
          >
            Pickup
          </button>
        </div>
        <input type="hidden" name="fulfillmentType" value={fulfillmentType} />

        {fulfillmentType === "delivery" ? (
          <div className="space-y-3">
            <div>
              <label htmlFor="addressText" className="block text-sm font-medium text-stone-700">
                Delivery address
              </label>
              <input
                id="addressText"
                name="addressText"
                required
                placeholder="e.g. Kilimani, Argwings Kodhek Rd, Apt 4B"
                className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-stone-700">
                Delivery instructions (optional)
              </label>
              <input
                id="instructions"
                name="instructions"
                placeholder="e.g. Gate code, landmark"
                className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-500">Pick up your order from our kitchen once it&apos;s ready.</p>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-4">
        <label htmlFor="notes" className="block text-sm font-medium text-stone-700">
          Order notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="e.g. No spicy, extra sauce"
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </section>

      {state.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand px-6 py-4 text-base font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Placing order..." : `Pay with M-Pesa · ${formatKes(total)}`}
      </button>
    </form>
  );
}
