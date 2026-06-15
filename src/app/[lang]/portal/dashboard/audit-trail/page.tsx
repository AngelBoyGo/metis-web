"use client";

import { useEffect, useState } from "react";
import { apiFetch, OFFLINE_MESSAGE } from "../../components/apiFetch";
import styles from "../portal.module.css";

export default function AuditTrailWorkspace() {
  const [offline, setOffline] = useState(false);
  const [rows, setRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await apiFetch("/api/audit/trail", { cacheBust: true });
        if (!active) {
          return;
        }
        if (!response.ok) {
          console.log(OFFLINE_MESSAGE);
          setOffline(true);
          setRows([]);
          return;
        }
        const data: unknown = await response.json();
        if (Array.isArray(data)) {
          setRows(data.map((row) => (typeof row === "string" ? row : JSON.stringify(row))));
        } else if (data && typeof data === "object") {
          const record = data as Record<string, unknown>;
          const entries = record.entries ?? record.items ?? record.rows;
          if (Array.isArray(entries)) {
            setRows(entries.map((row) => JSON.stringify(row)));
          } else {
            setRows([JSON.stringify(data)]);
          }
        }
        setOffline(false);
      } catch {
        if (active) {
          console.log(OFFLINE_MESSAGE);
          setOffline(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <p className={styles.pageIntro}>
        Audit trail — immutable operator action log streamed from the carrier audit endpoint.
      </p>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>AUDIT_TRAIL //</div>
        {loading ? (
          <div className={styles.emptyVault}>[ LOADING ] audit stream...</div>
        ) : offline ? (
          <div className={styles.interceptorOffline}>{OFFLINE_MESSAGE}</div>
        ) : rows.length === 0 ? (
          <div className={styles.emptyVault}>[ EMPTY ] no audit entries recorded</div>
        ) : (
          <pre className={styles.interceptorOutput}>{rows.join("\n")}</pre>
        )}
      </section>
    </>
  );
}
