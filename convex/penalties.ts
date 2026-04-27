import { internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const DAY_MS = 24 * 60 * 60 * 1000;

// SMS message templates (kept under 160 chars)
const MESSAGES = {
  reminder_3day: (title: string, date: string) =>
    `Reminder: "${title}" is due on ${date}. Return on time to earn +40 XP!`,
  overdue_1day: (title: string) =>
    `Gentle reminder: "${title}" was due yesterday. Please return to keep your streak.`,
  overdue_7day: (title: string) =>
    `Warning: "${title}" is 7 days overdue. Your borrowing is suspended until returned.`,
  overdue_14day: (title: string) =>
    `"${title}" is 14+ days overdue. Please return or replace. Your account has been flagged.`,
};

// Process all borrowings and send appropriate escalation messages
export const processEscalations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all issued borrowings with due dates
    const allBorrowings = await ctx.db.query("borrowings").collect();
    const issuedBorrowings = allBorrowings.filter(
      (b) => (b.status === "issued" || b.status === "overdue") && b.dueDate
    );

    const smsBatch: Array<{
      phone: string;
      message: string;
      type: string;
      borrowingId: string;
      churchId: string;
      memberId: string;
      stage: "reminder_3day" | "overdue_1day" | "overdue_7day" | "overdue_14day";
    }> = [];

    for (const borrowing of issuedBorrowings) {
      if (!borrowing.dueDate) continue;

      const daysUntilDue = Math.floor((borrowing.dueDate - now) / DAY_MS);
      const daysOverdue = Math.floor((now - borrowing.dueDate) / DAY_MS);

      // Check which escalation stages have already been sent
      const existingEscalations = await ctx.db
        .query("penaltyEscalations")
        .withIndex("by_borrowing", (q) => q.eq("borrowingId", borrowing._id))
        .collect();
      const sentStages = new Set(existingEscalations.map((e) => e.stage));

      const member = await ctx.db.get(borrowing.memberId);
      const book = await ctx.db.get(borrowing.bookId);
      if (!member || !book) continue;

      const dueDateStr = new Date(borrowing.dueDate).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
      });

      // Day -3: Friendly reminder (3 days before due)
      if (daysUntilDue <= 3 && daysUntilDue > 0 && !sentStages.has("reminder_3day")) {
        smsBatch.push({
          phone: member.phone,
          message: MESSAGES.reminder_3day(book.title, dueDateStr),
          type: "reminder",
          borrowingId: borrowing._id,
          churchId: borrowing.churchId,
          memberId: borrowing.memberId,
          stage: "reminder_3day",
        });
      }

      // Day 1 overdue
      if (daysOverdue >= 1 && !sentStages.has("overdue_1day")) {
        // Update status to overdue
        if (borrowing.status === "issued") {
          await ctx.db.patch(borrowing._id, { status: "overdue" });
        }
        smsBatch.push({
          phone: member.phone,
          message: MESSAGES.overdue_1day(book.title),
          type: "overdue",
          borrowingId: borrowing._id,
          churchId: borrowing.churchId,
          memberId: borrowing.memberId,
          stage: "overdue_1day",
        });
      }

      // Day 7 overdue: suspend borrowing
      if (daysOverdue >= 7 && !sentStages.has("overdue_7day")) {
        await ctx.db.patch(borrowing.memberId, {
          status: "suspended",
          isSuspended: true,
        });
        smsBatch.push({
          phone: member.phone,
          message: MESSAGES.overdue_7day(book.title),
          type: "suspension",
          borrowingId: borrowing._id,
          churchId: borrowing.churchId,
          memberId: borrowing.memberId,
          stage: "overdue_7day",
        });
      }

      // Day 14 overdue: high risk flag
      if (daysOverdue >= 14 && !sentStages.has("overdue_14day")) {
        await ctx.db.patch(borrowing.memberId, {
          isHighRisk: true,
        });
        smsBatch.push({
          phone: member.phone,
          message: MESSAGES.overdue_14day(book.title),
          type: "high_risk",
          borrowingId: borrowing._id,
          churchId: borrowing.churchId,
          memberId: borrowing.memberId,
          stage: "overdue_14day",
        });
      }
    }

    // Record all escalations, SMS logs, and schedule actual SMS sends
    for (let i = 0; i < smsBatch.length; i++) {
      const sms = smsBatch[i];
      await ctx.db.insert("penaltyEscalations", {
        borrowingId: sms.borrowingId as any,
        memberId: sms.memberId as any,
        churchId: sms.churchId as any,
        stage: sms.stage,
        sentAt: now,
      });

      await ctx.db.insert("smsLog", {
        phone: sms.phone,
        message: sms.message,
        type: sms.type,
        status: "pending",
        borrowingId: sms.borrowingId as any,
        churchId: sms.churchId as any,
        sentAt: now,
      });

      // Stagger SMS sends 1s apart to avoid burst limits
      await ctx.scheduler.runAfter(i * 1000, internal.smsActions.sendSms, {
        phone: sms.phone,
        message: sms.message,
      });
    }

    return { processed: issuedBorrowings.length, smsQueued: smsBatch.length };
  },
});

// Update trust status after a return (called from markReturned)
export const updateTrustAfterReturn = internalMutation({
  args: {
    memberId: v.id("users"),
    isOnTime: v.boolean(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member) return;

    if (args.isOnTime) {
      const newCount = (member.consecutiveOnTime ?? 0) + 1;
      const trustStatus = newCount >= 3 ? "established" : "new";
      await ctx.db.patch(args.memberId, {
        consecutiveOnTime: newCount,
        trustStatus: trustStatus as "new" | "established",
      });
    } else {
      // Reset streak on late return
      await ctx.db.patch(args.memberId, {
        consecutiveOnTime: 0,
        trustStatus: "new",
      });
    }

    // Restore from suspension if returning overdue book
    if (member.isSuspended || member.status === "suspended") {
      await ctx.db.patch(args.memberId, {
        status: "active",
        isSuspended: false,
      });
    }
  },
});
