import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const SMS_API_URL = "https://api.smsleopard.com/v1/sms/send";

export const sendSms = internalAction({
  args: {
    phone: v.string(),
    message: v.string(),
  },
  handler: async (_ctx, args) => {
    const accessToken = process.env.SMSLEOPARD_ACCESS_TOKEN;
    const senderId = process.env.SMSLEOPARD_SENDER_ID;

    if (!accessToken || !senderId) {
      console.error("SMS: SMSLEOPARD_ACCESS_TOKEN or SMSLEOPARD_SENDER_ID not set");
      return { success: false, error: "Missing SMS config" };
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
          destination: [{ number: args.phone }],
          message: args.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("SMS send failed:", response.status, errorData);
        return { success: false, error: `SMS API error: ${response.status}` };
      }

      const data = await response.json();
      return { success: true, messageId: data.id ?? "sent" };
    } catch (error) {
      console.error("SMS send error:", error);
      return { success: false, error: "Network error sending SMS" };
    }
  },
});
