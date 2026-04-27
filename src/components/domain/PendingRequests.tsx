"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Inbox } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { formatError } from "@/lib/errors/formatError";

interface PendingRequestsProps {
  churchId: string;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PendingRequests({ churchId }: PendingRequestsProps) {
  const requests = useQuery(api.borrowings.listPendingByChurch, {
    churchId: churchId as Id<"churches">,
  });
  const approveMutation = useMutation(api.borrowings.approve);
  const declineMutation = useMutation(api.borrowings.decline);
  const issueMutation = useMutation(api.borrowings.issue);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleApprove(borrowingId: string) {
    setProcessingId(borrowingId);
    try {
      await approveMutation({
        borrowingId: borrowingId as Id<"borrowings">,
      });
      toast.success("Request approved");
    } catch (error) {
      toast.error(formatError(error, "Failed to approve"));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleApproveAndIssue(borrowingId: string) {
    setProcessingId(borrowingId);
    try {
      await approveMutation({
        borrowingId: borrowingId as Id<"borrowings">,
      });
      await issueMutation({
        borrowingId: borrowingId as Id<"borrowings">,
      });
      toast.success("Book approved and issued");
    } catch (error) {
      toast.error(formatError(error, "Failed to issue"));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDecline(borrowingId: string) {
    setProcessingId(borrowingId);
    try {
      await declineMutation({
        borrowingId: borrowingId as Id<"borrowings">,
        note: "Request declined by evangelist",
      });
      toast.success("Request declined");
    } catch (error) {
      toast.error(formatError(error, "Failed to decline"));
    } finally {
      setProcessingId(null);
    }
  }

  if (requests === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-28 pt-6" />
          </Card>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Inbox className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">No pending requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const isProcessing = processingId === req._id;
        return (
          <Card key={req._id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{req.bookTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">{req.bookAuthor}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p>
                  <span className="font-medium">{req.memberName}</span>{" "}
                  <span className="text-muted-foreground">{req.memberPhone}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Requested {formatDate(req.requestedAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApproveAndIssue(req._id)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approve & Issue
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApprove(req._id)}
                  disabled={isProcessing}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDecline(req._id)}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
