import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kopa360",
  description: "Where Quality Tutors Meet Opportunity",
  icons: {
    icon: [
      {
        url: "/kopa360-logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/kopa360-logo.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/kopa360-logo.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/kopa360-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
