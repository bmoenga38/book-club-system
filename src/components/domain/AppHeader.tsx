"use client";

import { useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

const FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };

export function AppHeader() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full h-14 bg-[#1A2744] dark:bg-[#0A1A3A] shadow-md flex justify-between items-center px-4 sm:px-6">
      <div className="flex items-center gap-2.5">
        <span className="material-symbols-outlined text-[#ffdf9f] dark:text-[#F5C400] text-xl">menu_book</span>
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm leading-tight tracking-tight" style={FONT}>
            The Sacred Archive
          </span>
          <span className="text-[#ffdf9f] dark:text-[#F5C400] text-[9px] uppercase font-bold tracking-[0.12em]">
            Blessed Hope
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {session?.user?.name && (
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#ffdf9f]/30 dark:border-[#F5C400]/30 bg-[#04122e] dark:bg-[#163050] flex items-center justify-center">
            <span className="text-[#ffdf9f] dark:text-[#F5C400] text-xs font-bold">
              {session.user.name[0]}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
