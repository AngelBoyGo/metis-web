"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./apiFetch";
import { DEMO_KEYS } from "./demo-fixtures";
import styles from "../dashboard/portal.module.css";
import {
  activePlaintext,
  extractKeys,
  formatIssuedTimestamp,
  mapIssuedKey,
  mapLoadedKey,
  secondsRemaining,
  ttlCountdown,
  type KeyRecord,
} from "./vault-utils";

export default function KeyVaultView() {
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [generatePending, setGeneratePending] = useState(false);
  const [revokePendingId, setRevokePendingId] = useState<string | null>(null);
  const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);
  const [copyNoticeId, setCopyNoticeId] = useState<string | null>(null);
  const [vaultTick, setVaultTick] = useState(0);

  async function fetchKeysFromEndpoint(path: string): Promise<KeyRecord[] | null> {
    const response = await apiFetch(path, { cacheBust: true });
    if (!response.ok) {
      return null;
    }
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      return null;
    }
    const extracted = extractKeys(data);
    return extracted.map(mapLoadedKey);
  }

  async function loadKeys() {
    try {
      const fromList = await fetchKeysFromEndpoint("/api/keys/list");
      if (fromList !== null) {
        setDemoMode(false);
        setKeys(fromList);
        return;
      }

      const fromKeys = await fetchKeysFromEndpoint("/api/keys");
      if (fromKeys !== null) {
        setDemoMode(false);
        setKeys(fromKeys);
        return;
      }

      setDemoMode(true);
      setKeys(DEMO_KEYS.map(mapLoadedKey));
    } catch {
      setDemoMode(true);
      setKeys(DEMO_KEYS.map(mapLoadedKey));
    } finally {
      setKeysLoading(false);
    }
  }

  useEffect(() => {
    void loadKeys();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVaultTick((value) => value + 1);
      setKeys((prev) => {
        let changed = false;
        const next = prev.map((entry) => {
          if (!entry.plaintext || entry.issuedAt === null) {
            return entry;
          }
          if (Date.now() - entry.issuedAt > 90_000) {
            changed = true;
            return { ...entry, plaintext: null, issuedAt: null };
          }
          return entry;
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  async function copyCredential(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyNoticeId(id);
      window.setTimeout(() => setCopyNoticeId(null), 2000);
    } catch {
      setCopyNoticeId(null);
    }
  }

  function sealCredential(id: string) {
    setKeys((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, plaintext: null, issuedAt: null } : entry,
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
        setKeys((prev) => [mapIssuedKey(extracted[0]), ...prev]);
      } else if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;
        const token = record.token ?? record.key ?? record.secret;
        const id = record.id ?? record.key_id;
        if (typeof token === "string") {
          setKeys((prev) => [
            mapIssuedKey({
              id: typeof id === "string" ? id : token.slice(-8),
              token,
            }),
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
    if (revokeConfirmId !== id) {
      setRevokeConfirmId(id);
      return;
    }

    setRevokeConfirmId(null);
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
    <section className={styles.section}>
      <div className={styles.sectionTitle}>KEY_VAULT //</div>
      {demoMode ? (
        <div className={styles.demoBadge}>[SIMULATION_DEMO_MODE] //</div>
      ) : null}
      <p className={styles.vaultHint}>
        Credentials are stored hashed. Full secrets are shown once at issuance — copy immediately.
      </p>
      <div style={{ marginBottom: 16 }}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => void handleGenerate()}
          disabled={generatePending}
        >
          {generatePending ? "GENERATING //" : "GENERATE_CREDENTIAL //"}
        </button>
      </div>
      <div className={styles.vaultList}>
        {keysLoading ? (
          <div className={styles.emptyVault}>[ LOADING ] key vault...</div>
        ) : keys.length === 0 ? (
          <>
            <div className={styles.emptyVault}>[ EMPTY ] no credentials provisioned</div>
            <p className={styles.vaultHint}>
              Select GENERATE_CREDENTIAL to issue a bearer token. Copy the plaintext once — it
              masks after seal or auto-seal. TTL countdown and revoke remain on the sealed row.
            </p>
          </>
        ) : (
          keys.map((entry) => {
            void vaultTick;
            const plaintext = activePlaintext(entry);
            const remaining = secondsRemaining(entry);

            return (
              <div
                key={entry.id}
                className={`${styles.keyRow} ${revokePendingId === entry.id ? styles.inactiveCard : ""} ${plaintext ? styles.keyRowIssued : ""}`}
              >
                {plaintext ? (
                  <div className={styles.issuedBlock}>
                    <p className={styles.issuedWarning}>
                      SAVE NOW — shown once only. Auto-seals in {remaining}s.
                    </p>
                    <code className={styles.keyTokenPlain}>{plaintext}</code>
                  </div>
                ) : (
                  <div className={styles.storedBlock}>
                    <span className={styles.keyToken}>{entry.masked}</span>
                    <span className={styles.storedLabel}>STORED // non-recoverable</span>
                  </div>
                )}
                <div className={styles.keyMetaRow}>
                  <span className={styles.keyMetaLabel}>ISSUED_AT_TIMESTAMP //</span>
                  <span>{formatIssuedTimestamp(entry.createdAt)}</span>
                </div>
                <div className={styles.keyMetaRow}>
                  <span className={styles.keyMetaLabel}>TTL_EXPIRY_COUNTDOWN //</span>
                  <span className={styles.keyTtl}>{ttlCountdown(entry.createdAt)}</span>
                </div>
                <div className={styles.keyActions}>
                  {plaintext ? (
                    <>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => void copyCredential(entry.id, plaintext)}
                        disabled={revokePendingId === entry.id}
                      >
                        {copyNoticeId === entry.id ? "COPIED //" : "COPY_CREDENTIAL //"}
                      </button>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => sealCredential(entry.id)}
                        disabled={revokePendingId === entry.id}
                      >
                        SEAL_SECRET //
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.revokeButton}`}
                    onClick={() => void handleRevoke(entry.id)}
                    disabled={revokePendingId === entry.id}
                  >
                    {revokePendingId === entry.id
                      ? "REVOKING //"
                      : revokeConfirmId === entry.id
                        ? "CONFIRM_REVOKE //"
                        : "REVOKE_CREDENTIAL //"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
