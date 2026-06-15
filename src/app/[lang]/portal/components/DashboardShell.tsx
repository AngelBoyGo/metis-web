"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "./apiFetch";
import shellStyles from "./shell.module.css";
import styles from "../dashboard/portal.module.css";

type Operator = {
  id: string;
  email: string;
  name: string;
};

const NAV_ITEMS = [
  { segment: "overview", label: "Overview" },
  { segment: "key-vault", label: "Key Vault" },
  { segment: "ingestion-jobs", label: "Ingestion Jobs" },
  { segment: "usage-ledger", label: "Usage Ledger" },
  { segment: "hardware-health", label: "Hardware Health" },
  { segment: "recovery-events", label: "Recovery Events" },
  { segment: "tenants", label: "Tenants" },
  { segment: "billing", label: "Billing" },
  { segment: "security", label: "Security" },
  { segment: "audit-trail", label: "Audit Trail" },
] as const;

type Props = {
  lang: string;
  children: React.ReactNode;
};

export default function DashboardShell({ lang, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [operator, setOperator] = useState<Operator | null>(null);
  const basePath = `/${lang}/portal/dashboard`;

  useEffect(() => {
    let active = true;

    async function loadOperator() {
      try {
        const response = await apiFetch("/api/auth/user/me");
        if (!active || !response.ok) {
          return;
        }
        const data = (await response.json()) as Operator;
        if (active) {
          setOperator(data);
        }
      } catch {
        /* layout already gates auth */
      }
    }

    void loadOperator();
    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.refresh();
      router.push(`/${lang}/portal/login`);
    }
  }

  return (
    <div className={shellStyles.dashboardFrame}>
      <nav className={shellStyles.sidebar} aria-label="Portal workspaces">
        <div className={shellStyles.sidebarLabel}>WORKSPACES //</div>
        {NAV_ITEMS.map((item) => {
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
      <div className={shellStyles.workspace}>
        <header className={shellStyles.workspaceHeader}>
          METIS // CONTROL PLANE
        </header>
        {operator ? (
          <div className={styles.operatorBar}>
            <div className={styles.operatorMeta}>
              <span className={styles.operatorLabel}>OPERATOR //</span>
              <span className={styles.operatorEmail}>{operator.email}</span>
              <span className={styles.operatorName}>{operator.name}</span>
            </div>
            <button
              type="button"
              className={`${styles.actionButton} ${styles.logoutButton}`}
              onClick={() => void handleLogout()}
            >
              TERMINATE_SESSION //
            </button>
          </div>
        ) : null}
        <main className={shellStyles.workspaceMain}>{children}</main>
      </div>
    </div>
  );
}
