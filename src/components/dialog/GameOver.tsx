"use client";

// import { Loading } from "@/assets/svgs";
import MySocket from "@/utils/socket";
import Link from "next/link";
import React, { useState } from "react";
import Loading from "../Loading";
import { displayOptions } from "@/utils/types";

function GameOver({
  room,
  setPlayAgain,
  setDisplay,
  playAgain,
  message,
  setGameStatus,
  mysocket,
}: {
  playAgain: boolean;
  room: string;
  message: string;
  mysocket: MySocket;
  setDisplay: React.Dispatch<React.SetStateAction<displayOptions>>;
  setGameStatus: React.Dispatch<React.SetStateAction<string>>;
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
    <div className="fixed h-screen w-screen top-0 left-0 bg-black/60 flex items-center justify-center">
      <div className="flex text-center flex-col gap-2 px-4 py-6 rounded-lg bg-white w-[90vw] lg:w-[400px]">
        <h1 className="text-[1.3rem] w-full border-b border-neutral-200 font-semibold">
          {message === "play_again" ? "Play Again?" : "Game Over"}
        </h1>
        <div className="p-2">
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
          <button
            onClick={message === "play_again" ? handleSendAck : handlePlayAgain}
            className="transition-all duration-200 min-w-[120px] focus:outline-none text-white bg-green-800 hover:bg-green-700 focus:ring-4  focus:ring-green-300 font-medium rounded-lg px-5 py-1"
          >
            {message === "play_again" ? "Accept" : "Play Again"}
          </button>
          <Link
            href="/"
            className="min-w-[120px] focus:outline-none text-white bg-red-800 hover:bg-red-700 focus:ring-4  focus:ring-red-300 font-medium rounded-lg px-5 py-1"
          >
            {message === "play_again" ? "Reject" : "Exit"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default GameOver;
