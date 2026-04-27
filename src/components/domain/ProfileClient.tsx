"use client";

import { useQuery } from "convex/react";
import { signOut } from "next-auth/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";

interface ProfileClientProps { userId: string; churchId: string; }

const FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };

export function ProfileClient({ userId, churchId }: ProfileClientProps) {
  const profile = useQuery(api.users.getProfile, { id: userId as Id<"users"> });
  const leaderboard = useQuery(api.users.getLeaderboard, { churchId: churchId as Id<"churches">, limit: 5 });

  if (profile === undefined) return (
    <div className="space-y-4 px-6 pt-6">
      {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-[#e0e3e6] dark:bg-white/10 animate-pulse" />)}
    </div>
  );
  if (!profile) return <p className="text-[#45464d] dark:text-gray-400 text-center py-12">Profile not found</p>;

  const xpPct = profile.nextLevelXp ? Math.min(100, Math.round((profile.totalXp / profile.nextLevelXp) * 100)) : 100;
  const rank = leaderboard?.findIndex(l => l._id === userId);
  const rankLabel = rank !== undefined && rank >= 0 ? `#${rank + 1}` : "-";

  return (
    <div className="bg-[#f7f9fc] dark:bg-[#051029] min-h-screen pb-32">
      {/* Top App Bar */}
      <header className="bg-[#f7f9fc] dark:bg-[#051029] flex items-center justify-between px-6 py-4 w-full sticky top-0 z-50 transition-colors">
        <div className="flex items-center gap-4">
          <Link href="/">
            <span className="material-symbols-outlined text-[#1a2744] dark:text-white scale-95 active:opacity-80 transition-transform cursor-pointer">arrow_back</span>
          </Link>
          <h1 className="font-bold text-2xl text-[#0d1b37] dark:text-white" style={FONT}>The Sacred Archive</h1>
        </div>
        <div className="flex flex-col items-end">
          <span className="uppercase tracking-widest text-[0.75rem] font-medium text-[#795900] dark:text-[#F5C400]">Profile</span>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6 max-w-md mx-auto">
        {/* User Identity Card */}
        <section className="bg-white dark:bg-[#0F2444] rounded-xl p-6 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] dark:shadow-none dark:border dark:border-white/10 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-[#1a2744] dark:bg-[#0A1A3A] flex items-center justify-center overflow-hidden border-2 border-[#ffdf9f] dark:border-[#F5C400]">
            <span className="text-[#ffdf9f] dark:text-[#F5C400] text-2xl font-bold" style={FONT}>{profile.name[0]}</span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-xl text-[#0d1b37] dark:text-white" style={FONT}>{profile.name}</h2>
            <p className="text-sm text-[#45464d] dark:text-gray-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">church</span>
              {profile.churchName}
            </p>
            <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-[#04122e] dark:bg-[#1a2744] text-[#eec058] dark:text-[#F5C400] text-[10px] font-bold uppercase tracking-wider">
              {profile.role.replace("_", " ")}
            </div>
          </div>
        </section>

        {/* XP Card */}
        <section className="bg-[#1a2744] dark:bg-[#0F2444] rounded-xl p-6 text-white overflow-hidden relative">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#795900]/10 rounded-full blur-3xl" />
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[#ffdf9f] dark:text-[#F5C400] text-[10px] font-bold uppercase tracking-widest mb-1">Current Progress</p>
              <h3 className="text-4xl font-extrabold text-white" style={FONT}>{profile.totalXp} XP</h3>
            </div>
            <div className="text-right">
              <span className="bg-[#ffdf9f] dark:bg-[#F5C400] text-[#261a00] dark:text-[#051029] px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                Lvl {profile.levelNumber} — {profile.level}
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          {profile.nextLevelXp && (
            <div className="space-y-2">
              <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ffdf9f] dark:bg-[#F5C400] rounded-full transition-all duration-500"
                  style={{ width: `${xpPct}%`, boxShadow: "0 0 12px rgba(255,223,159,0.4)" }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-medium text-white/60 tracking-tight">
                <span>PATH TO MASTERY</span>
                <span>Next: {profile.nextLevelXp} XP</span>
              </div>
            </div>
          )}
        </section>

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#f2f4f7] dark:bg-[#0F2444] p-4 rounded-xl flex flex-col items-center text-center border border-transparent dark:border-white/10">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>book_2</span>
            <span className="text-lg font-bold text-[#191c1e] dark:text-white">{profile.activeBorrowings} Active</span>
            <span className="text-[10px] font-medium text-[#45464d] dark:text-gray-400 uppercase tracking-tighter">Readings</span>
          </div>
          <div className="bg-[#f2f4f7] dark:bg-[#0F2444] p-4 rounded-xl flex flex-col items-center text-center border border-transparent dark:border-white/10">
            <span className="material-symbols-outlined text-orange-500 dark:text-orange-400 mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            <span className="text-lg font-bold text-[#191c1e] dark:text-white">{profile.consecutiveOnTime} Streak</span>
            <span className="text-[10px] font-medium text-[#45464d] dark:text-gray-400 uppercase tracking-tighter">Days</span>
          </div>
          <div className="bg-[#f2f4f7] dark:bg-[#0F2444] p-4 rounded-xl flex flex-col items-center text-center border border-transparent dark:border-white/10">
            <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            <span className="text-lg font-bold text-[#191c1e] dark:text-white">{rankLabel} Rank</span>
            <span className="text-[10px] font-medium text-[#45464d] dark:text-gray-400 uppercase tracking-tighter">Global</span>
          </div>
        </div>

        {/* Trust Card */}
        <section className="bg-[#e7f3ed] dark:bg-green-900/20 p-4 rounded-xl border border-green-200/50 dark:border-green-800/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
          </div>
          <div>
            <h4 className="font-bold text-green-900 dark:text-green-300 text-sm">
              {profile.trustStatus === "established" ? "Established Member" : "New Member"}
            </h4>
            <p className="text-xs text-green-800/80 dark:text-green-400/80">
              {profile.trustStatus === "established"
                ? `Can borrow up to ${profile.maxBooks} books simultaneously`
                : `${profile.consecutiveOnTime}/3 on-time returns to upgrade`}
            </p>
          </div>
        </section>

        {/* Badges Section */}
        {profile.badges.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-[#795900] dark:text-[#F5C400] font-bold uppercase tracking-widest text-xs flex justify-between items-center">
              Spiritual Milestones
              <span className="text-[10px] text-[#75777e] dark:text-gray-500">{profile.badges.length} Earned</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map(b => (
                <span key={b} className="px-3 py-1.5 bg-[#ffdf9f] dark:bg-[#F5C400]/20 text-[#261a00] dark:text-[#F5C400] rounded-full text-[11px] font-semibold border border-[#795900]/20 dark:border-[#F5C400]/30">
                  {b}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Leaderboard Section */}
        {leaderboard && leaderboard.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-bold text-[#0d1b37] dark:text-white" style={FONT}>Top Readers</h3>
            <div className="bg-white dark:bg-[#0F2444] rounded-xl overflow-hidden border border-transparent dark:border-white/10">
              {leaderboard.map((e, i) => (
                <div
                  key={e._id}
                  className={`flex items-center justify-between p-4 ${
                    i < leaderboard.length - 1 ? "border-b border-[#eceef1] dark:border-white/10" : ""
                  } ${e._id === userId ? "bg-[#d9e2ff]/30 dark:bg-blue-900/20" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`font-bold text-lg w-4 ${i === 0 ? "text-[#795900] dark:text-[#F5C400]" : "text-[#75777e] dark:text-gray-500"}`}>{i + 1}</span>
                    <div className={`w-8 h-8 rounded-full ${i === 0 ? "bg-[#eec058] dark:bg-[#F5C400]" : "bg-[#e0e3e6] dark:bg-white/10"}`} />
                    <span className={`${e._id === userId ? "font-semibold" : "font-medium"} text-[#191c1e] dark:text-white`}>
                      {e.name}{e._id === userId ? " (You)" : ""}
                    </span>
                  </div>
                  <span className="font-bold text-[#191c1e] dark:text-white">{e.totalXp} XP</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Policy Link */}
        <Link
          href="/policy"
          className="flex items-center justify-between w-full bg-white dark:bg-[#0F2444] p-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffdf9f]/20 dark:bg-[#F5C400]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#795900] dark:text-[#F5C400] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
            </div>
            <span className="font-semibold text-sm text-[#0d1b37] dark:text-white">Borrowing Policy & Rules</span>
          </div>
          <span className="material-symbols-outlined text-[#75777e] dark:text-gray-500">chevron_right</span>
        </Link>

        {/* Sign Out Button */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full py-3.5 rounded-xl border-2 border-dashed border-[#c62828]/30 dark:border-[#ef5350]/30 text-[#c62828] dark:text-[#ef5350] flex items-center justify-center gap-2 hover:bg-[#c62828]/5 dark:hover:bg-[#ef5350]/5 transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span className="font-semibold text-sm">Sign Out</span>
        </button>
      </main>
    </div>
  );
}
