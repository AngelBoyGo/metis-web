"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath } from "@/content/i18n/config";
import type { Locale } from "@/content/i18n/types";
import type { SiteContent } from "@/content/i18n/types";
import LangSwitcher from "./LangSwitcher";

type SiteNavProps = {
  lang: Locale;
  dict: SiteContent;
  mode?: "routes" | "anchors";
};

function scrollToAnchor(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function SiteNav({ lang, dict, mode = "routes" }: SiteNavProps) {
  const pathname = usePathname();
  const homePath = localePath(lang, "");
  const isHome = pathname === homePath;
  const useAnchors = mode === "anchors" || isHome;
  const { nav } = dict;

  return (
    <header className="site-nav-wrap">
      <div className="site-nav-utility">
        <div className="site-nav-utility-inner">
          {nav.utility.map((item) => {
            if ("static" in item && item.static) {
              return (
                <span key={item.label} className="site-nav-utility-item">
                  {item.label}
                </span>
              );
            }
            if ("external" in item && item.external) {
              return (
                <a
                  key={item.label}
                  className="site-nav-utility-item"
                  href={item.href}
                  download
                >
                  {item.label}
                </a>
              );
            }
            if ("segment" in item) {
              return (
                <Link
                  key={item.label}
                  className="site-nav-utility-item"
                  href={localePath(lang, item.segment)}
                >
                  {item.label}
                </Link>
              );
            }
            return null;
          })}
          <LangSwitcher lang={lang} labels={dict.langSwitcher} />
        </div>
      </div>
      <nav className="site-nav" aria-label="Primary">
        {useAnchors
          ? nav.homeAnchors.map((item) => (
              <button
                key={item.id}
                type="button"
                className="site-nav-link"
                onClick={() => scrollToAnchor(item.id)}
              >
                {item.label}
              </button>
            ))
          : nav.primary.map((item) => {
              const href = localePath(lang, item.segment);
              return (
                <Link
                  key={item.segment}
                  href={href}
                  className={`site-nav-link${pathname === href ? " site-nav-link-active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
      </nav>
    </header>
  );
}
