import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { ProcessReturns } from "@/components/domain/ProcessReturns";

export default async function ReturnsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Process Returns</h1>
      <ProcessReturns churchId={session.user.churchId} />
    </div>
  );
}
