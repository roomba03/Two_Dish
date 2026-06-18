import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Cook dashboard ─────────────────────────────────────────────────────────
  if (pathname === "/cook/login") {
    return NextResponse.next();
  }

  if (pathname === "/cook" || pathname.startsWith("/cook/")) {
    const session = req.cookies.get("cook-session");
    if (!session?.value) {
      const url = req.nextUrl.clone();
      url.pathname = "/cook/login";
      return NextResponse.redirect(url);
    }
  }

  // ── Customer account ────────────────────────────────────────────────────────
  if (pathname === "/account/login" || pathname === "/account/signup") {
    return NextResponse.next();
  }

  if (pathname === "/account" || pathname.startsWith("/account/")) {
    const session = req.cookies.get("customer-session");
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/account/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cook", "/cook/:path*", "/account", "/account/:path*"],
};
