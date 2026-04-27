"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { formatError } from "@/lib/errors/formatError";

interface MemberManagementProps {
  churchId: string;
}

export function MemberManagement({ churchId }: MemberManagementProps) {
  const pending = useQuery(api.users.listPendingVerification, {
    churchId: churchId as Id<"churches">,
  });
  const allMembers = useQuery(api.users.listByChurch, {
    churchId: churchId as Id<"churches">,
  });
  const updateStatus = useMutation(api.users.updateStatus);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleVerify(userId: string) {
    setProcessingId(userId);
    try {
      await updateStatus({
        id: userId as Id<"users">,
        status: "active",
      });
      toast.success("Member verified");
    } catch (error) {
      toast.error(formatError(error, "Failed"));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(userId: string) {
    setProcessingId(userId);
    try {
      await updateStatus({
        id: userId as Id<"users">,
        status: "suspended",
      });
      toast.success("Member rejected");
    } catch (error) {
      toast.error(formatError(error, "Failed"));
    } finally {
      setProcessingId(null);
    }
  }

  if (pending === undefined || allMembers === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-20 pt-6" />
          </Card>
        ))}
      </div>
    );
  }

  const activeMembers = allMembers.filter((m) => m.status === "active");

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Pending Verification ({pending.length})</h2>
          {pending.map((member) => (
            <Card key={member._id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{member.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{member.phone}</p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleVerify(member._id)}
                    disabled={processingId === member._id}
                    className="flex-1"
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(member._id)}
                    disabled={processingId === member._id}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Active Members ({activeMembers.length})</h2>
        {activeMembers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No active members yet</p>
          </div>
        ) : (
          activeMembers.map((member) => (
            <Link key={member._id} href={`/admin/members/${member._id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between pt-4">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {member.role.replace("_", " ")}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
