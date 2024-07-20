"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function ReturnToHome({ message }: { message: string }) {
  const [timer, setTimer] = useState<number>(5);
  const router = useRouter();
  useEffect(() => {
    if (timer === 0) {
      router.push("/");
      return;
    }
    // save intervalId to clear the interval when the
    // component re-renders
    const intervalId = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    // clear interval on re-render to avoid memory leaks
    return () => clearInterval(intervalId);
  }, [timer]);

  return (
    <div className="fixed h-screen w-screen top-0 left-0 bg-black/60 flex items-center justify-center">
      <div className="flex text-center flex-col gap-2 px-4 py-6 rounded-lg bg-white w-[90vw] lg:w-[400px]">
        <h1 className="text-[1.1rem] sm:text-[1.3rem] w-full border-b border-neutral-200 font-semibold">
          {message}
        </h1>
        <div className="pb-5 text-sm sm:text-base">
          You would be redirected automatically to home page in {timer} seconds
        </div>

        <Link
          href="/"
          className="min-w-[120px] text-sm sm:text-base focus:outline-none text-white bg-red-800 hover:bg-red-700 focus:ring-4  focus:ring-red-300 font-medium rounded-lg px-5 py-1"
        >
          Return
        </Link>
      </div>
    </div>
  );
}

export default ReturnToHome;
