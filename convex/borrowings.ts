import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const LOAN_PERIOD_DAYS = 14;
const NEW_MEMBER_LIMIT = 1;
const ESTABLISHED_MEMBER_LIMIT = 3;
const TRUST_UPGRADE_THRESHOLD = 3;

const XP_REQUEST = 10;
const XP_ISSUED = 25;
const XP_ON_TIME_RETURN = 40;

// ─── Queries ────────────────────────────────────────────────────────────────

export const listByMember = query({
  args: { memberId: v.id("users") },
  handler: async (ctx, args) => {
    const borrowings = await ctx.db
      .query("borrowings")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .order("desc")
      .collect();

    // Enrich with book titles
    const enriched = await Promise.all(
      borrowings.map(async (b) => {
        const book = await ctx.db.get(b.bookId);
        return { ...b, bookTitle: book?.title ?? "Unknown", bookAuthor: book?.author ?? "" };
      })
    );
    return enriched;
  },
});

export const listRecentActivity = query({
  args: { churchId: v.id("churches"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const max = args.limit ?? 10;
    const allBorrowings = await ctx.db
      .query("borrowings")
      .filter((q) => q.eq(q.field("churchId"), args.churchId))
      .order("desc")
      .collect();

    const recent = allBorrowings.slice(0, max);

    const enriched = await Promise.all(
      recent.map(async (b) => {
        const book = await ctx.db.get(b.bookId);
        const member = await ctx.db.get(b.memberId);
        return {
          _id: b._id,
          status: b.status,
          bookTitle: book?.title ?? "Unknown",
          memberName: member?.name ?? "Unknown",
          createdAt: b._creationTime,
          issuedAt: b.issuedAt,
          returnedAt: b.returnedAt,
          dueDate: b.dueDate,
        };
      })
    );
    return enriched;
  },
});

export const listPendingByChurch = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    const borrowings = await ctx.db
      .query("borrowings")
      .withIndex("by_church_status", (q) =>
        q.eq("churchId", args.churchId).eq("status", "requested")
      )
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      borrowings.map(async (b) => {
        const book = await ctx.db.get(b.bookId);
        const member = await ctx.db.get(b.memberId);
        return {
          ...b,
          bookTitle: book?.title ?? "Unknown",
          bookAuthor: book?.author ?? "",
          memberName: member?.name ?? "Unknown",
          memberPhone: member?.phone ?? "",
        };
      })
    );
    return enriched;
  },
});

export const listActiveByChurch = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    const allBorrowings = await ctx.db
      .query("borrowings")
      .filter((q) => q.eq(q.field("churchId"), args.churchId))
      .order("desc")
      .collect();

    const active = allBorrowings.filter(
      (b) => b.status === "issued" || b.status === "approved" || b.status === "overdue"
    );

    const enriched = await Promise.all(
      active.map(async (b) => {
        const book = await ctx.db.get(b.bookId);
        const member = await ctx.db.get(b.memberId);
        return {
          ...b,
          bookTitle: book?.title ?? "Unknown",
          bookAuthor: book?.author ?? "",
          memberName: member?.name ?? "Unknown",
          memberPhone: member?.phone ?? "",
        };
      })
    );
    return enriched;
  },
});

export const listOverdueByChurch = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const issued = await ctx.db
      .query("borrowings")
      .filter((q) =>
        q.and(
          q.eq(q.field("churchId"), args.churchId),
          q.or(
            q.eq(q.field("status"), "issued"),
            q.eq(q.field("status"), "overdue")
          )
        )
      )
      .collect();

    const overdue = issued.filter((b) => b.dueDate && b.dueDate < now);

    const enriched = await Promise.all(
      overdue.map(async (b) => {
        const book = await ctx.db.get(b.bookId);
        const member = await ctx.db.get(b.memberId);
        const daysOverdue = Math.floor((now - b.dueDate!) / (1000 * 60 * 60 * 24));
        return {
          ...b,
          bookTitle: book?.title ?? "Unknown",
          memberName: member?.name ?? "Unknown",
          memberPhone: member?.phone ?? "",
          daysOverdue,
        };
      })
    );
    return enriched.sort((a, b) => b.daysOverdue - a.daysOverdue);
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

