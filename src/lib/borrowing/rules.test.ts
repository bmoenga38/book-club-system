import { describe, it, expect } from "vitest";
import {
  calculateConsecutiveOnTime,
  getBorrowingLimit,
  isEstablished,
  hasOverdueBooks,
  countActiveBorrowings,
  canBorrow,
  calculateDueDate,
  isReturnOnTime,
  getXpForAction,
  getLevel,
  getBadges,
  getPenaltyStage,
  getDaysUntilDue,
  shouldSendReminder,
  type BorrowingRecord,
} from "./rules";

// ─── Trust Progression ──────────────────────────────────────────────────────

describe("calculateConsecutiveOnTime", () => {
  it("returns 0 for empty array", () => {
    expect(calculateConsecutiveOnTime([])).toBe(0);
  });

  it("counts consecutive on-time returns", () => {
    const records: BorrowingRecord[] = [
      { status: "returned", returnedAt: 100, dueDate: 200 },
      { status: "returned", returnedAt: 50, dueDate: 100 },
      { status: "returned", returnedAt: 10, dueDate: 50 },
    ];
    expect(calculateConsecutiveOnTime(records)).toBe(3);
  });

  it("stops at first late return", () => {
    const records: BorrowingRecord[] = [
      { status: "returned", returnedAt: 100, dueDate: 200 }, // on time
      { status: "returned", returnedAt: 300, dueDate: 200 }, // LATE
      { status: "returned", returnedAt: 10, dueDate: 50 },   // on time but after late
    ];
    expect(calculateConsecutiveOnTime(records)).toBe(1);
  });

  it("returns 0 if first return is late", () => {
    const records: BorrowingRecord[] = [
      { status: "returned", returnedAt: 300, dueDate: 200 },
    ];
    expect(calculateConsecutiveOnTime(records)).toBe(0);
  });

  it("handles missing dueDate or returnedAt", () => {
    const records: BorrowingRecord[] = [
      { status: "returned", returnedAt: 100 }, // no dueDate
    ];
    expect(calculateConsecutiveOnTime(records)).toBe(0);
  });
});

describe("getBorrowingLimit", () => {
  it("returns 1 for new members (< 3 on-time returns)", () => {
    expect(getBorrowingLimit(0)).toBe(1);
    expect(getBorrowingLimit(1)).toBe(1);
    expect(getBorrowingLimit(2)).toBe(1);
  });

  it("returns 3 for established members (>= 3 on-time returns)", () => {
    expect(getBorrowingLimit(3)).toBe(3);
    expect(getBorrowingLimit(5)).toBe(3);
    expect(getBorrowingLimit(10)).toBe(3);
  });
});

describe("isEstablished", () => {
  it("returns false below threshold", () => {
    expect(isEstablished(0)).toBe(false);
    expect(isEstablished(2)).toBe(false);
  });

  it("returns true at or above threshold", () => {
    expect(isEstablished(3)).toBe(true);
    expect(isEstablished(10)).toBe(true);
  });
});

// ─── Overdue Detection ──────────────────────────────────────────────────────

describe("hasOverdueBooks", () => {
  it("returns false for no borrowings", () => {
    expect(hasOverdueBooks([])).toBe(false);
  });

  it("detects explicitly overdue status", () => {
    const records: BorrowingRecord[] = [{ status: "overdue" }];
    expect(hasOverdueBooks(records)).toBe(true);
  });

  it("detects issued book past due date", () => {
    const now = 1000;
    const records: BorrowingRecord[] = [
      { status: "issued", dueDate: 500 },
    ];
    expect(hasOverdueBooks(records, now)).toBe(true);
  });

  it("returns false for issued book before due date", () => {
    const now = 100;
    const records: BorrowingRecord[] = [
      { status: "issued", dueDate: 500 },
    ];
    expect(hasOverdueBooks(records, now)).toBe(false);
  });

  it("ignores returned books", () => {
    const records: BorrowingRecord[] = [
      { status: "returned", dueDate: 1, returnedAt: 100 },
    ];
    expect(hasOverdueBooks(records)).toBe(false);
  });
});

