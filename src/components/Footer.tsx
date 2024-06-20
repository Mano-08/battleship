import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <div className="border-t-[0.5px] border-black border-solid mt-10 py-5">
      &copy; mano 2024
      <Link href="/r/1234">click</Link>
    </div>
  );
}

export default Footer;
