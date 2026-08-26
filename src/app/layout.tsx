import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import AuthModal from "@/components/auth-modal";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { OfflineIndicator } from "@/components/offline-indicator";
import { ServiceWorkerRegistrar } from "@/components/service-worker-registrar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#059669",
};

export const metadata: Metadata = {
  title: "Kenya County Governance Explorer 2022–2027",
  description: "Interactive hierarchical tree of all Kenyan government representatives across 47 counties. Evidence-based scorecards sourced from OAG, CoB, TI-Kenya, and IEBC.",
  keywords: ["Kenya", "County Governance", "2022-2027", "OAG", "CoB", "IEBC", "Devolved Government"],
  authors: [{ name: "Kenya Governance Explorer" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "Kenya County Governance Explorer",
    description: "Interactive hierarchical tree of all 47 Kenyan county governments with evidence-based scorecards",
    url: "https://chat.z.ai",
    siteName: "Kenya Governance Explorer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kenya County Governance Explorer 2022-2027",
    description: "All 47 counties, evidence-based scorecards, OAG & CoB data",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <OfflineIndicator />
              {children}
              <AuthModal />
              <PwaInstallPrompt />
              <Toaster />
              <ServiceWorkerRegistrar />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
