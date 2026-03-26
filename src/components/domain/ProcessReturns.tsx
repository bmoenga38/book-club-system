"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ProcessReturnsProps {
  churchId: string;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
  });
}

export function ProcessReturns({ churchId }: ProcessReturnsProps) {
  const active = useQuery(api.borrowings.listActiveByChurch, {
    churchId: churchId as Id<"churches">,
  });
  const markReturned = useMutation(api.borrowings.markReturned);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleReturn(borrowingId: string) {
    setProcessingId(borrowingId);
    try {
      const result = await markReturned({
        borrowingId: borrowingId as Id<"borrowings">,
      });
      if (result.isOnTime) {
        toast.success("Book returned on time! +40 XP awarded");
      } else {
        toast.success("Book returned (late — no XP awarded)");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process return");
    } finally {
      setProcessingId(null);
    }
  }

  if (active === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24 pt-6" />
          </Card>
        ))}
      </div>
    );
  }

  // Only show issued and overdue (not just approved — those haven't been picked up yet)
  const returnable = active.filter(
    (b) => b.status === "issued" || b.status === "overdue"
  );

  if (returnable.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">No books to return</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {returnable.map((b) => {
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
                ) : (
                  <Badge className="bg-green-500 text-white">Active</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <p>
                  <span className="font-medium">{b.memberName}</span>{" "}
                  <span className="text-muted-foreground">{b.memberPhone}</span>
                </p>
                {b.dueDate && (
                  <p className="text-xs text-muted-foreground">
                    Due {formatDate(b.dueDate)}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => handleReturn(b._id)}
                disabled={processingId === b._id}
                className="w-full"
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                {processingId === b._id ? "Processing..." : "Mark Returned"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
