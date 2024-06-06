"use client";

import { initialBoardConfig } from "@/utils/board";
import { shipColors, ships } from "@/utils/ships";
import MySocket from "@/utils/socket";
import { Board, MyShipPlacement, RandomPlacement, Ship } from "@/utils/types";
import React, { useEffect, useState } from "react";
import SelectShip from "./selectship";
import { getRandomCoord } from "@/helper/randomize";
import { useRouter } from "next/navigation";

function MyBoard({
  mysocket,
  playerReady,
  setWhosTurn,
}: {
  mysocket: MySocket;
  playerReady: boolean;
  setWhosTurn: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const router = useRouter();
  const [myBoard, setMyBoard] = useState<Board[][]>(initialBoardConfig());
  const [vertical, setVertical] = useState<boolean>(false);
  const [myShips, setMyShips] = useState<Ship[]>(ships);
  const [randomBoard, setRandomBoard] = useState<MyShipPlacement>({});
  const [allShipsPlaced, setAllShipsPlaced] = useState<boolean>(false);
  const [selectedShip, setSelectedShip] = useState<null | Ship>(null);
  const [myShipPlacements, setMyShipPlacement] = useState<MyShipPlacement>({});

  useEffect(() => {
    resetBoard();
    const randomCoord = getRandomCoord();
    setRandomBoard(randomCoord);
    setMyShipPlacement(randomCoord);
  }, []);

  useEffect(() => {
    mysocket.setOnAttack(handleTorpedoAttack);
  }, []);

  useEffect(() => {
    if (Object.keys(randomBoard).length === 5) {
      setMyBoard((old) => {
        const newData = [...old];
        for (let s = 0; s < ships.length; s++) {
          const ship = ships[s];
          const {
            vertical,
            length,
            startIndex: { rowStart, colStart },
          } = randomBoard[ship.id];
          if (vertical) {
            for (let i = rowStart; i < rowStart + length; i++) {
              const updatedElement = { ...newData[i][colStart] };
              updatedElement.ship = true;
              if (i === rowStart) {
                updatedElement.details.start = true;
              }
              if (i === rowStart + length - 1) {
                updatedElement.details.end = true;
              }
              updatedElement.details.vertical = true;
              updatedElement.details.id = ship.id;
              newData[i][colStart] = updatedElement;
            }
          } else {
            for (let i = colStart; i < colStart + length; i++) {
              const updatedElement = { ...newData[rowStart][i] };
              updatedElement.ship = true;
              if (i === colStart) {
                updatedElement.details.start = true;
              }
              if (i === colStart + length - 1) {
                updatedElement.details.end = true;
              }
              updatedElement.details.vertical = false;
              updatedElement.details.id = ship.id;
              newData[rowStart][i] = updatedElement;
            }
          }
        }
        return newData;
      });
    }
  }, [randomBoard]);

  useEffect(() => {
    if (!selectedShip) {
      removeHoverStatus();
    }
  }, [selectedShip]);

  function handleTorpedoAttack({
    rindex,
    cindex,
    playerId,
  }: {
    rindex: number;
    cindex: number;
    playerId: string;
  }) {
    if (playerId === mysocket.getId()) {
      return;
    }
    if (!myBoard[rindex][cindex].ship) {
      setWhosTurn("player");
    }
    setMyBoard((oldData) => {
      const newData = [...oldData];
      if (newData[rindex][cindex].ship) {
        const updatedElement = { ...newData[rindex][cindex] };
        updatedElement.details.burst = true;
        newData[rindex][cindex] = updatedElement;
      }
      return newData;
    });
  }

  function removeHoverStatus() {
    setMyBoard((oldData) => {
      const newMyBoard = [...oldData];
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          const updatedElement = { ...oldData[row][col] };
          if (!updatedElement.ship) {
            updatedElement.details.vertical = false;
            updatedElement.details.start = false;
            updatedElement.details.end = false;
          }
          updatedElement.validHover = null;
          newMyBoard[row][col] = updatedElement;
        }
      }
      return newMyBoard;
    });
  }

  function handleMouseEnterCell({
    rindex,
    cindex,
  }: {
    rindex: number;
    cindex: number;
  }) {
    if (!selectedShip) return;
    const length = selectedShip.length;
    removeHoverStatus();

    if (vertical) {
      if (length + rindex <= 10) {
        let shipExist = false;
        for (let row = rindex; row < length + rindex; row++) {
          if (myBoard[row][cindex]["ship"] === true) {
            shipExist = true;
            break;
          }
        }
        if (!shipExist) {
          setMyBoard((oldData) => {
            const newMyBoard = [...oldData];
            for (let row = rindex; row < length + rindex; row++) {
              const updatedElement = { ...newMyBoard[row][cindex] };
              updatedElement.validHover = true;
              updatedElement.details.vertical = true;
              if (row === rindex) {
                updatedElement.details.start = true;
              }
              if (row === rindex + length - 1) {
                updatedElement.details.end = true;
              }
              newMyBoard[row][cindex] = updatedElement;
            }

            return newMyBoard;
          });
        } else {
          // handle if any ship exists on the way
          setMyBoard((oldData) => {
            const newMyBoard = [...oldData];
            for (let row = rindex; row < rindex + selectedShip.length; row++) {
              const updatedElement = { ...oldData[row][cindex] };
              if (!updatedElement.ship) {
                updatedElement.details.vertical = false;
                updatedElement.details.start = false;
                updatedElement.details.end = false;
              }
              updatedElement.validHover = false;
              newMyBoard[row][cindex] = updatedElement;
            }
            return newMyBoard;
          });
        }
      } else {
        setMyBoard((oldData) => {
          const newMyBoard = [...oldData];
          for (let row = rindex; row < 10; row++) {
            const updatedElement = { ...oldData[row][cindex] };
            updatedElement.validHover = false;
            updatedElement.details.vertical = false;
            updatedElement.details.start = false;
            updatedElement.details.end = false;
            newMyBoard[row][cindex] = updatedElement;
          }
          return newMyBoard;
        });
      }
    } else {
      if (length + cindex <= 10) {
        let shipExist = false;
        for (let col = cindex; col < length + cindex; col++) {
          if (myBoard[rindex][col]["ship"] === true) {
            shipExist = true;
            break;
          }
        }
        if (!shipExist) {
          setMyBoard((oldData) => {
            const newMyBoard = [...oldData];
            for (let col = cindex; col < length + cindex; col++) {
              const updatedElement = { ...newMyBoard[rindex][col] };
              updatedElement.validHover = true;
              if (col === cindex) {
                updatedElement.details.start = true;
              }
              if (col === cindex + length - 1) {
                updatedElement.details.end = true;
              }
              newMyBoard[rindex][col] = updatedElement;
            }
            return newMyBoard;
          });
        } else {
          // handle if any ship exists on the way
          setMyBoard((oldData) => {
            const newMyBoard = [...oldData];
            for (let col = cindex; col < cindex + selectedShip.length; col++) {
              const updatedElement = { ...oldData[rindex][col] };
              if (!updatedElement.ship) {
                updatedElement.details.start = false;
                updatedElement.details.vertical = false;
                updatedElement.details.end = false;
              }
              updatedElement.validHover = false;
              newMyBoard[rindex][col] = updatedElement;
            }
            return newMyBoard;
          });
        }
      } else {
        setMyBoard((oldData) => {
          const newMyBoard = [...oldData];
          for (let col = cindex; col < 10; col++) {
            const updatedElement = { ...oldData[rindex][col] };
            updatedElement.validHover = false;
            updatedElement.details.start = false;
            updatedElement.details.end = false;
            newMyBoard[rindex][col] = updatedElement;
          }
          return newMyBoard;
        });
      }
    }
  }

  function handlePlaceShip({
    rindex,
    cindex,
    ship,
  }: {
    rindex: number;
    cindex: number;
    ship: any;
  }) {
    if (ship.validHover && selectedShip !== null) {
      setMyShipPlacement((oldData) => {
        const newData = { ...oldData };
        const newElement = {
          length: selectedShip.length,
          vertical,
          startIndex: { rowStart: rindex, colStart: cindex },
        };
        newData[selectedShip.id] = newElement;
        return newData;
      });
      if (vertical) {
        setMyBoard((oldData) => {
          const newMyBoard = [...oldData];
          for (let row = rindex; row < rindex + selectedShip.length; row++) {
            const updatedElement = { ...oldData[row][cindex] };
            updatedElement.ship = true;
            updatedElement.details.id = selectedShip.id;
            updatedElement.validHover = null;
            newMyBoard[row][cindex] = updatedElement;
          }
          return newMyBoard;
        });
      } else {
        setMyBoard((oldData) => {
          const newMyBoard = [...oldData];
          for (let col = cindex; col < cindex + selectedShip.length; col++) {
            const updatedElement = { ...oldData[rindex][col] };
            updatedElement.ship = true;
            updatedElement.details.id = selectedShip.id;
            updatedElement.validHover = null;
            newMyBoard[rindex][col] = updatedElement;
          }
          return newMyBoard;
        });
      }
      setMyShips((oldData) =>
        oldData.map((ship) =>
          ship.id === selectedShip.id
            ? { ...ship, selected: false, placed: true }
            : ship
        )
      );

      setSelectedShip(null);
    }
  }

  function handleRandomize() {
    resetBoard();
    const randomCoord = getRandomCoord();
    setRandomBoard(randomCoord);
    setMyShipPlacement(randomCoord);
  }

  function resetBoard() {
    setSelectedShip(null);
    setAllShipsPlaced(false);
    setMyShips(ships);
    setMyShipPlacement({});
    setMyBoard((oldData) => {
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          oldData[row][col] = {
            ship: false,
            details: {
              id: "noship",
              burst: false,
              start: false,
              end: false,
              vertical: false,
            },

            validHover: null,
          };
        }
      }
      return oldData;
    });
  }

  function setBoard(randomCoord: any) {}

  return (
    <section className="flex flex-col gap-5 md:flex-row items-center ">
      <SelectShip
        hide={playerReady}
        mysocket={mysocket}
        myShips={myShips}
        myShipPlacements={myShipPlacements}
        setMyShips={setMyShips}
        resetBoard={resetBoard}
        handleRandomize={handleRandomize}
        setSelectedShip={setSelectedShip}
      />
      <div className="flex flex-col outline outline-black p-[7px] rounded-xl">
        {myBoard.map((row: Board[], rindex: number) => (
          <div
            className="flex flex-row"
            key={`mb-r-${rindex}`}
            id={`mb-r-${rindex}`}
          >
            {row.map((ele: Board, cindex) => (
              <div
                className="h-[30px] w-[30px] flex items-center justify-center"
                key={`mb-r-${rindex}-c-${cindex}`}
                id={`mb-r-${rindex}-c-${cindex}`}
                onMouseEnter={() => handleMouseEnterCell({ rindex, cindex })}
                onClick={() => handlePlaceShip({ ship: ele, cindex, rindex })}
              >
                <div
                  style={
                    ele.validHover === null
                      ? ele.ship
                        ? ele.details.burst
                          ? { background: "rgba(7,0,27,0.8)" }
                          : { background: shipColors[ele.details.id as string] }
                        : ele.details.burst
                        ? { background: "rgba(79,79,79,0.80)" }
                        : { background: "rgba(0,0,0,0.1)" }
                      : ele.validHover === true
                      ? { background: "rgba(0,0,0,0.5)" }
                      : ele.validHover === false
                      ? { background: "rgba(195,56,56,0.73)" }
                      : {}
                  }
                  className={`${
                    ele.ship
                      ? ele.details.start
                        ? ele.details.vertical
                          ? "h-[30px] w-[25px] rounded-t-full outline-black outline"
                          : "h-[25px] w-[30px] rounded-s-full outline-black outline"
                        : ele.details.end
                        ? ele.details.vertical
                          ? "h-[30px] w-[25px] rounded-b-md outline-black outline"
                          : "h-[25px] w-[30px] rounded-e-md outline-black outline"
                        : ele.details.vertical
                        ? "w-[25px] h-[30px] outline-black outline"
                        : "w-[30px] h-[25px] outline-black outline"
                      : "rounded-md h-[10px] w-[10px] outline-[0.01rem]"
                  }`}
                ></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export default MyBoard;
