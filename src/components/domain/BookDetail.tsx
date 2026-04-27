"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { toast } from "sonner";
import { UserRole } from "@/types/auth";
import type { UserStatus } from "@/types/auth";
import { useState } from "react";
import { formatError } from "@/lib/errors/formatError";

interface BookDetailProps { bookId: string; userId: string; userRole: string; userStatus: UserStatus; churchId: string; }

const COVERS = ["from-[#3A2F1B] to-[#5C4B2E]","from-[#2B3A4E] to-[#1A2744]","from-[#4A2C2A] to-[#6B3D3A]","from-[#2E4A3A] to-[#1A3A2C]","from-[#3D3055] to-[#2A1E40]","from-[#4A3F1B] to-[#3A2F1B]"];
function getCover(t: string) { let h=0; for(let i=0;i<t.length;i++) h=t.charCodeAt(i)+((h<<5)-h); return COVERS[Math.abs(h)%COVERS.length]; }

const FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };

export function BookDetail({ bookId, userId, userRole, userStatus, churchId }: BookDetailProps) {
  const book = useQuery(api.books.getById, { id: bookId as Id<"books"> });
  const requestBorrow = useMutation(api.borrowings.request);
  const [requesting, setRequesting] = useState(false);
  const isAdmin = userRole === UserRole.CHURCH_ADMIN || userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ASSISTANT_LIBRARIAN;

  if (book === undefined) return (
    <div className="px-6 pt-6 space-y-4">
      <div className="h-6 w-16 rounded-full bg-[#e0e3e6] animate-pulse" />
      <div className="min-h-[240px] rounded-[40px] bg-[#e0e3e6] animate-pulse" />
      <div className="h-40 rounded-[20px] bg-[#e0e3e6] animate-pulse" />
    </div>
  );

  if (book === null) return (
    <div className="flex flex-col items-center gap-4 py-20 px-6 text-center">
      <span className="material-symbols-outlined text-[48px] text-[#c5c6ce]">menu_book</span>
      <p className="font-bold text-lg text-[#0d1b37]">Book not found</p>
      <Link href="/books" className="text-sm text-[#795900] hover:underline">Back to library</Link>
    </div>
  );

  async function handleRequest() {
    setRequesting(true);
    try {
      await requestBorrow({ bookId: bookId as Id<"books">, memberId: userId as Id<"users">, churchId: churchId as Id<"churches"> });
      toast.success("Borrow request submitted!");
    } catch (e) { toast.error(formatError(e, "Failed")); }
    finally { setRequesting(false); }
  }

  const ok = book.availableCopies > 0;
  const canRequest = userStatus === "active" && ok;

  return (
    <div className="pb-24 bg-[#f7f9fc] min-h-screen">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center w-full px-6 py-4 bg-gradient-to-b from-[#f7f9fc] to-[#f2f4f7] sticky top-0 z-50">
        <Link href="/books" className="flex items-center gap-2 active:scale-95 duration-200 cursor-pointer">
          <span className="material-symbols-outlined text-[#1a2744]">arrow_back</span>
          <span className="font-bold text-2xl leading-tight text-[#1a2744]" style={FONT}>Library</span>
        </Link>
        <span className="material-symbols-outlined text-[#1a2744]">local_library</span>
      </nav>

      <main className="px-6 space-y-8 mt-4">
        {/* Hero Section */}
        <section className={`relative h-[240px] w-full bg-gradient-to-br ${getCover(book.title)} overflow-hidden flex flex-col justify-end p-8 rounded-[40px] shadow-lg`}>
          {/* Decorative Circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute top-20 -left-10 w-32 h-32 bg-[#ffdf9f]/10 rounded-full blur-xl" />
          {/* Category Tag */}
          {book.category && (
            <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
              <span className="text-white text-[10px] font-bold tracking-widest uppercase">{book.category}</span>
            </div>
          )}
          {/* Content */}
          <div className="relative z-10 space-y-1">
            <h1 className="text-white text-3xl font-bold tracking-tight" style={FONT}>{book.title}</h1>
            <Link href={`/books/author/${encodeURIComponent(book.author)}`} className="text-[#828eb1] font-medium text-sm hover:text-[#ffdf9f] transition-colors">by {book.author}</Link>
          </div>
          {/* Floating book cover */}
          <div className={`absolute right-6 bottom-0 w-32 h-44 transform translate-y-4 rotate-6 shadow-2xl rounded-lg overflow-hidden border-2 border-white/20 bg-gradient-to-br ${getCover(book.title)} flex items-center justify-center`}>
            <span className="material-symbols-outlined text-white/20 text-4xl">menu_book</span>
          </div>
        </section>

        {/* Availability Bar */}
        <div className={`flex items-center gap-3 px-5 py-4 rounded-xl ${ok ? "bg-[#e8f5e9]" : "bg-[#ffdad6]"}`}>
          <div className={`rounded-full p-1 flex items-center justify-center ${ok ? "bg-green-600" : "bg-red-600"}`}>
            <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              {ok ? "check" : "close"}
            </span>
          </div>
          <span className={`font-semibold text-sm ${ok ? "text-green-800" : "text-red-800"}`}>
            {ok ? `${book.availableCopies} of ${book.totalCopies} copies available` : "All copies currently on loan"}
          </span>
        </div>

        {/* About Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-[#0d1b37] text-2xl font-bold" style={FONT}>About the book</h2>
            <span className="text-[#795900] font-bold text-[10px] tracking-widest uppercase">Overview</span>
          </div>
          {book.description && (
            <div className="bg-white p-6 rounded-[20px] shadow-[0px_12px_32px_rgba(25,28,30,0.06)]">
              <p className="text-[#45464d] text-sm leading-relaxed">{book.description}</p>
            </div>
          )}
        </section>

        {/* Details Grid */}
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#f2f4f7] p-5 rounded-[20px]">
              <span className="text-[#795900] text-[10px] font-bold tracking-widest uppercase block mb-1">Author</span>
              <Link href={`/books/author/${encodeURIComponent(book.author)}`} className="text-[#191c1e] font-semibold text-sm hover:text-[#795900] transition-colors">{book.author}</Link>
            </div>
            <div className="bg-[#f2f4f7] p-5 rounded-[20px]">
              <span className="text-[#795900] text-[10px] font-bold tracking-widest uppercase block mb-1">Copies</span>
              <p className="text-[#191c1e] font-semibold text-sm">{book.totalCopies} Total</p>
            </div>
          </div>
          {book.category && (
            <div className="bg-[#f2f4f7] p-5 rounded-[20px] flex justify-between items-center">
              <div>
                <span className="text-[#795900] text-[10px] font-bold tracking-widest uppercase block mb-1">Category</span>
                <p className="text-[#191c1e] font-semibold text-sm">{book.category}</p>
              </div>
              <span className="material-symbols-outlined text-[#75777e]">label</span>
            </div>
          )}
        </section>

        {/* CTA Buttons */}
        {canRequest && (
          <button
            onClick={handleRequest}
            disabled={requesting}
            className="w-full h-[52px] bg-[#795900] hover:opacity-90 transition-all active:scale-[0.98] rounded-xl flex items-center justify-center gap-3 text-white font-bold shadow-lg shadow-[#795900]/20 disabled:opacity-50"
          >
            {requesting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Requesting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>book_2</span>
                Request to Borrow
              </>
            )}
          </button>
        )}

        {!canRequest && userStatus === "active" && !ok && (
          <div className="w-full h-[52px] bg-[#e0e3e6] rounded-xl flex items-center justify-center gap-3 text-[#45464d] font-semibold">
            <span className="material-symbols-outlined">schedule</span>
            Currently Unavailable
          </div>
        )}

        {isAdmin && (
          <Link
            href={`/admin/books/${book._id}/edit`}
            className="w-full h-[52px] border-2 border-dashed border-[#c5c6ce] rounded-xl flex items-center justify-center gap-3 text-[#0d1b37] font-semibold hover:bg-[#f2f4f7] transition-colors"
          >
            <span className="material-symbols-outlined">edit</span>
            Edit Book
          </Link>
        )}
      </main>
    </div>
  );
}
