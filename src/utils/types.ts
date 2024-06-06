import { JwtPayload } from "jwt-decode";

export interface CustomJwtPayload extends JwtPayload {
  nickname: string;
}

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
  id: string;
  placed: boolean;
  selected: boolean;
  length: number;
};
