import { NextResponse } from "next/server";
import { AUTH_COOKIE, verifyLogin } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const scope: string = body.team_slug || body.scope || "";
  const password: string = body.password || "";

  const granted = verifyLogin(scope, password);
  if (!granted) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, scope: granted });
  response.cookies.set(AUTH_COOKIE, granted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });
  return response;
}
