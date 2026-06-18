import type { MetadataRoute } from "next";
import { locales } from "@/content/i18n/config";
import { SITE_URL } from "@/lib/site-metadata";

const PUBLIC_SEGMENTS = [
  "",
  "about",
  "capabilities",
  "pricing",
  "onboarding",
  "start-pilot",
  "quickstart",
  "support",
  "public-sector",
  "research",
  "leadership",
  "documents",
  "contact",
  "privacy",
  "terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of locales) {
    for (const segment of PUBLIC_SEGMENTS) {
      const path = segment ? `/${lang}/${segment}` : `/${lang}`;
      entries.push({
        url: `${SITE_URL}${path}`,
        lastModified,
        changeFrequency: segment === "" ? "weekly" : "monthly",
        priority: segment === "" ? 1 : segment === "contact" ? 0.9 : 0.7,
      });
    }
  }

  return entries;
}
