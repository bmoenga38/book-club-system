import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Churches ──────────────────────────────────────────────────────────────
  churches: defineTable({
    name: v.string(),
    code: v.optional(v.string()),
    address: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    defaultLoanDays: v.optional(v.number()),
    maxBooksNew: v.optional(v.number()),
    maxBooksEstablished: v.optional(v.number()),
    trustThreshold: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  }).index("by_code", ["code"]),

  // ─── Users ─────────────────────────────────────────────────────────────────
  users: defineTable({
    phone: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    role: v.union(
      v.literal("member"),
      v.literal("assistant_librarian"),
      v.literal("church_admin"),
      v.literal("super_admin")
    ),
    status: v.union(
      v.literal("pending_verification"),
      v.literal("active"),
      v.literal("suspended")
    ),
    churchId: v.id("churches"),
    trustStatus: v.optional(
      v.union(v.literal("new"), v.literal("established"))
    ),
    consecutiveOnTime: v.optional(v.number()),
    isSuspended: v.optional(v.boolean()),
    isHighRisk: v.optional(v.boolean()),
    xpBalance: v.optional(v.number()),
    level: v.optional(v.string()),
  })
    .index("by_phone", ["phone"])
    .index("by_church", ["churchId"]),

  // ─── OTP Codes ─────────────────────────────────────────────────────────────
  otpCodes: defineTable({
    phone: v.string(),
    hashedCode: v.string(),
    expiresAt: v.number(),
    attempts: v.number(),
    lockedUntil: v.optional(v.number()),
  }).index("by_phone", ["phone"]),

  // ─── Audit Log ─────────────────────────────────────────────────────────────
  auditLog: defineTable({
    actorId: v.id("users"),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_actor", ["actorId"])
    .index("by_entity", ["entityType", "entityId"]),

  // ─── Books (Epic 2 — Catalog) ─────────────────────────────────────────────
  books: defineTable({
    title: v.string(),
    author: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    isbn: v.optional(v.string()),
    publisher: v.optional(v.string()),
    publishedYear: v.optional(v.number()),
    pageCount: v.optional(v.number()),
    language: v.optional(v.string()),
    totalCopies: v.number(),
    availableCopies: v.number(),
    churchId: v.id("churches"),
  })
    .index("by_church", ["churchId"])
    .index("by_category", ["category"]),

  // ─── Borrowings (Epic 3) ──────────────────────────────────────────────────
  borrowings: defineTable({
    bookId: v.id("books"),
    memberId: v.id("users"),
    churchId: v.id("churches"),
    status: v.union(
      v.literal("requested"),
      v.literal("approved"),
      v.literal("issued"),
      v.literal("returned"),
      v.literal("declined"),
      v.literal("overdue")
    ),
    requestedAt: v.number(),
    approvedAt: v.optional(v.number()),
    issuedAt: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    returnedAt: v.optional(v.number()),
    declineNote: v.optional(v.string()),
  })
    .index("by_member", ["memberId"])
    .index("by_book", ["bookId"])
    .index("by_church_status", ["churchId", "status"]),

  // ─── XP Events (Epic 5 — Gamification) ────────────────────────────────────
  xpEvents: defineTable({
    userId: v.id("users"),
    action: v.string(),
    points: v.number(),
    borrowingId: v.optional(v.id("borrowings")),
  }).index("by_user", ["userId"]),

  // ─── SMS Log (Epic 4 — Notifications) ────────────────────────────────────
  smsLog: defineTable({
    phone: v.string(),
    message: v.string(),
    type: v.string(), // "otp", "reminder", "overdue", "suspension", "high_risk", "approval", "decline"
    status: v.union(v.literal("sent"), v.literal("failed"), v.literal("pending")),
    borrowingId: v.optional(v.id("borrowings")),
    churchId: v.optional(v.id("churches")),
    sentAt: v.number(),
    error: v.optional(v.string()),
  })
    .index("by_church", ["churchId"])
    .index("by_borrowing", ["borrowingId"]),

  // ─── Penalty Escalation Tracking (Epic 4) ────────────────────────────────
  penaltyEscalations: defineTable({
    borrowingId: v.id("borrowings"),
    memberId: v.id("users"),
    churchId: v.id("churches"),
    stage: v.union(
      v.literal("reminder_3day"),   // Day -3: friendly reminder
      v.literal("overdue_1day"),    // Day 1: gentle reminder
      v.literal("overdue_7day"),    // Day 7: warning + suspend
      v.literal("overdue_14day")    // Day 14: high risk flag
    ),
    sentAt: v.number(),
  })
    .index("by_borrowing", ["borrowingId"])
    .index("by_member", ["memberId"]),
});
