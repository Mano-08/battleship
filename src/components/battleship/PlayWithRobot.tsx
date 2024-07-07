"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Cookies from "universal-cookie";

import {
  Board,
  CustomJwtPayload,
  defaultUserData,
  MyShipPlacement,
  Ship,
  shipIds,
  UserData,
} from "@/utils/types";
import { jwtDecode } from "jwt-decode";
import SignUp from "@/components/dialog/SignUp";
import { initialBoardConfig } from "@/utils/board";
import { shipColors, ships } from "@/utils/ships";
import toast, { Toaster } from "react-hot-toast";
import { getRandomCoord } from "@/helper/randomize";
import { Fire, Skeleton } from "@/assets/svgs";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { LogOut, Volume2, VolumeX } from "lucide-react";
import { updateScoreIntoCookie } from "@/utils/utils";

function PlayWithRobot() {
  const [loggedin, setLoggedin] = useState<boolean>(true);
  const [exitGame, setExitGame] = useState<boolean>(false);
  const [mute, setMute] = useState<boolean>(true);
  // const [score, setScore] = useState<number>(0);
  // const [username, setUsername] = useState<string>("");
  const { width, height } = useWindowSize();

  const splashAudioRef = useRef<HTMLAudioElement | null>(null);
  const explotionAudioRef = useRef<HTMLAudioElement | null>(null);
  const oppExplotionAudioRef = useRef<HTMLAudioElement | null>(null);
  const oppSplashAudioRef = useRef<HTMLAudioElement | null>(null);

  const [hitCount, setHitCount] = useState<number>(0);
  const [whosTurn, setWhosTurn] = useState<"player" | "opponent">("player");
  const [winner, setWinner] = useState<"player" | "opponent" | null>(null);
  const [gameStatus, setGameStatus] = useState<
    "initiating" | "initiated" | "gameover"
  >("initiating");
  // const [nickname, setNickname] = useState<string>("");
  const [myBoard, setMyBoard] = useState<Board[][]>(initialBoardConfig());
  const [vertical, setVertical] = useState<boolean>(false);
  const [myShips, setMyShips] = useState<Ship[]>(ships);
  const [randomOpponentBoard, setRandomOpponentBoard] =
    useState<MyShipPlacement>({});
  const [randomBoard, setRandomBoard] = useState<MyShipPlacement>({});
  const [selectedShip, setSelectedShip] = useState<null | Ship>(null);
  // const [gmail, setGmail] = useState<null | string>(null);
  const [displayShips, setDisplayShips] = useState<boolean>(false);
  // const [googleSignIn, setGoogleSignIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>(defaultUserData);

  const [myShipPlacements, setMyShipPlacement] = useState<MyShipPlacement>({});
  const [opponentShipPlacement, setOpponentsShipPlacement] =
    useState<MyShipPlacement>({});
  const [opponentBoard, setOpponentBoard] = useState<Board[][]>(
    initialBoardConfig()
  );
  const [coord, setCoord] = useState<{ row: number; col: number } | null>(null);
  const [opponentsWreckedShips, setOpponentsWreckedShips] = useState<{
    [key: string]: boolean;
  }>({});
  const [myWreckedShips, setMyWreckedShips] = useState<{
    [key: string]: boolean;
  }>({});

  const cookies = new Cookies();

  useEffect(() => {
    const token = cookies.get("bt_oken");
    if (!token) {
      setLoggedin(false);
      return;
    }
    const dataFromToken = jwtDecode<CustomJwtPayload>(token);
    setUserData(dataFromToken);

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

  function sleep(duration: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  function handleShipBurst(row: number, col: number) {
    const shipId = myBoard[row][col].details.id;
    const {
      length,
      vertical,
      startIndex: { rowStart, colStart },
    } = myShipPlacements[shipId];
    let wrecked = true;
    if (vertical) {
      for (let i = rowStart; i < rowStart + length; i++) {
        if (!myBoard[i][colStart].details.burst && i !== row) {
          wrecked = false;
          break;
        }
      }
      wrecked &&
        setMyWreckedShips((old) => {
          const newData = { ...old };
          newData[shipId] = true;
          return newData;
        });
    } else {
      for (let i = colStart; i < colStart + length; i++) {
        if (!myBoard[rowStart][i].details.burst && i !== col) {
          wrecked = false;
          break;
        }
      }
      wrecked &&
        setMyWreckedShips((old) => {
          const newData = { ...old };
          newData[shipId] = true;
          return newData;
        });
    }
    if (wrecked) {
      return shipId;
    } else {
      return null;
    }
  }

  const [hitStack, setHitStack] = useState<
    {
      row: number;
      col: number;
      shipId: string;
      direction: "vertical" | "horizontal" | null;
    }[]
  >([]);

  function removeShipFromHitStack(
    lastHits: {
      row: number;
      col: number;
      shipId: string;
      direction: "vertical" | "horizontal" | null;
    }[],
    shipId: string
  ) {
    return lastHits.filter((hit) => hit.shipId !== shipId);
  }

  async function guessNextMove() {
    let opponentsTurnOver = false;
    let lastHits = hitStack;
    let lastHit = hitStack.length > 0 ? hitStack[hitStack.length - 1] : null;
    while (!opponentsTurnOver) {
      await sleep(1300);
      if (lastHit) {
        console.log(lastHit, "INISIDE LAST HIT");
        console.log(lastHits, "LAST HITS");
        const { row, col, direction, shipId } = lastHit;
        const directions = [
          { row: row - 1, col, dir: "vertical" },
          { row: row + 1, col, dir: "vertical" },
          { row, col: col - 1, dir: "horizontal" },
          { row, col: col + 1, dir: "horizontal" },
        ];
        const validDirections = directions.filter(
          ({ row, col, dir }) =>
            row >= 0 &&
            row < 10 &&
            col >= 0 &&
            col < 10 &&
            !myBoard[row][col].details.burst &&
            (direction === null || dir === direction)
        );
        console.log(validDirections, "VALID DIRECTIONS");
        if (validDirections.length === 0) {
          if (direction === "horizontal") {
            let curr = col;
            if (lastHits.length > 1) {
              const secondLastHit = lastHits[lastHits.length - 2];
              if (secondLastHit.col < col) {
                curr = col - 1;
                while (
                  curr >= 0 &&
                  myBoard[row][curr].details.burst &&
                  myBoard[row][curr].ship
                ) {
                  curr = curr - 1;
                }
              } else {
                curr = col + 1;
                while (
                  curr < 10 &&
                  myBoard[row][curr].details.burst &&
                  myBoard[row][curr].ship
                ) {
                  curr = curr + 1;
                }
              }

              if (curr >= 0 && curr < 10 && !myBoard[row][curr].details.burst) {
                validDirections.push({
                  row: row,
                  col: curr,
                  dir: "horizontal",
                });
              } else {
                lastHits[lastHits.length - 1] = {
                  ...lastHit,
                  direction: "vertical",
                };
                lastHit = {
                  ...lastHit,
                  direction: "vertical",
                };
                continue;
              }
            }
          } else {
            let curr = row;
            if (lastHits.length > 1) {
              const secondLastHit = lastHits[lastHits.length - 2];
              if (secondLastHit.row < row) {
                curr = row - 1;
                while (
                  curr >= 0 &&
                  myBoard[curr][col].details.burst &&
                  myBoard[curr][col].ship
                ) {
                  curr = curr - 1;
                }
              } else {
                curr = row + 1;
                while (
                  curr < 10 &&
                  myBoard[curr][col].details.burst &&
                  myBoard[curr][col].ship
                ) {
                  curr = curr + 1;
                }
              }

              if (curr >= 0 && curr < 10 && !myBoard[curr][col].details.burst) {
                validDirections.push({
                  row: curr,
                  col: col,
                  dir: "vertical",
                });
              } else {
                lastHits[lastHits.length - 1] = {
                  ...lastHit,
                  direction: "horizontal",
                };
                lastHit = {
                  ...lastHit,
                  direction: "horizontal",
                };
                continue;
              }
            }
          }
        }
        if (validDirections.length > 0) {
          const { row, col, dir } =
            validDirections[Math.floor(Math.random() * validDirections.length)];

          setMyBoard((old) => {
            const newData = [...old];
            const updatedElement = { ...newData[row][col] };
            updatedElement.details.burst = true;
            newData[row][col] = updatedElement;
            return newData;
          });

          if (myBoard[row][col].ship) {
            !mute && (oppExplotionAudioRef.current as HTMLAudioElement)?.play();
            lastHit = {
              row,
              col,
              shipId: myBoard[row][col].details.id,
              direction: dir as "vertical" | "horizontal",
            };
            lastHits.push(lastHit);
            const shipId = handleShipBurst(row, col);
            console.log(shipId, "SHIP ID");
            if (shipId !== null) {
              lastHits = removeShipFromHitStack(lastHits, shipId);
              lastHit =
                lastHits.length > 0 ? lastHits[lastHits.length - 1] : null;
            }
          } else {
            !mute && (oppSplashAudioRef.current as HTMLAudioElement)?.play();
            lastHits[lastHits.length - 1].direction =
              dir === "vertical" ? "horizontal" : "vertical";
            opponentsTurnOver = true;
          }
        } else {
          lastHit = null;
          continue;
        }
      } else {
        console.log("INSIDE RANDOM GUESS");
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        if (!myBoard[row][col].details.burst) {
          setMyBoard((old) => {
            const newData = [...old];
            const updatedElement = { ...newData[row][col] };
            updatedElement.details.burst = true;
            newData[row][col] = updatedElement;
            return newData;
          });

          if (myBoard[row][col].ship) {
            !mute && (oppExplotionAudioRef.current as HTMLAudioElement)?.play();
            const shipId = handleShipBurst(row, col);
            if (shipId !== null) {
              lastHits = removeShipFromHitStack(lastHits, shipId);
              lastHit =
                lastHits.length > 0 ? lastHits[lastHits.length - 1] : null;
            } else {
              lastHit = {
                row,
                col,
                shipId: myBoard[row][col].details.id,
                direction: null,
              };
              lastHits.push(lastHit);
            }
          } else {
            !mute && (oppSplashAudioRef.current as HTMLAudioElement)?.play();
            opponentsTurnOver = true;
          }
        } else {
          continue;
        }
      }
      setHitStack(lastHits);
    }
    setWhosTurn("player");
  }

  useEffect(() => {
    if (whosTurn === "opponent") {
      guessNextMove();
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

  function handleLoggedIn(nickname: string) {
    setUserData((old) => {
      const newData = { ...old, nickname: nickname };
      return newData;
    });
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

  if (!loggedin) {
    return <SignUp setDisplay={null} callback={handleLoggedIn} />;
  }

  return (
    <main className="min-h-screen flex flex-col justify-between px-5 lg:px-10">
      {gameStatus === "gameover" && (
        <div className="fixed h-screen w-screen top-0 left-0 bg-black/60 flex items-center justify-center">
          {winner === "player" && <Confetti width={width} height={height} />}
          <div className="flex text-center flex-col gap-2 px-4 py-6 rounded-lg bg-orange-50 w-[90vw] lg:w-[400px]">
            <h1 className="text-[1.3rem] w-full border-b border-neutral-200 font-semibold">
              Game Over
            </h1>
            <div className="pb-5">
              {winner === "player" ? <p>You Won!</p> : <p>You Lost</p>}
            </div>
            <div className="flex flex-row justify-evenly">
              <button
                autoFocus={true}
                onClick={handlePlayAgain}
                className="transition-all duration-200 min-w-[120px] focus:outline-none text-white bg-green-800 hover:bg-green-700 focus:ring-4  focus:ring-green-200 font-medium rounded-lg px-5 py-1"
              >
                Play again
              </button>
              <Link
                href="/"
                className="transition-all duration-200 min-w-[120px] focus:outline-none text-white bg-red-800 hover:bg-red-700 focus:ring-4  focus:ring-red-200 font-medium rounded-lg px-5 py-1"
              >
                Exit
              </Link>
            </div>
          </div>
        </div>
      )}

      {exitGame && (
        <div className="fixed top-0 left-0 h-screen w-screen bg-black/60 flex items-center justify-center">
          <div className="flex text-center flex-col gap-2 px-4 py-6 rounded-lg bg-orange-50 w-[90vw] lg:w-[400px]">
            <h1 className="text-[1.3rem] w-full border-b border-neutral-200 font-semibold">
              Exit Game
            </h1>
            <p className="p-2">Are you sure you want to exit?</p>
            <div className="flex flex-row justify-evenly pt-4">
              <button
                autoFocus={true}
                onClick={() => setExitGame(false)}
                className="transition-all duration-200 min-w-[120px] focus:outline-none text-white bg-green-800 hover:bg-green-700 focus:ring-4  focus:ring-green-200 font-medium rounded-lg px-5 py-1"
              >
                Stay
              </button>
              <Link
                href="/"
                className="transition-all duration-200 min-w-[120px] focus:outline-none text-white bg-red-800 hover:bg-red-700 focus:ring-4  focus:ring-red-200 font-medium rounded-lg px-5 py-1"
              >
                Exit
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex grow flex-col items-center gap-6 py-10 justify-center lg:flex-row">
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
              className="transition-all duration-200 w-full whitespace-nowrap overflow-hidden focus:outline-none text-black hover:bg-orange-200 outline outline-black font-medium rounded-lg px-5 py-1"
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
                      className="transition-all duration-200 h-[18px] text-[14px] leading-none w-[18px] flex items-center justify-center text-gray-900 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 font-medium rounded-md"
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
                  className="transition-all duration-200 w-full whitespace-nowrap overflow-hidden focus:outline-none text-black bg-orange-200 hover:bg-orange-300 focus:ring-4  focus:ring-orange-200 font-medium rounded-lg px-5 py-1"
                >
                  Reset
                </button>
                <div>
                  {vertical ? (
                    <button
                      onClick={() => setVertical(false)}
                      className="transition-all duration-200 grow min-w-[120px] whitespace-nowrap overflow-hidden focus:outline-none text-black bg-orange-200 hover:bg-orange-300 focus:ring-4  focus:ring-orange-200 font-medium rounded-lg px-5 py-1"
                    >
                      vertical
                    </button>
                  ) : (
                    <button
                      onClick={() => setVertical(true)}
                      className="transition-all duration-200 grow min-w-[120px] whitespace-nowrap overflow-hidden focus:outline-none text-black bg-orange-200 hover:bg-orange-300 focus:ring-4  focus:ring-orange-200 font-medium rounded-lg px-5 py-1"
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
                  e.currentTarget.blur();
                }}
                className="transition-all duration-200 w-full whitespace-nowrap overflow-hidden focus:outline-none text-black hover:bg-orange-200 outline outline-black font-medium rounded-lg px-5 py-1"
              >
                Randomize
              </button>
              <button
                onClick={(e) => {
                  e.currentTarget.blur();
                  toast.success("war begun!");
                  setGameStatus("initiated");
                }}
                autoFocus={true}
                disabled={gameStatus === "initiated"}
                className="transition-all duration-200 w-full whitespace-nowrap overflow-hidden text-white bg-black hover:bg-neutral-800 outline outline-black font-medium rounded-lg px-5 py-1"
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
            <h1 className="p-2 text-center">My Ships</h1>

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
          <h1 className="p-2 text-center">Opponent's Ships</h1>
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
                      opponentsWreckedShips[ele.details.id] && <Skeleton />}
                    {ele.ship &&
                      ele.details.burst &&
                      !opponentsWreckedShips[ele.details.id] && <Fire />}
                  </div>
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
      <footer className="w-full p-3 border-t border-neutral-400">
        <div className="mx-auto w-full lg:w-[860px] flex flex-row items-center justify-between gap-1">
          <p>
            score: <strong>{userData.score}</strong>
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
      </footer>
    </main>
  );
}

export default PlayWithRobot;
