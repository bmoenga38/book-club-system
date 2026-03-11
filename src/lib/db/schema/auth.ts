import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { churches } from "./system";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "member",
  "assistant_librarian",
  "church_admin",
  "super_admin",
]);

export const userStatusEnum = pgEnum("user_status", [
  "pending_verification",
  "active",
  "suspended",
]);

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    phone: varchar("phone", { length: 15 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    role: userRoleEnum("role").default("member").notNull(),
    status: userStatusEnum("status").default("pending_verification").notNull(),
    churchId: uuid("church_id")
      .references(() => churches.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_users_church_id").on(table.churchId)]
);

// ─── OTP Codes ───────────────────────────────────────────────────────────────

export const otpCodes = pgTable(
  "otp_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    phone: varchar("phone", { length: 15 }).notNull(),
    hashedCode: varchar("hashed_code", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attempts: integer("attempts").default(0).notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_otp_codes_phone").on(table.phone)]
);
