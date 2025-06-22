"use client";

import { useEffect, useRef, useState } from "react";
import React from "react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

import Cookies from "universal-cookie";
import { defaultUserData, UserData } from "@/utils/types";
import {
  Anchor,
  LogOut,
  MessageSquareDot,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import { auth, provider } from "@/db/firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { fetchUserData, pushDataToDB } from "@/utils/utils";

function Navbar({
  userData,
  setUserData,
  showGameOverDialog,
  setShowGameOverDialog,
  setExitGame,
  gameStatus,
  setGameStatus,
  setMute,
  mute,
}: {
  userData: UserData;
  showGameOverDialog: undefined | boolean;
  setShowGameOverDialog:
    | undefined
    | React.Dispatch<React.SetStateAction<boolean>>;
  gameStatus: "initiating" | "gameover" | "restart" | "initiated";
  setGameStatus: React.Dispatch<
    React.SetStateAction<"initiating" | "gameover" | "restart" | "initiated">
  >;
  setExitGame: React.Dispatch<React.SetStateAction<boolean>>;
  setMute: React.Dispatch<React.SetStateAction<boolean>>;
  mute: boolean;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}) {
  const [googleAuth, setGoogleAuth] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [openSettings, setOpenSettings] = useState<boolean>(false);
  const cookies = new Cookies();

  useEffect(() => {
    // setGoogleAuth(user === null ? false : true);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        setGoogleAuth(true);
        // ...
      } else {
        // User is signed out
        // ...
        setGoogleAuth(false);
      }
    });
  }, []);

  const handleClickOutside = (event: any) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target)
    ) {
      setOpenSettings(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSaveProgress() {
    // STEP 1 : Sign in with google
    signInWithPopup(auth, provider)
      .then(async (result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;
        const gmailAcc = user.email as string;
        //  STEP 2 : Check if data is there in DB
        const res = await fetchUserData(gmailAcc as string);

        let data = {
          nickname: userData.nickname,
          username:
            userData.username === ""
              ? uuidv4().replace(/-/g, "")
              : userData.username,
          gmail: gmailAcc,
          score: userData.score,
          googleSignIn: true,
        };
        if (res !== null) {
          data = res as any;
        }

        setUserData(data as any);

        try {
          await fetch("/api/update-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
        } catch (error) {
          console.log(error);
        }

        if (res === null) {
          // STEP 3 :  push to DB
          pushDataToDB(data);
        }
      })
      .catch(() => {
        toast.error("Sign in Failed");
      });
  }

  function handleDeleteAccount() {
    if (googleAuth) {
      signOut(auth)
        .then(() => {
          setUserData(defaultUserData);
          cookies.remove("bt_oken");
        })
        .catch(() => {
          return false;
        });
    } else {
      setUserData(defaultUserData);
      cookies.remove("bt_oken");
    }
  }
  return (
    <header className="w-full p-3 border-b border-solid border-neutral-300 h-[10vh] lg:h-auto py-5">
      <nav className="mx-auto w-full lg:w-[860px] gap-1 flex flex-row justify-between items-center">
        <Link href="/">
          <Anchor />
        </Link>
        <div className="flex flex-row gap-3 items-end">
          <div className="flex flex-row relative items-center gap-5">
            {gameStatus === "gameover" &&
              (showGameOverDialog !== undefined ? (
                <button
                  className={`${
                    !showGameOverDialog && "animate-pulse"
                  } transition-all duration-200 text-gray-900 focus:ring-4 focus:ring-orange-200 font-medium rounded-md p-2`}
                  onClick={() =>
                    setShowGameOverDialog && setShowGameOverDialog(true)
                  }
                >
                  <MessageSquareDot />
                </button>
              ) : (
                <button
                  className="transition-all duration-200 text-gray-900 focus:ring-4 focus:ring-orange-200 font-medium rounded-md p-2"
                  onClick={() => setGameStatus("initiating")}
                >
                  <RotateCcw />
                </button>
              ))}

            <div
              style={{
                display:
                  userData.nickname === ""
                    ? userData.googleSignIn
                      ? "block"
                      : "none"
                    : "block",
              }}
            >
              <strong className="mr-3">{userData.nickname}</strong> score:{" "}
              <strong>{userData.score}</strong>
            </div>

            <div
              ref={buttonRef}
              className={`${
                openSettings && "rotate-45"
              } transition-all duration-300  cursor-pointer`}
              onClick={() => setOpenSettings(!openSettings)}
            >
              <Settings />
            </div>
            {mute ? (
              <button
                className="transition-all duration-300 text-gray-900"
                onClick={() => setMute(false)}
              >
                <VolumeX />
              </button>
            ) : (
              <button
                className="transition-all duration-300 text-gray-900"
                onClick={() => setMute(true)}
              >
                <Volume2 />
              </button>
            )}
            <div
              ref={dropdownRef}
              className={`${
                openSettings ? "flex" : "hidden"
              } flex-col items-start p-2 rounded-lg bg-orange-50 absolute z-[500] top-9 right-0`}
            >
              <Link
                href="/about"
                className="w-full flex transition-all duration-300 p-1 px-2 flex-row gap-2 hover:bg-orange-100 rounded-md items-center whitespace-nowrap"
              >
                About
              </Link>
              {(!userData.googleSignIn || !googleAuth) && (
                <button
                  onClick={
                    userData.googleSignIn ? undefined : handleSaveProgress
                  }
                  className="w-full flex transition-all duration-300 p-1 px-2 flex-row gap-2 hover:bg-orange-100 rounded-md items-center whitespace-nowrap"
                >
                  <p>
                    {userData.nickname === ""
                      ? userData.googleSignIn
                        ? googleAuth
                          ? ""
                          : "Login"
                        : "Login"
                      : userData.googleSignIn
                      ? googleAuth
                        ? ""
                        : "Login"
                      : "Save Progress"}
                  </p>{" "}
                  <GoogleIcon />
                </button>
              )}
              <button
                style={{
                  display:
                    (userData.nickname === "" &&
                      userData.googleSignIn === true) ||
                    userData.nickname !== ""
                      ? "flex"
                      : "none",
                }}
                onClick={handleDeleteAccount}
                className="w-full transition-all duration-300 p-1 px-2 flex-row gap-2 hover:bg-red-200 rounded-md items-center whitespace-nowrap"
              >
                {userData.googleSignIn ? "Log out" : "Delete Account"}
              </button>
            </div>

            <button
              className="transition-all duration-300 text-gray-900"
              onClick={() => setExitGame(true)}
            >
              <LogOut />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      preserveAspectRatio="xMidYMid"
      viewBox="0 0 256 262"
      id="google"
    >
      <path
        fill="#4285F4"
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
      ></path>
      <path
        fill="#34A853"
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
      ></path>
      <path
        fill="#FBBC05"
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
      ></path>
      <path
        fill="#EB4335"
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
      ></path>
    </svg>
  );
}

export default Navbar;
