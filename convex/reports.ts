import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const getMonthlySummary = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const allBorrowings = await ctx.db
      .query("borrowings")
      .filter((q) => q.eq(q.field("churchId"), args.churchId))
      .collect();

    const recentBorrowings = allBorrowings.filter(
      (b) => b.requestedAt >= thirtyDaysAgo
    );

    const totalBorrows = recentBorrowings.length;
    const returned = recentBorrowings.filter((b) => b.status === "returned");
    const onTimeReturns = returned.filter(
      (b) => b.returnedAt && b.dueDate && b.returnedAt <= b.dueDate
    ).length;
    const onTimeRate = returned.length > 0
      ? Math.round((onTimeReturns / returned.length) * 100)
      : 0;

    const currentOverdue = allBorrowings.filter(
      (b) =>
        (b.status === "issued" || b.status === "overdue") &&
        b.dueDate &&
        b.dueDate < now
    ).length;

    const activeLoans = allBorrowings.filter(
      (b) => b.status === "issued" || b.status === "overdue"
    ).length;

    // Unique borrowers this month
    const uniqueBorrowers = new Set(
      recentBorrowings.map((b) => b.memberId)
    ).size;

    return {
      totalBorrows,
      returned: returned.length,
      onTimeRate,
      currentOverdue,
      activeLoans,
      uniqueBorrowers,
    };
  },
});

export const getPopularBooks = query({
  args: { churchId: v.id("churches"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const borrowings = await ctx.db
      .query("borrowings")
      .filter((q) => q.eq(q.field("churchId"), args.churchId))
      .collect();

    // Count borrows per book
    const bookCounts: Record<string, number> = {};
    for (const b of borrowings) {
      bookCounts[b.bookId] = (bookCounts[b.bookId] ?? 0) + 1;
    }

    const sorted = Object.entries(bookCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

    const enriched = await Promise.all(
      sorted.map(async ([bookId, count]) => {
        const book = await ctx.db.get(bookId as Id<"books">);
        return {
          bookId,
          title: book?.title ?? "Unknown",
          author: book?.author ?? "",
          borrowCount: count,
        };
      })
    );

    return enriched;
  },
});

export const getUnderutilizedBooks = query({
  args: { churchId: v.id("churches"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const books = await ctx.db
      .query("books")
      .withIndex("by_church", (q) => q.eq("churchId", args.churchId))
      .collect();

    const borrowings = await ctx.db
      .query("borrowings")
      .filter((q) => q.eq(q.field("churchId"), args.churchId))
      .collect();

    const bookCounts: Record<string, number> = {};
    for (const b of borrowings) {
      bookCounts[b.bookId] = (bookCounts[b.bookId] ?? 0) + 1;
    }

    const underutilized = books
      .map((book) => ({
        bookId: book._id,
        title: book.title,
        author: book.author,
        borrowCount: bookCounts[book._id] ?? 0,
      }))
      .sort((a, b) => a.borrowCount - b.borrowCount)
      .slice(0, limit);

    return underutilized;
  },
});

export const getInventoryStatus = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    const books = await ctx.db
      .query("books")
      .withIndex("by_church", (q) => q.eq("churchId", args.churchId))
      .collect();

    const totalBooks = books.length;
    const totalCopies = books.reduce((s, b) => s + b.totalCopies, 0);
    const availableCopies = books.reduce((s, b) => s + b.availableCopies, 0);
    const borrowedCopies = totalCopies - availableCopies;

    // Categories breakdown
    const categories: Record<string, number> = {};
    for (const book of books) {
      const cat = book.category ?? "Uncategorized";
      categories[cat] = (categories[cat] ?? 0) + 1;
    }

    return {
      totalBooks,
      totalCopies,
      availableCopies,
      borrowedCopies,
      categories: Object.entries(categories)
        .sort(([, a], [, b]) => b - a)
        .map(([name, count]) => ({ name, count })),
    };
  },
});

export const getSmsSpend = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const logs = await ctx.db
      .query("smsLog")
      .withIndex("by_church", (q) => q.eq("churchId", args.churchId))
      .collect();

    const recentLogs = logs.filter((l) => l.sentAt >= thirtyDaysAgo);
    const totalSent = recentLogs.filter((l) => l.status === "sent" || l.status === "pending").length;
    // Estimate ~KES 0.80 per SMS
    const estimatedCost = totalSent * 0.8;

    return {
      totalSent,
      estimatedCostKes: Math.round(estimatedCost * 100) / 100,
    };
  },
});
