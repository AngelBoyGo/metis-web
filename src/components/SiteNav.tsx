"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "@/content/site";
import LangIndicator from "./LangIndicator";

type SiteNavProps = {
  mode?: "routes" | "anchors";
};

export default function SiteNav({ mode = "routes" }: SiteNavProps) {
  const pathname = usePathname();
  const useAnchors = mode === "anchors";

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
            return (
              <Link key={item.label} className="site-nav-utility-item" href={item.href}>
                {item.label}
              </Link>
            );
          })}
          <LangIndicator />
        </div>
      </div>
      <nav className="site-nav" aria-label="Primary">
        {useAnchors
          ? nav.homeAnchors.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`site-nav-link${pathname === "/about" ? "" : ""}`}
              >
                {item.label}
              </Link>
            ))
          : nav.primary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`site-nav-link${pathname === item.href ? " site-nav-link-active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
      </nav>
    </header>
  );
}
