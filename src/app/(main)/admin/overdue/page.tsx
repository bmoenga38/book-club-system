import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { OverdueList } from "@/components/domain/OverdueList";

export default async function OverduePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Overdue Books</h1>
      <OverdueList churchId={session.user.churchId} />
    </div>
  );
}
