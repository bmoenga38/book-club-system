import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const mockReturning = vi.fn().mockResolvedValue([]);
  const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

  const mockLimit = vi.fn().mockResolvedValue([]);
  const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
  const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

  return {
    mockReturning,
    mockValues,
    mockInsert,
    mockLimit,
    mockWhere,
    mockFrom,
    mockSelect,
  };
});

vi.mock("next-auth", () => ({ default: vi.fn() }));
vi.mock("next-auth/jwt", () => ({}));

vi.mock("@/lib/db", () => ({
  db: {
    insert: mocks.mockInsert,
    select: mocks.mockSelect,
  },
}));

vi.mock("@/lib/db/schema", () => ({
  users: {
    phone: Symbol("users.phone"),
    id: Symbol("users.id"),
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val, op: "eq" })),
}));

import { getUserByPhone, createUser } from "./userQueries";

describe("getUserByPhone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user when found", async () => {
    const mockUser = {
      id: "user-1",
      phone: "+254712345678",
      name: "James",
      role: "member",
      churchId: "church-1",
      status: "pending_verification",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mocks.mockLimit.mockResolvedValueOnce([mockUser]);

    const result = await getUserByPhone("+254712345678");

    expect(result).toEqual(mockUser);
    expect(mocks.mockSelect).toHaveBeenCalled();
  });

  it("returns null when user not found", async () => {
    mocks.mockLimit.mockResolvedValueOnce([]);

    const result = await getUserByPhone("+254712345678");

    expect(result).toBeNull();
  });
});

describe("createUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts user with correct defaults", async () => {
    const newUser = {
      id: "user-2",
      phone: "+254712345678",
      name: "James",
      role: "member",
      status: "pending_verification",
      churchId: "church-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mocks.mockReturning.mockResolvedValueOnce([newUser]);

    const result = await createUser({
      phone: "+254712345678",
      name: "James",
      churchId: "church-1",
    });

    expect(result).toEqual(newUser);
    expect(mocks.mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: "+254712345678",
        name: "James",
        churchId: "church-1",
        role: "member",
        status: "pending_verification",
      })
    );
  });
});
