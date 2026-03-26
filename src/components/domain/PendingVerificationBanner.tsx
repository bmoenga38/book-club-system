"use client";

import { useSession } from "next-auth/react";
import { AlertCircle } from "lucide-react";

export function PendingVerificationBanner() {
  const { data: session } = useSession();

  if (session?.user?.status !== "pending_verification") return null;

  return (
    <div className="flex items-center gap-2 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <p>
        Your account is pending verification by the church evangelist. You will
        be notified once approved.
      </p>
    </div>
  );
}
