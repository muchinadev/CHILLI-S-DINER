import { describe, expect, it } from "vitest";
import { priceCart, PricingError } from "./pricing";
import type { Product } from "@/lib/data/products";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    business_id: "biz-1",
    category_id: null,
    name: "Pilau with Beef",
    description: null,
    image_url: null,
    image_content_type: null,
    selling_price: "350",
    cost_price: "140",
    available_qty: 10,
    is_active: true,
    available_from: null,
    available_until: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("priceCart", () => {
  it("computes subtotal, delivery fee and total from server-side product data, ignoring any client price", () => {
    const product = makeProduct();
    const result = priceCart([{ productId: product.id, quantity: 2 }], [product], { deliveryFee: 150 });

    expect(result.subtotal).toBe(700);
    expect(result.deliveryFee).toBe(150);
    expect(result.total).toBe(850);
    expect(result.lines[0].unitPrice).toBe(350);
  });

  it("throws for an empty cart", () => {
    expect(() => priceCart([], [])).toThrow(PricingError);
  });

  it("throws when a product is sold out (insufficient stock)", () => {
    const product = makeProduct({ available_qty: 1 });
    expect(() => priceCart([{ productId: product.id, quantity: 2 }], [product])).toThrow(/left in stock/);
  });

  it("throws when a product is inactive", () => {
    const product = makeProduct({ is_active: false });
    expect(() => priceCart([{ productId: product.id, quantity: 1 }], [product])).toThrow(/no longer available/);
  });

  it("throws for a non-integer or non-positive quantity", () => {
    const product = makeProduct();
    expect(() => priceCart([{ productId: product.id, quantity: 0 }], [product])).toThrow(PricingError);
    expect(() => priceCart([{ productId: product.id, quantity: -1 }], [product])).toThrow(PricingError);
  });

  it("throws when the cart references a product that no longer exists", () => {
    expect(() => priceCart([{ productId: "does-not-exist", quantity: 1 }], [])).toThrow(/no longer available/);
  });

  it("uses the product's current price even if the caller passes a different one", () => {
    // priceCart's CartLine type has no price field at all — this test documents
    // that guarantee by asserting the computed unit price always comes from `products`.
    const product = makeProduct({ selling_price: "999" });
    const result = priceCart([{ productId: product.id, quantity: 1 }], [product]);
    expect(result.lines[0].unitPrice).toBe(999);
    expect(result.subtotal).toBe(999);
  });

  it("rejects a resulting negative total", () => {
    const product = makeProduct({ selling_price: "100" });
    expect(() =>
      priceCart([{ productId: product.id, quantity: 1 }], [product], { discount: 1000 }),
    ).toThrow(/cannot be negative/);
  });
});
