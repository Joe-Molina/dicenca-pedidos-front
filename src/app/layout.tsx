"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./libs/tanstackQueryProvider";
import { Toaster } from "@/components/ui/sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-900`}
      >
        <Toaster position='bottom-center' />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
