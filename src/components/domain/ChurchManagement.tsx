"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Church,
  Plus,
  Users,
  BookOpen,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { formatError } from "@/lib/errors/formatError";

export function ChurchManagement() {
  const stats = useQuery(api.churches.getAggregateStats);
  const createChurch = useMutation(api.churches.create);
  const toggleActive = useMutation(api.churches.toggleActive);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await createChurch({
        name: form.get("name") as string,
        code: (form.get("code") as string) || undefined,
        address: (form.get("address") as string) || undefined,
        contactPhone: (form.get("contactPhone") as string) || undefined,
        contactEmail: (form.get("contactEmail") as string) || undefined,
      });
      toast.success("Church created");
      setShowForm(false);
    } catch (error) {
      toast.error(formatError(error, "Failed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24 pt-6" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Aggregate stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{stats.totalChurches}</p>
              <p className="text-xs text-muted-foreground">Churches</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeMembers}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalBooks}</p>
              <p className="text-xs text-muted-foreground">Books</p>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Active Borrowings</span>
            <span className="font-medium">{stats.activeBorrowings}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Overdue</span>
            <Badge variant={stats.overdue > 0 ? "destructive" : "secondary"}>
              {stats.overdue}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Add church button */}
      <Button onClick={() => setShowForm(!showForm)} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        {showForm ? "Cancel" : "Add New Church"}
      </Button>

      {/* Add church form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">Church Name *</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="code">Church Code</Label>
                <Input id="code" name="code" placeholder="e.g. NYERI-CENTRAL" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input id="contactPhone" name="contactPhone" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input id="contactEmail" name="contactEmail" type="email" />
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Creating..." : "Create Church"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Per-church breakdown */}
      <div className="space-y-3">
        {stats.perChurch.map((church) => (
          <Card key={church._id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Church className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">{church.name}</CardTitle>
                </div>
                <Badge variant={church.isActive ? "default" : "secondary"}>
                  {church.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {church.code && (
                <p className="text-xs text-muted-foreground">{church.code}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <Users className="mx-auto h-3 w-3 text-muted-foreground mb-1" />
                  <p className="font-medium">{church.activeMembers}</p>
                  <p className="text-muted-foreground">Members</p>
                </div>
                <div>
                  <BookOpen className="mx-auto h-3 w-3 text-muted-foreground mb-1" />
                  <p className="font-medium">{church.books}</p>
                  <p className="text-muted-foreground">Books</p>
                </div>
                <div>
                  <p className="font-medium">{church.activeBorrowings}</p>
                  <p className="text-muted-foreground">Active</p>
                </div>
                <div>
                  <AlertTriangle className="mx-auto h-3 w-3 text-muted-foreground mb-1" />
                  <p className="font-medium">{church.overdue}</p>
                  <p className="text-muted-foreground">Overdue</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={async () => {
                  await toggleActive({ id: church._id as Id<"churches"> });
                  toast.success(
                    church.isActive ? "Church deactivated" : "Church activated"
                  );
                }}
              >
                {church.isActive ? "Deactivate" : "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
