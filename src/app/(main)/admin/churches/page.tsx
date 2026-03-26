import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { ChurchManagement } from "@/components/domain/ChurchManagement";

export default async function ChurchesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Church Management</h1>
      <ChurchManagement />
    </div>
  );
}
