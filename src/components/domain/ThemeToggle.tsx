"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors active:scale-90"
      aria-label="Toggle theme"
    >
      <span className="material-symbols-outlined text-[#ffdf9f] dark:text-[#F5C400] text-lg">
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
