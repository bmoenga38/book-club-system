import { z } from "zod";

const phoneRegex = /^\+254\d{9}$/;

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .regex(phoneRegex, "Enter a valid Kenyan phone number (+254...)"),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
