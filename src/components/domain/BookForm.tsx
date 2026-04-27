"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatError } from "@/lib/errors/formatError";

interface BookFormProps {
  churchId: string;
  book?: {
    _id: string;
    title: string;
    author: string;
    description?: string;
    category?: string;
    isbn?: string;
    totalCopies: number;
  };
}

export function BookForm({ churchId, book }: BookFormProps) {
  const router = useRouter();
  const createBook = useMutation(api.books.create);
  const updateBook = useMutation(api.books.update);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!book;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const author = form.get("author") as string;
    const description = (form.get("description") as string) || undefined;
    const category = (form.get("category") as string) || undefined;
    const isbn = (form.get("isbn") as string) || undefined;
    const totalCopies = parseInt(form.get("totalCopies") as string, 10);

    if (!title || !author || isNaN(totalCopies) || totalCopies < 1) {
      toast.error("Please fill in all required fields");
      setSubmitting(false);
      return;
    }

    try {
      if (isEditing && book) {
        await updateBook({
          id: book._id as Id<"books">,
          title,
          author,
          description,
          category,
          isbn,
          totalCopies,
        });
        toast.success("Book updated successfully");
        router.push(`/books/${book._id}`);
      } else {
        const id = await createBook({
          title,
          author,
          description,
          category,
          isbn,
          totalCopies,
          churchId: churchId as Id<"churches">,
        });
        toast.success("Book added to catalog");
        router.push(`/books/${id}`);
      }
    } catch (error) {
      toast.error(formatError(error, "Failed to save book"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/books"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to catalog
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Book" : "Add New Book"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={book?.title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                name="author"
                defaultValue={book?.author}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={book?.description}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                defaultValue={book?.category}
                placeholder="e.g. Doctrine & Fundamentals"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                name="isbn"
                defaultValue={book?.isbn}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalCopies">Total Copies *</Label>
              <Input
                id="totalCopies"
                name="totalCopies"
                type="number"
                min={1}
                defaultValue={book?.totalCopies ?? 1}
                required
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting
                ? "Saving..."
                : isEditing
                  ? "Update Book"
                  : "Add Book"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
