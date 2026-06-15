"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./apiFetch";
import styles from "../dashboard/portal.module.css";
import {
  activePlaintext,
  extractKeys,
  mapIssuedKey,
  mapLoadedKey,
  secondsRemaining,
  type KeyRecord,
} from "./vault-utils";

export default function KeyVaultView() {
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [keysOffline, setKeysOffline] = useState(false);
  const [generatePending, setGeneratePending] = useState(false);
  const [revokePendingId, setRevokePendingId] = useState<string | null>(null);
  const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);
  const [copyNoticeId, setCopyNoticeId] = useState<string | null>(null);
  const [vaultTick, setVaultTick] = useState(0);

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
      setKeys(extracted.map(mapLoadedKey));
    } catch {
      setKeysOffline(true);
      setKeys([]);
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
      <p className={styles.vaultHint}>
        Credentials are stored hashed. Full secrets are shown once at issuance — copy immediately.
      </p>
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
              <span className={`${styles.keyToken} ${styles.inactiveValue}`}>metis_••••••••</span>
              <span className={styles.sealedLabel}>KEY_VAULT_SEALED //</span>
            </div>
            <div className={styles.keyActions}>
              <button
                type="button"
                className={`${styles.actionButton} ${styles.inactiveButton}`}
                disabled
              >
                VAULT_OFFLINE //
              </button>
            </div>
          </div>
        ) : keys.length === 0 ? (
          <div className={styles.emptyVault}>[ EMPTY ] no credentials provisioned</div>
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
