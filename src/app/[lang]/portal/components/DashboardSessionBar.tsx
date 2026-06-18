"use client";

import { useRouter } from "next/navigation";
import { apiFetch } from "./apiFetch";
import type { Operator } from "./DashboardShell";
import styles from "../dashboard/portal.module.css";

type Props = {
  lang: string;
  operator: Operator;
};

/** Shows the server-validated customer session and handles explicit logout. */
export default function DashboardSessionBar({ lang, operator }: Props) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.refresh();
      router.push(`/${lang}/portal/login`);
    }
  }

  return (
    <div className={styles.operatorBar}>
      <div className={styles.operatorMeta}>
        <span className={styles.operatorLabel}>SESSION //</span>
        <span className={styles.operatorEmail}>{operator.email}</span>
        {operator.name ? (
          <span className={styles.operatorName}>{operator.name}</span>
        ) : null}
      </div>
      <button
        type="button"
        className={`${styles.actionButton} ${styles.logoutButton}`}
        onClick={() => void handleLogout()}
      >
        TERMINATE_SESSION //
      </button>
    </div>
  );
}
