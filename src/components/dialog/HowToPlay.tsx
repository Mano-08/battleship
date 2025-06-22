import React from "react";

function HowToPlay({
  handlePlayWithFriend,
  handlePlayWithRobot,
}: {
  handlePlayWithFriend: () => void;
  handlePlayWithRobot: () => void;
}) {
  return (
    <div className="fixed z-[900] h-screen w-screen top-0 left-0 bg-black/60 flex items-center justify-center">
      <div className="animate-popup relative flex text-left flex-col gap-2 p-10 rounded-[35px] bg-white w-[90vw] lg:w-[500px]">
        <h1 className="text-[1.3rem] text-center w-full border-b border-neutral-200 font-semibold">
          How to Play?
        </h1>
        <ul className="list-disc p-5">
          <li>Battleship is a game of strategy and luck.</li>

          <li>
            You place 5 ships on a 10x10 grid, so does your opponent. But you
            cannot see their ships.
          </li>

          <li>Now, you take turns to bomb the grid of your opponent.</li>

          <li>
            The game continues until all the ships of one player are bombed.
          </li>

          <li className="text-green-600">
            Earn 250 points by winning within 40 moves!
          </li>

          <li className="mt-3">Good Luck!</li>
        </ul>

        <div className="flex flex-row items-center justify-center gap-2 ">
          <button
            onClick={handlePlayWithFriend}
            className="holographic-card rounded-full px-5 w-[47%] py-2.5 bg-white border border-black border-solid text-black"
          >
            Play with Friend
          </button>
          <button
            onClick={handlePlayWithRobot}
            className="holographic-card rounded-full px-5 w-[47%] py-2.5 bg-black text-white"
          >
            Play with Robot
          </button>
        </div>
      </div>
    </div>
  );
}

export default HowToPlay;
