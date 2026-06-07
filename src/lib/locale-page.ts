import { notFound } from "next/navigation";
import {
  getDictionary,
  generateLocaleParams,
  isLocale,
} from "@/content/i18n/config";
import type { Locale } from "@/content/i18n/types";

export { generateLocaleParams };

export async function resolveLocale(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang;
}

export function dictionaryFor(lang: Locale) {
  return getDictionary(lang);
}
