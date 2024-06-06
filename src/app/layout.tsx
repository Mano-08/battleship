import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Karla } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const bricolageGrotesque = Bricolage_Grotesque({ subsets: ["latin"] });
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
