import Hero from "@/components/Hero";
import { Metadata } from "next/types";
import React from "react";

export const metadata: Metadata = {
  title: "Play Battleship",
  description:
    "Play Battleship with Robot; Strategize, Compete, and Have Fun!!",
};

function Page() {
  return (
    <main className="flex flex-col px-1.5 md:px-16">
      <Hero />
    </main>
  );
}

export default Page;
