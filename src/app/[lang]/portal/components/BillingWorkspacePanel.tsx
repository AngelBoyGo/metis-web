"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "./apiFetch";
import CheckoutButton from "@/components/CheckoutButton";
import type { BillingRecord, PaymentState } from "@/lib/billing-store";
import styles from "../dashboard/portal.module.css";

type BillingStatusResponse = {
  authenticated: boolean;
  email: string | null;
  billing: BillingRecord | null;
  billingIntegrationStatus: "linked" | "unconfigured";
  verifiedInvoices: BillingInvoiceRecord[];
  achWireInstructions: string;
  receiptsAvailable: boolean;
};

type BillingInvoiceRecord = {
  invoiceId: string;
  billingCycle: string;
  amountPaid: number;
  tierTierSlug: string;
  status: "PAID" | "FAILED" | "PENDING";
};

const STATE_LABELS: Record<PaymentState, string> = {
  quote_requested: "Quote requested",
  invoice_sent: "Invoice sent",
  payment_pending: "Payment pending",
  payment_received: "Payment received",
  active: "Active",
  past_due: "Past due",
};

type Props = {
  lang: string;
};

function formatPaidAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
}

/**
 * Billing workspace panel with plan, payment state, and checkout actions.
 */
export default function BillingWorkspacePanel({ lang }: Props) {
  const [status, setStatus] = useState<BillingStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await apiFetch("/api/billing/status", { cacheBust: true });
        if (!active) {
          return;
        }
        if (!response.ok) {
          setStatus(null);
          return;
        }
        const data = (await response.json()) as BillingStatusResponse;
        setStatus(data);
      } catch {
        if (active) {
          setStatus(null);
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

  const billing = status?.billing;
  const verifiedInvoices = status?.verifiedInvoices ?? [];
  const hasLinkedInvoices =
    status?.billingIntegrationStatus === "linked" && verifiedInvoices.length > 0;
  const paymentState = billing?.paymentState ?? "quote_requested";

  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>BILLING_ACCOUNT //</div>
      {loading ? (
        <p className={styles.vaultHint}>Loading billing status…</p>
      ) : !status?.authenticated ? (
        <p className={styles.vaultHint}>
          Sign in to view account billing state. Plan and payment details appear after authentication.
        </p>
      ) : (
        <>
          <div className={styles.billingGrid}>
            <article className={styles.metricTile}>
              <span className={styles.metricLabel}>PLAN //</span>
              <div className={styles.metricTileValue}>{billing?.plan?.toUpperCase() ?? "NONE"}</div>
              <p className={styles.metricTileHint}>Contract: {billing?.contractType ?? "none"}</p>
            </article>
            <article className={styles.metricTile}>
              <span className={styles.metricLabel}>PAYMENT_STATE //</span>
              <div className={styles.metricTileValue}>{STATE_LABELS[paymentState]}</div>
              <p className={styles.metricTileHint}>Billing status: {billing?.billingStatus ?? "—"}</p>
            </article>
            <article className={styles.metricTile}>
              <span className={styles.metricLabel}>INVOICE //</span>
              <div className={styles.metricTileValue}>{billing?.invoiceStatus ?? "—"}</div>
              <p className={styles.metricTileHint}>Payment: {billing?.paymentStatus ?? "—"}</p>
            </article>
            <article className={styles.metricTile}>
              <span className={styles.metricLabel}>NEXT_BILLING //</span>
              <div className={styles.metricTileValue}>
                {billing?.nextBillingDate
                  ? new Date(billing.nextBillingDate).toLocaleDateString()
                  : "—"}
              </div>
              <p className={styles.metricTileHint}>
                Contact: {billing?.billingContact ?? status.email ?? "—"}
              </p>
            </article>
          </div>

          <div className={styles.billingActions}>
            <CheckoutButton plan="pilot" label="Pay pilot (one-time)" lang={lang} />
            <CheckoutButton
              plan="platform"
              label="Subscribe to platform"
              lang={lang}
              className="btn-secondary"
            />
          </div>

          <section className={styles.billingSubsection}>
            <div className={styles.metricLabel}>OVERAGE //</div>
            <p className={styles.vaultHint}>
              Metered byte volume above allocation is billed at the flat tier rate shown in the usage
              ledger. Overage line items appear on the monthly invoice when applicable.
            </p>
          </section>

          <section className={styles.billingSubsection}>
            <div className={styles.metricLabel}>ACH / WIRE //</div>
            <p className={styles.vaultHint}>{status.achWireInstructions}</p>
          </section>

          <section className={styles.billingSubsection}>
            <div className={styles.metricLabel}>RECEIPTS //</div>
            {hasLinkedInvoices ? (
              <div className={styles.auditGrid}>
                <div className={`${styles.auditRow} ${styles.auditHeader} ${styles.invoiceRow}`}>
                  <span>INVOICE_ID //</span>
                  <span>BILLING_CYCLE //</span>
                  <span>AMOUNT_PAID //</span>
                  <span>TIER_TIER_SLUG //</span>
                  <span>STATUS // [PAID]</span>
                </div>
                {verifiedInvoices.map((invoice) => (
                  <div
                    key={`${invoice.invoiceId}-${invoice.billingCycle}`}
                    className={`${styles.auditRow} ${styles.invoiceRow}`}
                  >
                    <span>{invoice.invoiceId}</span>
                    <span>{invoice.billingCycle}</span>
                    <span>{formatPaidAmount(invoice.amountPaid)}</span>
                    <span>{invoice.tierTierSlug.toUpperCase()}</span>
                    <span>[{invoice.status}]</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.vaultHint}>
                [PRODUCTION_INGESTION_TUNNEL] Subscriptions awaiting carrier billing link //
              </p>
            )}
          </section>
        </>
      )}
      <p className={styles.vaultHint}>
        <Link href={`/${lang}/support`}>Support</Link>
        {" · "}
        <Link href={`/${lang}/pricing`}>Pricing</Link>
      </p>
    </section>
  );
}
