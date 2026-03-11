import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  verifyOtpDb: vi.fn().mockResolvedValue({ valid: true }),
  checkRateLimit: vi.fn().mockResolvedValue({ locked: false }),
  getUserByPhone: vi.fn().mockResolvedValue(null),
  createUser: vi.fn().mockResolvedValue({
    id: "user-1",
    phone: "+254712345678",
    name: "James",
    role: "member",
    churchId: "church-1",
  }),
  signIn: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next-auth", () => ({ default: vi.fn() }));
vi.mock("next-auth/jwt", () => ({}));

vi.mock("@/lib/db/queries/otpQueries", () => ({
  verifyOtp: mocks.verifyOtpDb,
  checkRateLimit: mocks.checkRateLimit,
}));

vi.mock("@/lib/db/queries/userQueries", () => ({
  getUserByPhone: mocks.getUserByPhone,
  createUser: mocks.createUser,
}));

vi.mock("@/lib/auth/config", () => ({
  signIn: mocks.signIn,
}));

import { verifyOtp } from "./actions";

describe("verifyOtp action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyOtpDb.mockResolvedValue({ valid: true });
    mocks.checkRateLimit.mockResolvedValue({ locked: false });
    mocks.getUserByPhone.mockResolvedValue(null);
    mocks.createUser.mockResolvedValue({
      id: "user-1",
      phone: "+254712345678",
      name: "James",
      role: "member",
      churchId: "church-1",
    });
    mocks.signIn.mockResolvedValue(undefined);
  });

  it("registers new user on successful OTP verification", async () => {
    const result = await verifyOtp({
      phone: "+254712345678",
      code: "123456",
      name: "James",
      churchId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      mode: "register",
    });

    expect(result.success).toBe(true);
    expect(mocks.verifyOtpDb).toHaveBeenCalledWith("+254712345678", "123456");
    expect(mocks.createUser).toHaveBeenCalledWith({
      phone: "+254712345678",
      name: "James",
      churchId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
    expect(mocks.signIn).toHaveBeenCalledWith("credentials", {
      phone: "+254712345678",
      redirect: false,
    });
  });

  it("logs in existing user without creating", async () => {
    mocks.getUserByPhone.mockResolvedValue({
      id: "user-1",
      phone: "+254712345678",
    });

    const result = await verifyOtp({
      phone: "+254712345678",
      code: "123456",
      mode: "login",
    });

    expect(result.success).toBe(true);
    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(mocks.signIn).toHaveBeenCalled();
  });

  it("returns error for invalid OTP", async () => {
    mocks.verifyOtpDb.mockResolvedValue({
      valid: false,
      reason: "Invalid OTP",
    });

    const result = await verifyOtp({
      phone: "+254712345678",
      code: "000000",
      mode: "login",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe("Invalid OTP");
    }
  });

  it("returns RATE_LIMITED error when phone is locked (pre-check)", async () => {
    mocks.checkRateLimit.mockResolvedValue({
      locked: true,
      reason: "Too many attempts. Please wait 15 minutes.",
    });

    const result = await verifyOtp({
      phone: "+254712345678",
      code: "000000",
      mode: "login",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("RATE_LIMITED");
    }
    // Should not even attempt OTP verification
    expect(mocks.verifyOtpDb).not.toHaveBeenCalled();
  });

  it("returns error when registration missing name/church (before OTP check)", async () => {
    const result = await verifyOtp({
      phone: "+254712345678",
      code: "123456",
      mode: "register",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Name and church are required");
    }
    // Should not consume OTP
    expect(mocks.verifyOtpDb).not.toHaveBeenCalled();
  });

  it("does not create duplicate user on registration", async () => {
    mocks.getUserByPhone.mockResolvedValue({
      id: "user-1",
      phone: "+254712345678",
    });

    const result = await verifyOtp({
      phone: "+254712345678",
      code: "123456",
      name: "James",
      churchId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      mode: "register",
    });

    expect(result.success).toBe(true);
    expect(mocks.createUser).not.toHaveBeenCalled();
  });
});
