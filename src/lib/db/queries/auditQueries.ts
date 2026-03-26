import "server-only";

import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  const client = getConvexClient();
  return await client.mutation(api.audit.log, {
    actorId: params.actorId as any, // Convex ID
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    metadata: params.metadata ?? undefined,
  });
}

// ─── Get Audit Trail ─────────────────────────────────────────────────────────

export async function getAuditTrail(filters?: {
  entityType?: EntityType;
  entityId?: string;
  actorId?: string;
  limit?: number;
}) {
  const client = getConvexClient();
  return await client.query(api.audit.getTrail, {
    entityType: filters?.entityType,
    entityId: filters?.entityId,
    actorId: filters?.actorId as any,
    limit: filters?.limit,
  });
}
