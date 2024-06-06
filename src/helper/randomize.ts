import { MyShipPlacement, RandomPlacement } from "@/utils/types";

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function canPlaceShip(
  matrix: boolean[][],
  length: number,
  startRow: number,
  startCol: number,
  vertical: boolean
) {
  if (vertical) {
    if (startRow + length > 10) return false; // Out of bounds
    for (let i = 0; i < length; i++) {
      if (matrix[startRow + i][startCol]) return false; // Overlap
    }
  } else {
    if (startCol + length > 10) return false; // Out of bounds
    for (let i = 0; i < length; i++) {
      if (matrix[startRow][startCol + i]) return false; // Overlap
    }
  }
  return true;
}

function placeShip(matrix: boolean[][], length: number, vertical: boolean) {
  while (true) {
    const startRow = getRandomInt(10);
    const startCol = getRandomInt(10);
    if (canPlaceShip(matrix, length, startRow, startCol, vertical)) {
      if (vertical) {
        for (let i = 0; i < length; i++) {
          matrix[startRow + i][startCol] = true;
        }
      } else {
        for (let i = 0; i < length; i++) {
          matrix[startRow][startCol + i] = true;
        }
      }
      return { startRow, startCol, vertical };
    }
  }
}

export function getRandomCoord() {
  const matrix = Array.from({ length: 10 }, () => Array(10).fill(false));

  const ships = [
    { length: 5, name: "carrier" },
    { length: 4, name: "battleship" },
    { length: 3, name: "cruiser" },
    { length: 3, name: "submarine" },
    { length: 2, name: "destroyer" },
  ];
  const placements: MyShipPlacement = {};

  ships.forEach((ship) => {
    const vertical = Math.random() < 0.5;
    const placement = placeShip(matrix, ship.length, vertical);
    placements[ship.name] = {
      startIndex: {
        rowStart: placement.startRow,
        colStart: placement.startCol,
      },
      length: ship.length,
      vertical: vertical,
    };
  });
  placements;
  return placements;
}
