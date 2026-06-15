"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, OFFLINE_MESSAGE } from "./apiFetch";
import { extractByteVolume } from "./usage-utils";
import styles from "../dashboard/portal.module.css";

const SYSTEM_TOAST =
  "[SYSTEM_ENGINE_OPERATIONAL] Extracting encrypted multi-tenant data records over shared subnet links //";

type Props = {
  compact?: boolean;
  forceStandardLabels?: boolean;
};

export default function ActionInterceptors({ compact, forceStandardLabels }: Props) {
  const router = useRouter();
  const params = useParams();
  const lang = typeof params.lang === "string" ? params.lang : "en";
  const basePath = `/${lang}/portal/dashboard`;
  const [carrierOffline, setCarrierOffline] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function pollCarrier() {
      try {
        const response = await apiFetch("/api/serial/status", { cacheBust: true });
        if (!active) {
          return;
        }
        if (!response.ok) {
          console.log(OFFLINE_MESSAGE);
          setCarrierOffline(true);
          return;
        }
        const data: unknown = await response.json();
        setCarrierOffline(extractByteVolume(data) === null);
      } catch {
        if (active) {
          console.log(OFFLINE_MESSAGE);
          setCarrierOffline(true);
        }
      }
    }

    void pollCarrier();
    const interval = window.setInterval(() => {
      void pollCarrier();
    }, 8000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  function navigate(segment: string) {
    router.push(`${basePath}/${segment}`);
  }

  function showOperationalToast() {
    setToast(SYSTEM_TOAST);
    window.setTimeout(() => {
      setToast(null);
    }, 6000);
  }

  function handleStartIngestion() {
    if (carrierOffline) {
      showOperationalToast();
      return;
    }
    navigate("ingestion-jobs");
  }

  function handleExportBilling() {
    showOperationalToast();
    navigate("billing");
  }

  return (
    <section className={compact ? styles.sectionCompact : styles.section}>
      <div className={styles.sectionTitle}>ACTION_INTERCEPTORS //</div>
      {toast ? <div className={styles.systemToast}>{toast}</div> : null}
      <div className={styles.actionGrid}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => navigate("audit-trail")}
        >
          VIEW_AUDIT_LOG //
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => navigate("usage-ledger")}
        >
          VIEW_USAGE_LOGS //
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={handleStartIngestion}
        >
          {forceStandardLabels ? "START_INGESTION //" : carrierOffline ? "CARRIER_REQUIRED //" : "START_INGESTION //"}
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => navigate("hardware-health")}
        >
          CHECK_HARDWARE //
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={handleExportBilling}
        >
          EXPORT_BILLING //
        </button>
      </div>
    </section>
  );
}
