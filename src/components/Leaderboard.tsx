import { CustomJwtPayload, UserData } from "@/utils/types";
import { fetchUserScores } from "@/utils/utils";
import Cookies from "universal-cookie";
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { X } from "lucide-react";

const Leaderboard = ({
  handleCloseDialog,
}: {
  handleCloseDialog: () => void;
}) => {
  const colors = {
    1: "#ffd900b6",
    2: "#c0c0c0a9",
    3: "#cd8032a7",
  };
  const [userData, setUserData] = useState<UserData>({
    username: "",
    nickname: "",
    googleSignIn: false,
    gmail: "NULL",
    score: 0,
  });
  const [topPlayers, setTopPlayers] = useState<UserData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userPosition, setUserPosition] = useState<number>(0);

  async function getLeaderboardData(username: string) {
    const { topPlayers, position } = await fetchUserScores(username);
    setTopPlayers(topPlayers);
    setUserPosition(position);
  }

  useEffect(() => {
    const cookies = new Cookies();
    const token = cookies.get("bt_oken");
    if (token) {
      const dataFromToken = jwtDecode<CustomJwtPayload>(token);
      setUserData(dataFromToken);
      getLeaderboardData(dataFromToken.username);
    } else {
      getLeaderboardData("");
    }
    setLoading(false);
  }, []);

  return (
    <div
      onClick={handleCloseDialog}
      className="fixed z-[900] h-screen w-screen top-0 left-0 bg-black/60 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-popup relative flex text-center flex-col gap-2 p-10 rounded-[35px] bg-white w-[90vw] lg:w-[400px]"
      >
        <button
          className="absolute top-3 right-3 rounded-full bg-red-100 hover:bg-red-200 p-1"
          onClick={handleCloseDialog}
        >
          <X size={15} />
        </button>
        <h1 className="text-[1.3rem] w-full border-b border-neutral-200 font-semibold">
          LEADER BOARD 🏆
        </h1>
        <ol className="rounded-md overflow-hidden">
          {topPlayers === null &&
            Array(10)
              .fill({
                username: "",
                nickname: " . . . . . . . . ",
                googleSignIn: false,
                gmail: "NULL",
                score: 0,
              })
              .map((player: UserData, index: number) => (
                <li
                  style={{
                    background:
                      index < 3 ? colors[(index + 1) as 1 | 2 | 3] : "",
                  }}
                  className={`py-1 px-3 flex flex-row items-center justify-between animate-pulse`}
                  key={index}
                >
                  <span className="flex flex-row items-center gap-4 ">
                    <span className="w-4">{index + 1}.</span>{" "}
                    <span className="w-[150px] sm:w-[200px] text-left overflow-hidden whitespace-nowrap text-ellipsis">
                      {player.nickname}
                    </span>{" "}
                  </span>{" "}
                  <span>{player.score}</span>
                </li>
              ))}
          {topPlayers !== null &&
            topPlayers.map((player: UserData, index: number) => (
              <li
                style={{
                  background: index < 3 ? colors[(index + 1) as 1 | 2 | 3] : "",
                }}
                className={`py-1 px-3 flex flex-row items-center justify-between`}
                key={player.username}
              >
                <span className="flex flex-row items-center gap-4 ">
                  <span className="w-4">{index + 1}.</span>{" "}
                  <span className="w-[150px] sm:w-[200px] text-left overflow-hidden whitespace-nowrap text-ellipsis">
                    {player.nickname}
                  </span>{" "}
                </span>{" "}
                <span>{player.score}</span>
              </li>
            ))}
          <li
            className={`py-1 px-3 flex-row items-center justify-between border border-solid border-black rounded-b-md ${
              loading || userData.nickname === "" ? "hidden" : "flex"
            }`}
          >
            <span className="flex flex-row items-center gap-4 ">
              <span className="w-4">{userPosition}.</span>{" "}
              <span className="w-[150px] sm:w-[200px] text-left overflow-hidden whitespace-nowrap text-ellipsis">
                {userData.nickname}
              </span>{" "}
            </span>{" "}
            <span>{userData.score}</span>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default Leaderboard;
