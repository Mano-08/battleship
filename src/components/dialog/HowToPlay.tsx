import React from "react";

function HowToPlay({ handleCloseDialog }: { handleCloseDialog: () => void }) {
  return (
    <div
      onClick={handleCloseDialog}
      className="fixed z-[900] h-screen w-screen top-0 left-0 bg-black/60 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-popup relative flex text-left flex-col gap-2 px-4 py-6 rounded-lg bg-white w-[90vw] lg:w-[400px]"
      >
        <h1 className="text-[1.3rem] text-center w-full border-b border-neutral-200 font-semibold">
          How to Play?
        </h1>
        <ul className="list-disc p-5">
          <li>
            Battleship is a game of strategy, where you place your ships on a
            10x10 grid.
          </li>

          <li>
            So does your opponent place their ships on their grid, but you
            cannot see their ships.
          </li>

          <li>
            Now, you take turns to bomb the grid of your opponent. If you hit a
            ship, you get another chance to bomb.
          </li>

          <li>
            The game continues until all the ships of one player are bombed.
          </li>

          <li>Good Luck!</li>
        </ul>
      </div>
    </div>
  );
}

export default HowToPlay;
