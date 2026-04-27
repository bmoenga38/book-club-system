import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { BoardReports } from "@/components/domain/BoardReports";
import Link from "next/link";

const FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };

export default async function ReportsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="px-4 sm:px-6 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-foreground hover:bg-muted p-2 rounded-full transition-colors active:scale-95">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </Link>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#795900] dark:text-[#F5C400]">Sanctuary Admin</span>
          <h1 className="text-xl font-bold tracking-tight text-foreground" style={FONT}>Board Reports</h1>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-5 px-1">
        Monthly summary for church board meetings. Export to CSV or Excel for sharing.
      </p>

      <BoardReports churchId={session.user.churchId} />
    </div>
  );
}
