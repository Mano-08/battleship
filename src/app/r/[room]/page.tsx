"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Cookies from "universal-cookie";
import {
  CustomJwtPayload,
  defaultUserData,
  displayOptions,
  UserData,
  WhosTurn,
} from "@/utils/types";
import { jwtDecode } from "jwt-decode";
import SignUp from "@/components/dialog/SignUp";
import MyBoard from "@/components/battleship/MyBoard";
import OpponentBoard from "@/components/battleship/OpponentBoard";
import toast, { Toaster } from "react-hot-toast";
import ShareLink from "@/components/dialog/ShareLink";
import MySocket from "@/utils/socket";
import GameOver from "@/components/dialog/GameOver";
import Connecting from "@/components/dialog/Connecting";
import Link from "next/link";
import Nav from "@/components/battleship/Nav";
import ReturnToHomePage from "@/components/dialog/ReturnToHomePage";

const mysocket = new MySocket();

function Page() {
  const [loggedin, setLoggedin] = useState<boolean>(true);
  const [whosTurn, setWhosTurn] = useState<WhosTurn>(null);
  const [playAgain, setPlayAgain] = useState<boolean>(false);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const [display, setDisplay] = useState<displayOptions>("loading");
  const [winner, setWinner] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<string>("initiating");
  const [exitGame, setExitGame] = useState<boolean>(false);
  const [mute, setMute] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData>(defaultUserData);
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
    const dataFromToken = jwtDecode<CustomJwtPayload>(token);
    setUserData(dataFromToken);
    joinRoom(dataFromToken.nickname);

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
    setDisplay("");
    joinRoom(nickname);
  }

  if (roomFull) {
    return <ReturnToHomePage message="The room is Already full!" />;
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
          mute={mute}
          whosTurn={whosTurn}
          display={display}
          mysocket={mysocket}
          playerReady={playerReady}
          setWhosTurn={setWhosTurn}
        />
        {exitGame && (
          <div className="fixed top-0 left-0 h-screen w-screen bg-black/60 flex items-center justify-center">
            <div className="flex text-center flex-col gap-2 px-4 py-6 rounded-lg bg-white w-[90vw] lg:w-[400px]">
              <h1 className="text-[1.3rem] w-full border-b border-neutral-200 font-semibold">
                Exit Game
              </h1>
              <p className="p-2">Are you sure you want to exit?</p>
              <div className="flex flex-row justify-evenly pt-4">
                <button
                  autoFocus={true}
                  onClick={() => setExitGame(false)}
                  className="transition-all duration-200 min-w-[120px] focus:outline-none text-white bg-green-800 hover:bg-green-700 focus:ring-4  focus:ring-green-300 font-medium rounded-lg px-5 py-1"
                >
                  Stay
                </button>
                <Link
                  href="/"
                  className="transition-all duration-200 min-w-[120px] focus:outline-none text-white bg-red-800 hover:bg-red-700 focus:ring-4  focus:ring-red-300 font-medium rounded-lg px-5 py-1"
                >
                  Exit
                </Link>
              </div>
            </div>
          </div>
        )}
        {display === "loading" && <Connecting />}
        {display === "share_link" && <ShareLink room={room} />}
        {display === "player_left" && (
          <ReturnToHomePage message="Opponent Left!" />
        )}
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
          mute={mute}
          userData={userData}
          setUserData={setUserData}
          setPlayerReady={setPlayerReady}
          setOpponentReady={setOpponentReady}
          gameStatus={gameStatus}
          setWhosTurn={setWhosTurn}
          setGameStatus={setGameStatus}
        />
      </div>

      <Nav
        userData={userData}
        setMute={setMute}
        mute={mute}
        setExitGame={setExitGame}
      />
      <Toaster position="bottom-center" reverseOrder={false} />
    </main>
  );
}

export default Page;
