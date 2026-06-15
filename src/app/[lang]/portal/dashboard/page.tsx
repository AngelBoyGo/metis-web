"use client";

import { useEffect, useState } from "react";
import styles from "./portal.module.css";

const FLAT_TIER_RATE = 0.000002;
const OFFLINE_MESSAGE = "[OFFLINE] TELEMETRY_CARRIER_LINK_DISCONNECTED //";

const apiFetch = (input: RequestInfo | URL, init?: RequestInit) =>
  fetch(input, { ...init, credentials: "include" });

type KeyRecord = {
  id: string;
  raw: string;
  revealed: boolean;
};

function maskToken(raw: string): string {
  const suffix = raw.length >= 4 ? raw.slice(-4) : raw;
  return `metis_••••••••${suffix}`;
}

function extractKeys(data: unknown): Array<{ id: string; token: string }> {
  try {
    if (!data) {
      return [];
    }

    if (Array.isArray(data)) {
      return data.flatMap((row) => {
        if (!row || typeof row !== "object") {
          return [];
        }
        const record = row as Record<string, unknown>;
        const id = record.id ?? record.key_id;
        const token = record.token ?? record.key ?? record.secret;
        if (typeof id === "string" && typeof token === "string") {
          return [{ id, token }];
        }
        if (typeof token === "string") {
          return [{ id: token.slice(-8), token }];
        }
        return [];
      });
    }

    if (typeof data === "object") {
      const record = data as Record<string, unknown>;
      const nested = record.keys ?? record.items ?? record.credentials;
      if (Array.isArray(nested)) {
        return extractKeys(nested);
      }
      const id = record.id ?? record.key_id;
      const token = record.token ?? record.key ?? record.secret;
      if (typeof token === "string") {
        return [{ id: typeof id === "string" ? id : token.slice(-8), token }];
      }
    }

    return [];
  } catch {
    return [];
  }
}

function extractByteVolume(data: unknown): number | null {
  try {
    if (!data || typeof data !== "object") {
      return null;
    }

    const record = data as Record<string, unknown>;

    if (typeof record.bytes === "number") {
      return record.bytes;
    }
    if (typeof record.byte_volume === "number") {
      return record.byte_volume;
    }

    const aliases = [record.volume_bytes, record.total_bytes];
    for (const value of aliases) {
      if (typeof value === "number") {
        return value;
      }
    }

    const nested = record.counters ?? record.billing ?? record.metrics;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      for (const [key, value] of Object.entries(nested as Record<string, unknown>)) {
        if (
          typeof value === "number" &&
          (key.includes("byte") || key.includes("volume") || key.includes("data"))
        ) {
          return value;
        }
      }
    }

    if (record.counters && typeof record.counters === "object") {
      return 0;
    }

    return null;
  } catch {
    return null;
  }
}

type Counter = {
  label: string;
  value: string | number;
};

function formatCounterLabel(key: string): string {
  return `${key.replace(/_/g, " ").toUpperCase()} //`;
}

