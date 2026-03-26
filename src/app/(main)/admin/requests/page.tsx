import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { PendingRequests } from "@/components/domain/PendingRequests";

export default async function RequestsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Pending Requests</h1>
      <PendingRequests churchId={session.user.churchId} />
    </div>
  );
}
