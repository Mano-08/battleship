import { JwtPayload } from "jwt-decode";

export interface CustomJwtPayload extends JwtPayload {
  nickname: string;
}

export type shipIds =
  | "carrier"
  | "battleship"
  | "cruiser"
  | "submarine"
  | "destroyer";

export type ShipColor = {
  [key: string]: string;
};

export type MyShipPlacement = {
  [key: string]: {
    length: number;
    vertical: boolean;
    startIndex: { rowStart: number; colStart: number };
  };
};

export type RandomPlacement = {
  [key: string]: {
    start_row: number;
    start_column: number;
    vertical: boolean;
    length: number;
  };
};

export interface Board {
  ship: boolean;
  details: {
    id: string;
    burst: boolean;
    start: boolean;
    end: boolean;
    vertical: boolean;
  };
  validHover: null | boolean;
}

export type Ship = {
  id: shipIds;
  placed: boolean;
  selected: boolean;
  length: number;
};

export type displayOptions =
  | "loading"
  | "share_link"
  | "player_left"
  | "game_won"
  | "game_lost"
  | "play_again"
  | "";
