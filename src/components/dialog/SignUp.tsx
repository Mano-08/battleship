"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Cookies from "universal-cookie";
import Loading from "../Loading";
import { v4 as uuidv4 } from "uuid";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload, DisplayModes, UserData } from "@/utils/types";
import { createRecordInDB } from "@/utils/utils";

type setDisplayProp = React.Dispatch<React.SetStateAction<DisplayModes>>;

function SignUp({
  setDisplay,
  callback,
}: {
  setDisplay: null | setDisplayProp;
  callback: (userData: UserData) => void;
}) {
  const [nicknameInput, setNicknameInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDisplay && setDisplay(null);
      }
    };
    return document.addEventListener("keydown", handleKeydown);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNicknameInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (nicknameInput.trim() === "") return;
    setLoading(true);
    const cookies = new Cookies();
    const token = cookies.get("bt_oken");
    const dataFromToken = token && jwtDecode<CustomJwtPayload>(token);
    const data = {
      nickname: nicknameInput.trim(),
      username: token ? dataFromToken.username : uuidv4().replace(/-/g, ""),
      score: token ? dataFromToken.score : 0,
      gmail: token ? dataFromToken.gmail : "NULL",
      googleSignIn: token ? dataFromToken.googleSignIn : false,
    };

    try {
      const res = await fetch("/api/update-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (res.status === 200) {
        callback(data);
      }
    } catch (error) {
      console.log(error);
    }

    // Create a record in Firebase DB
    createRecordInDB(data);

    setLoading(false);
  };

  const handleCloseDialog = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setDisplay && setDisplay(null);
    }
  };

  return (
    <div
      onClick={handleCloseDialog}
      className="fixed z-[900] h-screen w-screen top-0 left-0 bg-black/60 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-popup flex text-center flex-col gap-2 p-5 lg:p-10 rounded-[35px] bg-white w-[90vw] lg:w-[400px]"
      >
        <h1 className="text-[1.3rem] w-full border-b border-neutral-200 font-semibold">
          Enter Nickname
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-row items-center justify-center gap-3 sm:gap-5 py-5"
        >
          <input
            type="text"
            name="nickname"
            value={nicknameInput}
            autoFocus
            autoComplete="off"
            onChange={handleChange}
            placeholder="dracula"
            className="border-b max-w-[50%] text-center grow border-black outline-none px-0.5 py-1"
          />

          {!loading ? (
            <button
              disabled={loading}
              className="holographic-card transition-all duration-200 text-white bg-black focus:ring-4  focus:ring-neutral-300 font-medium rounded-lg px-5 py-1"
            >
              Go
            </button>
          ) : (
            <div>
              <Loading />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default SignUp;
