import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { EditBookClient } from "@/components/domain/EditBookClient";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  return (
    <div className="p-4">
      <EditBookClient bookId={id} churchId={session.user.churchId} />
    </div>
  );
}
