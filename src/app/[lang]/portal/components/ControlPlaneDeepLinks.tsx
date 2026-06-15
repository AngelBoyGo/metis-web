"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../dashboard/portal.module.css";

const DEEP_LINKS = [
  { segment: "recovery-events", label: "Recovery Events" },
  { segment: "hardware-health", label: "Hardware Health" },
  { segment: "tenants", label: "Tenants" },
] as const;

export default function ControlPlaneDeepLinks() {
  const pathname = usePathname();
  const langMatch = pathname.match(/^\/([^/]+)\/portal\//);
  const lang = langMatch?.[1] ?? "en";
  const basePath = `/${lang}/portal/dashboard`;

  return (
    <section className={styles.sectionCompact}>
      <h2 className={styles.sectionTitle}>CONTROL_PLANE_WORKSPACES //</h2>
      <div className={styles.deepLinkGrid}>
        {DEEP_LINKS.map((item) => (
          <Link
            key={item.segment}
            href={`${basePath}/${item.segment}`}
            className={styles.deepLinkCard}
          >
            <span className={styles.deepLinkLabel}>{item.label.toUpperCase()} //</span>
            <span className={styles.deepLinkHint}>
              Open {item.label} workspace
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
