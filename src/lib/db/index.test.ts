import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const mockNeon = vi.fn().mockReturnValue(() => Promise.resolve([]));
  const mockDb = { query: { users: {} }, select: vi.fn(), insert: vi.fn() };
  const mockDrizzle = vi.fn().mockReturnValue(mockDb);
  return { mockNeon, mockDb, mockDrizzle };
});

vi.mock("@neondatabase/serverless", () => ({
  neon: mocks.mockNeon,
}));

vi.mock("drizzle-orm/neon-http", () => ({
  drizzle: mocks.mockDrizzle,
}));

describe("db/index", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = "postgresql://test:test@localhost/testdb";
  });

  it("exports db proxy that lazily initializes on first access", async () => {
    vi.resetModules();
    const mod = await import("./index");

    // Before accessing any property, neon should NOT have been called
    expect(mocks.mockNeon).not.toHaveBeenCalled();

    // Access a property to trigger lazy init
    void mod.db.query;

    expect(mocks.mockNeon).toHaveBeenCalledWith("postgresql://test:test@localhost/testdb");
    expect(mocks.mockDrizzle).toHaveBeenCalledWith(
      expect.objectContaining({
        client: expect.any(Function),
        schema: expect.any(Object),
      })
    );
  });

  it("getDb() creates connection on first call and reuses on subsequent calls", async () => {
    vi.resetModules();
    const mod = await import("./index");

    const db1 = mod.getDb();
    const db2 = mod.getDb();

    // neon should only be called once (singleton)
    expect(mocks.mockNeon).toHaveBeenCalledTimes(1);
    expect(db1).toBe(db2);
  });

  it("exports db object", async () => {
    vi.resetModules();
    const mod = await import("./index");
    expect(mod.db).toBeDefined();
  });
});
