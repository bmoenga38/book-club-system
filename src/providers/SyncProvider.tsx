"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useOnlineStatus } from "@/lib/offline/useOnlineStatus";
import {
  getPendingActions,
  markSynced,
  clearSyncedActions,
  getQueueCount,
} from "@/lib/offline/offlineQueue";
import { toast } from "sonner";

interface SyncContextValue {
  isOnline: boolean;
  queueCount: number;
  syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue>({
  isOnline: true,
  queueCount: 0,
  syncNow: async () => {},
});

export function SyncProvider({ children }: { children: ReactNode }) {
  const isOnline = useOnlineStatus();
  const [queueCount, setQueueCount] = useState(0);
  const requestBorrow = useMutation(api.borrowings.request);

  const refreshCount = useCallback(async () => {
    try {
      const count = await getQueueCount();
      setQueueCount(count);
    } catch {
      // IndexedDB may not be available in SSR
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!isOnline) return;

    const pending = await getPendingActions();
    if (pending.length === 0) return;

    let synced = 0;
    for (const action of pending) {
      try {
        if (action.type === "borrow_request") {
          await requestBorrow({
            bookId: action.payload.bookId as Id<"books">,
            memberId: action.payload.memberId as Id<"users">,
            churchId: action.payload.churchId as Id<"churches">,
          });
        }
        await markSynced(action.id);
        synced++;
      } catch {
        // If one fails, continue with others
      }
    }

    await clearSyncedActions();
    await refreshCount();

    if (synced > 0) {
      toast.success(`Synced ${synced} offline request${synced > 1 ? "s" : ""}`);
    }
  }, [isOnline, requestBorrow, refreshCount]);

  // Refresh count on mount
  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      syncNow();
    }
  }, [isOnline, syncNow]);

  return (
    <SyncContext.Provider value={{ isOnline, queueCount, syncNow }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext() {
  return useContext(SyncContext);
}
