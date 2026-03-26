"use client";

import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 text-sm text-orange-800 dark:bg-orange-900/20 dark:text-orange-200">
      <WifiOff className="h-4 w-4 shrink-0" />
      <p>You are offline. You can browse the catalog but some actions require a connection.</p>
    </div>
  );
}
