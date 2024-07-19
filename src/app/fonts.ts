import { Montserrat } from "next/font/google";
import localFont from "next/font/local";

export const monsterrat = Montserrat({ subsets: ["latin"] });

export const britney = localFont({
  src: "./BritneyVariabletff.ttf",
  weight: "400",
});
