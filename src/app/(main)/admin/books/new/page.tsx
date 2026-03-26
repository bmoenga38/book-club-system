import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { BookForm } from "@/components/domain/BookForm";

export default async function AddBookPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="p-4">
      <BookForm churchId={session.user.churchId} />
    </div>
  );
}
