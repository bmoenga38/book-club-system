"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface OverdueListProps {
  churchId: string;
}

export function OverdueList({ churchId }: OverdueListProps) {
  const overdue = useQuery(api.borrowings.listOverdueByChurch, {
    churchId: churchId as Id<"churches">,
  });
  const markReturned = useMutation(api.borrowings.markReturned);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleReturn(borrowingId: string) {
    setProcessingId(borrowingId);
    try {
      await markReturned({ borrowingId: borrowingId as Id<"borrowings"> });
      toast.success("Book marked as returned");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setProcessingId(null);
    }
  }

  if (overdue === undefined) {
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

  if (overdue.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">No overdue books</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {overdue.map((b) => (
        <Card key={b._id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{b.bookTitle}</CardTitle>
                <p className="text-sm font-medium">{b.memberName}</p>
                <p className="text-xs text-muted-foreground">{b.memberPhone}</p>
              </div>
              <Badge variant="destructive">{b.daysOverdue} days overdue</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              onClick={() => handleReturn(b._id)}
              disabled={processingId === b._id}
              className="w-full"
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Mark Returned
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
