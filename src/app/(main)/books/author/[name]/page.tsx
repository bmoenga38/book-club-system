import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { AuthorDetail } from "@/components/domain/AuthorDetail";

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { name } = await params;
  const authorName = decodeURIComponent(name);

  return (
    <AuthorDetail
      authorName={authorName}
      churchId={session.user.churchId}
    />
  );
}
