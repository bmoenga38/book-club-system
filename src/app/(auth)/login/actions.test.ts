import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn().mockResolvedValue({ locked: false }),
  createOtp: vi.fn().mockResolvedValue("123456"),
  getUserByPhone: vi.fn().mockResolvedValue(null),
  sendOtpSms: vi.fn().mockResolvedValue({ success: true, data: { messageId: "msg-1" } }),
  signIn: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next-auth", () => ({ default: vi.fn() }));
vi.mock("next-auth/jwt", () => ({}));

vi.mock("@/lib/db/queries/otpQueries", () => ({
  checkRateLimit: mocks.checkRateLimit,
  createOtp: mocks.createOtp,
}));

vi.mock("@/lib/db/queries/userQueries", () => ({
  getUserByPhone: mocks.getUserByPhone,
}));

vi.mock("@/lib/sms/service", () => ({
  sendOtp: mocks.sendOtpSms,
}));

vi.mock("@/lib/auth/config", () => ({
  signIn: mocks.signIn,
}));

import { sendOtp, quickLogin } from "./actions";

describe("sendOtp action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkRateLimit.mockResolvedValue({ locked: false });
    mocks.createOtp.mockResolvedValue("123456");
    mocks.getUserByPhone.mockResolvedValue(null);
    mocks.sendOtpSms.mockResolvedValue({ success: true, data: { messageId: "msg-1" } });
  });

  it("sends OTP for new user (register mode)", async () => {
    const result = await sendOtp({ phone: "+254712345678" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isExistingUser).toBe(false);
    }
    expect(mocks.createOtp).toHaveBeenCalledWith("+254712345678");
    expect(mocks.sendOtpSms).toHaveBeenCalledWith("+254712345678", "123456");
  });

  it("sends OTP for existing user (login mode)", async () => {
    mocks.getUserByPhone.mockResolvedValue({
      id: "user-1",
      phone: "+254712345678",
      name: "James",
    });

    const result = await sendOtp({ phone: "+254712345678" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isExistingUser).toBe(true);
    }
  });

  it("rejects when rate limited", async () => {
    mocks.checkRateLimit.mockResolvedValue({
      locked: true,
      reason: "Too many attempts. Please wait 15 minutes.",
    });

    const result = await sendOtp({ phone: "+254712345678" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("RATE_LIMITED");
    }
  });

  it("returns error when SMS fails", async () => {
    mocks.sendOtpSms.mockResolvedValue({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "SMS failed" },
    });

    const result = await sendOtp({ phone: "+254712345678" });

    expect(result.success).toBe(false);
  });

  it("returns validation error for invalid phone", async () => {
    const result = await sendOtp({ phone: "invalid" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });
});

describe("quickLogin action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signIn.mockResolvedValue(undefined);
  });

  it("logs in existing user without OTP", async () => {
    mocks.getUserByPhone.mockResolvedValue({
      _id: "user-1",
      phone: "+254712345678",
      name: "James",
      role: "member",
      status: "active",
    });

    const result = await quickLogin({ phone: "+254712345678" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.redirectTo).toBe("/");
    }
    expect(mocks.signIn).toHaveBeenCalledWith("credentials", {
      phone: "+254712345678",
      redirect: false,
    });
  });

  it("rejects non-existent user", async () => {
    mocks.getUserByPhone.mockResolvedValue(null);

    const result = await quickLogin({ phone: "+254712345678" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("NOT_FOUND");
      expect(result.error.message).toContain("No account found");
    }
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("returns validation error for invalid phone", async () => {
    const result = await quickLogin({ phone: "bad" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("returns error when signIn fails", async () => {
    mocks.getUserByPhone.mockResolvedValue({
      _id: "user-1",
      phone: "+254712345678",
      name: "James",
    });
    mocks.signIn.mockRejectedValue(new Error("Auth failed"));

    const result = await quickLogin({ phone: "+254712345678" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("UNAUTHORIZED");
    }
  });
});
