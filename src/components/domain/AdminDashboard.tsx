"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";

interface AdminDashboardProps { churchId: string; }

const FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function statusLabel(status: string) {
  switch (status) {
    case "requested": return { text: "Requested", color: "bg-[#ffdf9f] text-[#261a00]" };
    case "approved": return { text: "Approved", color: "bg-[#d8e2fe] text-[#0d1b37]" };
    case "issued": return { text: "Issued", color: "bg-[#c8e6c9] text-[#1b5e20]" };
    case "returned": return { text: "Returned", color: "bg-[#e0e3e6] text-[#45464d]" };
    case "overdue": return { text: "Overdue", color: "bg-[#ffdad6] text-[#93000a]" };
    case "declined": return { text: "Declined", color: "bg-[#ffdad6] text-[#93000a]" };
    default: return { text: status, color: "bg-muted text-muted-foreground" };
  }
}

export function AdminDashboard({ churchId }: AdminDashboardProps) {
  const pending = useQuery(api.borrowings.listPendingByChurch, { churchId: churchId as Id<"churches"> });
  const active = useQuery(api.borrowings.listActiveByChurch, { churchId: churchId as Id<"churches"> });
  const overdue = useQuery(api.borrowings.listOverdueByChurch, { churchId: churchId as Id<"churches"> });
  const pendingMembers = useQuery(api.users.listPendingVerification, { churchId: churchId as Id<"churches"> });
  const recentActivity = useQuery(api.borrowings.listRecentActivity, { churchId: churchId as Id<"churches">, limit: 5 });
  const loading = pending === undefined || active === undefined || overdue === undefined;

  return (
    <div className="bg-background min-h-screen pb-24">
      <main className="px-4 sm:px-6 py-5 space-y-7">
        {/* Welcome Section */}
        <section>
          <p className="font-medium text-[10px] uppercase tracking-[0.12em] text-[#795900] dark:text-[#F5C400] mb-1">Sanctuary Admin</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight" style={FONT}>Dashboard</h2>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4">
          <Link href="/admin/requests">
            <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-sm bg-gradient-to-br from-[#1a2744] to-[#04122e] text-white active:scale-[0.95] transition-transform border border-white/5">
              <span className="material-symbols-outlined absolute top-2 right-2 text-5xl opacity-15">hourglass_empty</span>
              <div className="relative z-10">
                <p className="text-[9px] font-medium uppercase tracking-wider opacity-80">Pending Requests</p>
                <p className="text-3xl sm:text-4xl font-bold mt-1">{loading ? "-" : pending?.length ?? 0}</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/active">
            <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-sm bg-gradient-to-br from-[#2e7d32] to-[#1b5e20] text-white active:scale-[0.95] transition-transform border border-white/5">
              <span className="material-symbols-outlined absolute top-2 right-2 text-5xl opacity-15">sync</span>
              <div className="relative z-10">
                <p className="text-[9px] font-medium uppercase tracking-wider opacity-80">Active Loans</p>
                <p className="text-3xl sm:text-4xl font-bold mt-1">{loading ? "-" : active?.length ?? 0}</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/overdue">
            <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-sm bg-gradient-to-br from-[#c62828] to-[#b71c1c] text-white active:scale-[0.95] transition-transform border border-white/5">
              <span className="material-symbols-outlined absolute top-2 right-2 text-5xl opacity-15">priority_high</span>
              <div className="relative z-10">
                <p className="text-[9px] font-medium uppercase tracking-wider opacity-80">Overdue</p>
                <p className="text-3xl sm:text-4xl font-bold mt-1">{loading ? "-" : overdue?.length ?? 0}</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/members">
            <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-sm bg-gradient-to-br from-[#ff8f00] to-[#ef6c00] text-white active:scale-[0.95] transition-transform border border-white/5">
              <span className="material-symbols-outlined absolute top-2 right-2 text-5xl opacity-15">person_add</span>
              <div className="relative z-10">
                <p className="text-[9px] font-medium uppercase tracking-wider opacity-80">New Members</p>
                <p className="text-3xl sm:text-4xl font-bold mt-1">{pendingMembers === undefined ? "-" : pendingMembers.length}</p>
              </div>
            </div>
          </Link>
        </section>

        {/* Quick Actions */}
        <section className="space-y-3">
          <header className="flex items-center gap-3">
            <h3 className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground shrink-0">Quick Actions</h3>
            <div className="h-px flex-1 bg-border" />
          </header>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/admin/issue", icon: "add_shopping_cart", label: "Issue Book" },
              { href: "/admin/returns", icon: "assignment_return", label: "Return Book" },
              { href: "/admin/reports", icon: "assessment", label: "Reports" },
              { href: "/admin/members", icon: "group", label: "Members" },
            ].map((a) => (
              <Link key={a.href} href={a.href}>
                <div className="flex flex-col items-center justify-center p-5 bg-card border-2 border-dashed border-[#1a2744]/20 dark:border-[#F5C400]/20 rounded-2xl hover:bg-muted dark:hover:bg-[#163050] transition-all active:scale-95 group">
                  <span className="material-symbols-outlined text-[#1a2744] dark:text-[#F5C400] text-2xl mb-2 group-hover:scale-110 transition-transform">{a.icon}</span>
                  <span className="text-xs font-semibold text-[#1a2744] dark:text-[#F5C400]">{a.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-3">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground" style={FONT}>Recent Archive Activity</h3>
            <Link href="/admin/active" className="text-[10px] font-bold uppercase tracking-wider text-[#795900] dark:text-[#F5C400]">
              View All
            </Link>
          </header>

          <div className="bg-muted dark:bg-[#0A1A3A] rounded-2xl p-3 space-y-2">
            {recentActivity === undefined ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 bg-card p-3 rounded-xl animate-pulse">
                    <div className="w-9 h-12 bg-muted rounded shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-32 bg-muted rounded-full" />
                      <div className="h-2 w-20 bg-muted rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="flex items-center gap-4 bg-card p-4 rounded-xl">
                <div className="w-10 h-14 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-muted-foreground text-sm">menu_book</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">No activity yet</p>
                  <p className="text-xs text-muted-foreground">Book transactions will appear here</p>
                </div>
              </div>
            ) : (
              recentActivity.map((item) => {
                const st = statusLabel(item.status);
                const ts = item.returnedAt ?? item.issuedAt ?? item.createdAt;
                return (
                  <div key={item._id} className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border/50">
                    <div className="w-9 h-12 bg-gradient-to-br from-[#1a2744] to-[#2a4582] rounded-lg shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white/30 text-sm">menu_book</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.bookTitle}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.status === "returned" ? "Returned by" : item.status === "issued" ? "Issued to" : "Requested by"} {item.memberName} · {timeAgo(ts)}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${st.color}`}>
                      {st.text}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
