"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { BookForm } from "./BookForm";

interface EditBookClientProps {
  bookId: string;
  churchId: string;
}

export function EditBookClient({ bookId, churchId }: EditBookClientProps) {
  const book = useQuery(api.books.getById, {
    id: bookId as Id<"books">,
  });

  if (book === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (book === null) {
    return <p className="text-muted-foreground">Book not found</p>;
  }

  return (
    <BookForm
      churchId={churchId}
      book={{
        _id: book._id,
        title: book.title,
        author: book.author,
        description: book.description,
        category: book.category,
        isbn: book.isbn,
        totalCopies: book.totalCopies,
      }}
    />
  );
}
