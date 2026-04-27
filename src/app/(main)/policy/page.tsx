import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { PolicyPage } from "@/components/domain/PolicyPage";

export default async function PolicyRoute() {
  const session = await auth();
  if (!session) redirect("/login");

  return <PolicyPage />;
}
