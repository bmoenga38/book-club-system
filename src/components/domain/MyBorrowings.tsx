"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";

interface MyBorrowingsProps {
  userId: string;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDaysUntilDue(dueDate: number): number {
  return Math.ceil((dueDate - Date.now()) / (1000 * 60 * 60 * 24));
}

function getStatusBadge(status: string, dueDate?: number) {
  switch (status) {
    case "requested":
      return <Badge variant="secondary">Requested</Badge>;
    case "approved":
      return <Badge className="bg-blue-500 text-white">Approved</Badge>;
    case "issued": {
      if (dueDate && dueDate < Date.now()) {
        return <Badge variant="destructive">Overdue</Badge>;
      }
      const days = dueDate ? getDaysUntilDue(dueDate) : 0;
      if (days <= 3) {
        return <Badge className="bg-yellow-500 text-white">Due Soon</Badge>;
      }
      return <Badge className="bg-green-500 text-white">Active</Badge>;
    }
    case "overdue":
      return <Badge variant="destructive">Overdue</Badge>;
    case "returned":
      return <Badge variant="outline">Returned</Badge>;
    case "declined":
      return <Badge variant="secondary">Declined</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function MyBorrowings({ userId }: MyBorrowingsProps) {
  const borrowings = useQuery(api.borrowings.listByMember, {
    memberId: userId as Id<"users">,
  });

  if (borrowings === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-20 pt-6" />
          </Card>
        ))}
      </div>
    );
  }

  if (borrowings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">No borrowings yet</p>
        <a href="/books" className="text-sm text-primary underline">
          Browse the catalog
        </a>
      </div>
    );
  }

  const active = borrowings.filter(
    (b) => b.status === "requested" || b.status === "approved" || b.status === "issued" || b.status === "overdue"
  );
  const past = borrowings.filter(
    (b) => b.status === "returned" || b.status === "declined"
  );

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Active</h2>
          {active.map((b) => (
            <Card key={b._id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{b.bookTitle}</CardTitle>
                    <p className="text-sm text-muted-foreground">{b.bookAuthor}</p>
                  </div>
                  {getStatusBadge(b.status, b.dueDate)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Requested {formatDate(b.requestedAt)}</span>
                  {b.dueDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due {formatDate(b.dueDate)}
                      {b.status === "issued" && b.dueDate > Date.now() && (
                        <span>({getDaysUntilDue(b.dueDate)} days left)</span>
                      )}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">History</h2>
          {past.map((b) => (
            <Card key={b._id} className="opacity-75">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{b.bookTitle}</CardTitle>
                    <p className="text-sm text-muted-foreground">{b.bookAuthor}</p>
                  </div>
                  {getStatusBadge(b.status)}
                </div>
              </CardHeader>
              {b.returnedAt && (
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    Returned {formatDate(b.returnedAt)}
                  </p>
                </CardContent>
              )}
              {b.declineNote && (
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    Note: {b.declineNote}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