describe("countActiveBorrowings", () => {
  it("counts requested, approved, and issued", () => {
    const records: BorrowingRecord[] = [
      { status: "requested" },
      { status: "approved" },
      { status: "issued" },
      { status: "returned" },
      { status: "declined" },
      { status: "overdue" },
    ];
    expect(countActiveBorrowings(records)).toBe(3);
  });

  it("returns 0 for empty array", () => {
    expect(countActiveBorrowings([])).toBe(0);
  });
});

// ─── canBorrow (Integration of Rules) ───────────────────────────────────────

describe("canBorrow", () => {
  it("allows borrowing for new member with no active loans", () => {
    const result = canBorrow([]);
    expect(result.allowed).toBe(true);
  });

  it("blocks new member with 1 active loan", () => {
    const records: BorrowingRecord[] = [
      { status: "issued", dueDate: Date.now() + 100000 },
    ];
    const result = canBorrow(records);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("1 book");
  });

  it("allows established member to borrow up to 3", () => {
    const now = Date.now();
    const records: BorrowingRecord[] = [
      // 3 on-time returns to become established
      { status: "returned", returnedAt: now - 300, dueDate: now - 100 },
      { status: "returned", returnedAt: now - 600, dueDate: now - 400 },
      { status: "returned", returnedAt: now - 900, dueDate: now - 700 },
      // 1 active loan
      { status: "issued", dueDate: now + 100000 },
    ];
    const result = canBorrow(records, now);
    expect(result.allowed).toBe(true);
  });

  it("blocks established member at 3 active loans", () => {
    const now = Date.now();
    const records: BorrowingRecord[] = [
      { status: "returned", returnedAt: now - 300, dueDate: now - 100 },
      { status: "returned", returnedAt: now - 600, dueDate: now - 400 },
      { status: "returned", returnedAt: now - 900, dueDate: now - 700 },
      { status: "issued", dueDate: now + 100000 },
      { status: "issued", dueDate: now + 100000 },
      { status: "issued", dueDate: now + 100000 },
    ];
    const result = canBorrow(records, now);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("3 books");
  });

  it("blocks if overdue books exist", () => {
    const now = 1000;
    const records: BorrowingRecord[] = [
      { status: "issued", dueDate: 500 },
    ];
    const result = canBorrow(records, now);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("overdue");
  });
});

// ─── Due Date & Return ──────────────────────────────────────────────────────

