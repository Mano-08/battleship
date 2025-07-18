"use client";

import React, { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import SignUp from "./dialog/SignUp";
import { useRouter } from "next/navigation";
import OppImage from "../../public/opp.png";
import PlayerImage from "../../public/player.png";
import { v4 as uuidv4 } from "uuid";
import { CustomJwtPayload, SignUpModes } from "@/utils/types";
import { britney, monsterrat } from "@/app/fonts";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import { findUserCount } from "@/utils/utils";
import Leaderboard from "./Leaderboard";
import HowToPlay from "./dialog/HowToPlay";
// import { mysocket } from "@/utils/socket";

// const mysocket = new MySocket();

function Hero() {
  const [display, setDisplay] = useState<string | null>(null);
  const { push } = useRouter();
  const [userCount, setUserCount] = useState<number>(379);

  // useEffect(() => {
  //   mysocket.connect();
  //   return () => mysocket.disconnect();
  // }, []);

  useEffect(() => {
    findUserCount(setUserCount);
  }, []);
  function createRoom() {
    const room = uuidv4();
    push(`/r/${room}`);
  }

  function enterBattlefield() {
    push("/play");
  }

  function userExist({ mode }: { mode: SignUpModes }): boolean {
    const cookies = new Cookies();
    const token = cookies.get("bt_oken");
    if (!token) {
      setDisplay(mode);
      return false;
    } else {
      const { nickname } = jwtDecode<CustomJwtPayload>(token);
      if (nickname === "") {
        setDisplay(mode);
        return false;
      }
    }
    return true;
  }

  function handleCloseDialog() {
    setDisplay(null);
  }

  function handlePlayWithFriend() {
    if (userExist({ mode: "signup-multiplayer" })) {
      createRoom();
    }
  }

  function handlePlayWithRobot() {
    if (userExist({ mode: "signup-solo" })) {
      enterBattlefield();
    }
  }

  useEffect(() => {
    if (display !== null) {
      document.getElementsByTagName("html")[0].style.overflowY = "hidden";
    } else {
      document.getElementsByTagName("html")[0].style.overflowY = "auto";
    }
    return () => {
      document.getElementsByTagName("html")[0].style.overflowY = "auto";
    };
  }, [display]);

  return (
    <>
      {display === "signup-multiplayer" && (
        <SignUp setDisplay={setDisplay} callback={createRoom} />
      )}
      {display === "signup-solo" && (
        <SignUp setDisplay={setDisplay} callback={enterBattlefield} />
      )}

      {display === "leaderboard" && (
        <Leaderboard handleCloseDialog={handleCloseDialog} />
      )}

      {display === "how-to-play" && (
        <HowToPlay handleCloseDialog={handleCloseDialog} />
      )}

      <div className="min-h-[85vh] w-full flex flex-col justify-end pb-[10vh] lg:pb-[15vh]">
        <div className="mx-auto w-[95%] lg:w-[860px] lg:gap-1 flex flex-col-reverse lg:flex-row gap-5 justify-between items-center">
          <div className="flex flex-col lg:text-left text-center gap-5">
            <p className={britney.className + " text-4xl lg:text-5xl"}>
              BaTTLESHIP
            </p>
            <p className="text-sm lg:text-xl">
              Dominate the seas, one battle at a time <br />
              Sink your enemies before they sink you!
            </p>
            <div
              style={{ display: userCount === 0 ? "hidden" : "block" }}
              className={
                monsterrat.className +
                " text-xs lg:text-left text-center lg:text-sm text-neutral-500"
              }
            >
              Join over <strong>{userCount}</strong> players from around the
              world!
              <br />
              <div className="flex flex-row items-center sm:justify-start justify-center gap-2 w-full">
                <button
                  onClick={() => setDisplay("leaderboard")}
                  className="underline"
                >
                  leaderboard
                </button>
                <button
                  onClick={() => setDisplay("how-to-play")}
                  className="underline"
                >
                  how to play?
                </button>
              </div>
            </div>
            <div className="grid grid-rows-2 grid-cols-1  lg:grid-cols-2 lg:grid-rows-1 gap-4 font-semibold">
              <button
                onClick={handlePlayWithFriend}
                type="button"
                className="bg-black outline-black outline text-white p-3 lg:p-4 rounded-lg"
              >
                Play with Friend
              </button>{" "}
              <button
                onClick={handlePlayWithRobot}
                type="button"
                className="outline-black outline p-3 lg:p-4 rounded-lg"
              >
                Play with Robot
              </button>
            </div>
          </div>

          <div className="relative flex flex-row items-center lg:w-auto">
            <Image
              height={320}
              width={320}
              priority={true}
              src={OppImage.src}
              alt="battle ship"
              className="relative z-[200] hover:scale-105 -left-16 lg:left-0 transition-all duration-1000 -rotate-3 h-[230px] lg:h-[320px] w-auto bg-[--orange] rounded-lg overflow-hidden"
            />
            <Image
              height={320}
              width={320}
              priority={true}
              src={PlayerImage.src}
              alt="battle ship"
              className="absolute hover:scale-105 transition-all duration-1000 z-[300] left-16 lg:left-36  bottom-0 rotate-12 h-[230px] lg:h-[320px] w-auto bg-[--orange] rounded-lg overflow-hidden"
            />
          </div>
          <span></span>
        </div>
      </div>
    </>
  );
}

export default Hero;
