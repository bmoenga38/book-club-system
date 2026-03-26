"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils/cn";
import { UserRole } from "@/types/auth";

const memberLinks = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/books", label: "Books", icon: "library_books" },
  { href: "/borrowings", label: "Loans", icon: "import_contacts" },
  { href: "/profile", label: "Profile", icon: "person" },
];

const adminLinks = [
  { href: "/admin", label: "Admin", icon: "admin_panel_settings" },
];

export function AppNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin =
    session?.user?.role === UserRole.CHURCH_ADMIN ||
    session?.user?.role === UserRole.SUPER_ADMIN ||
    session?.user?.role === UserRole.ASSISTANT_LIBRARIAN;

  const links = isAdmin ? [...memberLinks, ...adminLinks] : memberLinks;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 sm:px-4 pb-[env(safe-area-inset-bottom,8px)] pt-2 bg-white/90 dark:bg-[#0F2444]/90 backdrop-blur-xl shadow-[0px_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0px_-4px_20px_rgba(0,0,0,0.3)] border-t border-border/50">
      {links.map(({ href, label, icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center min-w-[48px] px-3 py-1.5 transition-all duration-150 active:scale-90 rounded-xl",
              active
                ? "bg-[#ffdf9f] dark:bg-[#F5C400] text-[#261a00] dark:text-[#051029]"
                : "text-[#1A2744] dark:text-[#A4A4A4] hover:text-[#795900] dark:hover:text-[#F5C400]"
            )}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.04rem] mt-0.5">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
