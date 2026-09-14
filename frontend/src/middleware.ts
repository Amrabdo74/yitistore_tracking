import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = process.env.COOKIE_NAME ?? "yt_session";

function readRole(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "=")));
    return typeof json.role === "string" ? json.role : null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname === "/login";
  const isProtected =
    pathname.startsWith("/orders") || pathname.startsWith("/driver");

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && token) {
    const url = req.nextUrl.clone();
    url.pathname = readRole(token) === "DRIVER" ? "/driver/orders" : "/orders";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/orders") && token && readRole(token) === "DRIVER") {
    const url = req.nextUrl.clone();
    url.pathname = "/driver/orders";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/orders", "/orders/:path*", "/driver/:path*"],
};
