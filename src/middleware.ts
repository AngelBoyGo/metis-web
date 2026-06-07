import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "es", "zh", "th"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/documents") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const segment = pathname.split("/")[1];
  if (LOCALES.includes(segment)) {
    return NextResponse.next();
  }

  const target = pathname === "/" ? "/en" : `/en${pathname}`;
  return NextResponse.redirect(new URL(target, request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
