import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { newScore, nickname, username } = await req.json();
    const token = jwt.sign(
      { score: newScore, nickname, username },
      process.env.JWTSECRETKEY as string,
      {
        expiresIn: "365d",
      }
    );
    const cookieStore = cookies();
    cookieStore.set("bt_oken", token, {
      path: "/",
      sameSite: "strict",
      secure: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });

    return new NextResponse(JSON.stringify({ token }), { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
