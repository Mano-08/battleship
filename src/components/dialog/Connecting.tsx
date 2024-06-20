import React from "react";
import Loading from "../Loading";

function Connecting() {
  return (
    <div className="fixed h-screen w-screen top-0 left-0 bg-black/60 flex items-center justify-center">
      <div className="flex text-center flex-col gap-2 p-5 animate-popup rounded-lg bg-white w-[90vw] lg:w-[300px]">
        <div className=" flex flex-row items-center justify-center gap-5">
          Connecting <Loading />
        </div>
      </div>
    </div>
  );
}

export default Connecting;
