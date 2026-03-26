// Pure business logic functions — no DB or Convex dependency
// These are extracted for testability

const NEW_MEMBER_LIMIT = 1;
const ESTABLISHED_MEMBER_LIMIT = 3;
const TRUST_UPGRADE_THRESHOLD = 3;
const LOAN_PERIOD_DAYS = 14;

const XP_REQUEST = 10;
const XP_ISSUED = 25;
const XP_ON_TIME_RETURN = 40;

export interface BorrowingRecord {
  status: string;
  dueDate?: number;
  returnedAt?: number;
}

export function calculateConsecutiveOnTime(
  returnedBorrowings: BorrowingRecord[]
): number {
  let count = 0;
  for (const b of returnedBorrowings) {
    if (b.returnedAt && b.dueDate && b.returnedAt <= b.dueDate) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

export function getBorrowingLimit(consecutiveOnTime: number): number {
  return consecutiveOnTime >= TRUST_UPGRADE_THRESHOLD
    ? ESTABLISHED_MEMBER_LIMIT
    : NEW_MEMBER_LIMIT;
}

export function isEstablished(consecutiveOnTime: number): boolean {
  return consecutiveOnTime >= TRUST_UPGRADE_THRESHOLD;
}

export function hasOverdueBooks(
  borrowings: BorrowingRecord[],
  now: number = Date.now()
): boolean {
  return borrowings.some(
    (b) =>
      b.status === "overdue" ||
      (b.status === "issued" && b.dueDate !== undefined && b.dueDate < now)
  );
}

export function countActiveBorrowings(borrowings: BorrowingRecord[]): number {
  return borrowings.filter(
    (b) =>
      b.status === "requested" ||
      b.status === "approved" ||
      b.status === "issued"
  ).length;
}

export function canBorrow(
  borrowings: BorrowingRecord[],
  now: number = Date.now()
): { allowed: boolean; reason?: string } {
  if (hasOverdueBooks(borrowings, now)) {
    return { allowed: false, reason: "You have overdue books. Please return them first." };
  }

  const active = countActiveBorrowings(borrowings);
  const returned = borrowings
    .filter((b) => b.status === "returned")
    .sort((a, b) => (b.returnedAt ?? 0) - (a.returnedAt ?? 0));
  const consecutive = calculateConsecutiveOnTime(returned);
  const limit = getBorrowingLimit(consecutive);

  if (active >= limit) {
    return {
      allowed: false,
      reason: `You can borrow up to ${limit} book${limit > 1 ? "s" : ""} at a time.`,
    };
  }

  return { allowed: true };
}

export function calculateDueDate(
  issueDate: number,
  loanDays: number = LOAN_PERIOD_DAYS
): number {
  return issueDate + loanDays * 24 * 60 * 60 * 1000;
}

export function isReturnOnTime(
  returnDate: number,
  dueDate: number
): boolean {
  return returnDate <= dueDate;
}

export function getXpForAction(action: "request" | "issued" | "on_time_return"): number {
  switch (action) {
    case "request":
      return XP_REQUEST;
    case "issued":
      return XP_ISSUED;
    case "on_time_return":
      return XP_ON_TIME_RETURN;
  }
}

export function getLevel(xp: number): { name: string; number: number } {
  if (xp >= 1000) return { name: "Library Legend", number: 5 };
  if (xp >= 500) return { name: "Library Champion", number: 4 };
  if (xp >= 250) return { name: "Avid Reader", number: 3 };
  if (xp >= 100) return { name: "Consistent Reader", number: 2 };
  return { name: "Newcomer", number: 1 };
}

export function getBadges(
  totalBorrowings: number,
  consecutiveOnTime: number
): string[] {
  const badges: string[] = [];
  if (totalBorrowings >= 1) badges.push("First Borrow");
  if (totalBorrowings >= 5) badges.push("Bookworm");
  if (totalBorrowings >= 10) badges.push("Avid Reader");
  if (totalBorrowings >= 25) badges.push("Library Regular");
  if (consecutiveOnTime >= 3) badges.push("Trustworthy");
  if (consecutiveOnTime >= 5) badges.push("Streak Master");
  if (consecutiveOnTime >= 10) badges.push("Perfect Record");
  return badges;
}

export function getPenaltyStage(
  daysOverdue: number
): "none" | "reminder_3day" | "overdue_1day" | "overdue_7day" | "overdue_14day" {
  if (daysOverdue >= 14) return "overdue_14day";
  if (daysOverdue >= 7) return "overdue_7day";
  if (daysOverdue >= 1) return "overdue_1day";
  return "none";
}

export function getDaysUntilDue(dueDate: number, now: number = Date.now()): number {
  return Math.ceil((dueDate - now) / (24 * 60 * 60 * 1000));
}

export function shouldSendReminder(
  daysUntilDue: number
): boolean {
  return daysUntilDue <= 3 && daysUntilDue > 0;
}
