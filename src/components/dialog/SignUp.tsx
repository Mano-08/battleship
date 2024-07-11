"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Cookies from "universal-cookie";
import Loading from "../Loading";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db/firebase";
import { doc, setDoc } from "firebase/firestore";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "@/utils/types";

type setDisplayProp = React.Dispatch<React.SetStateAction<string | null>>;

function SignUp({
  setDisplay,
  callback,
}: {
  setDisplay: null | setDisplayProp;
  callback: (nickname: string) => void;
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
        callback(nicknameInput);
      }
    } catch (error) {
      console.log(error);
    }

    // Create a record in Firebase DB
    try {
      await setDoc(doc(db, "users", data.username), data);
    } catch (e) {
      console.error("Error adding document: ", e);
    }

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
        className="animate-popup flex text-center flex-col gap-2 px-4 py-6 rounded-lg bg-white w-[90vw] lg:w-[400px]"
      >
        <h1 className="text-[1.3rem] w-full border-b border-neutral-200 font-semibold">
          Enter Nickname
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-row items-center justify-between gap-5 p-5"
        >
          <input
            type="text"
            name="nickname"
            value={nicknameInput}
            autoFocus
            autoComplete="off"
            onChange={handleChange}
            placeholder="thedracula"
            className="border-b text-center grow border-black outline-none px-0.5 py-1"
          />

          {!loading ? (
            <button
              disabled={loading}
              className="transition-all duration-200 focus:outline-none text-white bg-green-800 hover:bg-green-700 focus:ring-4  focus:ring-green-300 font-medium rounded-lg px-5 py-1"
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
