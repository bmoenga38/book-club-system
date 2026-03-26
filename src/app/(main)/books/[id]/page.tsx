import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { BookDetail } from "@/components/domain/BookDetail";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  return (
    <div className="p-4">
      <BookDetail
        bookId={id}
        userId={session.user.id}
        userRole={session.user.role}
        userStatus={session.user.status}
        churchId={session.user.churchId}
      />
    </div>
  );
}
