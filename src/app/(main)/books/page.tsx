import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { BookCatalog } from "@/components/domain/BookCatalog";

export default async function BooksPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <BookCatalog
      churchId={session.user.churchId}
      userRole={session.user.role}
    />
  );
}
