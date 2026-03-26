import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getTotalXp = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return events.reduce((sum, e) => sum + e.points, 0);
  },
});
