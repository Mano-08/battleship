"use client";

// import { Loading } from "@/assets/svgs";
import MySocket from "@/utils/socket";
import Link from "next/link";
import React, { useState } from "react";
import Loading from "../Loading";
import { displayOptions } from "@/utils/types";
import { X } from "lucide-react";

function GameOver({
  room,
  setPlayAgain,
  setDisplay,
  playAgain,
  setShowGameOverDialog,
  message,
  setGameStatus,
  mysocket,
}: {
  playAgain: boolean;
  room: string;
  message: string;
  mysocket: MySocket;
  setShowGameOverDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setDisplay: React.Dispatch<React.SetStateAction<displayOptions>>;
  setGameStatus: React.Dispatch<
    React.SetStateAction<"initiating" | "gameover" | "restart" | "initiated">
  >;
  setPlayAgain: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  function handlePlayAgain() {
    setPlayAgain(true);
    mysocket.send("requestPlayAgain", { playerId: mysocket.getId(), room });
  }

  function handleSendAck() {
    setDisplay("");
    setPlayAgain(false);
    setGameStatus("restart");
    mysocket.send("acceptPlayAgain", { playerId: mysocket.getId(), room });
  }
  return (
    <div
      onClick={() => setShowGameOverDialog(false)}
      className="fixed h-screen w-screen top-0 left-0 bg-black/60 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex relative text-center flex-col gap-2 px-4 py-6 rounded-lg bg-white w-[90vw] lg:w-[400px]"
      >
        <button
          className="absolute top-3 right-3 rounded-full bg-red-100 hover:bg-red-200 p-1"
          onClick={() => setShowGameOverDialog(false)}
        >
          <X size={15} />
        </button>
        <h1 className="text-[1.1rem] sm:text-[1.3rem] w-full border-b border-neutral-200 font-semibold">
          {message === "play_again" ? "Play Again?" : "Game Over"}
        </h1>
        <div className="p-2 text-sm sm:text-base">
          {message === "play_again" ? (
            <p>Your friend wants to play the game again</p>
          ) : message === "game_lost" ? (
            <p>Oops! you&apos;ve lost the game</p>
          ) : (
            <p>Congratulations! you&apos;ve won the game</p>
          )}
        </div>

        {playAgain && (
          <div className="flex flex-row items-center justify-center text-sm py-2 gap-5">
            waiting for acknowledgment <Loading />
          </div>
        )}

        <div className="flex flex-row justify-evenly">
          <Link
            href="/"
            className="transition-all duration-200 min-w-[100px] sm:min-w-[120px] text-sm sm:text-base whitespace-nowrap overflow-hidden text-white bg-black outline outline-black font-medium rounded-lg px-5 py-1"
          >
            {message === "play_again" ? "Reject" : "Exit"}
          </Link>
          <button
            onClick={message === "play_again" ? handleSendAck : handlePlayAgain}
            className="transition-all text-sm sm:text-base duration-200 min-w-[100px] sm:min-w-[120px] whitespace-nowrap overflow-hidden text-black outline outline-black font-medium rounded-lg px-5 py-1"
          >
            {message === "play_again" ? "Accept" : "Play Again"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameOver;
