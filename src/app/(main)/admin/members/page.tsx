import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { MemberManagement } from "@/components/domain/MemberManagement";

export default async function MembersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Members</h1>
      <MemberManagement churchId={session.user.churchId} />
    </div>
  );
}
