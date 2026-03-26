import { VerifyForm } from "@/components/domain/VerifyForm";
import { getChurches } from "@/lib/db/queries/churchQueries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const phone = params.phone ?? "";
  const mode = (params.mode ?? "register") as "login" | "register";

  // Auto-assign the first church (no dropdown needed)
  let defaultChurchId = "";
  if (mode === "register") {
    const churches = await getChurches();
    if (churches.length > 0) {
      defaultChurchId = churches[0].id;
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify OTP</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to {phone}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyForm
          phone={phone}
          mode={mode}
          defaultChurchId={defaultChurchId}
        />
      </CardContent>
    </Card>
  );
}
