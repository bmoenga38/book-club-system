import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { BoardReports } from "@/components/domain/BoardReports";

export default async function ReportsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Board Reports</h1>
      <p className="text-sm text-muted-foreground">
        Monthly summary for church board meetings
      </p>
      <BoardReports churchId={session.user.churchId} />
    </div>
  );
}
