import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import { checkLoginRateLimit, resetLoginRateLimit } from "./rateLimit";

describe("checkLoginRateLimit", () => {
  beforeEach(() => {
    // Reset by using a unique key per test
  });

  it("allows first attempt", () => {
    const key = `test-${Date.now()}-1`;
    const result = checkLoginRateLimit(key);
    expect(result.allowed).toBe(true);
  });

  it("allows up to 5 attempts", () => {
    const key = `test-${Date.now()}-2`;
    for (let i = 0; i < 5; i++) {
      const result = checkLoginRateLimit(key);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks on 6th attempt", () => {
    const key = `test-${Date.now()}-3`;
    for (let i = 0; i < 5; i++) {
      checkLoginRateLimit(key);
    }
    const result = checkLoginRateLimit(key);
    expect(result.allowed).toBe(false);
    expect(result.message).toContain("Too many");
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("includes retry time in error message", () => {
    const key = `test-${Date.now()}-4`;
    for (let i = 0; i < 6; i++) {
      checkLoginRateLimit(key);
    }
    const result = checkLoginRateLimit(key);
    expect(result.allowed).toBe(false);
    expect(result.message).toContain("minute");
  });

  it("stays blocked on subsequent attempts after lockout", () => {
    const key = `test-${Date.now()}-5`;
    for (let i = 0; i < 6; i++) {
      checkLoginRateLimit(key);
    }
    // Try again while locked
    const result = checkLoginRateLimit(key);
    expect(result.allowed).toBe(false);
  });
});

describe("resetLoginRateLimit", () => {
  it("allows login after reset", () => {
    const key = `test-${Date.now()}-6`;
    // Exhaust attempts
    for (let i = 0; i < 6; i++) {
      checkLoginRateLimit(key);
    }
    expect(checkLoginRateLimit(key).allowed).toBe(false);

    // Reset
    resetLoginRateLimit(key);

    // Should be allowed again
    const result = checkLoginRateLimit(key);
    expect(result.allowed).toBe(true);
  });
});
