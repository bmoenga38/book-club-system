"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { UserRole } from "@/types/auth";

interface BookCatalogProps {
  churchId: string;
  userRole: string;
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

export function BookCatalog({ churchId, userRole }: BookCatalogProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const books = useQuery(api.books.list, {
    churchId: churchId as Id<"churches">,
    search: search || undefined,
    category: selectedCategory,
  });
  const categories = useQuery(api.books.getCategories, {
    churchId: churchId as Id<"churches">,
  });

  const isAdmin =
    userRole === UserRole.CHURCH_ADMIN || userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ASSISTANT_LIBRARIAN;

  const total = books?.length ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top App Bar */}
      <header className="w-full top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="active:scale-95 duration-200 text-foreground hover:bg-muted transition-colors p-2 rounded-full">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </Link>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground" style={FONT}>Browse Library</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="active:scale-95 duration-200 text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search bar (toggled) */}
      {showFilters && (
        <div className="px-4 sm:px-6 py-4 bg-background border-b border-border">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-[#795900]/20 dark:focus:ring-[#F5C400]/20 text-foreground placeholder:text-muted-foreground outline-none transition-all text-sm"
              placeholder="Search by title, author..."
            />
          </div>
          {categories && categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto w-full pt-3 pb-1" style={{ scrollbarWidth: "none" }}>
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                  !selectedCategory
                    ? "bg-[#1a2744] dark:bg-[#F5C400] text-white dark:text-[#051029]"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                All Books
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? undefined : cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                    selectedCategory === cat
                      ? "bg-[#1a2744] dark:bg-[#F5C400] text-white dark:text-[#051029]"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <section className="px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#795900] dark:text-[#F5C400]">Catalog Archive</span>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground" style={FONT}>{total} Books Found</h2>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg text-foreground hover:bg-accent transition-colors active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-sm">tune</span>
          <span className="text-xs sm:text-sm font-semibold tracking-tight">Filter &amp; Sort</span>
        </button>
      </section>

      {isAdmin && (
        <div className="px-4 sm:px-6 pb-4">
          <Link
            href="/admin/books/new"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1a2744] dark:bg-[#F5C400] text-[#ffdf9f] dark:text-[#051029] rounded-xl text-sm font-bold active:scale-95 transition-transform hover:bg-[#04122e] dark:hover:bg-[#D9A200]"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Book
          </Link>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6">
        {books === undefined ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 bg-card p-4 rounded-2xl animate-pulse border border-border">
                <div className="w-20 sm:w-24 h-28 sm:h-36 bg-muted rounded-xl shrink-0" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-3 w-20 bg-muted rounded-full" />
                  <div className="h-5 w-40 bg-muted rounded-full" />
                  <div className="h-3 w-28 bg-muted rounded-full" />
                  <div className="h-5 w-16 bg-muted rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
              <span className="material-symbols-outlined text-[40px] text-muted-foreground/30">menu_book</span>
            </div>
            <p className="font-bold text-lg text-foreground">{search ? "No results" : "Library is empty"}</p>
            <p className="text-sm text-muted-foreground">
              {search ? `Nothing matches "${search}"` : "Books appear here once added"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {books.map((book) => {
              const ok = book.availableCopies > 0;
              return (
                <Link key={book._id} href={`/books/${book._id}`}>
                  <div className="group relative flex gap-4 bg-card p-3 sm:p-4 rounded-2xl border border-border hover:border-[#795900]/30 dark:hover:border-[#F5C400]/30 shadow-sm hover:shadow-md transition-all duration-200">
                    {/* Book Cover */}
                    <div className={`w-20 sm:w-24 h-28 sm:h-36 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${getCover(book.title)} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-white/25 text-2xl">menu_book</span>
                    </div>
                    {/* Book Info */}
                    <div className="flex flex-col justify-center flex-1 min-w-0 py-0.5">
                      {book.category && (
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#795900] dark:text-[#F5C400] mb-1">{book.category}</span>
                      )}
                      <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight mb-0.5 line-clamp-2" style={FONT}>{book.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-2 truncate">{book.author}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${
                            ok
                              ? "bg-[#ffdf9f] dark:bg-[#F5C400]/20 text-[#261a00] dark:text-[#F5C400]"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {ok ? "AVAILABLE" : "ON LOAN"}
                        </span>
                        <div className="h-1.5 w-16 sm:w-24 bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${ok ? "bg-[#795900] dark:bg-[#F5C400]" : "bg-muted-foreground/30"}`}
                            style={{ width: `${book.totalCopies > 0 ? (book.availableCopies / book.totalCopies) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Chevron */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="material-symbols-outlined text-muted-foreground/40 group-hover:text-[#795900] dark:group-hover:text-[#F5C400] transition-colors">chevron_right</span>
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
