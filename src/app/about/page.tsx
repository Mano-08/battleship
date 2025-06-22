"use client";

import { GoogleIcon } from "@/components/Navbar";
import Link from "next/link";
import React from "react";
import toast, { Toaster } from "react-hot-toast";

function Page() {
  const [feedback, setFeedback] = React.useState("");
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await fetch(process.env.NEXT_PUBLIC_FORM_ACTION_ENDPOINT as string, {
        method: "POST",
        body: new FormData(e.currentTarget),
        headers: {
          Accept: "application/json",
        },
      });
      setFeedback("");
      toast.success("Thanks for the Feedback!");
    } catch (error) {
      console.error(error);
      toast.error("Feedback submission failed!");
    }
  }
  return (
    <main className="min-h-[70vh] w-full flex flex-col px-5 lg:px-10 py-10 lg:py-[10vh]">
      <Toaster position="bottom-center" reverseOrder={false} />

      <section className="mx-auto w-full lg:w-[640px] flex flex-col  items-start gap-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold">ABOUT</h1>
          <p className="">
            Battleship is a classic board game where two players try to sink
            each other&apos;s fleet of ships. Each player has a grid on which
            they secretly place their ships. Players take turns calling out grid
            coordinates to guess where the opponent&apos;s ships are located.
            It&apos;s a game of strategy and luck.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <h1 className="text-2xl font-semibold">HOW TO PLAY</h1>
          <div className="h-[30vh] md:h-[65vh] w-full flex flex-col rounded-2xl overflow-hidden bg-white/30">
            <iframe
              style={{ height: "100%", width: "100%" }}
              src="https://www.youtube.com/embed/RY4nAyRgkLo?si=F5cdbmOIKxFNRHoS"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold">
            BOT&apos;S COORDINATE GUESSER LOGIC
          </h1>
          <div>
            An intelligent coordinate guesser algorithm has been designed for
            the robot to predict coordinates that leverages on the previous HIT
            coordinates along with predicted direction of ship alignment
            (vertical or horizontal) where the ship was HIT but not WRECKED.
            <br />
            <br />
            Data Structure of the HIT Stack:
            <br />
            <pre className="p-5 rounded-2xl my-2 outline outline-1 outline-neutral-400">
              {`{
  row: number;
  col: number;
  shipId: string;
  direction: "vertical" | "horizontal" | null;
}[]`}
            </pre>
            <br />
            The Algorithm is designed based on the following ideology:
            <br />
            <br />
            <ul className="list-disc px-5">
              <li>
                First guess is random, if it is a HIT, then push it into HIT
                Stack with direction set to null.
              </li>
              <li>
                If there is data on HIT Stack, the next guess is around the most
                recent hit, i.e. the top element of stack.
              </li>
              <li>
                While dropping torpedo around valid coordinates of most recent
                HIT, if we miss the guess then we would swap predicted direction
                from vertical to horizontal or vice versa.
              </li>
              <li>
                In case if there are no valid coordinates around the most recent
                HIT, there again are 2 cases:
                <ol className="list-item">
                  <li>
                    <strong>Case 1:</strong> If there are successive hits on my
                    HIT Stack, then the next guess is along the direction of
                    Successive hits, this way we reach the other end of the
                    ship.
                  </li>
                  <li>
                    <strong>Case 2:</strong> Else we just swap our predicted
                    direction from horizontal to vertical or vertical to
                    horizontal.
                  </li>
                </ol>
              </li>
              <li>
                When a ship is wrecked completely, remove it&apos;s coordinates
                from the HIT Stack.
              </li>
              <li>
                If a ship is wrecked and no more coordinates are present inside
                HIT Stack, just go with random guess.
              </li>
            </ul>
            <br />
            You can find the code of the Coordinate guesser&nbsp;
            <Link
              className="underline"
              href="https://github.com/Mano-08/battleship/blob/main/src/helper/guesser.ts"
            >
              here
            </Link>
            .
            <br />
            Learn more about this project on&nbsp;
            <Link
              className="underline"
              href="https://github.com/Mano-08/battleship"
            >
              github
            </Link>
            &nbsp;and find me on&nbsp;
            <Link className="underline" href="https://x.com/mano__08">
              twitter
            </Link>
            .
          </div>
        </div>

        <div className="flex flex-col w-full">
          <h1 className="text-2xl font-semibold">FEEDBACK</h1>

          <form
            className="flex flex-col items-end gap-3"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              name="Name"
              value="BATTLESHIP FEEDBACK"
              placeholder="Your name"
              style={{ display: "none" }}
              required
            />

            <input
              type="email"
              name="Email"
              value="feedback@battleship.com"
              style={{ display: "none" }}
            />

            <textarea
              name="message"
              id="editor"
              rows={7}
              autoFocus
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="resize-none rounded-2xl p-3 w-full focus:ring-orange-200 outline outline-black focus:outline-[2.5px] bg-transparent"
            />

            <button
              type="submit"
              id="submit_button"
              className="px-3 holographic-card py-1.5 rounded-lg text-white bg-black"
            >
              Submit
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold">CREDITS</h1>
          <div className="flex flex-row items-center gap-2">
            <Link href="https://iconscout.com/icons/google" target="_blank">
              <GoogleIcon />
            </Link>
            <span className=" whitespace-nowrap">
              by{" "}
              <a
                href="https://iconscout.com/contributors/icon-mafia"
                className="underline text-sm"
              >
                Icon Mafia
              </a>{" "}
              on{" "}
              <a href="https://iconscout.com" className="underline text-sm">
                IconScout
              </a>
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Page;
