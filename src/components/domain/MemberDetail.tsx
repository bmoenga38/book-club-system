"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Phone,
  Shield,
  Star,
  Flame,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface MemberDetailProps {
  memberId: string;
}

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  issued: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  returned: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  declined: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  overdue: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

function formatDate(ts?: number) {
  if (!ts) return "-";
  return new Date(ts).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MemberDetail({ memberId }: MemberDetailProps) {
  const router = useRouter();
  const detail = useQuery(api.users.getMemberDetail, {
    id: memberId as Id<"users">,
  });

  if (detail === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <Card className="animate-pulse">
          <CardContent className="h-40 pt-6" />
        </Card>
        <Card className="animate-pulse">
          <CardContent className="h-60 pt-6" />
        </Card>
      </div>
    );
  }

  if (detail === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">Member not found</p>
        <Button variant="outline" onClick={() => router.push("/admin/members")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Members
        </Button>
      </div>
    );
  }

  const { user, borrowings, totalXp, overdueCount, recentOverdueCount, consecutiveOnTime, trustStatus } = detail;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/admin/members")}
        className="gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Members
      </Button>

      {/* Member Info Card */}
      <Card className="rounded-2xl border-0 bg-[#1a2744] text-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle
            className="text-xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {user.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-[#ffdf9f]">
            <Phone className="h-4 w-4" />
            {user.phone}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-[#ffdf9f]/20 text-[#ffdf9f] hover:bg-[#ffdf9f]/30 capitalize">
              <Shield className="mr-1 h-3 w-3" />
              {user.role.replace(/_/g, " ")}
            </Badge>
            <Badge
              className={`rounded-full ${
                user.status === "active"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : user.status === "suspended"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-yellow-500/20 text-yellow-300"
              }`}
            >
              {user.status.replace(/_/g, " ")}
            </Badge>
            <Badge className="rounded-full bg-white/10 text-white/80 capitalize">
              Trust: {trustStatus}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <Star className="mx-auto mb-1 h-4 w-4 text-[#ffdf9f]" />
              <p className="text-lg font-bold">{totalXp}</p>
              <p className="text-xs text-white/60">XP</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <Flame className="mx-auto mb-1 h-4 w-4 text-[#ffdf9f]" />
              <p className="text-lg font-bold">{consecutiveOnTime}</p>
              <p className="text-xs text-white/60">Streak</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <BookOpen className="mx-auto mb-1 h-4 w-4 text-[#ffdf9f]" />
              <p className="text-lg font-bold">{borrowings.length}</p>
              <p className="text-xs text-white/60">Borrows</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Pattern Analysis */}
      {overdueCount > 0 && (
        <Card className="rounded-2xl border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
          <CardContent className="flex items-start gap-3 pt-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-300">
                Overdue Pattern
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                {overdueCount} overdue{overdueCount !== 1 ? "s" : ""} total
                {recentOverdueCount > 0 &&
                  ` ({recentOverdueCount} in last 6 months)`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Borrowing History */}
      <div className="space-y-3">
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Borrowing History ({borrowings.length})
        </h2>

        {borrowings.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No borrowing history yet</p>
            </CardContent>
          </Card>
        ) : (
          borrowings.map((b) => (
            <Card key={b._id} className="rounded-2xl">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-tight">{b.bookTitle}</p>
                    {b.bookAuthor && (
                      <p className="text-sm text-muted-foreground">
                        {b.bookAuthor}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Requested: {formatDate(b.requestedAt)}</span>
                      {b.issuedAt && <span>Issued: {formatDate(b.issuedAt)}</span>}
                      {b.dueDate && <span>Due: {formatDate(b.dueDate)}</span>}
                      {b.returnedAt && (
                        <span>Returned: {formatDate(b.returnedAt)}</span>
                      )}
                    </div>
                    {b.declineNote && (
                      <p className="mt-1 text-xs italic text-red-500">
                        Note: {b.declineNote}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={`shrink-0 rounded-full text-xs capitalize ${STATUS_STYLES[b.status] ?? ""}`}
                  >
                    {b.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
