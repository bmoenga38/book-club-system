import "server-only";

import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";
import { hash, compare } from "bcryptjs";
import crypto from "crypto";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_CODE_LENGTH = 6;
const BCRYPT_ROUNDS = 10;

export async function createOtp(phone: string): Promise<string> {
  const code = crypto
    .randomInt(0, 10 ** OTP_CODE_LENGTH)
    .toString()
    .padStart(OTP_CODE_LENGTH, "0");

  const hashedCode = await hash(code, BCRYPT_ROUNDS);

  const client = getConvexClient();
  await client.mutation(api.otp.create, {
    phone,
    hashedCode,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });

  return code;
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ valid: boolean; reason?: string }> {
  const now = Date.now();
  const client = getConvexClient();

  const record = await client.query(api.otp.getLatestValid, { phone, now });

  if (!record) {
    return { valid: false, reason: "OTP expired or not found" };
  }

  if (record.lockedUntil && record.lockedUntil > now) {
    return { valid: false, reason: "Too many attempts. Please wait 15 minutes." };
  }

  const isMatch = await compare(code, record.hashedCode);

  if (!isMatch) {
    const newAttempts = record.attempts + 1;
    await client.mutation(api.otp.incrementAttempts, {
      id: record._id,
      newAttempts,
    });

    if (newAttempts >= 3) {
      return { valid: false, reason: "Too many attempts. Please wait 15 minutes." };
    }
    return { valid: false, reason: "Invalid OTP" };
  }

  // Success — invalidate this OTP
  await client.mutation(api.otp.invalidate, { id: record._id, now });

  return { valid: true };
}

export async function checkRateLimit(
  phone: string
): Promise<{ locked: boolean; reason?: string }> {
  const now = Date.now();
  const client = getConvexClient();

  const record = await client.query(api.otp.getLatest, { phone });

  if (!record) {
    return { locked: false };
  }

  if (record.lockedUntil && record.lockedUntil > now) {
    return { locked: true, reason: "Too many attempts. Please wait 15 minutes." };
  }

  return { locked: false };
}
