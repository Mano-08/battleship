import React from "react";

function Page() {
  return (
    <main className="min-h-[70vh] w-full flex flex-col px-5 lg:px-10 py-10 lg:py-[10vh]">
      <section className="mx-auto w-full lg:w-[860px] flex flex-col items-start gap-5">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">ABOUT</h1>
          <p className="">This game is cool ...</p>
        </div>

        <div className="flex flex-col w-full">
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

        <div className="flex flex-col ">
          <h1 className="text-2xl font-semibold">FEEDBACK</h1>

          <form action="https://formspree.io/f/mrgjnldy" method="POST">
            <input
              type="text"
              name="Name"
              value="MANGA SUGGESTION"
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

            <textarea name="message" id="editor" rows={7} required />

            <button type="submit" id="submit_button">
              Submit
            </button>
          </form>
        </div>

        <div className="flex flex-col ">
          <h1 className="text-2xl font-semibold">CREDITS</h1>
          <p>
            <a
              href="https://iconscout.com/icons/google"
              className="underline text-sm"
              target="_blank"
            >
              Google
            </a>{" "}
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
          </p>
        </div>
      </section>
    </main>
  );
}

export default Page;
