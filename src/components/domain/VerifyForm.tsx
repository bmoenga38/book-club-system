"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyOtpSchema, type VerifyOtpInput } from "@/app/(auth)/verify/schemas";
import { verifyOtp } from "@/app/(auth)/verify/actions";
import { sendOtp } from "@/app/(auth)/login/actions";

interface VerifyFormProps {
  phone: string;
  mode: "login" | "register";
  defaultChurchId: string;
}

export function VerifyForm({ phone, mode, defaultChurchId }: VerifyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      phone,
      mode,
      code: "",
      churchId: defaultChurchId || undefined,
    },
  });

  const onSubmit = async (data: VerifyOtpInput) => {
    setIsLoading(true);
    try {
      const result = await verifyOtp(data);
      if (result.success) {
        router.push(result.data.redirectTo);
        router.refresh();
      } else {
        toast.error(result.error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const result = await sendOtp({ phone });
      if (result.success) {
        toast.success("New OTP sent");
      } else {
        toast.error(result.error.message);
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("phone")} />
      <input type="hidden" {...register("mode")} />
      {defaultChurchId && (
        <input type="hidden" {...register("churchId")} />
      )}

      {mode === "register" && (
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Your full name"
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-destructive" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="code">OTP Code</Label>
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          autoComplete="one-time-code"
          aria-describedby={errors.code ? "code-error" : undefined}
          {...register("code")}
        />
        {errors.code && (
          <p id="code-error" className="text-sm text-destructive" role="alert">
            {errors.code.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full min-h-11"
        disabled={isLoading}
      >
        {isLoading ? "Verifying..." : "Verify"}
      </Button>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          disabled={isResending}
          onClick={handleResend}
        >
          {isResending ? "Sending..." : "Resend OTP"}
        </Button>
      </div>
    </form>
  );
}
