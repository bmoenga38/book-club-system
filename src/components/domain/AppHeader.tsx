"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

const FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };

export function AppHeader() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!showDropdown) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  return (
    <header className="sticky top-0 z-50 w-full h-14 bg-[#1A2744] dark:bg-[#0A1A3A] shadow-md flex justify-between items-center px-4 sm:px-6 md:pl-[15.5rem]">
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Bookclub" className="w-8 h-8 rounded-md" />
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
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((v) => !v)}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#ffdf9f]/30 dark:border-[#F5C400]/30 bg-[#04122e] dark:bg-[#163050] flex items-center justify-center cursor-pointer hover:border-[#ffdf9f]/60 dark:hover:border-[#F5C400]/60 transition-colors"
            >
              <span className="text-[#ffdf9f] dark:text-[#F5C400] text-xs font-bold">
                {session.user.name[0]}
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-[#0F2444] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 overflow-hidden z-50">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#c62828] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
