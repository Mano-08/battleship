import { db } from "@/db/firebase";
import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { UserData } from "./types";

export function sleep(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

export async function findUserCount(
  setUserCount: React.Dispatch<React.SetStateAction<number>>
) {
  const coll = collection(db, "users");
  const snapshot = await getCountFromServer(coll);
  setUserCount(snapshot.data().count);
}

export async function fetchUserData(gmailAcc: string) {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("gmail", "==", gmailAcc));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // Assuming you expect one document per gmail
      return userDoc.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

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

export const fetchUserScores = async (
  username: string
): Promise<{ position: number; topPlayers: UserData[] }> => {
  const q = query(collection(db, "users"), orderBy("score", "desc"));
  const querySnapshot = await getDocs(q);
  const topPlayers: UserData[] = [];
  let position = 0;
  let index = 0;
  for (const doc of querySnapshot.docs) {
    const userData = doc.data() as UserData;
    if (index < 10) {
      topPlayers.push(userData);
    }
    console.log(userData, username);
    if (userData.username === username) {
      position = index + 1;
      if (index >= 9) {
        break;
      }
    }
    index += 1;
  }

  return { position, topPlayers };
};

export async function createRecordInDB(data: UserData) {
  try {
    await setDoc(doc(db, "users", data.username), data);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function pushDataToDB(data: UserData) {
  try {
    await setDoc(doc(db, "users", data.username), data);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
