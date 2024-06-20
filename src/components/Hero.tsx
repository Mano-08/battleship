"use client";

import Notepad from "@/assets/notepad";
import Trophy from "@/assets/trophy";
import React, { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import Image from "next/image";
import SignUp from "./dialog/SignUp";
import { useRouter } from "next/navigation";
import MySocket from "@/utils/socket";
import battleshipImage from "../../public/main.png";
import { v4 as uuidv4 } from "uuid";
import { SignUpModes } from "@/utils/types";
// import { mysocket } from "@/utils/socket";

// const mysocket = new MySocket();

function Hero() {
  const [display, setDisplay] = useState<string | null>(null);
  const { push } = useRouter();

  // useEffect(() => {
  //   mysocket.connect();
  //   return () => mysocket.disconnect();
  // }, []);

  function createRoom() {
    const room = uuidv4();
    push(`/r/${room}`);
  }

  function enterBattlefield() {
    push("/play");
  }

  function enterOnlineBattlefield() {
    push("/online");
  }

  function userExist({ mode }: { mode: SignUpModes }): boolean {
    const cookies = new Cookies();
    const token = cookies.get("bt_oken");
    if (!token) {
      setDisplay(mode);
      return false;
    }
    return true;
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

  function handlePlayOnline() {
    if (userExist({ mode: "signup-online" })) {
      enterOnlineBattlefield();
    }
  }

  useEffect(() => {
    if (display) {
      document.getElementsByTagName("html")[0].style.overflowY = "hidden";
    } else {
      document.getElementsByTagName("html")[0].style.overflowY = "auto";
    }
  }, [display]);

  return (
    <>
      {display === "signup-multiplayer" && (
        <SignUp setDisplay={setDisplay} callback={createRoom} />
      )}
      {display === "signup-solo" && (
        <SignUp setDisplay={setDisplay} callback={enterBattlefield} />
      )}
      {display === "signup-online" && (
        <SignUp setDisplay={setDisplay} callback={enterOnlineBattlefield} />
      )}

      <div className="min-h-[85vh] w-full flex items-center justify-center">
        <section className="flex flex-col justify-end lg:justify-start lg:flex-row items-center gap-5">
          <Image
            src={battleshipImage}
            height={300}
            width={300}
            alt="battle ship"
            className="h-[300px] w-[300px] rounded-lg bg-white outline outline-black"
          />
          <div className="w-[300px] lg:w-auto flex flex-col justify-start gap-7 lg:justify-between lg:h-[300px] py-1">
            <div className="flex flex-col gap-2">
              <button
                onClick={handlePlayWithRobot}
                type="button"
                className="transition-all duration-200 focus:outline-none text-white bg-neutral-800 hover:bg-neutral-700 focus:ring-4  focus:ring-neutral-300 font-medium rounded-lg px-10 py-2"
              >
                Quick Game
              </button>
              <button
                onClick={handlePlayOnline}
                type="button"
                className="transition-all duration-200 focus:outline-none text-white bg-neutral-800 hover:bg-neutral-700 focus:ring-4  focus:ring-neutral-300 font-medium rounded-lg px-10 py-2"
              >
                Play Online
              </button>
              <button
                onClick={handlePlayWithFriend}
                type="button"
                className="transition-all duration-200 focus:outline-none text-white bg-neutral-800 hover:bg-neutral-700 focus:ring-4  focus:ring-neutral-300 font-medium rounded-lg px-10 py-2"
              >
                Play with Friend
              </button>
            </div>
            <div className="flex justify-center lg:justify-start flex-row gap-2">
              <button
                type="button"
                className="transition-all duration-200 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-md p-2"
              >
                <Trophy />
              </button>
              <button className="transition-all duration-200 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-md p-2">
                <Notepad />
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Hero;
