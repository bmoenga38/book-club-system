import "server-only";

import { db } from "@/lib/db";
import { otpCodes } from "@/lib/db/schema";
import { eq, desc, gt, and } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import crypto from "crypto";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_MAX_ATTEMPTS = 3;
const OTP_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const OTP_CODE_LENGTH = 6;
const BCRYPT_ROUNDS = 10;

export async function createOtp(phone: string): Promise<string> {
  const code = crypto
    .randomInt(0, 10 ** OTP_CODE_LENGTH)
    .toString()
    .padStart(OTP_CODE_LENGTH, "0");

  const hashedCode = await hash(code, BCRYPT_ROUNDS);

  await db.insert(otpCodes).values({
    phone,
    hashedCode,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    attempts: 0,
  });

  return code;
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ valid: boolean; reason?: string }> {
  const now = new Date();

  const records = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.phone, phone), gt(otpCodes.expiresAt, now)))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  const record = records[0];

  if (!record) {
    return { valid: false, reason: "OTP expired or not found" };
  }

  if (record.lockedUntil && record.lockedUntil > now) {
    return { valid: false, reason: "Too many attempts. Please wait 15 minutes." };
  }

  const isMatch = await compare(code, record.hashedCode);

  if (!isMatch) {
    const newAttempts = record.attempts + 1;

    if (newAttempts >= OTP_MAX_ATTEMPTS) {
      await db
        .update(otpCodes)
        .set({
          attempts: newAttempts,
          lockedUntil: new Date(Date.now() + OTP_LOCKOUT_MS),
        })
        .where(eq(otpCodes.id, record.id));
      return { valid: false, reason: "Too many attempts. Please wait 15 minutes." };
    }

    await db
      .update(otpCodes)
      .set({ attempts: newAttempts })
      .where(eq(otpCodes.id, record.id));
    return { valid: false, reason: "Invalid OTP" };
  }

  // Success — invalidate this OTP
  await db
    .update(otpCodes)
    .set({ expiresAt: now })
    .where(eq(otpCodes.id, record.id));

  return { valid: true };
}

export async function checkRateLimit(
  phone: string
): Promise<{ locked: boolean; reason?: string }> {
  const now = new Date();

  const records = await db
    .select()
    .from(otpCodes)
    .where(eq(otpCodes.phone, phone))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  const record = records[0];

  if (!record) {
    return { locked: false };
  }

  if (record.lockedUntil && record.lockedUntil > now) {
    return { locked: true, reason: "Too many attempts. Please wait 15 minutes." };
  }

  return { locked: false };
}
