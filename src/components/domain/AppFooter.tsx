"use client";

import { useState, useRef, useEffect } from "react";

const FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };

export function AppFooter() {
  const [showHelp, setShowHelp] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showHelp) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setShowHelp(false);
    }
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [showHelp]);

  return (
    <>
      {/* Footer bar — sits above mobile nav (bottom-[60px]) on small screens, bottom-0 on desktop */}
      <footer className="fixed bottom-[60px] md:bottom-0 left-0 right-0 z-30 md:left-56 bg-white/95 dark:bg-[#0A1A3A]/95 backdrop-blur-md border-t border-border/40 px-4 py-2">
        <div className="flex items-center justify-between max-w-md mx-auto md:max-w-4xl">
          <p className="text-[10px] text-muted-foreground tracking-wide">
            Powered by{" "}
            <span className="font-bold text-[#1A2744] dark:text-[#F5C400]">
              Bytebazaar Tech Labs
            </span>
          </p>
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#795900] dark:text-[#F5C400] hover:underline active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[12px]">help</span>
            Help
          </button>
        </div>
      </footer>

      {/* Help Modal */}
      {showHelp && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
            onClick={() => setShowHelp(false)}
          />

          {/* Modal — centered overlay using flex container */}
          <div
            ref={modalRef}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-sm pointer-events-auto animate-in zoom-in-95 fade-in duration-200">
            <div className="bg-white dark:bg-[#0F2444] rounded-3xl p-6 shadow-2xl border border-[#ffdf9f]/30 dark:border-[#F5C400]/30 relative">
              {/* Close button */}
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f7f9fc] dark:bg-[#163050] hover:bg-[#e0e3e6] dark:hover:bg-[#1A3058] flex items-center justify-center transition-colors active:scale-90"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[#1A2744] dark:text-[#F5C400] text-lg">close</span>
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#ffdf9f] dark:bg-[#F5C400]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#261a00] dark:text-[#F5C400] text-3xl">support_agent</span>
                </div>
              </div>

              {/* Title */}
              <h2
                className="text-center text-xl font-bold text-[#1A2744] dark:text-white mb-1"
                style={FONT}
              >
                Need Help?
              </h2>
              <p className="text-center text-[#45464d] dark:text-[#A4A4A4] text-sm mb-5">
                Reach out to Brian for support
              </p>

              {/* Contact options */}
              <div className="space-y-2.5">
                {/* Phone */}
                <a
                  href="tel:+254792697197"
                  className="flex items-center gap-3 p-3.5 bg-[#f7f9fc] dark:bg-[#163050] hover:bg-[#eceef1] dark:hover:bg-[#1A3058] rounded-2xl transition-colors active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1FA774]/15 dark:bg-[#4ADE9F]/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#1FA774] dark:text-[#4ADE9F]">call</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#795900] dark:text-[#F5C400]">Call</p>
                    <p className="text-sm font-semibold text-[#1A2744] dark:text-white">0792 697 197</p>
                  </div>
                  <span className="material-symbols-outlined text-[#c5c6ce]">chevron_right</span>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/254792697197?text=Hi%20Brian%2C%20I%20need%20help%20with%20Blessed%20Hope%20Library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 bg-[#f7f9fc] dark:bg-[#163050] hover:bg-[#eceef1] dark:hover:bg-[#1A3058] rounded-2xl transition-colors active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#25D366]">chat</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#795900] dark:text-[#F5C400]">WhatsApp</p>
                    <p className="text-sm font-semibold text-[#1A2744] dark:text-white">Message Brian</p>
                  </div>
                  <span className="material-symbols-outlined text-[#c5c6ce]">chevron_right</span>
                </a>

                {/* Email */}
                <a
                  href="mailto:hello@bytebazaar.co.ke?subject=Blessed%20Hope%20Library%20Support"
                  className="flex items-center gap-3 p-3.5 bg-[#f7f9fc] dark:bg-[#163050] hover:bg-[#eceef1] dark:hover:bg-[#1A3058] rounded-2xl transition-colors active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1a2744]/10 dark:bg-[#F5C400]/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#1a2744] dark:text-[#F5C400]">mail</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#795900] dark:text-[#F5C400]">Email</p>
                    <p className="text-sm font-semibold text-[#1A2744] dark:text-white truncate">hello@bytebazaar.co.ke</p>
                  </div>
                  <span className="material-symbols-outlined text-[#c5c6ce]">chevron_right</span>
                </a>
              </div>

              {/* Powered by */}
              <p className="text-center text-[10px] text-muted-foreground mt-5 tracking-wide">
                Powered by{" "}
                <span className="font-bold text-[#1A2744] dark:text-[#F5C400]">
                  Bytebazaar Tech Labs
                </span>
              </p>
            </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
