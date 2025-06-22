import type { Metadata } from "next";
import { Yusei_Magic } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Script from "next/script";

const yusei_magic = Yusei_Magic({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  openGraph: {
    title: "Battleship",
    description: "Play Battleship; Strategize, Compete, and Have Fun!!",
    url: "https://playbattleship.vercel.app/",
    siteName: "Battleship",
    images: [
      {
        url: "https://res.cloudinary.com/djwhxlpk5/image/upload/v1750588636/playbattleship.png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  title: "Battleship",
  generator: "Next.js",
  description: "Play Battleship; Strategize, Compete, and Have Fun!!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script
        async
        id="Nenwfif"
        src="https://www.googletagmanager.com/gtag/js?id=G-JGSMP1NM28"
      ></Script>
      <Script id="fwefg">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-JGSMP1NM28');`}
      </Script>
      <GoogleAnalytics gaId="G-JGSMP1NM28" />
      <body className={`${yusei_magic.className} noise`}>{children}</body>
    </html>
  );
}
