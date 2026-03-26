import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/domain/AdminDashboard";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <AdminDashboard churchId={session.user.churchId} />
    </div>
  );
}
