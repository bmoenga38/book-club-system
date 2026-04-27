"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, User, Check } from "lucide-react";
import { toast } from "sonner";
import { formatError } from "@/lib/errors/formatError";

interface DirectIssueProps {
  churchId: string;
}

export function DirectIssue({ churchId }: DirectIssueProps) {
  const [memberSearch, setMemberSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<{
    _id: string;
    name: string;
    phone: string;
  } | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);

  const members = useQuery(
    api.borrowings.searchMembers,
    memberSearch.length >= 2
      ? { churchId: churchId as Id<"churches">, search: memberSearch }
      : "skip"
  );

  const books = useQuery(api.books.list, {
    churchId: churchId as Id<"churches">,
    search: bookSearch || undefined,
  });

  const directIssue = useMutation(api.borrowings.directIssue);

  async function handleIssue() {
    if (!selectedMember || !selectedBook) return;
    setIssuing(true);
    try {
      await directIssue({
        bookId: selectedBook as Id<"books">,
        memberId: selectedMember._id as Id<"users">,
        churchId: churchId as Id<"churches">,
      });
      toast.success(`Book issued to ${selectedMember.name}`);
      setSelectedMember(null);
      setSelectedBook(null);
      setMemberSearch("");
      setBookSearch("");
    } catch (error) {
      toast.error(formatError(error, "Failed to issue"));
    } finally {
      setIssuing(false);
    }
  }

  const availableBooks = books?.filter((b) => b.availableCopies > 0) ?? [];

  return (
    <div className="space-y-6">
      {/* Step 1: Select member */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            {selectedMember ? (
              <span>
                {selectedMember.name}{" "}
                <span className="font-normal text-muted-foreground">
                  {selectedMember.phone}
                </span>
              </span>
            ) : (
              "1. Select Member"
            )}
            {selectedMember && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedMember(null);
                  setMemberSearch("");
                }}
                className="ml-auto text-xs"
              >
                Change
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        {!selectedMember && (
          <CardContent className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {members && members.length > 0 && (
              <div className="space-y-1">
                {members.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => {
                      setSelectedMember(m);
                      setMemberSearch("");
                    }}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <span className="font-medium">{m.name}</span>
                    <span className="text-muted-foreground">{m.phone}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Step 2: Select book */}
      {selectedMember && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              2. Select Book
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search books..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {availableBooks.map((book) => (
                <button
                  key={book._id}
                  onClick={() => setSelectedBook(book._id)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent ${
                    selectedBook === book._id ? "bg-accent" : ""
                  }`}
                >
                  <div>
                    <span className="font-medium">{book.title}</span>
                    <span className="ml-2 text-muted-foreground">
                      {book.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {book.availableCopies} avail
                    </Badge>
                    {selectedBook === book._id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirm */}
      {selectedMember && selectedBook && (
        <Button
          onClick={handleIssue}
          disabled={issuing}
          className="w-full"
          size="lg"
        >
          {issuing ? "Issuing..." : "Issue Book"}
        </Button>
      )}
    </div>
  );
}
