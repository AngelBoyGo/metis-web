"use client";

import { useEffect, useState } from "react";
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
  const [identity, setIdentity] = useState<Operator>(operator);

  useEffect(() => {
    let active = true;

    async function refreshIdentity() {
      try {
        const response = await apiFetch("/api/session/identity", {
          cache: "no-store",
          cacheBust: true,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("SESSION_INVALID");
        }

        const nextIdentity = (await response.json()) as Operator;

        if (active && typeof nextIdentity.email === "string" && nextIdentity.email.trim()) {
          setIdentity(nextIdentity);
        } else {
          throw new Error("SESSION_INVALID");
        }
      } catch {
        if (active) {
          router.replace(`/${lang}/portal/login`);
          router.refresh();
        }
      }
    }

    void refreshIdentity();

    return () => {
      active = false;
    };
  }, [lang, router]);

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
        <span className={styles.operatorEmail}>{identity.email}</span>
        {identity.name ? (
          <span className={styles.operatorName}>{identity.name}</span>
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
