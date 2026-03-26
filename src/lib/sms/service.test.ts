import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const originalEnv = { ...process.env };

vi.mock("next-auth", () => ({ default: vi.fn() }));
vi.mock("next-auth/jwt", () => ({}));

import { sendOtp, sendSms } from "./service";

describe("sendSms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    process.env.SMSLEOPARD_ACCESS_TOKEN = "dGVzdC1rZXk6dGVzdC1zZWNyZXQ=";
    process.env.SMSLEOPARD_SENDER_ID = "SMS_Leopard";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("sends SMS successfully", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "msg-123" }),
    });

    const result = await sendSms("+254712345678", "Test message");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.messageId).toBe("msg-123");
    }
    expect(fetch).toHaveBeenCalledWith(
      "https://api.smsleopard.com/v1/sms/send",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Basic dGVzdC1rZXk6dGVzdC1zZWNyZXQ=",
        }),
      })
    );
  });

  it("returns failure on non-ok response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await sendSms("+254712345678", "Test message");

    expect(result.success).toBe(false);
  });

  it("returns failure on network error", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network error")
    );

    const result = await sendSms("+254712345678", "Test message");

    expect(result.success).toBe(false);
  });

  it("returns failure when env vars are missing", async () => {
    delete process.env.SMSLEOPARD_ACCESS_TOKEN;

    const result = await sendSms("+254712345678", "Test message");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("not configured");
    }
  });
});

describe("sendOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    process.env.SMSLEOPARD_ACCESS_TOKEN = "dGVzdC1rZXk6dGVzdC1zZWNyZXQ=";
    process.env.SMSLEOPARD_SENDER_ID = "SMS_Leopard";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("sends OTP with correct message template", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "msg-456" }),
    });

    const result = await sendOtp("+254712345678", "123456");

    expect(result.success).toBe(true);

    const fetchCall = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.message).toBe(
      "Your Book Club code is 123456. Expires in 5 minutes."
    );
    expect(body.message.length).toBeLessThan(160);
  });
});
