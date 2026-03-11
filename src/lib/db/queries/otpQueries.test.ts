import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const mockReturning = vi.fn().mockResolvedValue([{ id: "otp-1" }]);
  const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

  const mockLimit = vi.fn().mockResolvedValue([]);
  const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
  const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
  const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

  const mockUpdateSet = vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue(undefined),
  });
  const mockUpdate = vi.fn().mockReturnValue({ set: mockUpdateSet });

  return {
    mockReturning,
    mockValues,
    mockInsert,
    mockLimit,
    mockOrderBy,
    mockWhere,
    mockFrom,
    mockSelect,
    mockUpdate,
    mockUpdateSet,
  };
});

vi.mock("next-auth", () => ({ default: vi.fn() }));
vi.mock("next-auth/jwt", () => ({}));

vi.mock("@/lib/db", () => ({
  db: {
    insert: mocks.mockInsert,
    select: mocks.mockSelect,
    update: mocks.mockUpdate,
  },
}));

vi.mock("@/lib/db/schema", () => ({
  otpCodes: {
    phone: Symbol("otp_codes.phone"),
    expiresAt: Symbol("otp_codes.expires_at"),
    createdAt: Symbol("otp_codes.created_at"),
    id: Symbol("otp_codes.id"),
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val, op: "eq" })),
  and: vi.fn((...conditions) => ({ conditions, op: "and" })),
  desc: vi.fn((col) => ({ col, dir: "desc" })),
  gt: vi.fn((col, val) => ({ col, val, op: "gt" })),
}));

vi.mock("bcryptjs", () => ({
  hash: vi.fn().mockResolvedValue("$2a$10$hashedcode"),
  compare: vi.fn(),
}));

import { createOtp, verifyOtp, checkRateLimit } from "./otpQueries";
import { compare } from "bcryptjs";

describe("createOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a 6-digit OTP and inserts hashed version", async () => {
    const code = await createOtp("+254712345678");

    expect(code).toMatch(/^\d{6}$/);
    expect(mocks.mockInsert).toHaveBeenCalled();
    expect(mocks.mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: "+254712345678",
        hashedCode: "$2a$10$hashedcode",
        attempts: 0,
      })
    );
  });

  it("sets expiry to 5 minutes from now", async () => {
    const before = Date.now();
    await createOtp("+254712345678");
    const after = Date.now();

    const call = mocks.mockValues.mock.calls[0][0];
    const expiresAt = call.expiresAt.getTime();
    const fiveMinMs = 5 * 60 * 1000;

    expect(expiresAt).toBeGreaterThanOrEqual(before + fiveMinMs);
    expect(expiresAt).toBeLessThanOrEqual(after + fiveMinMs);
  });
});

describe("verifyOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns invalid when no OTP record found", async () => {
    mocks.mockLimit.mockResolvedValueOnce([]);

    const result = await verifyOtp("+254712345678", "123456");

    expect(result.valid).toBe(false);
    expect(result.reason).toContain("expired");
  });

  it("returns invalid when phone is locked", async () => {
    mocks.mockLimit.mockResolvedValueOnce([
      {
        id: "otp-1",
        phone: "+254712345678",
        hashedCode: "$2a$10$hash",
        expiresAt: new Date(Date.now() + 300000),
        attempts: 3,
        lockedUntil: new Date(Date.now() + 900000),
        createdAt: new Date(),
      },
    ]);

    const result = await verifyOtp("+254712345678", "123456");

    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Too many attempts");
  });

  it("returns valid when OTP matches", async () => {
    mocks.mockLimit.mockResolvedValueOnce([
      {
        id: "otp-1",
        phone: "+254712345678",
        hashedCode: "$2a$10$hash",
        expiresAt: new Date(Date.now() + 300000),
        attempts: 0,
        lockedUntil: null,
        createdAt: new Date(),
      },
    ]);

    (compare as ReturnType<typeof vi.fn>).mockResolvedValueOnce(true);

    const result = await verifyOtp("+254712345678", "123456");

    expect(result.valid).toBe(true);
  });

  it("increments attempts on wrong code", async () => {
    mocks.mockLimit.mockResolvedValueOnce([
      {
        id: "otp-1",
        phone: "+254712345678",
        hashedCode: "$2a$10$hash",
        expiresAt: new Date(Date.now() + 300000),
        attempts: 0,
        lockedUntil: null,
        createdAt: new Date(),
      },
    ]);

    (compare as ReturnType<typeof vi.fn>).mockResolvedValueOnce(false);

    const result = await verifyOtp("+254712345678", "000000");

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Invalid OTP");
    expect(mocks.mockUpdate).toHaveBeenCalled();
  });

  it("locks phone on 3rd failed attempt", async () => {
    mocks.mockLimit.mockResolvedValueOnce([
      {
        id: "otp-1",
        phone: "+254712345678",
        hashedCode: "$2a$10$hash",
        expiresAt: new Date(Date.now() + 300000),
        attempts: 2,
        lockedUntil: null,
        createdAt: new Date(),
      },
    ]);

    (compare as ReturnType<typeof vi.fn>).mockResolvedValueOnce(false);

    const result = await verifyOtp("+254712345678", "000000");

    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Too many attempts");
    expect(mocks.mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        attempts: 3,
        lockedUntil: expect.any(Date),
      })
    );
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns not locked when no records", async () => {
    mocks.mockLimit.mockResolvedValueOnce([]);

    const result = await checkRateLimit("+254712345678");

    expect(result.locked).toBe(false);
  });

  it("returns locked when lockedUntil is in the future", async () => {
    mocks.mockLimit.mockResolvedValueOnce([
      {
        id: "otp-1",
        phone: "+254712345678",
        lockedUntil: new Date(Date.now() + 900000),
        attempts: 3,
        createdAt: new Date(),
      },
    ]);

    const result = await checkRateLimit("+254712345678");

    expect(result.locked).toBe(true);
    expect(result.reason).toContain("Too many attempts");
  });

  it("returns not locked when lockedUntil has passed", async () => {
    mocks.mockLimit.mockResolvedValueOnce([
      {
        id: "otp-1",
        phone: "+254712345678",
        lockedUntil: new Date(Date.now() - 1000),
        attempts: 3,
        createdAt: new Date(),
      },
    ]);

    const result = await checkRateLimit("+254712345678");

    expect(result.locked).toBe(false);
  });
});
