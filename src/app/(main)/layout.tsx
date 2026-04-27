import { AppHeader } from "@/components/domain/AppHeader";
import { AppNav } from "@/components/domain/AppNav";
import { AppFooter } from "@/components/domain/AppFooter";
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
      <div className="md:ml-56 flex-1">
        {/* pb gives space for: nav (~64px) + footer (~36px) + breathing room */}
        <div className="mx-auto w-full max-w-lg md:max-w-4xl flex-1 pb-32 md:pb-24 md:pt-2 px-0 md:px-6">{children}</div>
      </div>
      <AppFooter />
      <AppNav />
      <InstallPrompt />
    </div>
  );
}
