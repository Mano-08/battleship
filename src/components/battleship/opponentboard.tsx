"use client";

import { Fire, Skeleton } from "@/assets/svgs";
import { initialBoardConfig } from "@/utils/board";
import { shipColors } from "@/utils/ships";
import MySocket from "@/utils/socket";
import { Board, MyShipPlacement } from "@/utils/types";
import { useParams } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import toast from "react-hot-toast";

function OpponentBoard({
  whosTurn,
  mysocket,
  setOpponentReady,
  setWhosTurn,
  gameStatus,
  setPlayerReady,
  setGameStatus,
  nickname,
}: {
  whosTurn: string | null;
  mysocket: MySocket;
  gameStatus: string;
  nickname: string;
  setWhosTurn: React.Dispatch<React.SetStateAction<string | null>>;
  setOpponentReady: React.Dispatch<React.SetStateAction<boolean>>;
  setPlayerReady: React.Dispatch<React.SetStateAction<boolean>>;
  setGameStatus: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { room }: { room: string } = useParams();
  const [shipPlacement, setShipPlacement] = useState<MyShipPlacement>({});
  const [opponentBoard, setOpponentBoard] = useState<Board[][]>(
    initialBoardConfig()
  );
  const [coord, setCoord] = useState<{ row: number; col: number } | null>(null);
  const [wreckedShips, setWreckedShips] = useState<{ [key: string]: boolean }>(
    {}
  );

  function handleOnReady({
    placement,
    playerId,
  }: {
    placement: MyShipPlacement;
    playerId: string;
  }) {
    if (playerId === mysocket.getId()) {
      setPlayerReady(true);
      return;
    }

    setOpponentReady(true);
    setShipPlacement(placement);
    setOpponentBoard((old) => {
      const newData = [...old];

      for (var key in placement) {
        const shipId = key;
        const {
          vertical,
          length,
          startIndex: { rowStart, colStart },
        } = placement[shipId];
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
            updatedElement.details.id = shipId;
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
            updatedElement.details.id = shipId;
            newData[rowStart][i] = updatedElement;
          }
        }
      }
      return newData;
    });
  }

  useEffect(() => {
    mysocket.onReady = handleOnReady;
  }, []);

  useEffect(() => {
    if (Object.keys(wreckedShips).length === 5) {
      toast.success("You win!");
      setGameStatus("finished");
      mysocket.send("gameOver", { room, playerId: mysocket.getId(), nickname });
    }
  }, [wreckedShips]);

  // useEffect(() => {
  //   console.log(whosTurn, mysocket.getId());
  // }, [whosTurn]);

  function handleDropTorpedo(rindex: number, cindex: number) {
    if (gameStatus !== "initiated") {
      toast.error("game not initiated");
      return;
    }
    if (whosTurn === "opponent") {
      toast.error("opponent's turn");
      return;
    }
    mysocket.send("dropTorpedo", {
      room,
      rindex,
      cindex,
      playerId: mysocket.getId(),
    });
    if (!opponentBoard[rindex][cindex].ship) {
      setWhosTurn("opponent");
    }
    setOpponentBoard((old) => {
      const newData = [...old];
      const updatedElement = { ...newData[rindex][cindex] };
      updatedElement.details.burst = true;
      newData[rindex][cindex] = updatedElement;
      return newData;
    });
    if (opponentBoard[rindex][cindex].ship) {
      const shipId = opponentBoard[rindex][cindex].details.id;
      const {
        length,
        vertical,
        startIndex: { rowStart, colStart },
      } = shipPlacement[shipId];
      let wrecked = true;
      if (vertical) {
        for (let i = rowStart; i < rowStart + length; i++) {
          if (!opponentBoard[i][colStart].details.burst && i !== rindex) {
            wrecked = false;
            break;
          }
        }
        wrecked &&
          setWreckedShips((old) => {
            const newData = { ...old };
            newData[shipId] = true;
            return newData;
          });
      } else {
        for (let i = colStart; i < colStart + length; i++) {
          if (!opponentBoard[rowStart][i].details.burst && i !== cindex) {
            wrecked = false;
            break;
          }
        }
        wrecked &&
          setWreckedShips((old) => {
            const newData = { ...old };
            newData[shipId] = true;
            return newData;
          });
      }
    }
  }

  return (
    <section className="flex flex-col outline outline-black p-[7px] rounded-xl">
      {opponentBoard.map((row: Board[], rindex: number) => (
        <div
          className="flex flex-row"
          id={`ob-r-${rindex}`}
          key={`ob-r-${rindex}`}
        >
          {row.map((ele: Board, cindex) => (
            <div
              className="h-[30px] w-[30px] flex items-center justify-center"
              key={`ob-r-${rindex}-c-${cindex}`}
              id={`ob-r-${rindex}-c-${cindex}`}
              onMouseEnter={() =>
                !opponentBoard[rindex][cindex].details.burst &&
                gameStatus === "initiated" &&
                setCoord({ row: rindex, col: cindex })
              }
              onMouseLeave={() => setCoord(null)}
              onClick={() =>
                !opponentBoard[rindex][cindex].details.burst &&
                gameStatus === "initiated" &&
                handleDropTorpedo(rindex, cindex)
              }
            >
              <div
                style={
                  ele.details.burst
                    ? ele.ship
                      ? {}
                      : { background: "#000" }
                    : { background: "rgb(0,0,0,0.1)" }
                }
                className={`${
                  (!ele.ship && ele.details.burst) || !ele.details.burst
                    ? "rounded-md h-[10px] w-[10px] outline-[0.01rem]"
                    : ""
                } ${
                  rindex === coord?.row &&
                  cindex === coord?.col &&
                  "ring-2 ring-black m-2"
                }`}
              >
                {ele.ship &&
                  ele.details.burst &&
                  wreckedShips[ele.details.id] && <Skeleton />}
                {ele.ship &&
                  ele.details.burst &&
                  !wreckedShips[ele.details.id] && <Fire />}
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

export default OpponentBoard;
