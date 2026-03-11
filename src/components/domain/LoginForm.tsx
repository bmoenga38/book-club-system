"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtpSchema, type SendOtpInput } from "@/app/(auth)/login/schemas";
import { sendOtp } from "@/app/(auth)/login/actions";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SendOtpInput>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { phone: "+254" },
  });

  const onSubmit = async (data: SendOtpInput) => {
    setIsLoading(true);
    try {
      const result = await sendOtp(data);
      if (result.success) {
        const mode = result.data.isExistingUser ? "login" : "register";
        router.push(
          `/verify?phone=${encodeURIComponent(data.phone)}&mode=${mode}`
        );
      } else {
        toast.error(result.error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+254712345678"
          aria-describedby={errors.phone ? "phone-error" : undefined}
          {...register("phone")}
        />
        {errors.phone && (
          <p id="phone-error" className="text-sm text-destructive" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full min-h-11"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send OTP"}
      </Button>
    </form>
  );
}
