"use client";

import MySocket from "@/utils/socket";
import { MyShipPlacement, Ship } from "@/utils/types";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

function SelectShip({
  hide,
  mysocket,
  myShipPlacements,
  myShips,
  setMyShips,
  resetBoard,
  setSelectedShip,
  handleRandomize,
}: {
  hide: boolean;
  mysocket: MySocket;
  myShips: Ship[];
  myShipPlacements: MyShipPlacement;
  setMyShips: React.Dispatch<React.SetStateAction<Ship[]>>;
  resetBoard: () => void;
  setSelectedShip: React.Dispatch<React.SetStateAction<Ship | null>>;
  handleRandomize: () => void;
}) {
  const [displayShips, setDisplayShips] = useState<boolean>(false);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const { room }: { room: string } = useParams();

  function handleSelectShip(selectedShip: Ship) {
    setMyShips((oldData) =>
      oldData.map((ship) => {
        return {
          ...ship,
          selected: ship.id === selectedShip.id ? !ship.selected : false,
        };
      })
    );
    setSelectedShip((prev) =>
      prev ? (prev.id === selectedShip.id ? null : selectedShip) : selectedShip
    );
  }
  return (
    <section
      className={`flex flex-col items-start overflow-hidden ${
        hide ? "max-w-0" : "max-w-96"
      } transition-all duration-[2s] ease-in-out`}
    >
      <button
        onClick={() => {
          resetBoard();
          setDisplayShips(true);
        }}
        disabled={displayShips}
        className="w-full whitespace-nowrap overflow-hidden focus:outline-none text-black bg-neutral-200 hover:bg-neutral-300 focus:ring-4  focus:ring-neutral-200 font-medium rounded-lg px-5 py-1"
      >
        Place Manually
      </button>

      <div
        className={`${
          displayShips ? "max-h-96" : "max-h-0"
        } flex flex-col items-start overflow-hidden transition-all ease-in-out duration-[2000ms] mb-2`}
      >
        {myShips.map((ship) => {
          return (
            <button
              key={ship.id}
              style={
                ship.selected
                  ? { background: "blue" }
                  : ship.placed
                  ? { background: "red" }
                  : {}
              }
              onClick={() => !ship.placed && handleSelectShip(ship)}
            >
              {ship.id}-{ship.length}
            </button>
          );
        })}
        <button
          onClick={(e) => {
            resetBoard();
            e.currentTarget.blur();
          }}
          className="w-full text-black bg-neutral-200 hover:bg-neutral-300 focus:ring-2 focus:ring-neutral-200 font-medium rounded-lg px-5 py-1"
        >
          Reset
        </button>
      </div>

      <div className="w-full flex flex-col items-start gap-2">
        <button
          onClick={(e) => {
            setDisplayShips(false);
            handleRandomize();
            e.currentTarget.blur();
          }}
          className="w-full text-black bg-neutral-200 hover:bg-neutral-300 focus:ring-4  focus:ring-neutral-200 font-medium rounded-lg px-5 py-1"
        >
          Randomize
        </button>
        <button
          onClick={(e) => {
            e.currentTarget.blur();
            setPlayerReady(true);
            mysocket.send("ready", {
              room: room,
              placement: myShipPlacements,
              playerId: mysocket.getId(),
            });
          }}
          disabled={playerReady}
          className="w-full text-black bg-neutral-200 hover:bg-neutral-300 focus:ring-4  focus:ring-neutral-200 font-medium rounded-lg px-5 py-1"
        >
          Ready
        </button>
      </div>
    </section>
  );
}

export default SelectShip;
