"use client";

import { Fire, Skeleton } from "@/assets/svgs";
import { initialBoardConfig } from "@/utils/board";
import { shipColors } from "@/utils/ships";
import MySocket from "@/utils/socket";
import { Board, MyShipPlacement } from "@/utils/types";
import { useParams } from "next/navigation";
import React, { use, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

function OpponentBoard({
  whosTurn,
  mysocket,
  setOpponentReady,
  setWhosTurn,
  setWinner,
  mute,
  gameStatus,
  setScore,
  score,
  username,
  setPlayerReady,
  setGameStatus,
  nickname,
}: {
  whosTurn: string | null;
  mysocket: MySocket;
  gameStatus: string;
  nickname: string;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  mute: boolean;
  username: string;
  setWinner: React.Dispatch<React.SetStateAction<string | null>>;
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
    if (Object.keys(wreckedShips).length === 1) {
      toast.success("You win!");
      setGameStatus("gameover");
      setWinner("player");
      updateScoreIntoCookie();
      setHitCount(0);
      mysocket.send("gameOver", { room, playerId: mysocket.getId(), nickname });
    }
  }, [wreckedShips]);

  async function updateScoreIntoCookie() {
    const bonus = hitCount <= 30 ? 250 : 100;
    const newScore = score + bonus;
    setScore(newScore);
    const res = await fetch("/api/update-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newScore,
        nickname,
        username,
      }),
    });
    if (res.status === 200) {
      console.log(res.json());
    }
  }

  function handleDropTorpedo(rindex: number, cindex: number) {
    console.log("HOOO");
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
    if (!opponentBoard[rindex][cindex].ship) {
      setWhosTurn("opponent");
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
      <audio ref={oppSplashAudioRef} src="/audio/splash.wav"></audio>
      <audio ref={oppExplotionAudioRef} src="/audio/explotion.wav"></audio>
    </section>
  );
}

export default OpponentBoard;
