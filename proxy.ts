import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, HEAD_COACH_SCOPE } from "@/lib/auth";

const PUBLIC_PREFIXES = ["/login", "/api/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const scope = request.cookies.get(AUTH_COOKIE)?.value;

  // Public routes always pass through.
  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Everything else requires a session.
  if (!scope) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Head coach can go anywhere.
  if (scope === HEAD_COACH_SCOPE) return NextResponse.next();

  // Team-scoped users:
  //   /home        → redirect to their team page (they only have one team)
  //   /teams/<x>   → allow only when <x> matches their scope
  //   everything else (drills, sources, plans/*) → allow (content is shared)
  if (pathname === "/" || pathname === "/home") {
    const url = request.nextUrl.clone();
    url.pathname = `/teams/${scope}`;
    return NextResponse.redirect(url);
  }

  const teamMatch = pathname.match(/^\/teams\/([^/]+)/);
  if (teamMatch && teamMatch[1] !== scope) {
    const url = request.nextUrl.clone();
    url.pathname = `/teams/${scope}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
