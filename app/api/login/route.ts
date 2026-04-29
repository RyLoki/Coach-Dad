import { NextResponse } from "next/server";

const VALID_USERNAME = "RMcHaffie";
const VALID_PASSWORD = "Newton2026";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set("coach-dad-session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90, // 90 days
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
