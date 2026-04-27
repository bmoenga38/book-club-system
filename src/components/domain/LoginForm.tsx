"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { sendOtpSchema, type SendOtpInput } from "@/app/(auth)/login/schemas";
import { sendOtp, quickLogin } from "@/app/(auth)/login/actions";
import { formatError } from "@/lib/errors/formatError";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"otp" | "quick" | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SendOtpInput>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { phone: "+254" },
  });

  const onSendOtp = async (data: SendOtpInput) => {
    setIsLoading(true);
    setLoadingAction("otp");
    try {
      const result = await sendOtp(data);
      if (result.success) {
        const mode = result.data.isExistingUser ? "login" : "register";
        router.push(`/verify?phone=${encodeURIComponent(data.phone)}&mode=${mode}`);
      } else {
        toast.error(formatError(result.error.message));
      }
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const onQuickLogin = async () => {
    const phone = getValues("phone");
    const parsed = sendOtpSchema.safeParse({ phone });
    if (!parsed.success) {
      toast.error("Enter a valid Kenyan phone number (+254...)");
      return;
    }
    setIsLoading(true);
    setLoadingAction("quick");
    try {
      const result = await quickLogin({ phone });
      if (result.success) {
        router.push(result.data.redirectTo);
        router.refresh();
      } else {
        toast.error(formatError(result.error.message));
      }
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSendOtp)} className="w-full space-y-5">
      {/* Phone Input Group */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#45464d]/60">
          <span className="material-symbols-outlined text-[20px]">phone_iphone</span>
        </div>
        <input
          type="tel"
          placeholder="+254712345678"
          className="w-full h-[52px] pl-12 pr-4 bg-[#e0e3e6]/30 border border-[#c5c6ce] rounded-xl text-[#191c1e] placeholder:text-[#45464d]/40 focus:outline-none focus:ring-2 focus:ring-[#795900]/20 focus:border-[#795900] transition-all"
          aria-describedby={errors.phone ? "phone-error" : undefined}
          {...register("phone")}
        />
      </div>
      {errors.phone && (
        <p id="phone-error" className="text-sm text-red-600 ml-1" role="alert">
          {errors.phone.message}
        </p>
      )}

      {/* Log In Button */}
      <button
        type="button"
        onClick={onQuickLogin}
        disabled={isLoading}
        className="w-full h-[52px] bg-[#ffdf9f] hover:bg-[#eec058] text-[#261a00] font-bold text-base rounded-xl flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_4px_12px_rgba(121,89,0,0.15)]"
      >
        {loadingAction === "quick" ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#261a00] border-t-transparent" />
            Signing in...
          </span>
        ) : (
          "Log In"
        )}
      </button>

      {/* Divider */}
      <div className="w-full flex items-center my-8">
        <div className="flex-grow border-t border-[#c5c6ce]/30" />
        <span className="px-4 text-[#45464d] text-[12px] font-medium uppercase tracking-widest">
          New member?
        </span>
        <div className="flex-grow border-t border-[#c5c6ce]/30" />
      </div>

      {/* Register Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-[52px] border-2 border-dashed border-[#c5c6ce] text-[#0d1b37] font-semibold text-base rounded-xl hover:bg-[#f2f4f7] transition-colors flex items-center justify-center disabled:opacity-50 active:scale-[0.98]"
      >
        {loadingAction === "otp" ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0d1b37] border-t-transparent" />
            Sending OTP...
          </span>
        ) : (
          "Register Account"
        )}
      </button>
    </form>
  );
}
