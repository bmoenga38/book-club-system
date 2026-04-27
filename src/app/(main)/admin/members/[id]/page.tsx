import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { MemberDetail } from "@/components/domain/MemberDetail";

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  return (
    <div className="space-y-4 p-4">
      <MemberDetail memberId={id} />
    </div>
  );
}
