import type { Metadata } from "next";
import { Karla } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Head from "next/head";

// Bricolage_Grotesque

const karla = Karla({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Battleship",
  description: "Play Battleship; Strategize, Compete, and Have Fun!!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleAnalytics gaId="G-JGSMP1NM28" />
      <body className={`${karla.className} noise`}>{children}</body>
    </html>
  );
}
