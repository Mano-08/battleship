"use client";

import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "@/utils/types";
import { Anchor } from "lucide-react";

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
    <header className="w-full p-3 border-t border-neutral-400 h-[10vh] lg:h-auto py-2 md:py-5">
      <nav className="mx-auto w-[95%] lg:w-[860px] gap-1 flex flex-row justify-between items-center">
        <Link href="/">
          <Anchor />
        </Link>
        <div className="flex flex-row gap-3 items-end">
          {nickname !== "" && (
            <div>
              score: <strong>{score}</strong>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
