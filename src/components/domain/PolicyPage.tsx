"use client";

import Link from "next/link";

const FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };

interface PolicySection {
  icon: string;
  iconFill?: boolean;
  title: string;
  points: string[];
}

const SECTIONS: PolicySection[] = [
  {
    icon: "book_2",
    iconFill: true,
    title: "Borrowing Limits",
    points: [
      "New members may borrow 1 book at a time.",
      "Established members may borrow up to 3 books simultaneously.",
      "Each loan period lasts 14 calendar days from the issue date.",
    ],
  },
  {
    icon: "trending_up",
    title: "Trust Progression",
    points: [
      "All new members begin with a 1-book borrowing limit.",
      "Return 3 consecutive books on time to upgrade to Established status.",
      "Established members enjoy a 3-book simultaneous borrowing privilege.",
      "Late returns reset your consecutive on-time counter.",
    ],
  },
  {
    icon: "schedule",
    title: "Overdue Policy",
    points: [
      "Day -3: You receive a friendly reminder before your due date.",
      "Day 1: A gentle reminder is sent on the first day past due.",
      "Day 7: Your borrowing privileges may be suspended.",
      "Day 14: Your account is flagged as high-risk until resolved.",
    ],
  },
  {
    icon: "workspace_premium",
    iconFill: true,
    title: "XP & Rewards",
    points: [
      "+10 XP for submitting a borrow request.",
      "+25 XP when a book is issued to you.",
      "+40 XP for returning a book on time.",
      "No XP is awarded for late returns.",
      "Earn badges and climb the leaderboard as you read!",
    ],
  },
  {
    icon: "shield",
    iconFill: true,
    title: "Privacy",
    points: [
      "Your borrowing history is completely private.",
      "No public shaming for overdue books — reminders are personal.",
      "Only administrators can view borrowing records for management purposes.",
    ],
  },
  {
    icon: "support_agent",
    title: "Contact & Support",
    points: [
      "Reach out to your church evangelist or librarian for any help.",
      "Report damaged or lost books as soon as possible.",
      "Suggestions for new books are always welcome!",
    ],
  },
];

export function PolicyPage() {
  return (
    <div className="bg-[#f7f9fc] dark:bg-[#051029] min-h-screen pb-24">
      {/* Top Navigation */}
      <nav className="flex items-center gap-3 w-full px-6 py-4 bg-[#f7f9fc] dark:bg-[#051029] sticky top-0 z-50 border-b border-gray-100 dark:border-white/5">
        <Link
          href="/"
          className="active:scale-95 duration-200 cursor-pointer text-[#1a2744] dark:text-white"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="font-bold text-lg text-[#1a2744] dark:text-white" style={FONT}>
          Borrowing Policy & Rules
        </h1>
      </nav>

      <main className="px-6 py-6 space-y-5 max-w-lg mx-auto">
        {/* Intro */}
        <div className="text-center space-y-2 pb-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1a2744] dark:bg-[#0F2444] flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[#ffdf9f] dark:text-[#F5C400] text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              gavel
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#0d1b37] dark:text-white" style={FONT}>
            Library Guidelines
          </h2>
          <p className="text-sm text-[#45464d] dark:text-gray-400 leading-relaxed">
            Please review our borrowing policies to ensure a great experience for all members.
          </p>
        </div>

        {/* Policy Sections */}
        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="bg-white dark:bg-[#0F2444] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-white/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffdf9f]/20 dark:bg-[#F5C400]/10 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[#795900] dark:text-[#F5C400] text-xl"
                  style={
                    section.iconFill
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {section.icon}
                </span>
              </div>
              <h3 className="font-bold text-base text-[#0d1b37] dark:text-white" style={FONT}>
                {section.title}
              </h3>
            </div>
            <ul className="space-y-2.5 ml-1">
              {section.points.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#795900] dark:text-[#F5C400] text-sm mt-0.5 shrink-0">
                    chevron_right
                  </span>
                  <span className="text-sm text-[#45464d] dark:text-gray-300 leading-relaxed">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
