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
            each other's fleet of ships. Each player has a grid on which they
            secretly place their ships. Players take turns calling out grid
            coordinates to guess where the opponent's ships are located. It's a
            game of strategy and luck.
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

        {/* <div className="flex flex-col ">
          <h1 className="text-2xl font-semibold">WHY DID I BUILD THIS?</h1>
          <div>
            I used to play Battleship with my friends with pen and paper,
            sitting on the last bench of our class [2013]! One fine Sunday I
            thought how it would be to build an online version of it and here we
            are, it's not perfect but it was fun building it :D
            <br />
            <br />
            
          </div>
        </div> */}

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold">
            BOT'S COORDINATE GUESSER LOGIC
          </h1>
          <div>
            For building the game play against robot, I designed a
            Coordinate-Guesser function which picks up a random coordinate or if
            the knowledge base says that it already HIT a ship but not WRECKED
            it, then the coordinates explored would be around the cell where the
            ship was HIT, it also considers its prediction whether the ship is
            placed horizontally or vertically, in case it keeps attacking along
            the Vertical direction starting from the last hit coordinate but at
            some point drops torpedo into ocean (without completely wrecking the
            ship) then it corrects its prediction and tries Horizontally vis a
            vis. Also, when there exists a Hit but 'no' coordinates around it
            are empty, the robot moves along the path where it dropped bombs to
            reach the other end of the ship where torpedoes can eventually be
            dropped. I guess I made it confusing, sorry about that, but you can
            checkout the Coordinate Guesser Logic&nbsp;
            <Link
              className="underline"
              href="https://github.com/Mano-08/battleship/blob/main/src/helper/guesser.ts"
            >
              here
            </Link>
            .
            <br />
            <br />
            Learn more about the code on&nbsp;
            <Link
              className="underline"
              href="https://github.com/Mano-08/battleship"
            >
              github
            </Link>
            &nbsp; and find me on&nbsp;
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
              className="px-3 py-1.5 rounded-lg text-white bg-black"
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
