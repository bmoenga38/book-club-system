import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const churches = await ctx.db.query("churches").collect();
    return churches.map((c) => ({
      _id: c._id,
      name: c.name,
      code: c.code,
      address: c.address,
      isActive: c.isActive ?? true,
    }));
  },
});

export const getById = query({
  args: { id: v.id("churches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("churches", {
      ...args,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("churches"),
    name: v.string(),
    code: v.optional(v.string()),
    address: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    defaultLoanDays: v.optional(v.number()),
    maxBooksNew: v.optional(v.number()),
    maxBooksEstablished: v.optional(v.number()),
    trustThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const toggleActive = mutation({
  args: { id: v.id("churches") },
  handler: async (ctx, args) => {
    const church = await ctx.db.get(args.id);
    if (!church) throw new Error("Church not found");
    await ctx.db.patch(args.id, { isActive: !(church.isActive ?? true) });
  },
});

export const getAggregateStats = query({
  args: {},
  handler: async (ctx) => {
    const churches = await ctx.db.query("churches").collect();
    const users = await ctx.db.query("users").collect();
    const books = await ctx.db.query("books").collect();
    const borrowings = await ctx.db.query("borrowings").collect();

    const activeMembers = users.filter((u) => u.status === "active").length;
    const activeBorrowings = borrowings.filter(
      (b) => b.status === "issued" || b.status === "overdue"
    ).length;
    const overdue = borrowings.filter(
      (b) =>
        (b.status === "issued" || b.status === "overdue") &&
        b.dueDate &&
        b.dueDate < Date.now()
    ).length;

    const perChurch = await Promise.all(
      churches.map(async (church) => {
        const churchUsers = users.filter((u) => u.churchId === church._id);
        const churchBooks = books.filter((b) => b.churchId === church._id);
        const churchBorrowings = borrowings.filter((b) => b.churchId === church._id);
        const churchActive = churchBorrowings.filter(
          (b) => b.status === "issued" || b.status === "overdue"
        ).length;
        const churchOverdue = churchBorrowings.filter(
          (b) =>
            (b.status === "issued" || b.status === "overdue") &&
            b.dueDate &&
            b.dueDate < Date.now()
        ).length;

        return {
          _id: church._id,
          name: church.name,
          code: church.code,
          isActive: church.isActive ?? true,
          members: churchUsers.length,
          activeMembers: churchUsers.filter((u) => u.status === "active").length,
          books: churchBooks.length,
          activeBorrowings: churchActive,
          overdue: churchOverdue,
        };
      })
    );

    return {
      totalChurches: churches.length,
      totalMembers: users.length,
      activeMembers,
      totalBooks: books.length,
      activeBorrowings,
      overdue,
      perChurch,
    };
  },
});
