"use client";

import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "@/utils/types";

function Navbar() {
  const [nickname, setNickname] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  useEffect(() => {
    const cookies = new Cookies();
    const token = cookies.get("bt_oken");
    if (!token) {
      return;
    }
    const { nickname, score } = jwtDecode<CustomJwtPayload>(token);
    setNickname(nickname);
    setScore(score);
  }, []);

  return (
    <header className="w-full py-2 md:py-5">
      <nav className="flex flex-row justify-between items-center">
        <Link href="/">BATTLESHIP</Link>
        <div className="flex flex-row gap-3 items-end">
          {nickname !== "" && (
            <div>
              score: <strong>{score}</strong>
            </div>
          )}
          <button>settings</button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
