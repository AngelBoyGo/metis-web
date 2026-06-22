"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "./apiFetch";
import { DEMO_KEYS } from "./demo-fixtures";
import styles from "../dashboard/portal.module.css";
import {
  PLAINTEXT_TTL_MS,
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
  const [demoMode, setDemoMode] = useState(false);
  const [generatePending, setGeneratePending] = useState(false);
  const [revokePendingId, setRevokePendingId] = useState<string | null>(null);
  const [copyNoticeId, setCopyNoticeId] = useState<string | null>(null);
  const [revokeReceipt, setRevokeReceipt] = useState<string | null>(null);
  const [vaultTick, setVaultTick] = useState(0);
  const keysRef = useRef<KeyRecord[]>([]);

  async function fetchKeysFromEndpoint(path: string, currentKeys = keys): Promise<KeyRecord[] | null> {
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
    const loaded = extracted.map(mapLoadedKey);
    return loaded.map((entry) => {
      const local = currentKeys.find((candidate) => candidate.id === entry.id);
      const plaintext = local ? activePlaintext(local) : null;
      if (!local || !plaintext || local.issuedAt === null) {
        return entry;
      }
      return {
        ...entry,
        displayHash: local.displayHash,
        masked: local.masked,
        plaintext,
        issuedAt: local.issuedAt,
      };
    });
  }

  async function loadKeys(currentKeys = keysRef.current, allowDemoFallback = true) {
    try {
      const fromKeys = await fetchKeysFromEndpoint("/api/keys", currentKeys);
      if (fromKeys !== null) {
        setDemoMode(false);
        setKeys(fromKeys);
        return;
      }

      const fromList = await fetchKeysFromEndpoint("/api/keys/list", currentKeys);
      if (fromList !== null) {
        setDemoMode(false);
        setKeys(fromList);
        return;
      }

      if (allowDemoFallback) {
        setDemoMode(true);
        setKeys(DEMO_KEYS.map(mapLoadedKey));
      }
    } catch {
      if (allowDemoFallback) {
        setDemoMode(true);
        setKeys(DEMO_KEYS.map(mapLoadedKey));
      }
    } finally {
      setKeysLoading(false);
    }
  }

  useEffect(() => {
    keysRef.current = keys;
  }, [keys]);

  useEffect(() => {
    void loadKeys();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadKeys(keysRef.current, false);
    }, 30_000);
    return () => window.clearInterval(interval);
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
          if (Date.now() - entry.issuedAt > PLAINTEXT_TTL_MS) {
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
      window.setTimeout(() => {
        sealCredential(id);
        setCopyNoticeId(null);
      }, 900);
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
        const issued = extracted[0].token ? await mapIssuedKey({ ...extracted[0], token: extracted[0].token }) : null;
        if (issued) {
          setRevokeReceipt(null);
          setKeys((prev) => [issued, ...prev.filter((entry) => entry.id !== issued.id)]);
        }
      } else if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;
        const token = record.token ?? record.key ?? record.secret;
        const id = record.id ?? record.key_id;
        if (typeof token === "string") {
          const issued = await mapIssuedKey({
            id: typeof id === "string" ? id : token.slice(-8),
              token,
          });
          setRevokeReceipt(null);
          setKeys((prev) => [issued, ...prev.filter((entry) => entry.id !== issued.id)]);
        }
      } else {
        await loadKeys();
      }
    } finally {
      setGeneratePending(false);
    }
  }

  async function handleRevoke(entry: KeyRecord) {
    const id = entry.id;
    setRevokePendingId(id);
    try {
      const response = await apiFetch("/api/keys/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: entry.prefix }),
      });
      if (response.ok) {
        const purged = keysRef.current.some((candidate) => candidate.id === id) ? 1 : 0;
        setKeys((prev) => prev.filter((candidate) => candidate.id !== id));
        setRevokeReceipt(`[ REVOKED // ] ${purged} \u2192 0 rows purged · receipt recorded`);
      }
    } finally {
      setRevokePendingId(null);
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>KEY_VAULT //</div>
      {demoMode ? (
        <div className={styles.demoBadge}>[PRODUCTION_INGESTION_TUNNEL] //</div>
      ) : null}
      <p className={styles.vaultHint}>
        Credentials are stored hashed at rest. Full secrets are shown once at issuance — copy
        immediately. After seal or TTL expiry, only the prefix and hash remain. Use the bearer token
        in an Authorization header for API requests (see quickstart).
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
      {revokeReceipt ? <div className={styles.systemToast}>{revokeReceipt}</div> : null}
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
                    <div className={styles.keyMetaRow}>
                      <span className={styles.keyMetaLabel}>KEY_PREFIX //</span>
                      <span>{entry.prefix}</span>
                    </div>
                    <div className={styles.keyMetaRow}>
                      <span className={styles.keyMetaLabel}>PLAINTEXT //</span>
                      <code className={styles.keyTokenPlain}>{plaintext}</code>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => void copyCredential(entry.id, plaintext)}
                        disabled={revokePendingId === entry.id}
                      >
                        {copyNoticeId === entry.id ? "COPIED //" : "COPY //"}
                      </button>
                    </div>
                    <div className={styles.keyMetaRow}>
                      <span className={styles.keyMetaLabel}>HASH //</span>
                      <span>{entry.displayHash}</span>
                    </div>
                    <div className={styles.keyMetaRow}>
                      <span className={styles.keyMetaLabel}>TTL //</span>
                      <span className={styles.keyTtl}>3600s · one-time window</span>
                    </div>
                    <p className={styles.issuedWarning}>
                      WARNING // Plaintext sealed after this window — copy immediately. Auto-seals in {remaining}s.
                    </p>
                  </div>
                ) : (
                  <div className={styles.storedBlock}>
                    <div className={styles.keyMetaRow}>
                      <span className={styles.keyMetaLabel}>PREFIX //</span>
                      <span className={styles.keyToken}>{entry.prefix}</span>
                    </div>
                    <div className={styles.keyMetaRow}>
                      <span className={styles.keyMetaLabel}>HASH //</span>
                      <span>{entry.displayHash}</span>
                    </div>
                    <div className={styles.keyMetaRow}>
                      <span className={styles.keyMetaLabel}>TTL //</span>
                      <span className={styles.keyTtl}>sealed</span>
                    </div>
                  </div>
                )}
                <div className={styles.keyActions}>
                  {plaintext ? (
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => sealCredential(entry.id)}
                      disabled={revokePendingId === entry.id}
                    >
                      SEAL_SECRET //
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.revokeButton}`}
                    onClick={() => void handleRevoke(entry)}
                    disabled={revokePendingId === entry.id}
                  >
                    {revokePendingId === entry.id ? "REVOKING //" : "REVOKE_CREDENTIAL //"}
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
