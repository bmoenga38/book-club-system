import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const log = mutation({
  args: {
    actorId: v.id("users"),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLog", {
      actorId: args.actorId,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      metadata: args.metadata,
    });
  },
});

export const getTrail = query({
  args: {
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    actorId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    let q;
    if (args.entityType && args.entityId) {
      q = ctx.db
        .query("auditLog")
        .withIndex("by_entity", (idx) =>
          idx.eq("entityType", args.entityType!).eq("entityId", args.entityId!)
        );
    } else if (args.actorId) {
      q = ctx.db
        .query("auditLog")
        .withIndex("by_actor", (idx) => idx.eq("actorId", args.actorId!));
    } else {
      q = ctx.db.query("auditLog");
    }

    return await q.order("desc").take(limit);
  },
});
