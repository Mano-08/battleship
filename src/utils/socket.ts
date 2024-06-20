import { io } from "socket.io-client";
import { MyShipPlacement } from "./types";

class MySocket {
  public socket: any;
  public URL: string;
  public onPlayerJoined: (data: any) => void = () => {};
  public onAttack: (data: any) => void = () => {};
  public alertFull: () => void = () => {};
  public onPlayAgain: (playerId: string) => void = () => {};
  public onAcceptPlayAgain: (playerId: string) => void = () => {};
  public onPlayerLeft: () => void = () => {};
  public onGameOver: (data: any) => void = () => {};
  public onReady: ({
    placement,
    playerId,
  }: {
    placement: MyShipPlacement;
    playerId: string;
  }) => void = () => {};

  constructor() {
    this.URL = "http://localhost:5000";
    this.socket = io(this.URL, {
      autoConnect: false,
      transports: ["websocket"],
    });
    this.socket.onAny((event: any, ...args: any) => {
      console.log(event, args);
    });
    this.socket.on("full", () => {
      this.alertFull();
    });
    this.socket.on("gameOver", (data: any) => {
      this.onGameOver(data);
    });
    this.socket.on("playerLeft", () => {
      this.onPlayerLeft();
    });
    this.socket.on(
      "ready",
      ({
        placement,
        playerId,
      }: {
        placement: MyShipPlacement;
        playerId: string;
      }) => {
        this.onReady({ placement, playerId });
      }
    );
    this.socket.on("requestPlayAgain", (playerId: string) => {
      this.onPlayAgain(playerId);
    });
    this.socket.on("acceptPlayAgain", (playerId: string) => {
      this.onAcceptPlayAgain(playerId);
    });
    this.socket.on("dropTorpedo", (data: any) => {
      this.onAttack(data);
    });
    this.socket.on(
      "playerJoined",
      ({
        timeline,
        playerId,
        nickname,
      }: {
        timeline: string;
        playerId: string;
        nickname: string;
      }) => {
        this.onPlayerJoined({ timeline, playerId, nickname });
      }
    );
  }

  sleep(duration: number) {
    return new Promise((resolve) =>
      setTimeout(() => resolve("done"), duration)
    );
  }

  async joinRoom({ room, nickname }: { room: string; nickname: string }) {
    this.connect();
    while (!this.socket.connected) {
      console.log("waiting to connect");
      await this.sleep(1000);
    }
    console.log(" this.getId()", this.getId());
    this.socket.emit("join", { room, nickname, playerId: this.getId() });
  }

  setOnPlayAgain(callback: (playerId: string) => void) {
    this.onPlayAgain = callback;
  }

  setOnAcceptPlayAgain(callback: (playerId: string) => void) {
    this.onAcceptPlayAgain = callback;
  }

  setOnPlayerLeft(callback: () => void) {
    this.onPlayerLeft = callback;
  }

  setRoomFullCallback(callback: () => void) {
    this.alertFull = callback;
  }

  setOnAttack(callback: (data: any) => void) {
    this.onAttack = callback;
  }

  setOnPlayerJoined(callback: (data: any) => void) {
    this.onPlayerJoined = callback;
  }

  setOnGameOver(callback: (data: any) => void) {
    this.onGameOver = callback;
  }

  setOnReady(callback: () => void) {
    this.onReady = callback;
  }

  send(code: string, data: any) {
    this.socket.emit(code, data);
  }

  getId() {
    return this.socket.id;
  }

  connect() {
    this.socket.connect();
  }
  disconnect() {
    this.socket.disconnect();
  }
}

export default MySocket;
