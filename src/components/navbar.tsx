import React from "react";
import Button from "./button";
import Link from "next/link";

function Navbar() {
  return (
    <header className="w-full py-2 md:py-5">
      <nav className="flex flex-row justify-between items-center">
        <Link href="/">BATTLESHIP</Link>
        <button>language</button>
      </nav>
    </header>
  );
}

export default Navbar;
