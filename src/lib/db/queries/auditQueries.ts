import "server-only";

import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────────────────────────
// Using string unions (not pgEnum) for extensibility without migrations.

export type AuditAction =
  | "VERIFY_MEMBER"
  | "REJECT_MEMBER"
  | "ASSIGN_ROLE"
  | "CREATE_CHURCH"
  | "APPROVE_REQUEST"
  | "DECLINE_REQUEST"
  | "ISSUE_BOOK"
  | "RETURN_BOOK"
  | "CREATE_BOOK"
  | "UPDATE_BOOK"
  | "DELETE_BOOK";

export type EntityType = "USER" | "CHURCH" | "BORROWING" | "BOOK";

// ─── Log Audit ───────────────────────────────────────────────────────────────

export async function logAudit(params: {
  actorId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  const [record] = await db
    .insert(auditLog)
    .values({
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata ?? null,
    })
    .returning();

  return record;
}

// ─── Get Audit Trail ─────────────────────────────────────────────────────────

export async function getAuditTrail(filters?: {
  entityType?: EntityType;
  entityId?: string;
  actorId?: string;
  limit?: number;
}) {
  const conditions = [];

  if (filters?.entityType) {
    conditions.push(eq(auditLog.entityType, filters.entityType));
  }
  if (filters?.entityId) {
    conditions.push(eq(auditLog.entityId, filters.entityId));
  }
  if (filters?.actorId) {
    conditions.push(eq(auditLog.actorId, filters.actorId));
  }

  return db
    .select()
    .from(auditLog)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLog.createdAt))
    .limit(filters?.limit ?? 50);
}
