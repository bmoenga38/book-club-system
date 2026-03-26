import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { DirectIssue } from "@/components/domain/DirectIssue";

export default async function IssuePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Direct Issue</h1>
      <p className="text-sm text-muted-foreground">
        Issue a book directly to a member who is physically present
      </p>
      <DirectIssue churchId={session.user.churchId} />
    </div>
  );
}
