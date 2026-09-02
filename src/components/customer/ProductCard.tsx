"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { formatKes } from "@/lib/format";

export type ProductCardData = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  availableQty: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.availableQty <= 0;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        imageUrl: product.imageUrl,
        availableQty: product.availableQty,
      },
      1,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">🍽️</div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-semibold text-stone-900">{product.name}</h3>
          {product.description ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-stone-500">{product.description}</p>
          ) : null}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold text-stone-900">{formatKes(product.price)}</span>
          {soldOut ? (
            <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-500">
              Sold out
            </span>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold text-white transition ${
                added ? "bg-green-600" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {added ? "Added" : "Add to cart"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
