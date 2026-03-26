import "server-only";

import type { ActionResult } from "@/types/actions";
import { ErrorCode } from "@/types/actions";

const SMS_API_URL = "https://api.smsleopard.com/v1/sms/send";

export async function sendSms(
  phone: string,
  message: string
): Promise<ActionResult<{ messageId: string }>> {
  const accessToken = process.env.SMSLEOPARD_ACCESS_TOKEN;
  const senderId = process.env.SMSLEOPARD_SENDER_ID;

  if (!accessToken || !senderId) {
    return {
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: "SMS service is not configured",
      },
    };
  }

  try {
    const response = await fetch(SMS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${accessToken}`,
      },
      body: JSON.stringify({
        source: senderId,
        destination: [{ number: phone }],
        message,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Failed to send SMS. Please try again.",
        },
      };
    }

    const data = await response.json();
    return { success: true, data: { messageId: data.id ?? "sent" } };
  } catch {
    return {
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: "Failed to send SMS. Please try again.",
      },
    };
  }
}

export async function sendOtp(
  phone: string,
  code: string
): Promise<ActionResult<{ messageId: string }>> {
  const message = `Your Book Club code is ${code}. Expires in 5 minutes.`;
  return sendSms(phone, message);
}
