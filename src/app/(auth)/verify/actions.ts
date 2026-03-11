"use server";

import type { ActionResult } from "@/types/actions";
import { ErrorCode } from "@/types/actions";
import { verifyOtpSchema } from "./schemas";
import { verifyOtp as verifyOtpDb, checkRateLimit } from "@/lib/db/queries/otpQueries";
import { getUserByPhone, createUser } from "@/lib/db/queries/userQueries";
import { signIn } from "@/lib/auth/config";

export async function verifyOtp(
  data: {
    phone: string;
    code: string;
    name?: string;
    churchId?: string;
    mode: "login" | "register";
  }
): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = verifyOtpSchema.safeParse(data);

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

  const { phone, code, name, churchId, mode } = parsed.data;

  // Check rate limit before any OTP work
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

  // Validate registration fields BEFORE consuming OTP
  if (mode === "register" && (!name || !churchId)) {
    return {
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: "Name and church are required for registration",
      },
    };
  }

  // Verify OTP against DB
  const otpResult = await verifyOtpDb(phone, code);
  if (!otpResult.valid) {
    const errorCode =
      otpResult.reason === "Too many attempts. Please wait 15 minutes."
        ? ErrorCode.RATE_LIMITED
        : ErrorCode.VALIDATION_ERROR;

    return {
      success: false,
      error: {
        code: errorCode,
        message: otpResult.reason ?? "Invalid OTP",
      },
    };
  }

  // For registration, create user (name/churchId already validated above)
  if (mode === "register") {
    const existingUser = await getUserByPhone(phone);
    if (!existingUser) {
      await createUser({ phone, name: name!, churchId: churchId! });
    }
  }

  // Sign in via NextAuth credentials
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
        message: "Authentication failed. Please try again.",
      },
    };
  }

  return { success: true, data: { redirectTo: "/" } };
}
