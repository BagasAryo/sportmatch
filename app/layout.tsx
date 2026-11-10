import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script"; // 1. Import ini
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "SportMatch", template: "%s | SportMatch" },
  description: "Cari dan booking lapangan futsal, badminton, dan voli.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}

        {/* 2. Cloudflare Web Analytics */}
        <Script src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "7c48f0c800f54f8d97b357eea280eb0d"}' strategy="afterInteractive" />
      </body>
    </html>
  );
}
