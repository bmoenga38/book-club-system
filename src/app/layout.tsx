import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { SyncProvider } from "@/providers/SyncProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Blessed Hope Library",
  description: "Blessed Hope SDA Church Library Management System",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#F7C700",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ConvexClientProvider>
          <ThemeProvider>
            <AuthProvider>
              <SyncProvider>
                {children}
                <Toaster />
              </SyncProvider>
            </AuthProvider>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
