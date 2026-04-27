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
import { useCallback } from "react";

interface BoardReportsProps {
  churchId: string;
}

const FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escCsv(val: string | number | undefined): string {
  const s = String(val ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export function BoardReports({ churchId }: BoardReportsProps) {
  const cid = churchId as Id<"churches">;
  const summary = useQuery(api.reports.getMonthlySummary, { churchId: cid });
  const popular = useQuery(api.reports.getPopularBooks, { churchId: cid, limit: 10 });
  const underutilized = useQuery(api.reports.getUnderutilizedBooks, { churchId: cid, limit: 10 });
  const inventory = useQuery(api.reports.getInventoryStatus, { churchId: cid });
  const smsSpend = useQuery(api.reports.getSmsSpend, { churchId: cid });

  const isLoading = !summary || !popular || !inventory;

  const buildCsvContent = useCallback(() => {
    if (!summary || !popular || !inventory) return "";

    const date = new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" });
    const lines: string[] = [];

    // Header
    lines.push("Blessed Hope SDA Church - Library Board Report");
    lines.push(`Generated: ${date}`);
    lines.push("");

    // Monthly Summary
    lines.push("=== MONTHLY SUMMARY (Last 30 Days) ===");
    lines.push("Metric,Value");
    lines.push(`Total Borrows,${summary.totalBorrows}`);
    lines.push(`Returned,${summary.returned}`);
    lines.push(`On-Time Rate,${summary.onTimeRate}%`);
    lines.push(`Active Borrowers,${summary.uniqueBorrowers}`);
    lines.push(`Currently Overdue,${summary.currentOverdue}`);
    lines.push(`Active Loans,${summary.activeLoans}`);
    lines.push("");

    // Popular Books
    lines.push("=== MOST POPULAR BOOKS ===");
    lines.push("Rank,Title,Author,Borrow Count");
    popular.forEach((b, i) => {
      lines.push(`${i + 1},${escCsv(b.title)},${escCsv(b.author)},${b.borrowCount}`);
    });
    lines.push("");

    // Underutilized
    if (underutilized && underutilized.length > 0) {
      lines.push("=== LEAST BORROWED BOOKS ===");
      lines.push("Title,Author,Borrow Count");
      underutilized.forEach((b) => {
        lines.push(`${escCsv(b.title)},${escCsv(b.author)},${b.borrowCount}`);
      });
      lines.push("");
    }

    // Inventory
    lines.push("=== INVENTORY STATUS ===");
    lines.push("Metric,Value");
    lines.push(`Unique Titles,${inventory.totalBooks}`);
    lines.push(`Total Copies,${inventory.totalCopies}`);
    lines.push(`Available,${inventory.availableCopies}`);
    lines.push(`Borrowed,${inventory.borrowedCopies}`);
    lines.push("");

    if (inventory.categories.length > 0) {
      lines.push("Category,Book Count");
      inventory.categories.forEach((c) => {
        lines.push(`${escCsv(c.name)},${c.count}`);
      });
      lines.push("");
    }

    // SMS
    if (smsSpend) {
      lines.push("=== SMS USAGE (Last 30 Days) ===");
      lines.push("Metric,Value");
      lines.push(`Messages Sent,${smsSpend.totalSent}`);
      lines.push(`Estimated Cost (KES),${smsSpend.estimatedCostKes}`);
    }

    return lines.join("\n");
  }, [summary, popular, underutilized, inventory, smsSpend]);

  const handleExportCsv = () => {
    const csv = buildCsvContent();
    if (!csv) return;
    const month = new Date().toISOString().slice(0, 7);
    downloadFile(csv, `board-report-${month}.csv`, "text/csv;charset=utf-8");
  };

  const handleExportExcel = () => {
    const csv = buildCsvContent();
    if (!csv) return;
    // Excel-compatible TSV with BOM for proper UTF-8 detection
    const tsv = "\uFEFF" + csv.replace(/,/g, "\t");
    const month = new Date().toISOString().slice(0, 7);
    downloadFile(tsv, `board-report-${month}.xls`, "application/vnd.ms-excel;charset=utf-8");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 sm:px-6 pt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Export Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2744] dark:bg-[#F5C400] text-white dark:text-[#051029] rounded-xl text-sm font-bold active:scale-95 transition-transform hover:bg-[#04122e] dark:hover:bg-[#D9A200]"
        >
          <span className="material-symbols-outlined text-base">download</span>
          Export CSV
        </button>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ffdf9f] dark:bg-[#F5C400]/20 text-[#261a00] dark:text-[#F5C400] rounded-xl text-sm font-bold active:scale-95 transition-transform hover:bg-[#eec058] dark:hover:bg-[#F5C400]/30 border border-[#795900]/20 dark:border-[#F5C400]/20"
        >
          <span className="material-symbols-outlined text-base">table_chart</span>
          Export Excel
        </button>
      </div>

      {/* Monthly Summary */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base" style={FONT}>
            <BarChart3 className="h-4 w-4 text-[#795900] dark:text-[#F5C400]" />
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
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base" style={FONT}>
            <TrendingUp className="h-4 w-4 text-[#795900] dark:text-[#F5C400]" />
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
                    <span className="w-5 text-center text-muted-foreground font-bold">{i + 1}</span>
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
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base" style={FONT}>
              <AlertTriangle className="h-4 w-4 text-[#795900] dark:text-[#F5C400]" />
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
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base" style={FONT}>
            <BookOpen className="h-4 w-4 text-[#795900] dark:text-[#F5C400]" />
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
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base" style={FONT}>
              <MessageSquare className="h-4 w-4 text-[#795900] dark:text-[#F5C400]" />
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
