import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  title: "Shem — Developer Portfolio",
  description: "BSIT student & developer looking for my first professional role. Backend focused, full-stack capable.",
};

/**
 * Force minimum viewport width to 1024px.
 * - Desktop (>= 1024px): uses native device width (unaffected)
 * - Tablet (768px–1024px): renders at 1024px, slight zoom-out
 * - Mobile (< 768px): renders at 1024px, browser zooms out to fit → shows desktop layout
 */
export const viewport: Viewport = {
  width: 1024,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" theme="dark" />
        {children}
      </body>
    </html>
  );
}
