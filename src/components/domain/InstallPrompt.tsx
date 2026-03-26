"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // iOS detection
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(ios);

    // Show iOS prompt after delay
    if (ios) {
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
      return;
    }

    // Android/Desktop: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[60] mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#1A2744] dark:bg-[#0F2444] rounded-2xl p-4 shadow-2xl border border-[#ffdf9f]/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffdf9f] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#1A2744] text-xl">download</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm">Install Blessed Hope Library</h3>
            <p className="text-[#828eb1] text-xs mt-0.5">
              {isIos
                ? "Tap the Share button, then 'Add to Home Screen'"
                : "Get quick access from your home screen"}
            </p>
          </div>
          <button onClick={handleDismiss} className="text-[#828eb1] hover:text-white p-1">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        {!isIos && (
          <button
            onClick={handleInstall}
            className="w-full mt-3 py-2.5 bg-[#ffdf9f] hover:bg-[#eec058] text-[#261a00] font-bold text-sm rounded-xl active:scale-[0.98] transition-all"
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
}
