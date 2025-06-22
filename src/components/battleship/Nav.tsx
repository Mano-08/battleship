"use client";

import { UserData } from "@/utils/types";
import {
  LogOut,
  MessageSquareDot,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import React from "react";

function Nav({
  userData,
  showGameOverDialog,
  setShowGameOverDialog,
  setExitGame,
  gameStatus,
  setGameStatus,
  setMute,
  mute,
}: {
  userData: UserData;
  showGameOverDialog: undefined | boolean;
  setShowGameOverDialog:
    | undefined
    | React.Dispatch<React.SetStateAction<boolean>>;
  gameStatus: "initiating" | "gameover" | "restart" | "initiated";
  setGameStatus: React.Dispatch<
    React.SetStateAction<"initiating" | "gameover" | "restart" | "initiated">
  >;
  setExitGame: React.Dispatch<React.SetStateAction<boolean>>;
  setMute: React.Dispatch<React.SetStateAction<boolean>>;
  mute: boolean;
}) {
  return (
    <nav className="w-full p-3 border-t border-neutral-400">
      <div className="mx-auto w-full lg:w-[860px] flex flex-row items-center justify-between gap-1">
        <div className="flex flex-row items-center gap-2">
          {gameStatus === "gameover" &&
            (showGameOverDialog !== undefined ? (
              <button
                className={`${
                  !showGameOverDialog && "animate-pulse"
                } transition-all duration-200 text-gray-900 focus:ring-4 focus:ring-orange-200 font-medium rounded-md p-2`}
                onClick={() =>
                  setShowGameOverDialog && setShowGameOverDialog(true)
                }
              >
                <MessageSquareDot />
              </button>
            ) : (
              <button
                className="transition-all duration-200 text-gray-900 focus:ring-4 focus:ring-orange-200 font-medium rounded-md p-2"
                onClick={() => setGameStatus("initiating")}
              >
                <RotateCcw />
              </button>
            ))}
          {mute ? (
            <button
              className="transition-all duration-200 text-gray-900 focus:ring-4 focus:ring-orange-200 font-medium rounded-md p-2"
              onClick={() => setMute(false)}
            >
              <VolumeX />
            </button>
          ) : (
            <button
              className="transition-all duration-200 text-gray-900 focus:ring-4 focus:ring-orange-200 font-medium rounded-md p-2"
              onClick={() => setMute(true)}
            >
              <Volume2 />
            </button>
          )}
          <button
            className="transition-all duration-200 text-gray-900 hover:bg-red-100 focus:ring-4 focus:ring-red-200 font-medium rounded-md p-2"
            onClick={() => setExitGame(true)}
          >
            <LogOut />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
