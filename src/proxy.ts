import { NextResponse, type NextRequest } from "next/server";
import { legacyLocaleRedirect, localeCookie } from "./i18n/locales";

export function proxy(request: NextRequest) {
  const path = legacyLocaleRedirect(
    request.nextUrl.pathname,
    request.cookies.get(localeCookie)?.value,
  );
  if (!path) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = path;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/((?!_next|icons|manifest.webmanifest|.*\\.).*)"],
};
