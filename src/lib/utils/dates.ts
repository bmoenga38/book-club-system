/**
 * Date utilities for East African Time (EAT/UTC+3) formatting and due date calculation.
 * No external date libraries — uses Intl.DateTimeFormat + raw Date arithmetic per architecture.
 */

const EAT_FORMATTER = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeZone: "Africa/Nairobi",
});

const EAT_DATETIME_FORMATTER = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Nairobi",
});

export function formatDateEAT(date: Date): string {
  return EAT_FORMATTER.format(date);
}

export function formatDateTimeEAT(date: Date): string {
  return EAT_DATETIME_FORMATTER.format(date);
}

export function calculateDueDate(issueDate: Date, loanPeriodDays: number = 14): Date {
  return new Date(issueDate.getTime() + loanPeriodDays * 86400000);
}

export function daysUntilDue(dueDate: Date): number {
  const now = new Date();
  return Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);
}

export function isOverdue(dueDate: Date): boolean {
  return daysUntilDue(dueDate) < 0;
}
