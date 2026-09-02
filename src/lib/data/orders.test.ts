import { describe, expect, it } from "vitest";
import { assertValidTransition, getAdminNextStatusOptions, InvalidTransitionError } from "./orders";

describe("order status transitions", () => {
  it("allows the documented happy-path progression", () => {
    expect(() => assertValidTransition("new", "payment_confirmed")).not.toThrow();
    expect(() => assertValidTransition("payment_confirmed", "preparing")).not.toThrow();
    expect(() => assertValidTransition("preparing", "ready")).not.toThrow();
    expect(() => assertValidTransition("ready", "out_for_delivery")).not.toThrow();
    expect(() => assertValidTransition("out_for_delivery", "delivered")).not.toThrow();
  });

  it("rejects skipping backwards from a terminal status", () => {
    expect(() => assertValidTransition("delivered", "preparing")).toThrow(InvalidTransitionError);
    expect(() => assertValidTransition("cancelled", "new")).toThrow(InvalidTransitionError);
  });

  it("rejects jumping straight to delivered from new", () => {
    expect(() => assertValidTransition("new", "delivered")).toThrow(InvalidTransitionError);
  });

  it("allows cancelling from most active states but not once delivered", () => {
    expect(() => assertValidTransition("preparing", "cancelled")).not.toThrow();
    expect(() => assertValidTransition("delivered", "cancelled")).toThrow(InvalidTransitionError);
  });

  it("is a no-op when the status does not change", () => {
    expect(() => assertValidTransition("preparing", "preparing")).not.toThrow();
  });

  it("only offers admin-settable next statuses, never internal ones like payment_confirmed", () => {
    const options = getAdminNextStatusOptions("new");
    expect(options).toContain("preparing");
    expect(options).toContain("cancelled");
    expect(options).not.toContain("payment_confirmed");
    expect(options).not.toContain("payment_pending");
  });

  it("offers no next statuses once an order is delivered, cancelled, or refunded", () => {
    expect(getAdminNextStatusOptions("cancelled")).toEqual([]);
    expect(getAdminNextStatusOptions("refunded")).toEqual([]);
  });
});
