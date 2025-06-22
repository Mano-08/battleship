import React from "react";
import toast from "react-hot-toast";

function ShareLink({ room }: { room: string }) {
  function handleCopyLink() {
    window.navigator.clipboard.writeText(`${window.location.origin}/r/${room}`);
    toast.success("Link copied");
  }
  return (
    <div className="fixed h-screen w-screen top-0 left-0 bg-black/60 flex items-center justify-center">
      <div className="animate-popup flex text-center flex-col gap-2 p-10 rounded-[35px] bg-white w-[90vw] lg:w-[400px]">
        <h1 className="text-[1.1rem] sm:text-[1.3rem] w-full border-b border-neutral-200 font-semibold">
          Share Link with your friend
        </h1>
        <p className="pt-3 pb-2 text-sm sm:text-base">Click to copy the URL</p>
        <button
          onClick={(e) => {
            handleCopyLink();
            e.currentTarget.blur();
          }}
          className="holographic-card transition-all text-sm sm:text-base duration-200 break-words min-w-[120px] focus:outline-none text-neutral-200 bg-black focus:ring-4  focus:ring-neutral-300 font-medium rounded-full px-5 py-2.5"
        >
          {`${window.location.origin.slice(0, 12)}...${room.slice(
            room.length - 12,
            room.length
          )}`}{" "}
        </button>
      </div>
    </div>
  );
}

export default ShareLink;
