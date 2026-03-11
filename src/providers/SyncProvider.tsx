"use client";

import { createContext, useContext, type ReactNode } from "react";

interface SyncContextValue {
  isOnline: boolean;
  queueCount: number;
}

const SyncContext = createContext<SyncContextValue>({
  isOnline: true,
  queueCount: 0,
});

export function SyncProvider({ children }: { children: ReactNode }) {
  // IMPORTANT: Full implementation in Epic 8 (PWA & Offline)
  // This is a shell provider to wire into root layout now
  return (
    <SyncContext.Provider value={{ isOnline: true, queueCount: 0 }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext() {
  return useContext(SyncContext);
}
