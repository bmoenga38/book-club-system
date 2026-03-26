import { z } from "zod";

const phoneRegex = /^\+254\d{9}$/;

export const verifyOtpSchema = z.object({
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  code: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  churchId: z.string().min(1, "Church is required").optional(),
  mode: z.enum(["login", "register"]),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
