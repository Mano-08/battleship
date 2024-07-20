import PlayWithRobot from "@/components/battleship/PlayWithRobot";
import { Metadata } from "next/types";
import React from "react";

export const metadata: Metadata = {
  title: "Play Battleship",
  description:
    "Play Battleship with Robot; Strategize, Compete, and Have Fun!!",
};

function Page() {
  return <PlayWithRobot />;
}

export default Page;
