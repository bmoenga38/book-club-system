"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  MessageSquare,
} from "lucide-react";

interface BoardReportsProps {
  churchId: string;
}

export function BoardReports({ churchId }: BoardReportsProps) {
  const cid = churchId as Id<"churches">;
  const summary = useQuery(api.reports.getMonthlySummary, { churchId: cid });
  const popular = useQuery(api.reports.getPopularBooks, { churchId: cid, limit: 5 });
  const underutilized = useQuery(api.reports.getUnderutilizedBooks, { churchId: cid, limit: 5 });
  const inventory = useQuery(api.reports.getInventoryStatus, { churchId: cid });
  const smsSpend = useQuery(api.reports.getSmsSpend, { churchId: cid });

  const isLoading = !summary || !popular || !inventory;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32 pt-6" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Monthly Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Monthly Summary (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{summary.totalBorrows}</p>
              <p className="text-xs text-muted-foreground">Total Borrows</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.returned}</p>
              <p className="text-xs text-muted-foreground">Returned</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.onTimeRate}%</p>
              <p className="text-xs text-muted-foreground">On-Time Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.uniqueBorrowers}</p>
              <p className="text-xs text-muted-foreground">Active Borrowers</p>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Currently Overdue</span>
            <Badge variant={summary.currentOverdue > 0 ? "destructive" : "secondary"}>
              {summary.currentOverdue}
            </Badge>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Active Loans</span>
            <span className="font-medium">{summary.activeLoans}</span>
          </div>
        </CardContent>
      </Card>

      {/* Popular Books */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Most Popular Books
          </CardTitle>
        </CardHeader>
        <CardContent>
          {popular.length === 0 ? (
            <p className="text-sm text-muted-foreground">No borrowing data yet</p>
          ) : (
            <div className="space-y-2">
              {popular.map((book, i) => (
                <div key={book.bookId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center text-muted-foreground">{i + 1}</span>
                    <div>
                      <p className="font-medium">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{book.borrowCount} borrows</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Underutilized Books */}
      {underutilized && underutilized.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Least Borrowed Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {underutilized.map((book) => (
                <div key={book.bookId} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{book.title}</p>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                  </div>
                  <Badge variant="secondary">
                    {book.borrowCount === 0 ? "Never borrowed" : `${book.borrowCount} borrows`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4" />
            Inventory Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{inventory.totalBooks}</p>
              <p className="text-xs text-muted-foreground">Unique Titles</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{inventory.totalCopies}</p>
              <p className="text-xs text-muted-foreground">Total Copies</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{inventory.availableCopies}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{inventory.borrowedCopies}</p>
              <p className="text-xs text-muted-foreground">Borrowed</p>
            </div>
          </div>
          {inventory.categories.length > 0 && (
            <>
              <Separator className="my-3" />
              <p className="text-xs font-medium text-muted-foreground mb-2">By Category</p>
              <div className="flex flex-wrap gap-2">
                {inventory.categories.map((cat) => (
                  <Badge key={cat.name} variant="outline">
                    {cat.name} ({cat.count})
                  </Badge>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* SMS Spend */}
      {smsSpend && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              SMS Usage (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Messages Sent</span>
              <span className="font-medium">{smsSpend.totalSent}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Estimated Cost</span>
              <span className="font-medium">KES {smsSpend.estimatedCostKes}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
