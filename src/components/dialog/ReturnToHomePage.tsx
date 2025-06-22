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
      <div className="flex text-center flex-col gap-2 p-10 rounded-[35px] bg-white w-[90vw] lg:w-[500px]">
        <h1 className="text-[1.1rem] sm:text-[1.3rem] w-full border-b border-neutral-200 font-semibold">
          {message}
        </h1>
        <div className="pb-5 text-sm sm:text-base">
          You would be redirected automatically to home page in {timer} seconds
        </div>
        <Link
          href="/"
          className="w-full text-sm rounded-full sm:text-base text-white bg-black  px-5 py-2.5"
        >
          Return
        </Link>
      </div>
    </div>
  );
}

export default ReturnToHome;
