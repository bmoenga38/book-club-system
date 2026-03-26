"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";

interface AdminDashboardProps { churchId: string; }

const FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };

export function AdminDashboard({ churchId }: AdminDashboardProps) {
  const pending = useQuery(api.borrowings.listPendingByChurch, { churchId: churchId as Id<"churches"> });
  const active = useQuery(api.borrowings.listActiveByChurch, { churchId: churchId as Id<"churches"> });
  const overdue = useQuery(api.borrowings.listOverdueByChurch, { churchId: churchId as Id<"churches"> });
  const pendingMembers = useQuery(api.users.listPendingVerification, { churchId: churchId as Id<"churches"> });
  const loading = pending === undefined || active === undefined || overdue === undefined;

  return (
    <div className="bg-[#f7f9fc] min-h-screen pb-24">
      {/* Top App Bar */}
      <header className="bg-[#f7f9fc] flex justify-between items-center px-6 py-4 w-full sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#1a2744]">menu_book</span>
          <h1 className="font-bold text-2xl tracking-tight text-[#1a2744]" style={FONT}>The Sacred Archive</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#1a2744] flex items-center justify-center overflow-hidden">
          <span className="material-symbols-outlined text-[#ffdf9f]">person</span>
        </div>
      </header>

      <main className="px-6 py-4 space-y-8">
        {/* Welcome Section */}
        <section>
          <p className="font-medium text-xs uppercase tracking-widest text-[#795900] mb-1">Sanctuary Admin</p>
          <h2 className="text-3xl font-bold text-[#0d1b37] tracking-tight" style={FONT}>Dashboard</h2>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          {/* Pending Requests */}
          <Link href="/admin/requests">
            <div className="relative overflow-hidden rounded-[16px] p-5 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] bg-gradient-to-br from-[#1a2744] to-[#04122e] text-white active:scale-[0.95] transition-transform">
              <span className="material-symbols-outlined absolute top-2 right-2 text-6xl opacity-20">hourglass_empty</span>
              <div className="relative z-10">
                <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">Pending Requests</p>
                <p className="text-4xl font-bold mt-2">{loading ? "-" : pending?.length ?? 0}</p>
              </div>
            </div>
          </Link>

          {/* Active Loans */}
          <Link href="/admin/active">
            <div className="relative overflow-hidden rounded-[16px] p-5 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] bg-gradient-to-br from-[#2e7d32] to-[#1b5e20] text-white active:scale-[0.95] transition-transform">
              <span className="material-symbols-outlined absolute top-2 right-2 text-6xl opacity-20">sync</span>
              <div className="relative z-10">
                <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">Active Loans</p>
                <p className="text-4xl font-bold mt-2">{loading ? "-" : active?.length ?? 0}</p>
              </div>
            </div>
          </Link>

          {/* Overdue */}
          <Link href="/admin/overdue">
            <div className="relative overflow-hidden rounded-[16px] p-5 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] bg-gradient-to-br from-[#c62828] to-[#b71c1c] text-white active:scale-[0.95] transition-transform">
              <span className="material-symbols-outlined absolute top-2 right-2 text-6xl opacity-20">priority_high</span>
              <div className="relative z-10">
                <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">Overdue</p>
                <p className="text-4xl font-bold mt-2">{loading ? "-" : overdue?.length ?? 0}</p>
              </div>
            </div>
          </Link>

          {/* New Members */}
          <Link href="/admin/members">
            <div className="relative overflow-hidden rounded-[16px] p-5 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] bg-gradient-to-br from-[#ff8f00] to-[#ef6c00] text-white active:scale-[0.95] transition-transform">
              <span className="material-symbols-outlined absolute top-2 right-2 text-6xl opacity-20">person_add</span>
              <div className="relative z-10">
                <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">New Members</p>
                <p className="text-4xl font-bold mt-2">{pendingMembers === undefined ? "-" : pendingMembers.length}</p>
              </div>
            </div>
          </Link>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <header className="flex justify-between items-center">
            <h3 className="text-[10px] font-medium uppercase tracking-widest text-[#75777e]">Quick Actions</h3>
            <div className="h-[1px] flex-1 ml-4 bg-[#e0e3e6]" />
          </header>
          <div className="grid grid-cols-2 gap-4">
            {[
              { href: "/admin/issue", icon: "add_shopping_cart", label: "Issue Book" },
              { href: "/admin/returns", icon: "assignment_return", label: "Return Book" },
              { href: "/admin/reports", icon: "assessment", label: "Reports" },
              { href: "/admin/members", icon: "group", label: "Members" },
            ].map((a) => (
              <Link key={a.href} href={a.href}>
                <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-[#1a2744]/30 rounded-[14px] hover:bg-[#f2f4f7] transition-all active:scale-95 group">
                  <span className="material-symbols-outlined text-[#1a2744] text-3xl mb-3 group-hover:scale-110 transition-transform">{a.icon}</span>
                  <span className="text-sm font-semibold text-[#1a2744]">{a.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="bg-[#f2f4f7] rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0d1b37]" style={FONT}>Recent Archive Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl">
              <div className="w-10 h-14 bg-[#e0e3e6] rounded flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#75777e] text-sm">menu_book</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#04122e]">Activity logs</p>
                <p className="text-xs text-[#75777e]">Recent book transactions appear here</p>
              </div>
              <span className="material-symbols-outlined text-[#795900] text-sm">arrow_forward_ios</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
