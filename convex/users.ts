import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();
  },
});

export const create = mutation({
  args: {
    phone: v.string(),
    name: v.string(),
    churchId: v.id("churches"),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("users", {
      phone: args.phone,
      name: args.name,
      churchId: args.churchId,
      role: "member",
      status: "pending_verification",
    });
    return await ctx.db.get(id);
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getProfile = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return null;

    // Calculate total XP from xpEvents + seeded xpBalance
    const xpEvents = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.id))
      .collect();
    const earnedXp = xpEvents.reduce((sum, e) => sum + e.points, 0);
    const totalXp = earnedXp + (user.xpBalance ?? 0);

    // Count borrowings
    const borrowings = await ctx.db
      .query("borrowings")
      .withIndex("by_member", (q) => q.eq("memberId", args.id))
      .collect();
    const activeBorrowings = borrowings.filter(
      (b) => b.status === "issued" || b.status === "approved" || b.status === "overdue"
    ).length;
    const totalBorrowings = borrowings.filter(
      (b) => b.status === "returned" || b.status === "issued" || b.status === "overdue"
    ).length;

    // Calculate consecutive on-time streak
    const consecutiveOnTime = user.consecutiveOnTime ?? 0;
    const trustStatus = user.trustStatus ?? "new";
    const maxBooks = trustStatus === "established" ? 3 : 1;

    // Level calculation
    const level = totalXp >= 1000
      ? "Library Legend"
      : totalXp >= 500
        ? "Library Champion"
        : totalXp >= 250
          ? "Avid Reader"
          : totalXp >= 100
            ? "Consistent Reader"
            : "Newcomer";

    const levelNumber = totalXp >= 1000 ? 5 : totalXp >= 500 ? 4 : totalXp >= 250 ? 3 : totalXp >= 100 ? 2 : 1;

    // Next level threshold
    const nextLevelXp = levelNumber >= 5 ? null : [100, 250, 500, 1000][levelNumber - 1];

    // Get church name
    const church = await ctx.db.get(user.churchId);

    // Badges
    const badges: string[] = [];
    if (totalBorrowings >= 1) badges.push("First Borrow");
    if (totalBorrowings >= 5) badges.push("Bookworm");
    if (totalBorrowings >= 10) badges.push("Avid Reader");
    if (totalBorrowings >= 25) badges.push("Library Regular");
    if (consecutiveOnTime >= 3) badges.push("Trustworthy");
    if (consecutiveOnTime >= 5) badges.push("Streak Master");
    if (consecutiveOnTime >= 10) badges.push("Perfect Record");

    return {
      ...user,
      totalXp,
      activeBorrowings,
      totalBorrowings,
      consecutiveOnTime,
      trustStatus,
      maxBooks,
      level,
      levelNumber,
      nextLevelXp,
      badges,
      churchName: church?.name ?? "Unknown",
    };
  },
});

export const getLeaderboard = query({
  args: { churchId: v.id("churches"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const users = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("churchId"), args.churchId),
          q.eq(q.field("status"), "active")
        )
      )
      .collect();

    // Calculate XP for each user
    const withXp = await Promise.all(
      users.map(async (u) => {
        const xpEvents = await ctx.db
          .query("xpEvents")
          .withIndex("by_user", (q) => q.eq("userId", u._id))
          .collect();
        const earnedXp = xpEvents.reduce((sum, e) => sum + e.points, 0);
        const totalXp = earnedXp + (u.xpBalance ?? 0);
        return { _id: u._id, name: u.name, totalXp, consecutiveOnTime: u.consecutiveOnTime ?? 0 };
      })
    );

    return withXp.sort((a, b) => b.totalXp - a.totalXp).slice(0, limit);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("users"),
    status: v.union(
      v.literal("pending_verification"),
      v.literal("active"),
      v.literal("suspended")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateRole = mutation({
  args: {
    id: v.id("users"),
    role: v.union(
      v.literal("member"),
      v.literal("assistant_librarian"),
      v.literal("church_admin"),
      v.literal("super_admin")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { role: args.role });
  },
});

export const listByChurch = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("churchId"), args.churchId))
      .collect();
  },
});

export const listPendingVerification = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("churchId"), args.churchId),
          q.eq(q.field("status"), "pending_verification")
        )
      )
      .collect();
  },
});
