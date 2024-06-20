"use client";

import { shipColors } from "@/utils/ships";
import MySocket from "@/utils/socket";
import { MyShipPlacement, Ship, displayOptions } from "@/utils/types";
import { useParams } from "next/navigation";
import { shipIds } from "@/utils/types";
import React, { useEffect, useState } from "react";

function SelectShip({
  vertical,
  gameStatus,
  hide,
  display,
  mysocket,
  removeShipFromPlacements,
  myShipPlacements,
  myShips,
  setMyShips,
  setVertical,
  resetBoard,
  playerReady,
  setPlayerReady,
  setSelectedShip,
  handleRandomize,
}: {
  hide: boolean;
  gameStatus: string;
  vertical: boolean;
  mysocket: MySocket;
  display: displayOptions;
  removeShipFromPlacements: (id: shipIds) => void;
  myShips: Ship[];
  playerReady: boolean;
  setVertical: React.Dispatch<React.SetStateAction<boolean>>;
  setPlayerReady: React.Dispatch<React.SetStateAction<boolean>>;
  myShipPlacements: MyShipPlacement;
  setMyShips: React.Dispatch<React.SetStateAction<Ship[]>>;
  resetBoard: () => void;
  setSelectedShip: React.Dispatch<React.SetStateAction<Ship | null>>;
  handleRandomize: () => void;
}) {
  const [displayShips, setDisplayShips] = useState<boolean>(false);
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
        hide
          ? "max-h-0 lg:max-h-96 lg:max-w-0 opacity-0"
          : "max-h-96 lg:max-h-96 lg:max-w-96"
      } transition-all duration-[2s] ease-in-out w-full p-3`}
    >
      <button
        onClick={() => {
          resetBoard();
          setDisplayShips(true);
        }}
        disabled={gameStatus === "initiated" && displayShips}
        className="transition-all duration-200 w-full whitespace-nowrap overflow-hidden focus:outline-none text-black bg-neutral-200 hover:bg-neutral-300 focus:ring-4  focus:ring-neutral-200 font-medium rounded-lg px-5 py-1"
      >
        Place Manually
      </button>

      <div
        className={`${
          displayShips ? "max-h-96 pt-7 pb-2" : "max-h-0 p-0"
        } flex flex-col w-full items-start gap-3 px-1 overflow-hidden transition-all ease-linear duration-[2000ms] mb-2`}
      >
        {myShips.map((ship) => {
          return (
            <div
              key={ship.id}
              className="w-full px-5 flex flex-row items-center justify-between"
            >
              <button
                data-description={ship.id}
                className="transition-all duration-200 flex flex-row gap-[2px]"
                onClick={() => !ship.placed && handleSelectShip(ship)}
              >
                {Array(ship.length)
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={index}
                      style={
                        ship.selected
                          ? {
                              backgroundColor: shipColors[ship.id],
                            }
                          : ship.placed
                          ? {
                              backgroundColor: shipColors[ship.id] + "1",
                            }
                          : {
                              backgroundColor: shipColors[ship.id] + "8",
                            }
                      }
                      className={`${
                        index === 0
                          ? "h-[15px] w-[20px] rounded-s-full outline-black outline"
                          : index === ship.length - 1
                          ? "h-[15px] w-[20px] rounded-e-sm outline-black outline"
                          : "w-[20px] h-[15px] outline-black outline"
                      } outline-[2px]`}
                    ></div>
                  ))}
              </button>
              <button
                style={
                  myShipPlacements[ship.id]
                    ? { display: "block" }
                    : { display: "none" }
                }
                onClick={() => removeShipFromPlacements(ship.id)}
                className="transition-all duration-200 h-[18px] text-[14px] leading-none w-[18px] flex items-center justify-center text-gray-900 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100 font-medium rounded-md"
              >
                -{" "}
              </button>
            </div>
          );
        })}
        <div className="flex flex-row items-center gap-2">
          <button
            onClick={(e) => {
              resetBoard();
              e.currentTarget.blur();
            }}
            className="transition-all duration-200 w-full whitespace-nowrap overflow-hidden focus:outline-none text-black bg-neutral-200 hover:bg-neutral-300 focus:ring-4  focus:ring-neutral-200 font-medium rounded-lg px-5 py-1"
          >
            Reset
          </button>
          <div>
            {vertical ? (
              <button
                onClick={() => setVertical(false)}
                className="transition-all duration-200 grow min-w-[120px] whitespace-nowrap overflow-hidden focus:outline-none text-black bg-neutral-200 hover:bg-neutral-300 focus:ring-4  focus:ring-neutral-200 font-medium rounded-lg px-5 py-1"
              >
                vertical
              </button>
            ) : (
              <button
                onClick={() => setVertical(true)}
                className="transition-all duration-200 grow min-w-[120px] whitespace-nowrap overflow-hidden focus:outline-none text-black bg-neutral-200 hover:bg-neutral-300 focus:ring-4  focus:ring-neutral-200 font-medium rounded-lg px-5 py-1"
              >
                horizontal
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col items-start gap-2">
        <button
          onClick={(e) => {
            setDisplayShips(false);
            handleRandomize();
            e.currentTarget.blur();
          }}
          className="transition-all duration-200 w-full text-black bg-neutral-200 hover:bg-neutral-300 focus:ring-4  focus:ring-neutral-200 font-medium rounded-lg px-5 py-1"
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
          className="w-full transition-all duration-200 focus:outline-none text-white bg-neutral-800 hover:bg-neutral-700 focus:ring-4  focus:ring-neutral-300 font-medium rounded-lg px-5 py-1"
        >
          Ready
        </button>
      </div>
    </section>
  );
}

export default SelectShip;
