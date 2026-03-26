import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const OTP_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const OTP_MAX_ATTEMPTS = 3;

export const create = mutation({
  args: {
    phone: v.string(),
    hashedCode: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("otpCodes", {
      phone: args.phone,
      hashedCode: args.hashedCode,
      expiresAt: args.expiresAt,
      attempts: 0,
    });
  },
});

export const getLatestValid = query({
  args: { phone: v.string(), now: v.number() },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("otpCodes")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .order("desc")
      .collect();

    // Find the most recent non-expired record
    return records.find((r) => r.expiresAt > args.now) ?? null;
  },
});

export const getLatest = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("otpCodes")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .order("desc")
      .take(1);

    return records[0] ?? null;
  },
});

export const incrementAttempts = mutation({
  args: { id: v.id("otpCodes"), newAttempts: v.number() },
  handler: async (ctx, args) => {
    if (args.newAttempts >= OTP_MAX_ATTEMPTS) {
      await ctx.db.patch(args.id, {
        attempts: args.newAttempts,
        lockedUntil: Date.now() + OTP_LOCKOUT_MS,
      });
    } else {
      await ctx.db.patch(args.id, { attempts: args.newAttempts });
    }
  },
});

export const invalidate = mutation({
  args: { id: v.id("otpCodes"), now: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { expiresAt: args.now });
  },
});
