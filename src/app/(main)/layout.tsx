import { AppHeader } from "@/components/domain/AppHeader";
import { AppNav } from "@/components/domain/AppNav";
import { PendingVerificationBanner } from "@/components/domain/PendingVerificationBanner";
import { OfflineBanner } from "@/components/domain/OfflineBanner";
import { InstallPrompt } from "@/components/domain/InstallPrompt";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <OfflineBanner />
      <PendingVerificationBanner />
      <div className="mx-auto w-full max-w-lg flex-1 pb-20">{children}</div>
      <AppNav />
      <InstallPrompt />
    </div>
  );
}
