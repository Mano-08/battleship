import React from "react";

function ShareLink({ room }: { room: string }) {
  return (
    <div className="fixed top-0 left-0 z-[100] h-screen w-screen flex bg-black/60 justify-center items-center">
      <div className="rounded-lg flex flex-col items-center justify-center bg-white p-6">
        <div>Share room link</div>
        <p>Click the following link to copy: {room} seconds</p>
        <button className="my-12 rounded-md text-white px-5 py-1 bg-green-600 hover:bg-green-500 disabled:bg-green-500 disabled:cursor-not-allowed">
          waiting for your firend to join
        </button>
      </div>
    </div>
  );
}

export default ShareLink;
