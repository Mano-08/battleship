"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function RoomFull() {
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
    <div className="fixed top-0 left-0 z-[100] h-screen w-screen flex bg-black/60 justify-center items-center">
      <div className="rounded-lg flex flex-col items-center justify-center bg-white p-6">
        <div>The room is Already full!</div>
        <p>
          You would be redirected automatically to home page in {timer} seconds
        </p>
        <button className="my-12 rounded-md text-white px-5 py-1 bg-green-600 hover:bg-green-500 disabled:bg-green-500 disabled:cursor-not-allowed">
          Return
        </button>
      </div>
    </div>
  );
}

export default RoomFull;
