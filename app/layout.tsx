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
  icons: {
    icon: "/favicon.png",
  },
};

/**
 * Use device-width for responsive scaling.
 * The root font-size (1.5625vw) handles proportional scaling across all screen sizes.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
