import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kenya County Governance Explorer 2022–2027",
  description: "Interactive hierarchical tree of all Kenyan government representatives across 47 counties. Evidence-based scorecards sourced from OAG, CoB, TI-Kenya, and IEBC.",
  keywords: ["Kenya", "County Governance", "2022-2027", "OAG", "CoB", "IEBC", "Devolved Government"],
  authors: [{ name: "Kenya Governance Explorer" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
