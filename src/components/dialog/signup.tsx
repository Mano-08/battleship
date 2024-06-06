"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { Loading } from "@/assets/svgs";
import Cookies from "universal-cookie";

type setDisplayProp = React.Dispatch<React.SetStateAction<string | null>>;

function SignUp({
  setDisplay,
  callback,
}: {
  setDisplay: null | setDisplayProp;
  callback: (nickname: string) => void;
}) {
  const [nickname, setNickname] = useState<string>("");
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
    setNickname(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    setLoading(true);
    e.preventDefault();
    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nickname,
      }),
    });
    if (res.status === 200) {
      callback(nickname);
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
      className="fixed top-0 left-0 z-[100] h-screen w-screen flex bg-black/60 justify-center items-center"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="rounded-lg flex flex-col items-center justify-center bg-white p-6"
      >
        <div className="grid grid-cols-2 items-center">
          <label htmlFor="nickname">nickname: </label>
          <input
            type="text"
            name="nickname"
            value={nickname}
            autoFocus
            autoComplete="off"
            onChange={handleChange}
            placeholder="thedracula"
            className="border-b border-black outline-none px-0.5 py-1"
          />
        </div>

        <div className="flex flex-row items-center justify-end gap-2">
          <button
            type="submit"
            disabled={loading}
            className="my-12 rounded-md text-white px-5 py-1 bg-green-600 hover:bg-green-500 disabled:bg-green-500 disabled:cursor-not-allowed"
          >
            Play
          </button>
          {loading && (
            <div className="animate-spin h-[24px] w-[24px]">
              <Loading />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default SignUp;
