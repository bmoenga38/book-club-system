import { auth, signOut } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/domain/ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div>
      <ProfileClient userId={session.user.id} churchId={session.user.churchId} />
      <div className="px-6 pb-8">
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full h-[48px] border-2 border-dashed border-border rounded-xl flex items-center justify-center hover:bg-muted transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-sm mr-2">logout</span>
            <span className="font-semibold text-sm">Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
