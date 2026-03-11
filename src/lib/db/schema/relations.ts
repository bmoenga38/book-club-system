import { relations } from "drizzle-orm";
import { churches, auditLog } from "./system";
import { users, otpCodes } from "./auth";

// ─── Church Relations ────────────────────────────────────────────────────────

export const churchesRelations = relations(churches, ({ many }) => ({
  users: many(users),
}));

// ─── User Relations ──────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  church: one(churches, {
    fields: [users.churchId],
    references: [churches.id],
  }),
  auditLogs: many(auditLog),
}));

// ─── Audit Log Relations ─────────────────────────────────────────────────────

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actor: one(users, {
    fields: [auditLog.actorId],
    references: [users.id],
  }),
}));

// ─── OTP Codes ───────────────────────────────────────────────────────────────
// No formal relations — otp_codes references phone number, not user FK.
// This allows OTP creation before user record exists (registration flow).

export const otpCodesRelations = relations(otpCodes, () => ({}));