describe("calculateDueDate", () => {
  it("adds 14 days by default", () => {
    const issueDate = 0;
    const result = calculateDueDate(issueDate);
    expect(result).toBe(14 * 24 * 60 * 60 * 1000);
  });

  it("uses custom loan days", () => {
    const issueDate = 0;
    const result = calculateDueDate(issueDate, 7);
    expect(result).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

describe("isReturnOnTime", () => {
  it("returns true when returned before due date", () => {
    expect(isReturnOnTime(100, 200)).toBe(true);
  });

  it("returns true when returned exactly on due date", () => {
    expect(isReturnOnTime(200, 200)).toBe(true);
  });

  it("returns false when returned after due date", () => {
    expect(isReturnOnTime(300, 200)).toBe(false);
  });
});

// ─── Gamification ───────────────────────────────────────────────────────────

describe("getXpForAction", () => {
  it("awards 10 XP for request", () => {
    expect(getXpForAction("request")).toBe(10);
  });

  it("awards 25 XP for issued", () => {
    expect(getXpForAction("issued")).toBe(25);
  });

  it("awards 40 XP for on-time return", () => {
    expect(getXpForAction("on_time_return")).toBe(40);
  });
});

describe("getLevel", () => {
  it("returns Newcomer for 0-99 XP", () => {
    expect(getLevel(0)).toEqual({ name: "Newcomer", number: 1 });
    expect(getLevel(99)).toEqual({ name: "Newcomer", number: 1 });
  });

  it("returns Consistent Reader for 100-249 XP", () => {
    expect(getLevel(100)).toEqual({ name: "Consistent Reader", number: 2 });
    expect(getLevel(249)).toEqual({ name: "Consistent Reader", number: 2 });
  });

  it("returns Avid Reader for 250-499 XP", () => {
    expect(getLevel(250)).toEqual({ name: "Avid Reader", number: 3 });
    expect(getLevel(499)).toEqual({ name: "Avid Reader", number: 3 });
  });

  it("returns Library Champion for 500-999 XP", () => {
    expect(getLevel(500)).toEqual({ name: "Library Champion", number: 4 });
    expect(getLevel(999)).toEqual({ name: "Library Champion", number: 4 });
  });

  it("returns Library Legend for 1000+ XP", () => {
    expect(getLevel(1000)).toEqual({ name: "Library Legend", number: 5 });
    expect(getLevel(5000)).toEqual({ name: "Library Legend", number: 5 });
  });
});

describe("getBadges", () => {
  it("returns empty for no activity", () => {
    expect(getBadges(0, 0)).toEqual([]);
  });

  it("awards First Borrow after 1 borrowing", () => {
    expect(getBadges(1, 0)).toContain("First Borrow");
  });

  it("awards Bookworm after 5 borrowings", () => {
    const badges = getBadges(5, 0);
    expect(badges).toContain("First Borrow");
    expect(badges).toContain("Bookworm");
  });

  it("awards Trustworthy after 3 consecutive on-time", () => {
    expect(getBadges(3, 3)).toContain("Trustworthy");
  });

  it("awards Streak Master after 5 consecutive on-time", () => {
    expect(getBadges(5, 5)).toContain("Streak Master");
  });

  it("awards Perfect Record after 10 consecutive on-time", () => {
    expect(getBadges(10, 10)).toContain("Perfect Record");
  });

  it("awards all badges for max activity", () => {
    const badges = getBadges(25, 10);
    expect(badges).toEqual([
      "First Borrow",
      "Bookworm",
      "Avid Reader",
      "Library Regular",
      "Trustworthy",
      "Streak Master",
      "Perfect Record",
    ]);
  });
});

// ─── Penalty Escalation ─────────────────────────────────────────────────────

describe("getPenaltyStage", () => {
  it("returns none for not overdue", () => {
    expect(getPenaltyStage(0)).toBe("none");
    expect(getPenaltyStage(-3)).toBe("none");
  });

  it("returns overdue_1day for 1-6 days overdue", () => {
    expect(getPenaltyStage(1)).toBe("overdue_1day");
    expect(getPenaltyStage(6)).toBe("overdue_1day");
  });

  it("returns overdue_7day for 7-13 days overdue", () => {
    expect(getPenaltyStage(7)).toBe("overdue_7day");
    expect(getPenaltyStage(13)).toBe("overdue_7day");
  });

  it("returns overdue_14day for 14+ days overdue", () => {
    expect(getPenaltyStage(14)).toBe("overdue_14day");
    expect(getPenaltyStage(30)).toBe("overdue_14day");
  });
});

describe("getDaysUntilDue", () => {
  const DAY = 24 * 60 * 60 * 1000;

  it("returns positive days when before due date", () => {
    const now = 0;
    const dueDate = 3 * DAY;
    expect(getDaysUntilDue(dueDate, now)).toBe(3);
  });

  it("returns 0 when exactly on due date", () => {
    const now = 1000;
    expect(getDaysUntilDue(now, now)).toBe(0);
  });

  it("returns negative days when overdue", () => {
    const now = 5 * DAY;
    const dueDate = 2 * DAY;
    expect(getDaysUntilDue(dueDate, now)).toBe(-3);
  });
});

describe("shouldSendReminder", () => {
  it("sends reminder 1-3 days before due", () => {
    expect(shouldSendReminder(1)).toBe(true);
    expect(shouldSendReminder(2)).toBe(true);
    expect(shouldSendReminder(3)).toBe(true);
  });

  it("does not send reminder more than 3 days before", () => {
    expect(shouldSendReminder(4)).toBe(false);
    expect(shouldSendReminder(10)).toBe(false);
  });

  it("does not send reminder on or after due date", () => {
    expect(shouldSendReminder(0)).toBe(false);
    expect(shouldSendReminder(-1)).toBe(false);
  });
});
