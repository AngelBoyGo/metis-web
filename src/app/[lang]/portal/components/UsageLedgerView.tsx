"use client";

import { useEffect, useState } from "react";
import { apiFetch, OFFLINE_MESSAGE } from "./apiFetch";
import styles from "../dashboard/portal.module.css";
import {
  billingCycleLabel,
  counterValue,
  extractByteVolume,
  extractCounters,
  FLAT_TIER_RATE,
  formatBytes,
  formatCurrency,
  formatSyncTime,
  HISTORY_POINTS,
  USAGE_ALLOCATION_BYTES,
  type Counter,
} from "./usage-utils";

type Props = {
  title?: string;
  showExport?: boolean;
};

export default function UsageLedgerView({
  title = "METERED_INVOICING //",
  showExport = false,
}: Props) {
  const [byteVolume, setByteVolume] = useState<number | null>(null);
  const [ledgerCounters, setLedgerCounters] = useState<Counter[]>([]);
  const [invoicingOffline, setInvoicingOffline] = useState(false);
  const [usageHistory, setUsageHistory] = useState<number[]>([]);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;

    function applyInvoicingOffline() {
      console.log(OFFLINE_MESSAGE);
      setInvoicingOffline(true);
      setByteVolume(0);
      setLedgerCounters([]);
      setLastSyncAt(null);
    }

    function applyInvoicingLive(data: unknown) {
      const volume = extractByteVolume(data);
      if (volume === null) {
        applyInvoicingOffline();
        return;
      }
      setByteVolume(volume);
      setLedgerCounters(extractCounters(data));
      setInvoicingOffline(false);
      setLastSyncAt(new Date());
      setUsageHistory((prev) => [...prev.slice(-(HISTORY_POINTS - 1)), volume]);
    }

    async function pollStatus() {
      try {
        const response = await apiFetch("/api/serial/status", { cacheBust: true });
        if (!active) {
          return;
        }
        if (!response.ok) {
          applyInvoicingOffline();
          return;
        }
        let data: unknown;
        try {
          data = await response.json();
        } catch {
          applyInvoicingOffline();
          return;
        }
        if (!active) {
          return;
        }
        applyInvoicingLive(data);
      } catch {
        if (active) {
          applyInvoicingOffline();
        }
      }
    }

    const timeout = window.setTimeout(() => {
      void pollStatus();
    }, 0);
    const interval = window.setInterval(() => {
      void pollStatus();
    }, 5000);

    return () => {
      active = false;
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  const volume = byteVolume ?? 0;
  const usagePct = invoicingOffline ? 0 : Math.min(100, (volume / USAGE_ALLOCATION_BYTES) * 100);
  const historyMax = usageHistory.length ? Math.max(...usageHistory, 1) : 1;
  const tenantCount = counterValue(ledgerCounters, (label) => label.includes("tenant"));
  const transactionRate = counterValue(ledgerCounters, (label) => label.includes("transaction"));

  return (
    <section className={styles.section}>
      <div className={styles.ledgerHeader}>
        <div>
          <div className={styles.sectionTitle}>{title}</div>
          <p className={styles.ledgerSubhead}>
            Flat tier · ${FLAT_TIER_RATE} per byte · cycle {billingCycleLabel()} UTC
          </p>
        </div>
        <div className={styles.ledgerStatus}>
          <span
            className={`${styles.statusPill} ${invoicingOffline ? styles.statusOffline : styles.statusLive}`}
          >
            {invoicingOffline ? "CARRIER_OFFLINE //" : "TELEMETRY_LIVE //"}
          </span>
          <span className={styles.syncStamp}>
            {lastSyncAt
              ? `Last sync ${formatSyncTime(lastSyncAt)} · 5s poll`
              : "Awaiting carrier link"}
          </span>
          {showExport ? (
            <a href="/api/usage/export" className={styles.exportLink} download>
              EXPORT_USAGE //
            </a>
          ) : null}
        </div>
      </div>

      {invoicingOffline ? (
        <p className={styles.vaultHint}>
          Carrier offline — byte volume reads zero and poll history stays empty until the serial bus
          reconnects. After ingestion jobs run, this panel accrues metered bytes and plots
          five-second samples for invoice reconciliation.
        </p>
      ) : null}

      <div
        className={`${styles.ledgerPanel} ${invoicingOffline ? styles.ledgerPanelOffline : ""}`}
      >
        <div className={styles.ledgerPrimary}>
          <div className={styles.usageHero}>
            <div className={styles.usageHeroTop}>
              <span className={styles.metricLabel}>BYTE_VOLUME //</span>
              <span className={styles.usageRaw}>
                {invoicingOffline ? "—" : volume.toLocaleString()} bytes raw
              </span>
            </div>
            <div
              className={`${styles.usageHeroValue} ${invoicingOffline ? styles.inactiveValue : ""}`}
            >
              {invoicingOffline ? "0 MB" : byteVolume !== null ? formatBytes(volume) : "—"}
            </div>
            <div className={styles.usageBarTrack}>
              <div className={styles.usageBarFill} style={{ width: `${usagePct}%` }} />
            </div>
            <div className={styles.usageBarMeta}>
              <span>{usagePct.toFixed(1)}% utilized</span>
              <span>{formatBytes(USAGE_ALLOCATION_BYTES)} allocation</span>
            </div>
          </div>

          <div className={styles.sparklineBlock}>
            <div className={styles.sparklineHeader}>
              <span className={styles.metricLabel}>POLL_HISTORY //</span>
              <span className={styles.sparklineCaption}>
                {usageHistory.length} samples · 5s interval
              </span>
            </div>
            <div className={styles.sparkline} aria-hidden="true">
              {usageHistory.length === 0 ? (
                <div className={styles.sparklineEmpty}>
                  {invoicingOffline
                    ? "Awaiting carrier link — poll bars appear after byte volume reports"
                    : "Collecting telemetry samples…"}
                </div>
              ) : (
                usageHistory.map((sample, index) => (
                  <div
                    key={`${sample}-${index}`}
                    className={styles.sparkBar}
                    style={{ height: `${Math.max(8, (sample / historyMax) * 100)}%` }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <aside className={styles.ledgerAside}>
          <div className={styles.costCard}>
            <span className={styles.metricLabel}>ESTIMATED_COST //</span>
            <div
              className={`${styles.costHero} ${invoicingOffline ? styles.inactiveValue : ""}`}
            >
              {invoicingOffline ? "$0.0000" : byteVolume !== null ? formatCurrency(volume) : "—"}
            </div>
            <dl className={styles.costBreakdown}>
              <div className={styles.costRow}>
                <dt>Volume</dt>
                <dd>{invoicingOffline ? "—" : formatBytes(volume)}</dd>
              </div>
              <div className={styles.costRow}>
                <dt>Unit rate</dt>
                <dd>${FLAT_TIER_RATE} / byte</dd>
              </div>
              <div className={`${styles.costRow} ${styles.costRowTotal}`}>
                <dt>Line total</dt>
                <dd>{invoicingOffline ? "—" : formatCurrency(volume)}</dd>
              </div>
            </dl>
          </div>
        </aside>

        <div className={styles.ledgerMetrics}>
          <article className={styles.metricTile}>
            <span className={styles.metricLabel}>REGISTERED TENANTS //</span>
            <div
              className={`${styles.metricTileValue} ${invoicingOffline ? styles.inactiveValue : ""}`}
            >
              {invoicingOffline ? "0" : tenantCount ?? "—"}
            </div>
            <p className={styles.metricTileHint}>Active operator accounts on carrier</p>
          </article>
          <article className={styles.metricTile}>
            <span className={styles.metricLabel}>TRANSACTION RATE //</span>
            <div
              className={`${styles.metricTileValue} ${invoicingOffline ? styles.inactiveValue : ""}`}
            >
              {invoicingOffline ? "0" : transactionRate ?? "—"}
              {!invoicingOffline && transactionRate !== null ? (
                <span className={styles.metricUnit}> req/s</span>
              ) : null}
            </div>
            <p className={styles.metricTileHint}>Rolling throughput from serial bus</p>
          </article>
          <article className={styles.metricTile}>
            <span className={styles.metricLabel}>BILLING_TIER //</span>
            <div className={styles.metricTileValue}>FLAT_METER</div>
            <p className={styles.metricTileHint}>No burst surcharge · byte-linear pricing</p>
          </article>
          <article className={styles.metricTile}>
            <span className={styles.metricLabel}>INVOICE_STATUS //</span>
            <div
              className={`${styles.metricTileValue} ${invoicingOffline ? styles.inactiveValue : ""}`}
            >
              {invoicingOffline ? "SUSPENDED" : "ACCRUING"}
            </div>
            <p className={styles.metricTileHint}>
              {invoicingOffline
                ? "Ledger frozen until carrier reconnects"
                : "Usage recorded for current cycle"}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
