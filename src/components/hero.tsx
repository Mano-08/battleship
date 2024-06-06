"use client";

import Notepad from "@/assets/notepad";
import Trophy from "@/assets/trophy";
import React, { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import SignUp from "./dialog/signup";
import { useRouter } from "next/navigation";
import MySocket from "@/utils/socket";
// import { mysocket } from "@/utils/socket";

// const mysocket = new MySocket();

function Hero() {
  const [display, setDisplay] = useState<string | null>(null);
  const { push } = useRouter();

  // useEffect(() => {
  //   mysocket.connect();
  //   return () => mysocket.disconnect();
  // }, []);

  const createRoom = () => {
    push("/r/1234");
  };

  const handleCheckUserExist = () => {
    const cookies = new Cookies();
    const token = cookies.get("bt_oken");
    if (!token) {
      setDisplay("signup");
      return;
    }
    createRoom();
  };

  useEffect(() => {
    if (display) {
      document.getElementsByTagName("html")[0].style.overflowY = "hidden";
    } else {
      document.getElementsByTagName("html")[0].style.overflowY = "auto";
    }
  }, [display]);

  return (
    <>
      {display === "signup" && (
        <SignUp setDisplay={setDisplay} callback={createRoom} />
      )}
      <div className="min-h-[85vh] w-full flex items-center justify-center">
        <section className="flex flex-col md:flex-row items-center gap-5">
          <div className="h-[300px] w-[300px] rounded-lg bg-white outline outline-black"></div>
          <div className="flex flex-col justify-between h-[300px] py-1">
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCheckUserExist}
                type="button"
                className="focus:outline-none text-white bg-neutral-800 hover:bg-neutral-700 focus:ring-4  focus:ring-neutral-300 font-medium rounded-lg px-10 py-2"
              >
                Play with friend
              </button>
              <button
                type="button"
                className="focus:outline-none text-white bg-neutral-800 hover:bg-neutral-700 focus:ring-4  focus:ring-neutral-300 font-medium rounded-lg px-10 py-2"
              >
                Play with robot
              </button>
            </div>
            <div className="flex flex-row gap-2">
              <button
                type="button"
                className=" text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-md p-2"
              >
                <Trophy />
              </button>
              <button className=" text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-md p-2">
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
