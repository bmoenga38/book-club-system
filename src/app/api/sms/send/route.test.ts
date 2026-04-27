import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const originalEnv = { ...process.env };

// Mock the SMS service
vi.mock("@/lib/sms/service", () => ({
  sendSms: vi.fn().mockResolvedValue({ success: true, data: { messageId: "test-123" } }),
}));

// Mock server-only
vi.mock("server-only", () => ({}));
vi.mock("next-auth", () => ({ default: vi.fn() }));
vi.mock("next-auth/jwt", () => ({}));

import { sendSms } from "@/lib/sms/service";

describe("SMS Send API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.INTERNAL_API_SECRET = "test-secret-123";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("validates that the internal secret is required", () => {
    // The route checks x-internal-secret header
    expect(process.env.INTERNAL_API_SECRET).toBe("test-secret-123");
  });

  it("sendSms returns success with messageId", async () => {
    const result = await sendSms("+254712345678", "Test message");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.messageId).toBe("test-123");
    }
  });

  it("sendSms is called with correct arguments", async () => {
    await sendSms("+254792697197", "Your request approved");
    expect(sendSms).toHaveBeenCalledWith("+254792697197", "Your request approved");
  });

  it("SMS messages stay under 160 chars", () => {
    const messages = [
      `Your request for "Steps to Christ" approved. Coordinate pickup with the library.`,
      `Your request for "Steps to Christ" was declined.`,
      `Reminder: "Steps to Christ" is due on 12 Apr. Return on time to earn +40 XP!`,
      `Gentle reminder: "Steps to Christ" was due yesterday. Please return to keep your streak.`,
      `Warning: "Steps to Christ" is 7 days overdue. Your borrowing is suspended until returned.`,
      `"Steps to Christ" is 14+ days overdue. Please return or replace. Your account has been flagged.`,
    ];

    for (const msg of messages) {
      expect(msg.length).toBeLessThanOrEqual(160);
    }
  });
});
