import React from "react";

function Page() {
  return (
    <main className="min-h-screen w-full flex flex-col px-5 lg:px-10 py-[10vh]">
      <section className="mx-auto w-full lg:w-[860px] flex flex-col items-start">
        <h1 className="">ABOUT</h1>
        <p>This game is cool ...</p>

        <h1>Credits</h1>
        <p>
          {/* <li>
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
                    <a
                      href="https://iconscout.com"
                      className="underline text-sm"
                    >
                      IconScout
                    </a>
                  </li> */}
        </p>
      </section>
    </main>
  );
}

export default Page;
