"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./apiFetch";
import {
  DEMO_RECEIPT_FIXTURES,
  RECEIPT_ENDPOINTS,
  type ReceiptFixtureKey,
} from "./demo-fixtures";
import styles from "../dashboard/portal.module.css";

type Props = {
  fixtureKey: ReceiptFixtureKey;
  label: string;
  onClose: () => void;
};

export default function ReceiptModal({ fixtureKey, label, onClose }: Props) {
  const [payload, setPayload] = useState<string>("[ LOADING ] receipt stream...");
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const endpoint = RECEIPT_ENDPOINTS[fixtureKey];
      try {
        const response = await apiFetch(endpoint, { cacheBust: true });
        if (!active) {
          return;
        }
        if (!response.ok) {
          setDemoMode(true);
          setPayload(JSON.stringify(DEMO_RECEIPT_FIXTURES[fixtureKey], null, 2));
          return;
        }
        const data: unknown = await response.json();
        setDemoMode(false);
        setPayload(JSON.stringify(data, null, 2));
      } catch {
        if (active) {
          setDemoMode(true);
          setPayload(JSON.stringify(DEMO_RECEIPT_FIXTURES[fixtureKey], null, 2));
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [fixtureKey]);

  return (
    <div className={styles.receiptModalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.receiptModalPanel}
        role="dialog"
        aria-labelledby="receipt-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.receiptModalHeader}>
          <span id="receipt-modal-title" className={styles.receiptModalTitle}>
            {label} //
          </span>
          <button type="button" className={styles.receiptModalClose} onClick={onClose}>
            [ CLOSE ] //
          </button>
        </div>
        {demoMode ? (
          <div className={styles.demoBadge}>[SIMULATION_DEMO_MODE] //</div>
        ) : null}
        <pre className={styles.receiptModalBody}>{payload}</pre>
      </div>
    </div>
  );
}
