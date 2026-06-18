"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import shellStyles from "./shell.module.css";

type NavItem = {
  segment: string;
  label: string;
};

type Props = {
  lang: string;
  items: readonly NavItem[];
};

/** Renders active dashboard navigation from the concrete browser URL. */
export default function DashboardNavigation({ lang, items }: Props) {
  const pathname = usePathname();
  const basePath = `/${lang}/portal/dashboard`;

  return (
    <nav className={shellStyles.sidebar} aria-label="Portal workspaces">
      <div className={shellStyles.sidebarLabel}>WORKSPACES //</div>
      {items.map((item) => {
        const href = `${basePath}/${item.segment}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={item.segment}
            href={href}
            className={`${shellStyles.navLink} ${active ? shellStyles.navLinkActive : ""}`}
          >
            {item.label.toUpperCase()} //
          </Link>
        );
      })}
    </nav>
  );
}
