import styles from "../dashboard/portal.module.css";

const TRUST_ITEMS = [
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
  },
  {
    title: "ADMIN_ROUTE_CONCEALMENT //",
    body: "Unauthenticated dashboard scans receive notFound stealth envelopes — no route topology leaked. Admin diagnostics remain gated behind session cookies and proxy rewrites.",
  },
  {
    title: "DATA_ZEROIZATION //",
    body: "Credential revocation triggers db.delete across key vault rows — 1 → 0 rows purged atomically. SHA-256 receipt hash and audit timestamp recorded for compliance export.",
  },
  {
    title: "DEPLOYMENT_ISOLATION //",
    body: "Carrier bridge runs on a private bridge subnet with port 443 as the sole public exposure. Internal lanes (8044, 8045) remain unreachable from the open internet.",
  },
] as const;

type Props = {
  filter?: string[];
};

export default function TrustPane({ filter }: Props) {
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
          </article>
        ))}
      </div>
    </section>
  );
}
