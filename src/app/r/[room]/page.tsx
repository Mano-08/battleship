"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Cookies from "universal-cookie";
import { CustomJwtPayload, displayOptions } from "@/utils/types";
import { jwtDecode } from "jwt-decode";
import SignUp from "@/components/dialog/SignUp";
import RoomFull from "@/components/dialog/Roomfull";
import MyBoard from "@/components/battleship/MyBoard";
import OpponentBoard from "@/components/battleship/OpponentBoard";
import toast, { Toaster } from "react-hot-toast";
import ShareLink from "@/components/dialog/ShareLink";
import MySocket from "@/utils/socket";
import GameOver from "@/components/dialog/GameOver";
import Connecting from "@/components/dialog/Connecting";

const mysocket = new MySocket();

function Page() {
  const [loggedin, setLoggedin] = useState<boolean>(true);
  const [whosTurn, setWhosTurn] = useState<string | null>(null);
  const [playAgain, setPlayAgain] = useState<boolean>(false);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const [display, setDisplay] = useState<displayOptions>("loading");
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
    setNickname(nickname);
    joinRoom(nickname);

    setTimeout(
      () => setDisplay((prev) => (prev === "share_link" ? "share_link" : "")),
      3000
    );

    mysocket.setRoomFullCallback(handleRoomFull);
    mysocket.setOnPlayerJoined(handlePlayerJoined);
    mysocket.setOnGameOver(handleGameOver);
    mysocket.setOnPlayerLeft(handlePlayerleft);
    mysocket.setOnPlayAgain(handlePlayAgain);
    mysocket.setOnAcceptPlayAgain(handleAcceptPlayAgain);
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

  useEffect(() => {
    if (winner === "player") {
      setDisplay("game_won");
    } else if (winner === "opponent") {
      setDisplay("game_lost");
    }
  }, [winner]);

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

  function handleAcceptPlayAgain(playerId: string) {
    if (playerId !== mysocket.getId()) {
      setDisplay("");
      setGameStatus("restart");
    }
  }

  function handlePlayAgain(playerId: string) {
    if (playerId !== mysocket.getId()) {
      if (playAgain) {
        setDisplay("");
        setPlayAgain(false);
        setGameStatus("restart");
        mysocket.send("acceptPlayAgain", { playerId: mysocket.getId(), room });
      } else {
        setDisplay("play_again");
      }
    }
  }

  function handlePlayerleft() {
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
    <main className="min-h-screen flex flex-col justify-between px-10">
      <div className="flex grow flex-col items-center gap-5 py-10 justify-center lg:flex-row">
        <MyBoard
          setPlayerReady={setPlayerReady}
          gameStatus={gameStatus}
          winner={winner}
          display={display}
          mysocket={mysocket}
          playerReady={playerReady}
          setWhosTurn={setWhosTurn}
        />
        {display === "loading" && <Connecting />}
        {display === "share_link" && <ShareLink room={room} />}
        {display === "player_left" && <RoomFull />}
        {(display === "game_won" ||
          display === "game_lost" ||
          display === "play_again") && (
          <GameOver
            room={room}
            setGameStatus={setGameStatus}
            setDisplay={setDisplay}
            playAgain={playAgain}
            setPlayAgain={setPlayAgain}
            mysocket={mysocket}
            message={display}
          />
        )}

        <OpponentBoard
          whosTurn={whosTurn}
          mysocket={mysocket}
          setWinner={setWinner}
          setPlayerReady={setPlayerReady}
          setOpponentReady={setOpponentReady}
          gameStatus={gameStatus}
          setWhosTurn={setWhosTurn}
          setGameStatus={setGameStatus}
          nickname={nickname}
        />
      </div>
      <Toaster position="bottom-center" reverseOrder={false} />
    </main>
  );
}

export default Page;
