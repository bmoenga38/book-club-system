"use server";

import type { ActionResult } from "@/types/actions";
import { ErrorCode } from "@/types/actions";
import { sendOtpSchema } from "./schemas";
import { checkRateLimit, createOtp } from "@/lib/db/queries/otpQueries";
import { getUserByPhone } from "@/lib/db/queries/userQueries";
import { sendOtp as sendOtpSms } from "@/lib/sms/service";
import { signIn } from "@/lib/auth/config";
import { checkLoginRateLimit, resetLoginRateLimit } from "@/lib/auth/rateLimit";

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

  // IP-level rate limit (in-memory, 5 attempts per 15 min)
  const ipLimit = checkLoginRateLimit(`otp:${phone}`);
  if (!ipLimit.allowed) {
    return {
      success: false,
      error: {
        code: ErrorCode.RATE_LIMITED,
        message: ipLimit.message ?? "Too many attempts. Please wait.",
      },
    };
  }

  // Convex-level rate limit (persistent, 3 OTP attempts per code)
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

// Quick login for returning users — no OTP needed
export async function quickLogin(
  data: { phone: string }
): Promise<ActionResult<{ redirectTo: string }>> {
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

  // Rate limit quick login (5 attempts per 15 min per phone)
  const limit = checkLoginRateLimit(`quick:${phone}`);
  if (!limit.allowed) {
    return {
      success: false,
      error: {
        code: ErrorCode.RATE_LIMITED,
        message: limit.message ?? "Too many login attempts. Please wait.",
      },
    };
  }

  // Check if user exists
  const existingUser = await getUserByPhone(phone);
  if (!existingUser) {
    return {
      success: false,
      error: {
        code: ErrorCode.NOT_FOUND,
        message: "No account found with this number. Please register first using OTP.",
      },
    };
  }

  // Sign in directly
  try {
    await signIn("credentials", {
      phone,
      redirect: false,
    });
  } catch {
    return {
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: "Login failed. Please try again.",
      },
    };
  }

  // Reset rate limit on successful login
  resetLoginRateLimit(`quick:${phone}`);

  return { success: true, data: { redirectTo: "/" } };
}
