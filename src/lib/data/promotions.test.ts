import { describe, expect, it } from "vitest";
import { computeDiscount, type Promotion } from "./promotions";

function makePromotion(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: "promo-1",
    business_id: "biz-1",
    code: "TEST10",
    description: null,
    discount_type: "percent",
    discount_value: "10",
    max_uses: null,
    uses_count: 0,
    is_active: true,
    expires_at: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("computeDiscount", () => {
  it("computes a percentage discount off the subtotal", () => {
    const promo = makePromotion({ discount_type: "percent", discount_value: "10" });
    expect(computeDiscount(promo, 1000)).toBe(100);
  });

  it("computes a fixed discount regardless of subtotal", () => {
    const promo = makePromotion({ discount_type: "fixed", discount_value: "150" });
    expect(computeDiscount(promo, 1000)).toBe(150);
  });

  it("never discounts more than the subtotal", () => {
    const promo = makePromotion({ discount_type: "fixed", discount_value: "500" });
    expect(computeDiscount(promo, 300)).toBe(300);
  });

  it("caps a percentage discount at the subtotal too", () => {
    const promo = makePromotion({ discount_type: "percent", discount_value: "100" });
    expect(computeDiscount(promo, 250)).toBe(250);
  });
});
