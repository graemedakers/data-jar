import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { UserStatus } from "@/components/UserStatus";
import { HelpButton } from "@/components/HelpButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Date Jar | Pick Your Next Date",
    template: "%s | Date Jar",
  },
  description: "A fun, interactive way for couples to decide on their next date. Create a shared jar of ideas and let fate decide!",
  keywords: ["date ideas", "couples app", "relationship", "date night", "random date generator", "decision maker"],
  authors: [{ name: "Date Jar Team" }],
  creator: "Date Jar",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://date-jar.vercel.app",
    title: "Date Jar | Pick Your Next Date",
    description: "Stop asking 'What do you want to do?'. Let the Date Jar decide.",
    siteName: "Date Jar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Date Jar | Pick Your Next Date",
    description: "A fun way for couples to decide on their next date.",
  },
  icons: {
    icon: "/favicon.ico",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <UserStatus />
        <HelpButton />
      </body>
    </html>
  );
}
