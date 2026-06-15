import type { Metadata } from "next";
import { locales, type Locale } from "@/content/i18n/config";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://metis.gold";

export function buildPageMetadata(
  lang: Locale,
  title: string,
  description: string,
  path = "",
): Metadata {
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const canonical = `${SITE_URL}/${lang}${normalizedPath}`;

  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${SITE_URL}/${locale}${normalizedPath}`;
  }
  languages["x-default"] = `${SITE_URL}/en${normalizedPath}`;

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Metis LLC",
      locale: lang,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export const portalRobots: Metadata = {
  robots: { index: false, follow: false },
};
