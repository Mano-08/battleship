"use client";

import { Loading } from "@/assets/svgs";
import MySocket from "@/utils/socket";
import Link from "next/link";
import React, { useState } from "react";

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
  setDisplay: React.Dispatch<React.SetStateAction<string>>;
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
    <div className="fixed top-0 left-0 z-[100] h-screen w-screen flex bg-black/60 justify-center items-center">
      <div className="rounded-lg flex flex-col items-center justify-center bg-white p-6">
        <div>{message === "play_again" ? "Play Again?" : "Game Over"}</div>
        <p>
          {message === "play_again"
            ? "Your friend wants to play the game again"
            : message === "game_lost"
            ? "Oops! you've lost the game"
            : "Congratulations! you've won the game"}
        </p>
        <div>
          {playAgain && "waiting for acknowledgment" && (
            <div className="animate-spin h-[24px] w-[24px]">
              <Loading />
            </div>
          )}
        </div>
        <Link href="/">
          <button>{message === "play_again" ? "Reject" : "Exit"}</button>
        </Link>
        <button
          onClick={message === "play_again" ? handleSendAck : handlePlayAgain}
          className="my-12 rounded-md text-white px-5 py-1 bg-green-600 hover:bg-green-500 disabled:bg-green-500 disabled:cursor-not-allowed"
        >
          {message === "play_again" ? "Accept" : "Play Again"}
        </button>
      </div>
    </div>
  );
}

export default GameOver;
