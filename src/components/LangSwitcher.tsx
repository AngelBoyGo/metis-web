"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/content/i18n/config";
import type { SiteContent } from "@/content/i18n/types";

type LangSwitcherProps = {
  lang: Locale;
  labels: SiteContent["langSwitcher"];
};

export default function LangSwitcher({ lang, labels }: LangSwitcherProps) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(en|es|zh|th)/, "") || "";

  return (
    <div className="lang-indicator" aria-label="Language">
      {locales.map((code, index) => (
        <span key={code} className="lang-indicator-item">
          {index > 0 && (
            <span className="lang-indicator-divider" aria-hidden="true">
              |
            </span>
          )}
          {code === lang ? (
            <span className="lang-indicator-active" aria-current="true">
              {labels[code]}
            </span>
          ) : (
            <Link href={`/${code}${rest}`} className="lang-indicator-link">
              {labels[code]}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
