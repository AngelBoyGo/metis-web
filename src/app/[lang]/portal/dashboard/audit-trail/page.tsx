"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../components/apiFetch";
import {
  DEMO_AUDIT_ROWS,
  DEMO_SOURCE_NODE,
  type AuditTrailRow,
} from "../../components/demo-fixtures";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";
import styles from "../portal.module.css";

type AuditState = "loading" | "offline-but-demo" | "empty" | "populated";

function parseAuditRows(data: unknown): AuditTrailRow[] {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data.flatMap((row) => {
      if (typeof row === "string") {
        try {
          const parsed = JSON.parse(row) as Record<string, unknown>;
          return normalizeRow(parsed);
        } catch {
          return [];
        }
      }
      if (row && typeof row === "object") {
        return normalizeRow(row as Record<string, unknown>);
      }
      return [];
    });
  }

  if (typeof data === "object") {
    const record = data as Record<string, unknown>;
    const entries = record.entries ?? record.items ?? record.rows;
    if (Array.isArray(entries)) {
      return entries.flatMap((row) =>
        row && typeof row === "object"
          ? normalizeRow(row as Record<string, unknown>)
          : [],
      );
    }
  }

  return [];
}

function normalizeRow(row: Record<string, unknown>): AuditTrailRow[] {
  const timestamp = row.timestamp ?? row.ts ?? row.time;
  const actor = row.actor ?? row.operator ?? row.user;
  const action = row.action ?? row.event ?? row.operation;
  const status = row.status ?? row.result ?? row.state;

  if (
    typeof timestamp === "string" &&
    typeof actor === "string" &&
    typeof action === "string" &&
    typeof status === "string"
  ) {
    return [{ timestamp, actor, action, status }];
  }

  return [];
}

function formatSyncTime(date: Date): string {
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

export default function AuditTrailWorkspace() {
  const contract = WORKSPACE_CONTRACTS["audit-trail"];
  const [auditState, setAuditState] = useState<AuditState>("loading");
  const [rows, setRows] = useState<AuditTrailRow[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>("—");

  useEffect(() => {
    let active = true;

    async function load() {
      const syncTime = formatSyncTime(new Date());
      try {
        const response = await apiFetch("/api/audit/trail", { cacheBust: true });
        if (!active) {
          return;
        }
        setLastSyncTime(syncTime);
        if (!response.ok) {
          setRows(DEMO_AUDIT_ROWS);
          setAuditState("offline-but-demo");
          return;
        }
        const data: unknown = await response.json();
        const parsed = parseAuditRows(data);
        if (parsed.length === 0) {
          setRows([]);
          setAuditState("empty");
          return;
        }
        setRows(parsed);
        setAuditState("populated");
      } catch {
        if (active) {
          setLastSyncTime(syncTime);
          setRows(DEMO_AUDIT_ROWS);
          setAuditState("offline-but-demo");
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <WorkspaceRouteFrame {...contract}>
      <p className={styles.pageIntro}>
        Audit trail — immutable operator action log streamed from the carrier audit endpoint.
      </p>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>AUDIT_TRAIL //</div>
        {auditState === "loading" ? (
          <div className={styles.emptyVault}>[ LOADING ] audit stream...</div>
        ) : (
          <>
            <div className={styles.auditMeta}>
              <div className={styles.auditMetaRow}>
                <span className={styles.auditMetaLabel}>LAST_SYNC_TIME //</span>
                <span>{lastSyncTime}</span>
              </div>
              <div className={styles.auditMetaRow}>
                <span className={styles.auditMetaLabel}>SOURCE_NODE //</span>
                <span>{DEMO_SOURCE_NODE}</span>
              </div>
              <div className={styles.auditMetaRow}>
                <span className={styles.auditMetaLabel}>DATA_INTEGRITY //</span>
                <span>PRAGMA_OK</span>
              </div>
            </div>
            {auditState === "offline-but-demo" ? (
              <>
                <div className={styles.demoBadge}>[SIMULATION_DEMO_MODE] //</div>
                <p className={styles.vaultHint}>
                  Sample rows below — your live session writes appear here when the carrier audit
                  endpoint is reachable.
                </p>
              </>
            ) : null}
            {auditState === "empty" ? (
              <div className={styles.emptyVault}>
                [ EMPTY ] no audit entries recorded yet — session login, credential issuance, job
                submit, and revoke actions appear here once the carrier audit stream connects.
              </div>
            ) : (
              <div className={styles.auditGrid}>
                <div className={`${styles.auditRow} ${styles.auditHeader}`}>
                  <span>TIMESTAMP //</span>
                  <span>ACTOR //</span>
                  <span>ACTION //</span>
                  <span>STATUS //</span>
                </div>
                {rows.map((row, index) => (
                  <div key={`${row.timestamp}-${index}`} className={styles.auditRow}>
                    <span>{row.timestamp}</span>
                    <span>{row.actor}</span>
                    <span>{row.action}</span>
                    <span>{row.status}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </WorkspaceRouteFrame>
  );
}
