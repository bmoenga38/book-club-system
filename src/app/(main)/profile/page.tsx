import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/domain/ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <ProfileClient userId={session.user.id} churchId={session.user.churchId} />
  );
}
