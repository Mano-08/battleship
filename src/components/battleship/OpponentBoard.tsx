"use client";

import { Fire, Skeleton } from "@/assets/svgs";
import { shipColors } from "@/utils/ships";
import MySocket from "@/utils/socket";
import { Board, MyShipPlacement, UserData, WhosTurn } from "@/utils/types";
import { updateScoreIntoCookie } from "@/utils/utils";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const board = Array(10)
  .fill(null)
  .map((_) =>
    Array(10).fill({
      ship: false,
      details: {
        id: "noship",
        burst: false,
        start: false,
        end: false,
        vertical: false,
      },
      validHover: null,
    })
  );

function OpponentBoard({
  whosTurn,
  mysocket,
  setOpponentReady,
  setWhosTurn,
  setWinner,
  mute,
  gameStatus,
  setUserData,
  userData,
  setPlayerReady,
  setGameStatus,
}: {
  whosTurn: "player" | "opponent" | null;
  mysocket: MySocket;
  gameStatus: string;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  mute: boolean;
  setWinner: React.Dispatch<React.SetStateAction<string | null>>;
  setWhosTurn: React.Dispatch<React.SetStateAction<WhosTurn>>;
  setOpponentReady: React.Dispatch<React.SetStateAction<boolean>>;
  setPlayerReady: React.Dispatch<React.SetStateAction<boolean>>;
  setGameStatus: React.Dispatch<
    React.SetStateAction<"initiating" | "gameover" | "restart" | "initiated">
  >;
}) {
  const { room }: { room: string } = useParams();
  const [shipPlacement, setShipPlacement] = useState<MyShipPlacement>({});
  const [opponentBoard, setOpponentBoard] = useState<Board[][]>(board);

  const oppExplotionAudioRef = useRef<HTMLAudioElement | null>(null);
  const oppSplashAudioRef = useRef<HTMLAudioElement | null>(null);
  const [coord, setCoord] = useState<{ row: number; col: number } | null>(null);
  const [wreckedShips, setWreckedShips] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [hitCount, setHitCount] = useState<number>(0);

  useEffect(() => {
    if (oppExplotionAudioRef.current) {
      oppExplotionAudioRef.current.volume = 0.2;
    }
    if (oppSplashAudioRef.current) {
      oppSplashAudioRef.current.volume = 0.2;
    }
  }, []);

  useEffect(() => {
    if (gameStatus === "restart") {
      resetBoard();
      setWinner(null);
      setGameStatus("initiating");
    }
  }, [gameStatus]);

  function resetBoard() {
    setOpponentBoard((oldData) => {
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
    setWreckedShips({});
    setCoord(null);
    setShipPlacement({});
    setPlayerReady(false);
    setOpponentReady(false);
  }

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
    resetBoard();
  }, []);

  useEffect(() => {
    if (Object.keys(wreckedShips).length === 5) {
      toast.success("You win!");
      setGameStatus("gameover");
      setWinner("player");
      updateScoreIntoCookie({
        userData,
        hitCount,
        setUserData,
      });
      setHitCount(0);
      mysocket.send("gameOver", {
        room,
        playerId: mysocket.getId(),
        nickname: userData.nickname,
      });
    }
  }, [wreckedShips]);

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
    setHitCount((old) => old + 1);
    setWhosTurn("opponent");
    if (!opponentBoard[rindex][cindex].ship) {
      !mute && (oppSplashAudioRef.current as HTMLAudioElement)?.play();
    } else {
      !mute && (oppExplotionAudioRef.current as HTMLAudioElement)?.play();
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
    <section
      style={{
        outlineWidth:
          gameStatus === "initiated"
            ? whosTurn === "player"
              ? "4px"
              : ""
            : "",
      }}
      className={`${
        gameStatus === "initiating" && "hidden"
      } lg:flex flex-col outline outline-black p-[7px] rounded-xl transition-all duration-300`}
    >
      <h1 className="p-2 text-center">Opponent&apos;s Board</h1>
      {gameStatus !== "gameover"
        ? opponentBoard.map((row: Board[], rindex: number) => (
            <div
              className="flex flex-row"
              id={`ob-r-${rindex}`}
              key={`ob-r-${rindex}`}
            >
              {row.map((ele: Board, cindex) => (
                <div
                  className="h-[25.5px] sm:h-[30px] w-[25.5px] sm:w-[30px] flex items-center justify-center"
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
          ))
        : opponentBoard.map((row: Board[], rindex: number) => (
            <div
              className="flex flex-row"
              key={`mb-r-${rindex}`}
              id={`mb-r-${rindex}`}
            >
              {row.map((ele: Board, cindex) => (
                <div
                  className="h-[25.5px] sm:h-[30px] w-[25.5px] sm:w-[30px] flex items-center justify-center"
                  key={`mb-r-${rindex}-c-${cindex}`}
                  id={`mb-r-${rindex}-c-${cindex}`}
                >
                  <div
                    style={
                      ele.validHover === null
                        ? ele.ship
                          ? ele.details.burst
                            ? { background: "rgba(7,0,27,0.8)" }
                            : {
                                background:
                                  shipColors[ele.details.id as string],
                              }
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
                            ? "h-[25.5px] sm:h-[30px] w-[20.5px] sm:w-[25px] rounded-t-full outline-black outline"
                            : "h-[20.5px] sm:h-[25px] w-[25.5px] sm:w-[30px] rounded-s-full outline-black outline"
                          : ele.details.end
                          ? ele.details.vertical
                            ? "h-[25.5px] sm:h-[30px] w-[20.5px] sm:w-[25px] rounded-b-md outline-black outline"
                            : "h-[20.5px] sm:h-[25px] w-[25.5px] sm:w-[30px] rounded-e-md outline-black outline"
                          : ele.details.vertical
                          ? "w-[20.5px] sm:w-[25px] h-[25.5px] sm:h-[30px] outline-black outline"
                          : "w-[25.5px] sm:w-[30px] h-[20.5px] sm:h-[25px] outline-black outline"
                        : "rounded-md h-[10px] w-[10px] outline-[0.01rem]"
                    }`}
                  ></div>
                </div>
              ))}
            </div>
          ))}
      <audio ref={oppSplashAudioRef} src="/audio/splash.wav"></audio>
      <audio ref={oppExplotionAudioRef} src="/audio/explotion.wav"></audio>
    </section>
  );
}

export default OpponentBoard;
