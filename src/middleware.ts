import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALE_COOKIE = "metis_locale";
const VALID_LOCALES = new Set(["en", "es", "zh", "th"]);

const COUNTRY_TO_LOCALE: Record<string, string> = {
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  GT: "es",
  CU: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  UY: "es",
  CN: "zh",
  TW: "zh",
  HK: "zh",
  SG: "zh",
  MO: "zh",
  TH: "th",
};

/**
 * Resolves visitor country from Vercel edge headers (Next.js 16 compatible).
 * @param request - Incoming request
 * @returns ISO 3166-1 alpha-2 country code or null
 */
function getCountryCode(request: NextRequest): string | null {
  const headerCountry = request.headers.get("x-vercel-ip-country");
  if (headerCountry) {
    return headerCountry.toUpperCase();
  }

  const geo = (
    request as NextRequest & { geo?: { country?: string } }
  ).geo;
  if (geo?.country) {
    return geo.country.toUpperCase();
  }

  return null;
}

/**
 * Maps country code to supported locale key.
 * @param country - ISO country code
 * @returns Locale key (en, es, zh, th)
 */
function countryToLocale(country: string | null): string {
  if (!country) {
    return "en";
  }
  return COUNTRY_TO_LOCALE[country] ?? "en";
}

export function middleware(request: NextRequest) {
  const existingLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (existingLocale && VALID_LOCALES.has(existingLocale)) {
    return NextResponse.next();
  }

  const country = getCountryCode(request);
  const detectedLocale = countryToLocale(country);

  if (detectedLocale === "en") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("lang", detectedLocale);

  const response = NextResponse.rewrite(url);
  response.cookies.set(LOCALE_COOKIE, detectedLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/"],
};
