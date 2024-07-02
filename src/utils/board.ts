"use client";
import { Board } from "./types";

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

export function initialBoardConfig() {
  const copyArray: Board[][] = board.map(function (arr) {
    return arr.slice();
  });
  return copyArray;
}
