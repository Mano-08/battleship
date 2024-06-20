import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "./globals.css";

// Bricolage_Grotesque

const karla = Karla({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Battleship",
  description: "Online Multiplayer Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${karla.className} noise`}>{children}</body>
    </html>
  );
}
