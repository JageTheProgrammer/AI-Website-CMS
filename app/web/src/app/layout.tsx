import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "Polityra CMS — Open-source website builder",
    template: "%s | Polityra CMS",
  },
  description:
    "An open-source, AI-assisted website builder maintained by the Polityra organization. Apache-2.0 licensed and under active development.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
