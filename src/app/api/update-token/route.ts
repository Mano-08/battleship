import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CryptoJS from "crypto-js";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // const data = { score: 0 };
    // var ciphertext = CryptoJS.AES.encrypt(
    //   JSON.stringify(data),
    //   process.env.ENCRYPTION_KEY as string
    // ).toString();
    // var bytes  = CryptoJS.AES.decrypt(ciphertext, process.env.ENCRYPTION_KEY as string);
    // var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    const token = jwt.sign(data, process.env.JWTSECRETKEY as string);
    const cookieStore = cookies();
    cookieStore.set("bt_oken", token, {
      path: "/",
      sameSite: "strict",
      secure: true,
    });
    return new NextResponse(JSON.stringify({ token }), { status: 200 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
