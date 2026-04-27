"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const SESSION_KEY = "pwa-install-shown-this-session";
const DISMISSED_KEY = "pwa-install-dismissed-permanent";

export function InstallPrompt() {
  const { status } = useSession();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Only show after the user is authenticated
    if (status !== "authenticated") return;

    // Skip if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Skip if user has permanently dismissed
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;

    // Skip if already shown this session (sessionStorage clears on browser close)
    if (sessionStorage.getItem(SESSION_KEY) === "true") return;

    // iOS detection
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(ios);

    if (ios) {
      // Show iOS prompt 2 seconds after login (gives time for page to settle)
      const t = setTimeout(() => {
        setShowPrompt(true);
        sessionStorage.setItem(SESSION_KEY, "true");
      }, 2000);
      return () => clearTimeout(t);
    }

    // Android/Desktop: capture install event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => {
        setShowPrompt(true);
        sessionStorage.setItem(SESSION_KEY, "true");
      }, 1500);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // If beforeinstallprompt already fired before this component mounted,
    // browsers store the event — show the prompt anyway so iOS-style install
    // hint still appears on Android Chrome that's already installable
    const checkInstallable = setTimeout(() => {
      if (!deferredPrompt && !sessionStorage.getItem(SESSION_KEY)) {
        // For browsers that don't fire beforeinstallprompt (e.g. when already manually dismissed),
        // we still show the iOS-style hint
        setShowPrompt(true);
        sessionStorage.setItem(SESSION_KEY, "true");
      }
    }, 4000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(checkInstallable);
    };
  }, [status, deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
        localStorage.setItem(DISMISSED_KEY, "true");
      }
      setDeferredPrompt(null);
    } else {
      // No native prompt — guide them to manual install
      setShowPrompt(false);
    }
  };

  const handleDismiss = (permanent: boolean = false) => {
    setShowPrompt(false);
    if (permanent) {
      localStorage.setItem(DISMISSED_KEY, "true");
    }
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
        onClick={() => handleDismiss(false)}
      />

      {/* Modal — flex-centered overlay */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-sm pointer-events-auto animate-in zoom-in-95 fade-in duration-200">
        <div className="bg-white dark:bg-[#0F2444] rounded-3xl p-6 shadow-2xl border border-[#ffdf9f]/30 dark:border-[#F5C400]/30">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Bookclub" className="w-full h-full" />
            </div>
          </div>

          {/* Title */}
          <h2
            className="text-center text-xl font-bold text-[#1A2744] dark:text-white mb-2"
            style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
          >
            Install Blessed Hope Library
          </h2>
          <p className="text-center text-[#45464d] dark:text-[#A4A4A4] text-sm mb-5 leading-relaxed">
            {isIos
              ? "Add to your home screen for quick access. Tap the Share icon below, then 'Add to Home Screen'."
              : "Get the full app experience — works offline, faster loading, and one tap from your home screen."}
          </p>

          {/* iOS instructions */}
          {isIos && (
            <div className="bg-[#f7f9fc] dark:bg-[#163050] rounded-2xl p-4 mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#1A2744] dark:text-[#F5C400]">ios_share</span>
              <p className="text-xs text-[#45464d] dark:text-[#A4A4A4] flex-1">
                Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            {!isIos && (
              <button
                onClick={handleInstall}
                className="w-full py-3 bg-[#ffdf9f] hover:bg-[#eec058] text-[#261a00] font-bold rounded-2xl active:scale-[0.98] transition-all shadow-md"
              >
                Install App
              </button>
            )}
            <button
              onClick={() => handleDismiss(false)}
              className="w-full py-2.5 text-[#45464d] dark:text-[#A4A4A4] text-sm font-medium hover:text-[#1A2744] dark:hover:text-white transition-colors"
            >
              {isIos ? "Got it" : "Maybe later"}
            </button>
            <button
              onClick={() => handleDismiss(true)}
              className="w-full py-1.5 text-[10px] uppercase tracking-wider text-[#75777e] dark:text-[#75777e] hover:text-[#c62828] transition-colors"
            >
              Don&apos;t show again
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
