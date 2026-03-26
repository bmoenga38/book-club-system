import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedChurch = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("churches", args);
  },
});

export const seedUser = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", args);
  },
});

export const seedBook = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("books", args);
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = ["xpEvents", "borrowings", "books", "auditLog", "otpCodes", "users", "churches"] as const;
    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
  },
});
