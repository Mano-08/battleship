import React from "react";

function HowToPlay({
  userCount = 350,
  handlePlayWithFriend,
  handlePlayWithRobot,
}: {
  userCount?: number;
  handlePlayWithFriend: () => void;
  handlePlayWithRobot: () => void;
}) {
  return (
    <div
      onClick={handlePlayWithRobot}
      className="fixed z-[900] h-screen w-screen top-0 left-0 bg-black/60 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-popup relative flex text-left flex-col gap-2 p-5 lg:p-10 rounded-[35px] bg-white w-[90vw] lg:w-[500px]"
      >
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

          <li>Earn 250 points by winning within 40 moves!</li>

          <li className="mt-3">Good Luck!</li>
        </ul>

        <p className="w-full text-violet-600 text-center p-2 text-sm border-black/20 mb-4 rounded-full border border-solid ">
          Played by over {userCount} players worldwide
        </p>

        <div className="flex flex-row items-center justify-between">
          <button
            onClick={handlePlayWithFriend}
            className="holographic-card rounded-full whitespace-nowrap px-3 lg:px-5 w-[48%] py-2.5 bg-white border border-black border-solid text-black"
          >
            Play with Friend
          </button>
          <button
            onClick={handlePlayWithRobot}
            className="holographic-card rounded-full whitespace-nowrap px-3 lg:px-5 w-[48%] py-2.5 bg-black text-white"
          >
            Play with Robot
          </button>
        </div>
      </div>
    </div>
  );
}

export default HowToPlay;
