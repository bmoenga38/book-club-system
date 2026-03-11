"use server";

import type { ActionResult } from "@/types/actions";
import { ErrorCode } from "@/types/actions";
import { sendOtpSchema } from "./schemas";
import { checkRateLimit, createOtp } from "@/lib/db/queries/otpQueries";
import { getUserByPhone } from "@/lib/db/queries/userQueries";
import { sendOtp as sendOtpSms } from "@/lib/sms/service";

export async function sendOtp(
  data: { phone: string }
): Promise<ActionResult<{ isExistingUser: boolean }>> {
  const parsed = sendOtpSchema.safeParse(data);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: firstError?.message ?? "Invalid input",
        field: firstError?.path[0]?.toString(),
      },
    };
  }

  const { phone } = parsed.data;

  // Check rate limit
  const rateCheck = await checkRateLimit(phone);
  if (rateCheck.locked) {
    return {
      success: false,
      error: {
        code: ErrorCode.RATE_LIMITED,
        message: rateCheck.reason ?? "Too many attempts. Please wait 15 minutes.",
      },
    };
  }

  // Check if user already exists
  const existingUser = await getUserByPhone(phone);
  const isExistingUser = !!existingUser;

  // Generate and store OTP
  const code = await createOtp(phone);

  // Send SMS
  const smsResult = await sendOtpSms(phone, code);
  if (!smsResult.success) {
    return {
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: "Failed to send OTP. Please try again.",
      },
    };
  }

  return { success: true, data: { isExistingUser } };
}
