"use client";

import React, { useEffect, useState, useRef } from "react";
import Cookies from "universal-cookie";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { findUserCount } from "@/utils/utils";
import Leaderboard from "./Leaderboard";
import HowToPlay from "./dialog/HowToPlay";
import Link from "next/link";

import {
  Board,
  CustomJwtPayload,
  SignUpModes,
  defaultUserData,
  MyShipPlacement,
  Ship,
  shipIds,
  UserData,
  DisplayModes,
  GameStatus,
} from "@/utils/types";
import { jwtDecode } from "jwt-decode";
import SignUp from "@/components/dialog/SignUp";
import { shipColors, ships } from "@/utils/ships";
import toast, { Toaster } from "react-hot-toast";
import { getRandomCoord } from "@/helper/randomize";
import { Fire, Skeleton } from "@/assets/svgs";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { Dice1, DicesIcon, X } from "lucide-react";
import { updateScoreIntoCookie } from "@/utils/utils";
import { guessNextMove } from "@/helper/guesser";
import Nav from "./battleship/Nav";
import Navbar from "./Navbar";

const oppboard = Array(10)
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

const myboard = Array(10)
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

function Hero() {
  const [loggedin, setLoggedin] = useState<boolean>(true);
  const [exitGame, setExitGame] = useState<boolean>(false);
  const [mute, setMute] = useState<boolean>(true);
  const [showGameOverDialog, setShowGameOverDialog] = useState<boolean>(true);
  const { width, height } = useWindowSize();

  const splashAudioRef = useRef<HTMLAudioElement | null>(null);
  const explotionAudioRef = useRef<HTMLAudioElement | null>(null);
  const oppExplotionAudioRef = useRef<HTMLAudioElement | null>(null);
  const oppSplashAudioRef = useRef<HTMLAudioElement | null>(null);

  const [hitCount, setHitCount] = useState<number>(0);
  const [whosTurn, setWhosTurn] = useState<"player" | "opponent">("player");
  const [winner, setWinner] = useState<"player" | "opponent" | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>("initiating");
  const [myBoard, setMyBoard] = useState<Board[][]>(myboard);
  const [vertical, setVertical] = useState<boolean>(false);
  const [myShips, setMyShips] = useState<Ship[]>(ships);
  const [randomOpponentBoard, setRandomOpponentBoard] =
    useState<MyShipPlacement>({});
  const [randomBoard, setRandomBoard] = useState<MyShipPlacement>({});
  const [selectedShip, setSelectedShip] = useState<null | Ship>(null);
  const [displayShips, setDisplayShips] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>(defaultUserData);

  const [myShipPlacements, setMyShipPlacement] = useState<MyShipPlacement>({});
  const [opponentShipPlacement, setOpponentsShipPlacement] =
    useState<MyShipPlacement>({});
  const [opponentBoard, setOpponentBoard] = useState<Board[][]>(oppboard);
  const [coord, setCoord] = useState<{ row: number; col: number } | null>(null);
  const [opponentsWreckedShips, setOpponentsWreckedShips] = useState<{
    [key: string]: boolean;
  }>({});
  const [myWreckedShips, setMyWreckedShips] = useState<{
    [key: string]: boolean;
  }>({});
  const [display, setDisplay] = useState<DisplayModes>("how-to-play");
  const [userCount, setUserCount] = useState<number>(347);

  const { push } = useRouter();
  useEffect(() => {
    findUserCount(setUserCount);
  }, []);

  function createRoom() {
    const room = uuidv4();
    push(`/r/${room}`);
  }

  function enterBattlefield() {
    setDisplay(null);
    fetchUserData();
  }

  function userExist({ mode }: { mode: SignUpModes }): boolean {
    const cookies = new Cookies();
    const token = cookies.get("bt_oken");
    if (!token) {
      setDisplay(mode);
      return false;
    } else {
      const { nickname } = jwtDecode<CustomJwtPayload>(token);
      if (nickname === "") {
        setDisplay(mode);
        return false;
      }
    }
    return true;
  }

  function handleCloseDialog() {
    setDisplay(null);
  }

  function handlePlayWithFriend() {
    if (userExist({ mode: "signup-multiplayer" })) {
      createRoom();
    }
  }

  function handlePlayWithRobot() {
    if (userExist({ mode: "signup-solo" })) {
      enterBattlefield();
    }
  }

  useEffect(() => {
    if (display !== null) {
      document.getElementsByTagName("html")[0].style.overflowY = "hidden";
    } else {
      document.getElementsByTagName("html")[0].style.overflowY = "auto";
    }
    return () => {
      document.getElementsByTagName("html")[0].style.overflowY = "auto";
    };
  }, [display]);

  const cookies = new Cookies();

  function fetchUserData() {
    const token = cookies.get("bt_oken");
    if (!token) {
      setLoggedin(false);
      return;
    }

    const dataFromToken = jwtDecode<CustomJwtPayload>(token);
    setUserData(dataFromToken);

    if (dataFromToken.nickname === "") {
      setLoggedin(false);
    }
  }

  useEffect(() => {
    fetchUserData();

    if (splashAudioRef.current) {
      splashAudioRef.current.volume = 0.2;
    }
    if (explotionAudioRef.current) {
      explotionAudioRef.current.volume = 0.2;
    }
    if (oppExplotionAudioRef.current) {
      oppExplotionAudioRef.current.volume = 0.2;
    }
    if (oppSplashAudioRef.current) {
      oppSplashAudioRef.current.volume = 0.2;
    }
  }, []);

  useEffect(() => {
    if (gameStatus === "initiating") {
      setHitCount(0);
      // Initialize Board with Random Ship Placement
      resetMyBoard();
      const randomCoord = getRandomCoord();
      setRandomBoard(randomCoord);
      setMyShipPlacement(randomCoord);
      setMyWreckedShips({});

      resetOpponentBoard();
      const randomOpponentCoord = getRandomCoord();
      setOpponentsShipPlacement(randomOpponentCoord);
      setRandomOpponentBoard(randomOpponentCoord);
      setOpponentsWreckedShips({});
    }
  }, [gameStatus]);

  useEffect(() => {
    function handleEscape(e: Event) {
      if ((e as KeyboardEvent).key === "Escape" && exitGame) setExitGame(false);
    }
    document.addEventListener("keyup", handleEscape);
    return () => document.removeEventListener("keyup", handleEscape);
  }, []);

  useEffect(() => {
    if (Object.keys(opponentsWreckedShips).length === 5) {
      setWinner("player");
      setGameStatus("gameover");
      updateScoreIntoCookie({
        hitCount,
        userData,
        setUserData,
      });
    } else if (Object.keys(myWreckedShips).length === 5) {
      setWinner("opponent");
      setGameStatus("gameover");
    }
  }, [opponentsWreckedShips, myWreckedShips]);

  const [hitStack, setHitStack] = useState<
    {
      row: number;
      col: number;
      shipId: string;
      direction: "vertical" | "horizontal" | null;
    }[]
  >([]);

  useEffect(() => {
    if (whosTurn === "opponent") {
      guessNextMove({
        hitStack,
        setHitStack,
        myBoard,
        mute,
        setMyBoard,
        oppExplotionAudioRef,
        setWhosTurn,
        myWreckedShips,
        oppSplashAudioRef,
        setMyWreckedShips,
        myShipPlacements,
      });
    }
  }, [whosTurn]);

  function resetOpponentBoard() {
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
    setOpponentsWreckedShips({});
    setOpponentsShipPlacement({});
    setCoord(null);
  }

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
    if (Object.keys(randomOpponentBoard).length === 5) {
      setOpponentBoard((old) => {
        const newData = [...old];
        for (let s = 0; s < ships.length; s++) {
          const ship = ships[s];
          const {
            vertical,
            length,
            startIndex: { rowStart, colStart },
          } = randomOpponentBoard[ship.id];
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
  }, [randomOpponentBoard]);

  function handleLoggedIn(userData: UserData) {
    setUserData(userData);
    setLoggedin(true);
  }

  function resetMyBoard() {
    setSelectedShip(null);
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

  function handleRandomize() {
    resetMyBoard();
    const randomCoord = getRandomCoord();
    setRandomBoard(randomCoord);
    setMyShipPlacement(randomCoord);
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

  function handleDisplayLeaderboard() {
    setDisplay("leaderboard");
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

  function handleDropTorpedo(rindex: number, cindex: number) {
    if (gameStatus !== "initiated") {
      toast.error("click Start to begin!");
      return;
    }
    if (whosTurn === "opponent") {
      toast.error("opponent's turn");
      return;
    }

    if (!opponentBoard[rindex][cindex].ship) {
      setWhosTurn("opponent");
    }

    setHitCount((prev) => prev + 1);
    setOpponentBoard((old) => {
      const newData = [...old];
      const updatedElement = { ...newData[rindex][cindex] };
      updatedElement.details.burst = true;
      newData[rindex][cindex] = updatedElement;
      return newData;
    });

    if (opponentBoard[rindex][cindex].ship) {
      !mute && (explotionAudioRef.current as HTMLAudioElement)?.play();
      const shipId = opponentBoard[rindex][cindex].details.id;
      const {
        length,
        vertical,
        startIndex: { rowStart, colStart },
      } = opponentShipPlacement[shipId];
      let wrecked = true;
      if (vertical) {
        for (let i = rowStart; i < rowStart + length; i++) {
          if (!opponentBoard[i][colStart].details.burst && i !== rindex) {
            wrecked = false;
            break;
          }
        }
        wrecked &&
          setOpponentsWreckedShips((old) => {
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
          setOpponentsWreckedShips((old) => {
            const newData = { ...old };
            newData[shipId] = true;
            return newData;
          });
      }
    } else {
      !mute && (splashAudioRef.current as HTMLAudioElement)?.play();
    }
  }

  function handlePlayAgain() {
    setWinner(null);
    setShowGameOverDialog(false);
    setExitGame(false);
    setGameStatus("initiating");
    setWhosTurn("player");
  }

  function removeShipFromPlacements(shipid: shipIds) {
    setMyShipPlacement((oldData) => {
      const newData = { ...oldData };
      delete newData[shipid];
      return newData;
    });
    setMyShips((oldData) =>
      oldData.map((ship) =>
        ship.id === shipid ? { ...ship, selected: false, placed: false } : ship
      )
    );
    setMyBoard((oldData) => {
      const newMyBoard = [...oldData];
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          const updatedElement = { ...oldData[row][col] };
          if (updatedElement.details.id === shipid) {
            updatedElement.ship = false;
            updatedElement.details.id = "";
            updatedElement.details.burst = false;
            updatedElement.details.start = false;
            updatedElement.details.end = false;
            updatedElement.details.vertical = false;
          }
          newMyBoard[row][col] = updatedElement;
        }
      }
      return newMyBoard;
    });
  }

  return (
    <>
      {display === "how-to-play" && (
        <HowToPlay
          handlePlayWithFriend={handlePlayWithFriend}
          handlePlayWithRobot={handlePlayWithRobot}
        />
      )}
      {display === "signup-multiplayer" && (
        <SignUp setDisplay={setDisplay} callback={createRoom} />
      )}
      {display === "signup-solo" && (
        <SignUp setDisplay={setDisplay} callback={enterBattlefield} />
      )}

      {display === "leaderboard" && (
        <Leaderboard handleCloseDialog={handleCloseDialog} />
      )}

      <Navbar
        callback={handleDisplayLeaderboard}
        userData={userData}
        setUserData={setUserData}
        setGameStatus={setGameStatus}
        setMute={setMute}
        mute={mute}
        setShowGameOverDialog={undefined}
        showGameOverDialog={undefined}
        gameStatus={gameStatus}
        setExitGame={setExitGame}
      />
      <div className="min-h-[90vh] w-full flex flex-col items-center justify-center">
        {gameStatus === "gameover" && showGameOverDialog && (
          <div className="fixed h-screen w-screen z-50 top-0 left-0 bg-black/60 flex items-center justify-center">
            {winner === "player" && <Confetti width={width} height={height} />}
            <div className="flex relative text-center flex-col gap-2 p-5 lg:p-10 rounded-[35px] bg-orange-50 w-[90vw] lg:w-[400px]">
              <button
                className="absolute top-6 right-6 rounded-full bg-red-100 hover:bg-red-200 p-1"
                onClick={() => setShowGameOverDialog(false)}
              >
                <X size={15} />
              </button>
              <h1 className="text-[1.3rem] w-full border-b border-neutral-200 font-semibold">
                Game Over
              </h1>
              <div className="pb-5 text-sm sm:text-base">
                {winner === "player" ? (
                  <p>Congratulations! you&apos;ve won the game</p>
                ) : (
                  <p>Oops! you&apos;ve lost the game</p>
                )}
              </div>
              <div className="flex flex-row justify-evenly">
                <button
                  onClick={() => {
                    setDisplay("how-to-play");
                    handlePlayAgain();
                  }}
                  className="rounded-full holographic-card px-5 py-2.5 bg-white border-solid border w-[47%] border-black text-black"
                >
                  Exit
                </button>
                <button
                  autoFocus={true}
                  onClick={() => {
                    setDisplay(null);
                    handlePlayAgain();
                  }}
                  className="rounded-full holographic-card px-5 py-2.5 w-[47%] bg-black text-white"
                >
                  Play again
                </button>
              </div>
            </div>
          </div>
        )}

        {exitGame && (
          <div
            onClick={() => setExitGame(false)}
            className="fixed top-0 left-0 h-screen z-50 w-screen bg-black/60 flex items-center justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex relative text-center flex-col gap-2 p-5 lg:p-10 rounded-[35px] bg-orange-50 w-[90vw] lg:w-[500px]"
            >
              <button
                className="absolute  top-6 right-6 rounded-full bg-red-100 hover:bg-red-200 p-1"
                onClick={() => setExitGame(false)}
              >
                <X size={15} />
              </button>
              <h1 className="text-[1.3rem]  w-full border-b border-neutral-200 font-semibold">
                Exit Game
              </h1>
              <p className="p-2">Are you sure you want to exit?</p>
              <div className="flex flex-row justify-evenly pt-4">
                <Link
                  href="/"
                  className="holographic-card rounded-full px-5 py-2.5 bg-white border-solid border w-[47%] border-black text-black"
                >
                  Exit
                </Link>
                <button
                  autoFocus={true}
                  onClick={() => setExitGame(false)}
                  className="holographic-card rounded-full px-5 py-2.5 bg-black w-[47%]  text-white"
                >
                  Stay
                </button>
              </div>
            </div>
          </div>
        )}

        {gameStatus === "initiated" && (
          <div className="w-full flex items-center justify-center">
            <div className="relative rounded-full p-2 flex flex-row items-center gap-2 bg-orange-100 text-black">
              <span
                className={`${
                  whosTurn === "opponent"
                    ? "bg-black text-white rounded-full"
                    : "text-black "
                } px-8 py-1.5`}
              >
                ROBOT
              </span>
              <span
                className={`${
                  whosTurn === "player"
                    ? "bg-black text-white rounded-full"
                    : "text-black "
                } px-8 py-1.5`}
              >
                YOU
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-6 py-10 lg:flex-row">
          <section className="flex flex-col-reverse gap-5 lg:flex-row items-center ">
            <div
              className={`flex flex-col gap-0.5 items-start overflow-hidden ${
                gameStatus !== "initiating"
                  ? "max-h-0 lg:max-h-96 lg:max-w-0 opacity-0 py-0"
                  : "max-h-96 lg:max-h-96 lg:max-w-96 py-3"
              } transition-all duration-[2s] ease-in-out w-full px-3`}
            >
              <button
                onClick={() => {
                  resetMyBoard();
                  setDisplayShips(true);
                }}
                disabled={gameStatus === "initiated" || displayShips}
                className="holographic-card transition-all duration-200 w-full whitespace-nowrap overflow-hidden text-black outline outline-black font-medium rounded-full px-5 py-2"
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
                        className="holographic-card transition-all duration-200 flex flex-row gap-[2px]"
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
                                      backgroundColor:
                                        shipColors[ship.id] + "1",
                                    }
                                  : {
                                      backgroundColor:
                                        shipColors[ship.id] + "8",
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
                        className="holographic-card transition-all duration-200 h-[18px] text-[14px] leading-none w-[18px] flex items-center justify-center text-gray-900 hover:bg-red-100 focus:ring-2 focus:ring-red-200 font-medium rounded-md"
                      >
                        -{" "}
                      </button>
                    </div>
                  );
                })}
                <div className="flex flex-row items-center gap-2">
                  <button
                    onClick={(e) => {
                      resetMyBoard();
                      e.currentTarget.blur();
                    }}
                    className="holographic-card transition-all duration-200 w-full whitespace-nowrap overflow-hidden text-black bg-orange-200 hover:bg-orange-300 focus:ring-4  focus:ring-orange-200 font-medium rounded-lg px-5 py-1"
                  >
                    Reset
                  </button>
                  <div>
                    {vertical ? (
                      <button
                        onClick={(e) => {
                          setVertical(false);
                          e.currentTarget.blur();
                        }}
                        className="holographic-card transition-all duration-200 grow min-w-[120px] whitespace-nowrap overflow-hidden text-black bg-orange-200 hover:bg-orange-300 focus:ring-4  focus:ring-orange-200 font-medium rounded-lg px-5 py-1"
                      >
                        vertical
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          setVertical(true);
                          e.currentTarget.blur();
                        }}
                        className="holographic-card transition-all duration-200 grow min-w-[120px] whitespace-nowrap overflow-hidden text-black bg-orange-200 hover:bg-orange-300 focus:ring-4  focus:ring-orange-200 font-medium rounded-lg px-5 py-1"
                      >
                        horizontal
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col items-start gap-3">
                <button
                  onClick={(e) => {
                    setDisplayShips(false);
                    handleRandomize();
                  }}
                  className="holographic-card transition-all flex flex-row justify-center items-center gap-2 duration-200 w-full whitespace-nowrap overflow-hidden text-black outline outline-black font-medium rounded-full px-5 py-2"
                >
                  Randomize <DicesIcon size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.currentTarget.blur();
                    if (Object.keys(myShipPlacements).length === 5) {
                      toast.success("war begun!");
                      setGameStatus("initiated");
                    } else {
                      toast.error("all ships not placed!");
                    }
                  }}
                  autoFocus={true}
                  disabled={gameStatus === "initiated"}
                  className="holographic-card transition-all duration-300 w-full whitespace-nowrap overflow-hidden text-white bg-black outline outline-black font-medium rounded-full px-5 py-2"
                >
                  Start
                </button>
              </div>
            </div>
            <div
              style={{
                outlineWidth:
                  gameStatus === "initiated"
                    ? whosTurn === "opponent"
                      ? "4px"
                      : ""
                    : "",
              }}
              className="flex flex-col outline outline-black p-[7px] rounded-xl transition-all duration-300"
            >
              <h1 className="p-2 text-center">My Board</h1>

              {myBoard.map((row: Board[], rindex: number) => (
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
                      onMouseEnter={() =>
                        handleMouseEnterCell({ rindex, cindex })
                      }
                      onClick={() =>
                        handlePlaceShip({ ship: ele, cindex, rindex })
                      }
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
            </div>
          </section>

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
              gameStatus === "initiating" ? "hidden" : "flex"
            } flex-col outline outline-black p-[7px] rounded-xl transition-all duration-300`}
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
                            (!ele.ship && ele.details.burst) ||
                            !ele.details.burst
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
                            opponentsWreckedShips[ele.details.id] && (
                              <Skeleton />
                            )}
                          {ele.ship &&
                            ele.details.burst &&
                            !opponentsWreckedShips[ele.details.id] && <Fire />}
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
          </section>

          <audio ref={splashAudioRef} src="/audio/splash.wav"></audio>
          <audio ref={explotionAudioRef} src="/audio/explotion.wav"></audio>

          <audio ref={oppSplashAudioRef} src="/audio/splash.wav"></audio>
          <audio ref={oppExplotionAudioRef} src="/audio/explotion.wav"></audio>

          <Toaster position="bottom-center" reverseOrder={false} />
        </div>
        {/* <Nav
          setGameStatus={setGameStatus}
          userData={userData}
          setMute={setMute}
          mute={mute}
          setShowGameOverDialog={undefined}
          showGameOverDialog={undefined}
          gameStatus={gameStatus}
          setExitGame={setExitGame}
        /> */}
      </div>
    </>
  );
}

export default Hero;
