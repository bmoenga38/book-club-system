export enum BorrowStatus {
  PENDING = "pending",
  APPROVED = "approved",
  ISSUED = "issued",
  RETURNED = "returned",
  OVERDUE = "overdue",
}

export enum PenaltyStage {
  NONE = "none",
  REMINDER = "reminder",
  GENTLE = "gentle",
  WARNING = "warning",
  HIGH_RISK = "high_risk",
}
