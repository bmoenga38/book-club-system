import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { ActiveBorrowings } from "@/components/domain/ActiveBorrowings";

export default async function ActivePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Active Borrowings</h1>
      <ActiveBorrowings churchId={session.user.churchId} />
    </div>
  );
}
