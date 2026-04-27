"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";

interface AuthorDetailProps {
  authorName: string;
  churchId: string;
}

const COVER_COLORS = [
  "from-[#3A2F1B] to-[#5C4B2E]",
  "from-[#2B3A4E] to-[#1A2744]",
  "from-[#4A2C2A] to-[#6B3D3A]",
  "from-[#2E4A3A] to-[#1A3A2C]",
  "from-[#3D3055] to-[#2A1E40]",
  "from-[#4A3F1B] to-[#3A2F1B]",
  "from-[#1B2E4A] to-[#0A1A3A]",
  "from-[#4A1B2E] to-[#3A0A1A]",
];

function getCover(title: string) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = title.charCodeAt(i) + ((h << 5) - h);
  return COVER_COLORS[Math.abs(h) % COVER_COLORS.length];
}

const FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };

const AUTHOR_BIOS: Record<string, string> = {
  "Ellen G. White":
    "A prolific author and Christian pioneer whose writings continue to inspire millions worldwide. Her works span topics of faith, health, education, and prophecy, forming a cornerstone of Adventist literature.",
};

function getAuthorBio(name: string): string {
  return (
    AUTHOR_BIOS[name] ??
    `A distinguished author whose works enrich our library collection. Explore their contributions to spiritual growth and knowledge below.`
  );
}

export function AuthorDetail({ authorName, churchId }: AuthorDetailProps) {
  const books = useQuery(api.books.list, {
    churchId: churchId as Id<"churches">,
    search: authorName,
  });

  // Filter to exact author match
  const authorBooks = books?.filter(
    (b) => b.author.toLowerCase() === authorName.toLowerCase()
  );

  const totalCopies = authorBooks?.reduce((sum, b) => sum + b.totalCopies, 0) ?? 0;
  const bookCount = authorBooks?.length ?? 0;

  return (
    <div className="bg-[#f7f9fc] dark:bg-[#051029] min-h-screen pb-24">
      {/* Top Navigation */}
      <nav className="flex items-center gap-3 w-full px-6 py-4 bg-[#f7f9fc] dark:bg-[#051029] sticky top-0 z-50">
        <Link
          href="/books"
          className="active:scale-95 duration-200 cursor-pointer text-[#1a2744] dark:text-white"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="font-bold text-lg text-[#1a2744] dark:text-white" style={FONT}>
          Author Profile
        </h1>
      </nav>

      <main className="px-6 space-y-8 mt-2 max-w-lg mx-auto">
        {/* Author Avatar & Name */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="w-28 h-28 rounded-full bg-[#1a2744] dark:bg-[#0F2444] flex items-center justify-center border-4 border-[#ffdf9f] dark:border-[#F5C400] shadow-xl">
            <span
              className="text-[#ffdf9f] dark:text-[#F5C400] text-4xl font-bold"
              style={FONT}
            >
              {authorName[0]}
            </span>
          </div>
          <div>
            <h2
              className="text-2xl font-bold text-[#0d1b37] dark:text-white"
              style={FONT}
            >
              {authorName}
            </h2>
            <p className="text-sm text-[#45464d] dark:text-gray-400 mt-2 leading-relaxed max-w-sm mx-auto">
              {getAuthorBio(authorName)}
            </p>
          </div>
        </section>

        {/* Sacred Works Header */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h3
              className="text-xl font-bold text-[#0d1b37] dark:text-white"
              style={FONT}
            >
              The Sacred Works
            </h3>
            <span className="text-[#795900] dark:text-[#F5C400] font-bold text-[10px] tracking-widest uppercase">
              Collection
            </span>
          </div>

          {/* Stats Row */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white dark:bg-[#0F2444] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 text-center">
              <span className="text-2xl font-bold text-[#0d1b37] dark:text-white" style={FONT}>
                {bookCount}
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#795900] dark:text-[#F5C400] mt-1">
                Books
              </p>
            </div>
            <div className="flex-1 bg-white dark:bg-[#0F2444] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 text-center">
              <span className="text-2xl font-bold text-[#0d1b37] dark:text-white" style={FONT}>
                {totalCopies}
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#795900] dark:text-[#F5C400] mt-1">
                Total Copies
              </p>
            </div>
          </div>
        </section>

        {/* Book Grid */}
        {authorBooks === undefined ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-52 rounded-2xl bg-gray-200 dark:bg-white/10 animate-pulse" />
            ))}
          </div>
        ) : authorBooks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-gray-300 dark:text-gray-600">
              menu_book
            </span>
            <p className="font-bold text-lg text-[#0d1b37] dark:text-white">
              No books found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {authorBooks.map((book) => {
              const ok = book.availableCopies > 0;
              return (
                <Link key={book._id} href={`/books/${book._id}`}>
                  <div className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#0F2444] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
                    {/* Cover */}
                    <div
                      className={`h-36 bg-gradient-to-br ${getCover(book.title)} flex items-center justify-center relative`}
                    >
                      <span className="material-symbols-outlined text-white/20 text-3xl">
                        menu_book
                      </span>
                      {/* Availability dot */}
                      <div className="absolute top-2 right-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            ok ? "bg-green-400" : "bg-red-400"
                          }`}
                        />
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3 space-y-1">
                      <h4
                        className="text-sm font-bold text-[#0d1b37] dark:text-white leading-tight line-clamp-2"
                        style={FONT}
                      >
                        {book.title}
                      </h4>
                      <p className="text-[10px] font-medium text-[#45464d] dark:text-gray-400">
                        {ok
                          ? `${book.availableCopies} of ${book.totalCopies} available`
                          : "On Loan"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
