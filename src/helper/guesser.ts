import { ships } from "@/utils/ships";
import { Board } from "@/utils/types";
import { sleep } from "@/utils/utils";

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

export async function guessNextMove({
  hitStack,
  setHitStack,
  myBoard,
  myWreckedShips,
  mute,
  setMyBoard,
  oppExplotionAudioRef,
  setWhosTurn,
  oppSplashAudioRef,
  setMyWreckedShips,
  myShipPlacements,
}: any) {
  let opponentsTurnOver = false;
  let lastHits = hitStack;
  let lastHit = hitStack.length > 0 ? hitStack[hitStack.length - 1] : null;
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
        setMyWreckedShips((old: { [key: string]: boolean }) => {
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
        setMyWreckedShips((old: { [key: string]: boolean }) => {
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
      if (validDirections.length > 0) {
        const { row, col, dir } =
          validDirections[Math.floor(Math.random() * validDirections.length)];

        setMyBoard((old: any) => {
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
      while (true) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        if (
          !myBoard[row][col].details.burst &&
          isPossible({ row, col, myBoard, myWreckedShips })
        ) {
          setMyBoard((old: Board[][]) => {
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

          break;
        }
      }
    }
    setHitStack(lastHits);
  }
  setWhosTurn("player");
}

type BoardDetails = {
  row: number;
  col: number;
  myBoard: Board[][];
  myWreckedShips: {
    [key: string]: boolean;
  };
};

function isPossible({
  row,
  col,
  myWreckedShips,
  myBoard,
}: BoardDetails): boolean {
  for (let ship of ships) {
    if (
      myWreckedShips[ship.id] === undefined &&
      shipPlacable(row, col, myBoard, ship.length)
    ) {
      return true;
    }
  }
  return false;
}

function shipPlacable(
  row: number,
  col: number,
  myBoard: Board[][],
  length: number
): boolean {
  let left = 0;
  let right = 0;
  let top = 0;
  let bottom = 0;

  // Check for empty cells on left
  for (let i = col - 1; i >= 0; i--) {
    if (myBoard[row][i].details.burst === false) {
      left++;
    } else {
      break;
    }
  }

  // Check for empty cells on right
  for (let i = col + 1; i < 10; i++) {
    if (myBoard[row][i].details.burst === false) {
      right++;
    } else {
      break;
    }
  }

  // Check for empty cells on bottom
  for (let i = row + 1; i < 10; i++) {
    if (myBoard[i][col].details.burst === false) {
      bottom++;
    } else {
      break;
    }
  }

  // Check for empty cells on top
  for (let i = row - 1; i >= 0; i--) {
    if (myBoard[i][col].details.burst === false) {
      top++;
    } else {
      break;
    }
  }

  return left + right + 1 >= length || top + bottom + 1 >= length;
}
