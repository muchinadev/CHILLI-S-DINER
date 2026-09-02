import { describe, expect, it } from "vitest";
import { checkoutSchema } from "./checkout";

const baseInput = {
  cart: [{ productId: "11111111-1111-4111-8111-111111111111", quantity: 1 }],
  name: "Wanjiru Kamau",
  phone: "0712345678",
  fulfillmentType: "delivery" as const,
  addressText: "Kilimani, Nairobi",
};

describe("checkoutSchema", () => {
  it("accepts a valid delivery order", () => {
    expect(checkoutSchema.safeParse(baseInput).success).toBe(true);
  });

  it("accepts a valid pickup order without an address", () => {
    const result = checkoutSchema.safeParse({ ...baseInput, fulfillmentType: "pickup", addressText: undefined });
    expect(result.success).toBe(true);
  });

  it("rejects an empty cart", () => {
    const result = checkoutSchema.safeParse({ ...baseInput, cart: [] });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid Kenyan phone number", () => {
    const result = checkoutSchema.safeParse({ ...baseInput, phone: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects a delivery order with no address", () => {
    const result = checkoutSchema.safeParse({ ...baseInput, addressText: undefined });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer or zero quantity", () => {
    const result = checkoutSchema.safeParse({
      ...baseInput,
      cart: [{ productId: baseInput.cart[0].productId, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });
});
