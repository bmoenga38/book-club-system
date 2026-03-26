import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default async function PendingVerificationPage() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.status === "active") redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle>Verification Pending</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Your account is awaiting verification by the church evangelist.
            You&apos;ll receive an SMS once your membership has been confirmed.
          </p>
          <p className="text-sm text-muted-foreground">
            This usually takes less than 24 hours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
