"use client";

import { UserData } from "@/utils/types";
import { LogOut, Volume2, VolumeX } from "lucide-react";
import React from "react";

function Nav({
  userData,
  setExitGame,
  setMute,
  mute,
}: {
  userData: UserData;
  setExitGame: React.Dispatch<React.SetStateAction<boolean>>;
  setMute: React.Dispatch<React.SetStateAction<boolean>>;
  mute: boolean;
}) {
  return (
    <nav className="w-full p-3 border-t border-neutral-400">
      <div className="mx-auto w-full lg:w-[860px] flex flex-row items-center justify-between gap-1">
        <p>
          score: <strong className="mr-3">{userData.score}</strong>
          <strong>{userData.nickname}</strong>
        </p>

        <div className="flex flex-row items-center gap-2">
          {mute ? (
            <button
              className="transition-all duration-200 text-gray-900 hover:bg-orange-100 focus:outline-none focus:ring-4 focus:ring-orange-200 font-medium rounded-md p-2"
              onClick={() => setMute(false)}
            >
              <VolumeX />
            </button>
          ) : (
            <button
              className="transition-all duration-200 text-gray-900 hover:bg-orange-100 focus:outline-none focus:ring-4 focus:ring-orange-200 font-medium rounded-md p-2"
              onClick={() => setMute(true)}
            >
              <Volume2 />
            </button>
          )}
          <button
            className="transition-all duration-200 text-gray-900 hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-200 font-medium rounded-md p-2"
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
