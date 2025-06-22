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
import ReturnToHomePage from "@/components/dialog/ReturnToHomePage";
import Navbar from "@/components/Navbar";
import Leaderboard from "@/components/Leaderboard";

const mysocket = new MySocket();

function Page() {
  const [loggedin, setLoggedin] = useState<boolean>(true);
  const [whosTurn, setWhosTurn] = useState<WhosTurn>(null);
  const [playAgain, setPlayAgain] = useState<boolean>(false);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const [display, setDisplay] = useState<displayOptions>("loading");
  const [showGameOverDialog, setShowGameOverDialog] = useState<boolean>(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<
    "initiating" | "gameover" | "restart" | "initiated"
  >("initiating");
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
    if (dataFromToken.nickname === "") {
      setLoggedin(false);
      return;
    }
    joinRoom(dataFromToken.nickname);

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

  function handleDisplayLeaderboard() {
    setDisplay("leaderboard");
  }

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
        setDisplay("");
      }
    } else {
      toast.success(`${nickname} joined`);
      setDisplay("");
    }
  }

  function handleRoomFull() {
    setRoomFull(true);
  }

  function handleLoggedIn(userData: UserData) {
    setLoggedin(true);
    setDisplay("");
    setUserData(userData);
    joinRoom(userData.nickname);
  }

  if (roomFull) {
    return <ReturnToHomePage message="The room is Already full!" />;
  }

  if (!loggedin) {
    return <SignUp setDisplay={null} callback={handleLoggedIn} />;
  }

  return (
    <main className="min-h-screen flex flex-col px-1.5 sm:px-10">
      <Navbar
        callback={handleDisplayLeaderboard}
        setUserData={setUserData}
        userData={userData}
        setMute={setMute}
        mute={mute}
        setExitGame={setExitGame}
        setShowGameOverDialog={setShowGameOverDialog}
        showGameOverDialog={showGameOverDialog}
        setGameStatus={setGameStatus}
        gameStatus={gameStatus}
      />
      {gameStatus === "initiated" && (
        <div className="w-full flex items-center justify-center">
          <div className="relative rounded-full p-2 mt-10 flex flex-row items-center gap-2 bg-orange-100 text-black">
            <span
              className={`${
                whosTurn === "opponent"
                  ? "bg-black text-white rounded-full"
                  : "text-black "
              } px-8 py-1.5`}
            >
              OPPONENT
            </span>
            <span
              className={`${
                whosTurn === "player"
                  ? "bg-black text-white rounded-full"
                  : "text-black "
              } px-8 py-1.5`}
            >
              YOU
            </span>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center gap-5 py-10 justify-center lg:flex-row">
        <MyBoard
          setWinner={setWinner}
          setPlayerReady={setPlayerReady}
          gameStatus={gameStatus}
          winner={winner}
          mute={mute}
          setGameStatus={setGameStatus}
          whosTurn={whosTurn}
          mysocket={mysocket}
          playerReady={playerReady}
          setWhosTurn={setWhosTurn}
        />
        {exitGame && (
          <div className="fixed top-0 left-0 h-screen w-screen bg-black/60 flex items-center justify-center">
            <div className="flex text-center flex-col gap-2 p-10 rounded-[35px] bg-white w-[90vw] lg:w-[500px]">
              <h1 className="text-[1.3rem] w-full border-b border-neutral-200 font-semibold">
                Exit Game
              </h1>
              <p className="p-2">Are you sure you want to exit?</p>
              <div className="flex flex-row justify-evenly pt-4">
                <Link
                  href="/"
                  className="transition-all holographic-card duration-300 w-[47%] whitespace-nowrap overflow-hidden text-black bg-white border-black border-solid border rounded-full px-5 py-2.5 "
                >
                  Exit
                </Link>
                <button
                  autoFocus={true}
                  onClick={() => setExitGame(false)}
                  className="transition-all holographic-card duration-300 w-[47%] whitespace-nowrap overflow-hidden text-white bg-black rounded-full px-5 py-2.5 "
                >
                  Stay
                </button>
              </div>
            </div>
          </div>
        )}
        {display === "leaderboard" && (
          <Leaderboard handleCloseDialog={() => setDisplay("")} />
        )}
        {display === "loading" && <Connecting />}
        {display === "share_link" && <ShareLink room={room} />}
        {display === "player_left" && (
          <ReturnToHomePage message="Opponent Left!" />
        )}
        {(display === "game_won" ||
          display === "game_lost" ||
          display === "play_again") &&
          showGameOverDialog && (
            <GameOver
              room={room}
              setGameStatus={setGameStatus}
              setDisplay={setDisplay}
              setShowGameOverDialog={setShowGameOverDialog}
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

      <Toaster position="bottom-center" reverseOrder={false} />
    </main>
  );
}

export default Page;
