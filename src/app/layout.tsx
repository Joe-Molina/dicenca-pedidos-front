"use client";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "./libs/tanstackQueryProvider";
import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${roboto.variable}.className bg-neutral-950`}>
        <Toaster position='bottom-center' />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
