"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface ActiveBorrowingsProps {
  churchId: string;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
  });
}

export function ActiveBorrowings({ churchId }: ActiveBorrowingsProps) {
  const active = useQuery(api.borrowings.listActiveByChurch, {
    churchId: churchId as Id<"churches">,
  });

  if (active === undefined) {
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

  if (active.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">No active borrowings</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {active.map((b) => {
        const isOverdue = b.dueDate && b.dueDate < Date.now();
        return (
          <Card key={b._id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{b.bookTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground">{b.bookAuthor}</p>
                </div>
                {isOverdue ? (
                  <Badge variant="destructive">Overdue</Badge>
                ) : b.status === "approved" ? (
                  <Badge className="bg-blue-500 text-white">Approved</Badge>
                ) : (
                  <Badge className="bg-green-500 text-white">Active</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm">
                <span>
                  <span className="font-medium">{b.memberName}</span>{" "}
                  <span className="text-muted-foreground">{b.memberPhone}</span>
                </span>
                {b.dueDate && (
                  <span className="text-xs text-muted-foreground">
                    Due {formatDate(b.dueDate)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
