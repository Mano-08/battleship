import { Ship, ShipColor } from "./types";

export const shipColors: ShipColor = {
  carrier: "#f00",
  battleship: "#0f0",
  cruiser: "#00f",
  submarine: "#ff0",
  destroyer: "#f0f",
};

export const ships: Ship[] = [
  {
    id: "carrier",
    placed: false,
    selected: false,
    length: 5,
  },
  {
    id: "battleship",
    placed: false,
    selected: false,
    length: 4,
  },
  {
    id: "cruiser",
    placed: false,
    selected: false,
    length: 3,
  },
  {
    id: "submarine",
    placed: false,
    selected: false,
    length: 3,
  },
  {
    id: "destroyer",
    placed: false,
    selected: false,
    length: 2,
  },
];