export const request = mutation({
  args: {
    bookId: v.id("books"),
    memberId: v.id("users"),
    churchId: v.id("churches"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member not found");
    if (member.status !== "active") throw new Error("Your account is not active");

    // Check for overdue books
    const memberBorrowings = await ctx.db
      .query("borrowings")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .collect();

    const hasOverdue = memberBorrowings.some(
      (b) => b.status === "overdue" || (b.status === "issued" && b.dueDate && b.dueDate < Date.now())
    );
    if (hasOverdue) throw new Error("You have overdue books. Please return them first.");

    // Check borrowing limit
    const activeBorrowings = memberBorrowings.filter(
      (b) => b.status === "requested" || b.status === "approved" || b.status === "issued"
    ).length;

    // Count consecutive on-time returns to determine trust level
    const returnedBorrowings = memberBorrowings
      .filter((b) => b.status === "returned")
      .sort((a, b) => (b.returnedAt ?? 0) - (a.returnedAt ?? 0));

    let consecutiveOnTime = 0;
    for (const b of returnedBorrowings) {
      if (b.returnedAt && b.dueDate && b.returnedAt <= b.dueDate) {
        consecutiveOnTime++;
      } else {
        break;
      }
    }

    const limit = consecutiveOnTime >= TRUST_UPGRADE_THRESHOLD
      ? ESTABLISHED_MEMBER_LIMIT
      : NEW_MEMBER_LIMIT;

    if (activeBorrowings >= limit) {
      throw new Error(
        `You can borrow up to ${limit} book${limit > 1 ? "s" : ""} at a time. Return a book to borrow another.`
      );
    }

    // Check book availability
    const book = await ctx.db.get(args.bookId);
    if (!book) throw new Error("Book not found");
    if (book.availableCopies < 1) throw new Error("This book is currently unavailable");

    // Check for duplicate pending request
    const existingRequest = memberBorrowings.find(
      (b) => b.bookId === args.bookId && (b.status === "requested" || b.status === "approved")
    );
    if (existingRequest) throw new Error("You already have a pending request for this book");

    const id = await ctx.db.insert("borrowings", {
      bookId: args.bookId,
      memberId: args.memberId,
      churchId: args.churchId,
      status: "requested",
      requestedAt: Date.now(),
    });

    // Award XP for request
    await ctx.db.insert("xpEvents", {
      userId: args.memberId,
      action: "borrow_request",
      points: XP_REQUEST,
      borrowingId: id,
    });

    return id;
  },
});

export const approve = mutation({
  args: {
    borrowingId: v.id("borrowings"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const borrowing = await ctx.db.get(args.borrowingId);
    if (!borrowing) throw new Error("Borrowing not found");
    if (borrowing.status !== "requested") throw new Error("Can only approve pending requests");

    // Verify book still available
    const book = await ctx.db.get(borrowing.bookId);
    if (!book || book.availableCopies < 1) {
      throw new Error("Book is no longer available");
    }

    await ctx.db.patch(args.borrowingId, {
      status: "approved",
      approvedAt: Date.now(),
    });

    // Send approval SMS to member
    const member = await ctx.db.get(borrowing.memberId);
    if (member?.phone && book) {
      const title = book.title.length > 60 ? book.title.slice(0, 57) + "..." : book.title;
      await ctx.scheduler.runAfter(0, internal.smsActions.sendSms, {
        phone: member.phone,
        message: `Your request for '${title}' has been approved. Coordinate pickup.`,
      });
    }
  },
});

export const decline = mutation({
  args: {
    borrowingId: v.id("borrowings"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const borrowing = await ctx.db.get(args.borrowingId);
    if (!borrowing) throw new Error("Borrowing not found");
    if (borrowing.status !== "requested") throw new Error("Can only decline pending requests");

    await ctx.db.patch(args.borrowingId, {
      status: "declined",
      declineNote: args.note,
    });

    // Send decline SMS to member
    const member = await ctx.db.get(borrowing.memberId);
    const book = await ctx.db.get(borrowing.bookId);
    if (member?.phone) {
      const title = book ? (book.title.length > 40 ? book.title.slice(0, 37) + "..." : book.title) : "the book";
      const note = args.note ? ` ${args.note.slice(0, 50)}` : "";
      await ctx.scheduler.runAfter(0, internal.smsActions.sendSms, {
        phone: member.phone,
        message: `Your request for '${title}' was declined.${note}`,
      });
    }
  },
});

export const issue = mutation({
  args: {
    borrowingId: v.id("borrowings"),
  },
  handler: async (ctx, args) => {
    const borrowing = await ctx.db.get(args.borrowingId);
    if (!borrowing) throw new Error("Borrowing not found");
    if (borrowing.status !== "approved" && borrowing.status !== "requested") {
      throw new Error("Can only issue approved or pending requests");
    }

    // Decrement available copies
    const book = await ctx.db.get(borrowing.bookId);
    if (!book || book.availableCopies < 1) {
      throw new Error("Book is no longer available");
    }

    const dueDate = Date.now() + LOAN_PERIOD_DAYS * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.borrowingId, {
      status: "issued",
      issuedAt: Date.now(),
      dueDate,
      approvedAt: borrowing.approvedAt ?? Date.now(),
    });

    await ctx.db.patch(borrowing.bookId, {
      availableCopies: book.availableCopies - 1,
    });

    // Award XP for issued
    await ctx.db.insert("xpEvents", {
      userId: borrowing.memberId,
      action: "book_issued",
      points: XP_ISSUED,
      borrowingId: args.borrowingId,
    });
  },
});

export const directIssue = mutation({
  args: {
    bookId: v.id("books"),
    memberId: v.id("users"),
    churchId: v.id("churches"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member not found");
    if (member.status !== "active") throw new Error("Member account is not active");

    // Check overdue
    const memberBorrowings = await ctx.db
      .query("borrowings")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .collect();

    const hasOverdue = memberBorrowings.some(
      (b) => b.status === "overdue" || (b.status === "issued" && b.dueDate && b.dueDate < Date.now())
    );
    if (hasOverdue) throw new Error("Member has overdue books");

    // Check limit
    const activeBorrowings = memberBorrowings.filter(
      (b) => b.status === "requested" || b.status === "approved" || b.status === "issued"
    ).length;

    const returnedBorrowings = memberBorrowings
      .filter((b) => b.status === "returned")
      .sort((a, b) => (b.returnedAt ?? 0) - (a.returnedAt ?? 0));

    let consecutiveOnTime = 0;
    for (const b of returnedBorrowings) {
      if (b.returnedAt && b.dueDate && b.returnedAt <= b.dueDate) {
        consecutiveOnTime++;
      } else {
        break;
      }
    }

    const limit = consecutiveOnTime >= TRUST_UPGRADE_THRESHOLD
      ? ESTABLISHED_MEMBER_LIMIT
      : NEW_MEMBER_LIMIT;

    if (activeBorrowings >= limit) {
      throw new Error(`Member has reached borrowing limit (${limit})`);
    }

    // Check book
    const book = await ctx.db.get(args.bookId);
    if (!book || book.availableCopies < 1) throw new Error("Book is not available");

    const now = Date.now();
    const dueDate = now + LOAN_PERIOD_DAYS * 24 * 60 * 60 * 1000;

    const id = await ctx.db.insert("borrowings", {
      bookId: args.bookId,
      memberId: args.memberId,
      churchId: args.churchId,
      status: "issued",
      requestedAt: now,
      approvedAt: now,
      issuedAt: now,
      dueDate,
    });

    await ctx.db.patch(args.bookId, {
      availableCopies: book.availableCopies - 1,
    });

    // Award XP for request + issued
    await ctx.db.insert("xpEvents", {
      userId: args.memberId,
      action: "borrow_request",
      points: XP_REQUEST,
      borrowingId: id,
    });
    await ctx.db.insert("xpEvents", {
      userId: args.memberId,
      action: "book_issued",
      points: XP_ISSUED,
      borrowingId: id,
    });

    return id;
  },
});

export const markReturned = mutation({
  args: {
    borrowingId: v.id("borrowings"),
  },
  handler: async (ctx, args) => {
    const borrowing = await ctx.db.get(args.borrowingId);
    if (!borrowing) throw new Error("Borrowing not found");
    if (borrowing.status !== "issued" && borrowing.status !== "overdue") {
      throw new Error("Can only return issued or overdue books");
    }

    const now = Date.now();
    const isOnTime = borrowing.dueDate ? now <= borrowing.dueDate : true;

    await ctx.db.patch(args.borrowingId, {
      status: "returned",
      returnedAt: now,
    });

    // Restore available copies
    const book = await ctx.db.get(borrowing.bookId);
    if (book) {
      await ctx.db.patch(borrowing.bookId, {
        availableCopies: book.availableCopies + 1,
      });
    }

    // Award XP only for on-time returns
    if (isOnTime) {
      await ctx.db.insert("xpEvents", {
        userId: borrowing.memberId,
        action: "on_time_return",
        points: XP_ON_TIME_RETURN,
        borrowingId: args.borrowingId,
      });
    }

    // Update trust progression and restore suspension
    await ctx.scheduler.runAfter(0, internal.penalties.updateTrustAfterReturn, {
      memberId: borrowing.memberId,
      isOnTime,
    });

    return { isOnTime };
  },
});

// Search members for direct issue flow
export const searchMembers = query({
  args: {
    churchId: v.id("churches"),
    search: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.search.length < 2) return [];

    const users = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("churchId"), args.churchId),
          q.eq(q.field("status"), "active")
        )
      )
      .collect();

    const term = args.search.toLowerCase();
    return users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.phone.includes(term)
      )
      .slice(0, 10)
      .map((u) => ({ _id: u._id, name: u.name, phone: u.phone }));
  },
});
