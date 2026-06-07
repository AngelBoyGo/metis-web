import type { Locale, SiteContent } from "./types";
import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import { zh } from "./dictionaries/zh";
import { th } from "./dictionaries/th";

/** AI-generated translations (es/zh/th) pending human review before final sign-off. */
export type { Locale, SiteContent };

export const locales: Locale[] = ["en", "es", "zh", "th"];
export const defaultLocale: Locale = "en";

const dictionaries: Record<Locale, SiteContent> = { en, es, zh, th };

export function isLocale(value: string): value is Locale {
  return (locales as string[]).includes(value);
}

export function getDictionary(locale: Locale): SiteContent {
  return dictionaries[locale] ?? dictionaries.en;
}

export function localePath(lang: Locale, segment: string): string {
  if (!segment) return `/${lang}`;
  const clean = segment.startsWith("/") ? segment : `/${segment}`;
  return `/${lang}${clean}`;
}

export function generateLocaleParams(): { lang: Locale }[] {
  return locales.map((lang) => ({ lang }));
}
