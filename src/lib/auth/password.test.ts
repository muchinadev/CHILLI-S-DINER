import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the correct password", () => {
    const hash = hashPassword("ChilliAdmin123!");
    expect(verifyPassword("ChilliAdmin123!", hash)).toBe(true);
  });

  it("rejects an incorrect password", () => {
    const hash = hashPassword("ChilliAdmin123!");
    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("produces a different hash each time (random salt)", () => {
    const a = hashPassword("same-password");
    const b = hashPassword("same-password");
    expect(a).not.toBe(b);
    expect(verifyPassword("same-password", a)).toBe(true);
    expect(verifyPassword("same-password", b)).toBe(true);
  });

  it("rejects a malformed stored hash instead of throwing", () => {
    expect(verifyPassword("anything", "not-a-valid-hash")).toBe(false);
  });
});
