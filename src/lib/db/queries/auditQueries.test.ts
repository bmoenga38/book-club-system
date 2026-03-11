import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoisted mocks — accessible inside vi.mock factories
const mocks = vi.hoisted(() => {
  const mockReturning = vi.fn().mockResolvedValue([
    {
      id: "test-audit-id",
      actorId: "actor-123",
      action: "VERIFY_MEMBER",
      entityType: "USER",
      entityId: "entity-456",
      metadata: null,
      createdAt: new Date(),
    },
  ]);
  const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

  const mockLimit = vi.fn().mockResolvedValue([]);
  const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
  const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
  const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

  // Symbolic column identifiers so tests can verify correct column references
  const COLUMNS = {
    actorId: Symbol("audit_log.actor_id"),
    entityType: Symbol("audit_log.entity_type"),
    entityId: Symbol("audit_log.entity_id"),
    createdAt: Symbol("audit_log.created_at"),
  };

  return {
    mockReturning,
    mockValues,
    mockInsert,
    mockLimit,
    mockOrderBy,
    mockWhere,
    mockFrom,
    mockSelect,
    COLUMNS,
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
  auditLog: mocks.COLUMNS,
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val, op: "eq" })),
  and: vi.fn((...conditions) => ({ conditions, op: "and" })),
  desc: vi.fn((col) => ({ col, dir: "desc" })),
}));

import { logAudit, getAuditTrail } from "./auditQueries";
import type { AuditAction, EntityType } from "./auditQueries";

describe("logAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockReturning.mockResolvedValue([
      {
        id: "test-audit-id",
        actorId: "actor-123",
        action: "VERIFY_MEMBER",
        entityType: "USER",
        entityId: "entity-456",
        metadata: null,
        createdAt: new Date(),
      },
    ]);
  });

  it("inserts an audit record with correct values", async () => {
    const result = await logAudit({
      actorId: "actor-123",
      action: "VERIFY_MEMBER" as AuditAction,
      entityType: "USER" as EntityType,
      entityId: "entity-456",
    });

    expect(mocks.mockInsert).toHaveBeenCalled();
    expect(mocks.mockValues).toHaveBeenCalledWith({
      actorId: "actor-123",
      action: "VERIFY_MEMBER",
      entityType: "USER",
      entityId: "entity-456",
      metadata: null,
    });
    expect(result).toBeDefined();
    expect(result.id).toBe("test-audit-id");
  });

  it("passes metadata when provided", async () => {
    await logAudit({
      actorId: "actor-123",
      action: "ASSIGN_ROLE" as AuditAction,
      entityType: "USER" as EntityType,
      entityId: "entity-789",
      metadata: { previousRole: "member", newRole: "church_admin" },
    });

    expect(mocks.mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { previousRole: "member", newRole: "church_admin" },
      })
    );
  });
});

describe("getAuditTrail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries audit records with default limit of 50", async () => {
    await getAuditTrail();

    expect(mocks.mockSelect).toHaveBeenCalled();
    expect(mocks.mockLimit).toHaveBeenCalledWith(50);
  });

  it("applies entityType filter when provided", async () => {
    await getAuditTrail({ entityType: "USER" as EntityType });

    expect(mocks.mockWhere).toHaveBeenCalled();
  });

  it("applies custom limit when provided", async () => {
    await getAuditTrail({ limit: 10 });

    expect(mocks.mockLimit).toHaveBeenCalledWith(10);
  });

  it("applies actorId filter when provided", async () => {
    await getAuditTrail({ actorId: "actor-123" });

    expect(mocks.mockWhere).toHaveBeenCalled();
  });
});
