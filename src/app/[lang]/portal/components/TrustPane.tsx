"use client";

import { useState } from "react";
import ReceiptModal from "./ReceiptModal";
import type { ReceiptFixtureKey } from "./demo-fixtures";
import styles from "../dashboard/portal.module.css";

type TrustItem = {
  title: string;
  body: string;
  receiptKey?: ReceiptFixtureKey;
  receiptLabel?: string;
};

const TRUST_ITEMS: TrustItem[] = [
  {
    title: "INGESTION_AT_SCALE //",
    body: "Batch and streaming ingestion lanes share a unified metering envelope. Carrier back-pressure is surfaced per tenant without exposing internal queue topology.",
  },
  {
    title: "TOKEN_AUTH //",
    body: "Bearer credentials are hashed at rest. Plaintext secrets are issued once and sealed after TTL expiry. Revocation propagates to edge validators on the next poll cycle.",
  },
  {
    title: "BIT_METERING //",
    body: "Byte-linear flat tier pricing accrues from serial bus counters. Ledger snapshots are exportable for invoice reconciliation against carrier telemetry.",
  },
  {
    title: "HARDWARE_RECOVERY //",
    body: "Artix-7 reflash daemon restores carrier connectivity in 6.2 seconds after bench power cycle. Recovery clock and trace stream confirm lane re-attachment on the local serial bus.",
    receiptKey: "recovery",
    receiptLabel: "[ VIEW_RECEIPT ]",
  },
  {
    title: "ADMIN_ROUTE_CONCEALMENT //",
    body: "Unauthenticated dashboard scans receive notFound stealth envelopes — no route topology leaked. Admin diagnostics remain gated behind session cookies and proxy rewrites.",
    receiptKey: "stealth-404",
    receiptLabel: "[ VIEW_EVENT_LOG ]",
  },
  {
    title: "DATA_ZEROIZATION //",
    body: "Credential revocation triggers db.delete across key vault rows — 1 → 0 rows purged atomically. SHA-256 receipt hash and audit timestamp recorded for compliance export.",
    receiptKey: "zeroization",
    receiptLabel: "[ VIEW_RECEIPT ]",
  },
  {
    title: "DEPLOYMENT_ISOLATION //",
    body: "Carrier bridge runs on a private bridge subnet with port 443 as the sole public exposure. Internal lanes (8044, 8045) remain unreachable from the open internet.",
  },
];

type Props = {
  filter?: string[];
};

export default function TrustPane({ filter }: Props) {
  const [openReceipt, setOpenReceipt] = useState<ReceiptFixtureKey | null>(null);
  const [openLabel, setOpenLabel] = useState("");

  const items = filter
    ? TRUST_ITEMS.filter((entry) => filter.includes(entry.title.replace(" //", "")))
    : TRUST_ITEMS;

  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>TRUST_PANES //</div>
      <div className={styles.trustGrid}>
        {items.map((entry) => (
          <article key={entry.title} className={styles.trustCard}>
            <h3 className={styles.trustTitle}>{entry.title}</h3>
            <p className={styles.trustBody}>{entry.body}</p>
            {entry.receiptKey && entry.receiptLabel ? (
              <button
                type="button"
                className={styles.viewReceiptLink}
                onClick={() => {
                  setOpenReceipt(entry.receiptKey ?? null);
                  setOpenLabel(entry.receiptLabel ?? "");
                }}
              >
                {entry.receiptLabel}
              </button>
            ) : null}
          </article>
        ))}
      </div>
      {openReceipt ? (
        <ReceiptModal
          fixtureKey={openReceipt}
          label={openLabel}
          onClose={() => setOpenReceipt(null)}
        />
      ) : null}
    </section>
  );
}