function extractCounters(data: unknown): Counter[] {
  try {
    if (!data || typeof data !== "object") {
      return [];
    }

    const record = data as Record<string, unknown>;
    const nested = record.counters ?? record.billing ?? record.metrics;

    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return Object.entries(nested as Record<string, unknown>).map(([key, value]) => ({
        label: formatCounterLabel(key),
        value: typeof value === "number" || typeof value === "string" ? value : String(value),
      }));
    }

    return [];
  } catch {
    return [];
  }
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) {
    return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
  }
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(2)} MB`;
  }
  if (bytes >= 1_000) {
    return `${(bytes / 1_000).toFixed(2)} KB`;
  }
  return `${bytes} B`;
}

function formatCurrency(bytes: number): string {
  const estimate = bytes * FLAT_TIER_RATE;
  return `$${estimate.toFixed(4)}`;
}

export default function PortalDashboardPage() {
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [keysOffline, setKeysOffline] = useState(false);
  const [generatePending, setGeneratePending] = useState(false);
  const [revokePendingId, setRevokePendingId] = useState<string | null>(null);
  const [byteVolume, setByteVolume] = useState<number | null>(null);
  const [ledgerCounters, setLedgerCounters] = useState<Counter[]>([]);
  const [invoicingOffline, setInvoicingOffline] = useState(false);

  async function loadKeys() {
    try {
      const response = await apiFetch("/api/keys");
      if (!response.ok) {
        setKeysOffline(true);
        setKeys([]);
        return;
      }
      let data: unknown;
      try {
        data = await response.json();
      } catch {
        setKeysOffline(true);
        setKeys([]);
        return;
      }
      const extracted = extractKeys(data);
      setKeysOffline(false);
      setKeys(
        extracted.map((entry) => ({
          id: entry.id,
          raw: entry.token,
          revealed: false,
        })),
      );
    } catch {
      setKeysOffline(true);
      setKeys([]);
    } finally {
      setKeysLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function initKeys() {
      try {
        const response = await apiFetch("/api/keys");
        if (!active) {
          return;
        }
        if (!response.ok) {
          setKeysOffline(true);
          setKeys([]);
          return;
        }
        let data: unknown;
        try {
          data = await response.json();
        } catch {
          if (active) {
            setKeysOffline(true);
            setKeys([]);
          }
          return;
        }
        if (!active) {
          return;
        }
        const extracted = extractKeys(data);
        setKeysOffline(false);
        setKeys(
          extracted.map((entry) => ({
            id: entry.id,
            raw: entry.token,
            revealed: false,
          })),
        );
      } catch {
        if (active) {
          setKeysOffline(true);
          setKeys([]);
        }
      } finally {
        if (active) {
          setKeysLoading(false);
        }
      }
    }

    void initKeys();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    function applyInvoicingOffline() {
      console.log(OFFLINE_MESSAGE);
      setInvoicingOffline(true);
      setByteVolume(0);
      setLedgerCounters([]);
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
    }

    async function pollStatus() {
      try {
        const response = await apiFetch(`/api/serial/status?_ts=${Date.now()}`);
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

  function toggleReveal(id: string) {
    setKeys((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, revealed: !entry.revealed } : entry,
      ),
    );
  }

  async function handleGenerate() {
    setGeneratePending(true);
    try {
      const response = await apiFetch("/api/keys/generate", { method: "POST" });
      if (!response.ok) {
        return;
      }
      const data: unknown = await response.json();
      const extracted = extractKeys(data);
      if (extracted.length > 0) {
        const entry = extracted[0];
        setKeys((prev) => [
          { id: entry.id, raw: entry.token, revealed: true },
          ...prev,
        ]);
      } else if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;
        const token = record.token ?? record.key ?? record.secret;
        const id = record.id ?? record.key_id;
        if (typeof token === "string") {
          setKeys((prev) => [
            {
              id: typeof id === "string" ? id : token.slice(-8),
              raw: token,
              revealed: true,
            },
            ...prev,
          ]);
        }
      } else {
        await loadKeys();
      }
    } finally {
      setGeneratePending(false);
    }
  }

  async function handleRevoke(id: string) {
    setRevokePendingId(id);
    try {
      const response = await apiFetch("/api/keys/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, key_id: id }),
      });
      if (response.ok) {
        setKeys((prev) => prev.filter((entry) => entry.id !== id));
      }
    } finally {
      setRevokePendingId(null);
    }
  }

  return (
    <div className={styles.mainframe}>
      <header className={styles.header}>METIS // DEVELOPER_PORTAL_SEC_09</header>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>KEY_VAULT //</div>
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => void handleGenerate()}
            disabled={generatePending || keysOffline}
          >
            {generatePending ? "GENERATING //" : "GENERATE_CREDENTIAL //"}
          </button>
        </div>
        <div className={styles.vaultList}>
          {keysLoading ? (
            <div className={styles.emptyVault}>[ LOADING ] key vault...</div>
          ) : keysOffline ? (
            <div className={`${styles.keyRow} ${styles.inactiveCard}`}>
              <div className={styles.sealedBlock}>
                <span className={`${styles.keyToken} ${styles.inactiveValue}`}>
                  metis_••••••••
                </span>
                <span className={styles.sealedLabel}>KEY_VAULT_SEALED //</span>
              </div>
              <div className={styles.keyActions}>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.inactiveButton}`}
                  disabled
                >
                  REVEAL_SECRET //
                </button>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.revokeButton} ${styles.inactiveButton}`}
                  disabled
                >
                  REVOKE_CREDENTIAL //
                </button>
              </div>
            </div>
          ) : keys.length === 0 ? (
            <div className={styles.emptyVault}>[ EMPTY ] no credentials provisioned</div>
          ) : (
            keys.map((entry) => (
              <div
                key={entry.id}
                className={`${styles.keyRow} ${revokePendingId === entry.id ? styles.inactiveCard : ""}`}
              >
                <span className={styles.keyToken}>
                  {entry.revealed ? entry.raw : maskToken(entry.raw)}
                </span>
                <div className={styles.keyActions}>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => toggleReveal(entry.id)}
                    disabled={revokePendingId === entry.id}
                  >
                    REVEAL_SECRET //
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.revokeButton}`}
                    onClick={() => void handleRevoke(entry.id)}
                    disabled={revokePendingId === entry.id}
                  >
                    {revokePendingId === entry.id
                      ? "REVOKING //"
                      : "REVOKE_CREDENTIAL //"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>METERED_INVOICING //</div>
        <div className={styles.invoicingGrid}>
          <div
            className={`${styles.metricCard} ${invoicingOffline ? styles.inactiveCard : ""}`}
          >
            <div
              className={`${styles.metricLabel} ${invoicingOffline ? styles.inactiveLabel : ""}`}
            >
              BYTE_VOLUME //
            </div>
            <div
              className={`${styles.metricValue} ${invoicingOffline ? styles.inactiveValue : ""}`}
            >
              {invoicingOffline
                ? "0 MB"
                : byteVolume !== null
                  ? formatBytes(byteVolume)
                  : "—"}
            </div>
          </div>
          <div
            className={`${styles.metricCard} ${invoicingOffline ? styles.inactiveCard : ""}`}
          >
            <div
              className={`${styles.metricLabel} ${invoicingOffline ? styles.inactiveLabel : ""}`}
            >
              ESTIMATED_COST //
            </div>
            <div
              className={`${styles.metricValue} ${invoicingOffline ? styles.inactiveValue : ""}`}
            >
              {invoicingOffline
                ? "$0.00"
                : byteVolume !== null
                  ? formatCurrency(byteVolume)
                  : "—"}
            </div>
          </div>
          {!invoicingOffline &&
            ledgerCounters.map((counter) => (
              <div key={counter.label} className={styles.metricCard}>
                <div className={styles.metricLabel}>{counter.label}</div>
                <div className={styles.metricValue}>{counter.value}</div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
