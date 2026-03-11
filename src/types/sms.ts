export enum SmsType {
  OTP = "otp",
  APPROVAL = "approval",
  DECLINE = "decline",
  REMINDER = "reminder",
  WARNING = "warning",
  HIGH_RISK = "high_risk",
}

export enum SmsStatus {
  QUEUED = "queued",
  SENT = "sent",
  FAILED = "failed",
}
