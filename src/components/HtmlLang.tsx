"use client";

import { useEffect } from "react";
import type { Locale } from "@/content/i18n/types";

export default function HtmlLang({ lang }: { lang: Locale }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
