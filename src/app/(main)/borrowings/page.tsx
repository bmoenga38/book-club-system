import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { MyBorrowings } from "@/components/domain/MyBorrowings";

export default async function BorrowingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">My Borrowings</h1>
      <MyBorrowings userId={session.user.id} />
    </div>
  );
}
