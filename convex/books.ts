import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    churchId: v.id("churches"),
    search: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let books;

    if (args.category) {
      books = await ctx.db
        .query("books")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
      // Filter by church
      books = books.filter((b) => b.churchId === args.churchId);
    } else {
      books = await ctx.db
        .query("books")
        .withIndex("by_church", (q) => q.eq("churchId", args.churchId))
        .collect();
    }

    // Search filter
    if (args.search) {
      const term = args.search.toLowerCase();
      books = books.filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          b.author.toLowerCase().includes(term) ||
          (b.description && b.description.toLowerCase().includes(term))
      );
    }

    return books;
  },
});

export const getById = query({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCategories = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    const books = await ctx.db
      .query("books")
      .withIndex("by_church", (q) => q.eq("churchId", args.churchId))
      .collect();

    const categories = new Set<string>();
    for (const book of books) {
      if (book.category) categories.add(book.category);
    }
    return Array.from(categories).sort();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    isbn: v.optional(v.string()),
    totalCopies: v.number(),
    churchId: v.id("churches"),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("books", {
      title: args.title,
      author: args.author,
      description: args.description,
      category: args.category,
      isbn: args.isbn,
      totalCopies: args.totalCopies,
      availableCopies: args.totalCopies,
      churchId: args.churchId,
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("books"),
    title: v.string(),
    author: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    isbn: v.optional(v.string()),
    totalCopies: v.number(),
  },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.id);
    if (!book) throw new Error("Book not found");

    // Adjust available copies proportionally
    const borrowedCopies = book.totalCopies - book.availableCopies;
    const newAvailable = Math.max(0, args.totalCopies - borrowedCopies);

    await ctx.db.patch(args.id, {
      title: args.title,
      author: args.author,
      description: args.description,
      category: args.category,
      isbn: args.isbn,
      totalCopies: args.totalCopies,
      availableCopies: newAvailable,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.id);
    if (!book) throw new Error("Book not found");

    // Check for active borrowings
    const activeBorrowings = await ctx.db
      .query("borrowings")
      .withIndex("by_book", (q) => q.eq("bookId", args.id))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "issued"),
          q.eq(q.field("status"), "approved"),
          q.eq(q.field("status"), "requested"),
          q.eq(q.field("status"), "overdue")
        )
      )
      .first();

    if (activeBorrowings) {
      throw new Error("Cannot delete a book with active borrowings");
    }

    await ctx.db.delete(args.id);
  },
});
