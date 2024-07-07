import { db } from "@/db/firebase";
import { doc, setDoc } from "firebase/firestore";
import { UserData } from "./types";

export async function updateScoreIntoCookie({
  hitCount,
  setUserData,
  userData,
}: {
  hitCount: number;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  userData: UserData;
}) {
  const bonus = hitCount <= 40 ? 250 : 100;
  const newScore = userData.score + bonus;
  setUserData((prev: UserData) => {
    const newData = { ...prev };
    newData.score = newScore;
    return newData;
  });
  const data = {
    ...userData,
    score: newScore,
  };
  try {
    const res = await fetch("/api/update-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.log(error);
  }

  // Update Data Into DB
  try {
    await setDoc(doc(db, "users", data.username), data);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
