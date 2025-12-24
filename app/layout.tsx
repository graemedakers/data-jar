import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { UserStatus } from "@/components/UserStatus";
import { HelpButton } from "@/components/HelpButton";
import { BottomNav } from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://datejar.com'),
  title: {
    default: "Date Jar | The Ultimate Ideas Generator",
    template: "%s | Date Jar",
  },
  description: "Stop asking \"what should we do?\" Spin the jar for ideas, sync with friends, and decide together. Try Date Jar for free today!",
  keywords: [
    "date ideas", "couples app", "relationship", "date night", "random date generator",
    "decision maker", "date planner", "couple activities", "romantic date ideas", "relationship app"
  ],
  authors: [{ name: "Date Jar Team" }],
  creator: "Date Jar",
  applicationName: "Date Jar",
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://datejar.com",
    title: "Date Jar | The Ultimate Ideas Generator",
    description: "Stop asking 'What do you want to do?'. Let the Date Jar decide.",
    siteName: "Date Jar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Date Jar | The Ultimate Ideas Generator",
    description: "A fun way for couples and friends to decide what to do.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <BottomNav />
        <UserStatus />
        <HelpButton />
      </body>
    </html>
  );
}
