"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Cookies from "universal-cookie";
import { Board, CustomJwtPayload, Ship } from "@/utils/types";
import { jwtDecode } from "jwt-decode";
import SignUp from "@/components/dialog/signup";
// import { mysocket } from "@/utils/socket";
import RoomFull from "@/components/dialog/roomfull";
import MyBoard from "@/components/battleship/myboard";
import { initialBoardConfig } from "@/utils/board";
import OpponentBoard from "@/components/battleship/opponentboard";
import SelectShip from "@/components/battleship/selectship";
import { ships } from "@/utils/ships";
import toast, { Toaster } from "react-hot-toast";
import ShareLink from "@/components/battleship/shareLink";
import MySocket from "@/utils/socket";
// import { mysocket } from "@/components/hero";
// import { Loading } from "@/assets/svgs";
const mysocket = new MySocket();

function Page() {
  const [loggedin, setLoggedin] = useState<boolean>(true);
  const [whosTurn, setWhosTurn] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const [display, setDisplay] = useState<string>("");
  const [winner, setWinner] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<string>("initiating");
  const [nickname, setNickname] = useState<string>("");
  const [opponentReady, setOpponentReady] = useState<boolean>(false);
  const [roomFull, setRoomFull] = useState<boolean>(false);

  const { room }: { room: string } = useParams();
  function joinRoom(nickname: string) {
    mysocket.joinRoom({ room, nickname });
  }

  useEffect(() => {
    const cookies = new Cookies();
    const token = cookies.get("bt_oken");
    if (!token) {
      setLoggedin(false);
      return;
    }
    const { nickname } = jwtDecode<CustomJwtPayload>(token);
    joinRoom(nickname);

    mysocket.setRoomFullCallback(handleRoomFull);
    mysocket.setOnPlayerJoined(handlePlayerJoined);
    mysocket.setOnGameOver(handleGameOver);
    mysocket.setOnPlayerLeft(handlePlayerleft);
    return () => mysocket.disconnect();
  }, []);

  useEffect(() => {
    playerReady && !opponentReady && toast("waiting for opponent");
    opponentReady && !playerReady && toast.success("opponent is ready");
    if (playerReady && opponentReady) {
      toast.success("game started!");
      setGameStatus("initiated");
    }
  }, [playerReady, opponentReady]);

  function handleGameOver({
    playerId,
    nickname,
  }: {
    playerId: string;
    nickname: string;
  }) {
    if (playerId !== mysocket.getId()) {
      toast.error(`${nickname} won`);
      setWinner("opponent");
      setGameStatus("gameover");
    }
  }

  function handlePlayerleft({ playerId }: { playerId: string }) {
    toast.error("opponent left");
    console.log("opponent left");
    setDisplay("player_left");
    setGameStatus("gameover");
  }

  function handlePlayerJoined({
    playerId,
    timeline,
    nickname,
  }: {
    playerId: string;
    timeline: string;
    nickname: string;
  }) {
    if (playerId === mysocket.getId()) {
      if (timeline === "first") {
        setWhosTurn("player");
        setDisplay("share_link");
      } else {
        setWhosTurn("opponent");
      }
    } else {
      toast.success(`${nickname} joined`);
      setDisplay("");
    }
  }

  function handleRoomFull() {
    setRoomFull(true);
  }

  function handleLoggedIn(nickname: string) {
    setLoggedin(true);
    joinRoom(nickname);
  }

  if (roomFull) {
    return <RoomFull />;
  }

  if (!loggedin) {
    return <SignUp setDisplay={null} callback={handleLoggedIn} />;
  }

  return (
    <main className="flex flex-col gap-5 items-center py-10 md:flex-row md:justify-center">
      <MyBoard
        mysocket={mysocket}
        playerReady={playerReady}
        setWhosTurn={setWhosTurn}
      />
      {display === "share_link" && <ShareLink room={room} />}
      {display === "player_left" && <RoomFull />}
      <OpponentBoard
        whosTurn={whosTurn}
        mysocket={mysocket}
        setPlayerReady={setPlayerReady}
        setOpponentReady={setOpponentReady}
        gameStatus={gameStatus}
        setWhosTurn={setWhosTurn}
        setGameStatus={setGameStatus}
        nickname={nickname}
      />
      <Toaster position="bottom-center" reverseOrder={false} />
    </main>
  );
}

export default Page;
