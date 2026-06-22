"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "./apiFetch";
import {
  ProvenanceStrip,
  type ProvenanceLabel,
} from "./trace-standalone-shared";
import { formatSyncTime } from "./usage-utils";
import styles from "../dashboard/portal.module.css";

const TENANT_SOURCE = "/api/tenants";

type TenantRow = {
  tenantId: string;
  email: string;
  keys: string;
  lastActive: string;
  simulation?: boolean;
};

type RegistryState =
  | { kind: "loading" }
  | { kind: "success"; rows: TenantRow[] }
  | { kind: "empty" }
  | { kind: "degraded"; code: string; explanation: string }
  | { kind: "error"; code: string; explanation: string };

const DEGRADED_CODES = new Set(["CARRIER_LINK_PENDING"]);

const ERROR_EXPLANATIONS: Record<string, string> = {
  CARRIER_LINK_PENDING: "Tenant registry endpoint not yet provisioned on carrier.",
  HTTP_404: "Tenant registry route not found on carrier.",
  HTTP_500: "Carrier returned an internal error for tenant registry.",
  HTTP_502: "Carrier gateway unreachable for tenant registry.",
  HTTP_503: "Tenant registry service unavailable on carrier.",
  NETWORK: "Network error while contacting tenant registry.",
  PARSE: "Tenant registry response could not be parsed.",
};

function cellValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

function mapTenantRow(entry: unknown): TenantRow | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const record = entry as Record<string, unknown>;
  const tenantId = record.tenant_id ?? record.tenantId ?? record.id;
  const email = record.email;
  const keys = record.keys ?? record.key_count ?? record.api_keys;
  const lastActive = record.last_active ?? record.lastActive ?? record.last_seen;
  const simulation =
    record.simulation === true ||
    record.demo === true ||
    String(record.source ?? "").toUpperCase().includes("SIMULATION") ||
    String(record.source ?? "").toUpperCase().includes("DEMO");

  if (tenantId === undefined && email === undefined) {
    return null;
  }

  return {
    tenantId: cellValue(tenantId),
    email: cellValue(email),
    keys: cellValue(keys),
    lastActive: cellValue(lastActive),
    simulation,
  };
}

function extractTenantRows(data: unknown): TenantRow[] | "error" | "empty" {
  if (!data) {
    return "error";
  }

  if (typeof data === "object" && !Array.isArray(data)) {
    const record = data as Record<string, unknown>;
    if (typeof record.error === "string") {
      return "error";
    }
    const nested = record.tenants ?? record.rows ?? record.data;
    if (Array.isArray(nested)) {
      const rows = nested.map(mapTenantRow).filter((row): row is TenantRow => row !== null);
      return rows.length > 0 ? rows : "empty";
    }
  }

  if (Array.isArray(data)) {
    const rows = data.map(mapTenantRow).filter((row): row is TenantRow => row !== null);
    return rows.length > 0 ? rows : "empty";
  }

  return "error";
}

function errorExplanation(code: string): string {
  return ERROR_EXPLANATIONS[code] ?? "Tenant registry request failed.";
}

function resolveTenantProvenance(state: RegistryState): ProvenanceLabel {
  switch (state.kind) {
    case "loading":
      return "EMPTY";
    case "success":
      return "LIVE";
    case "empty":
      return "EMPTY";
    case "degraded":
      return "OFFLINE";
    case "error":
      return "OFFLINE";
    default:
      return "EMPTY";
  }
}

export default function TenantsRegistryView() {
  const pathname = usePathname();
  const onTenantsRoute = /\/portal\/dashboard\/tenants(?:\/|$)/.test(pathname);
  const [state, setState] = useState<RegistryState>({ kind: "loading" });
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const loadRegistry = useCallback(async () => {
    if (!onTenantsRoute) {
      return;
    }
    setState({ kind: "loading" });
    try {
      const response = await apiFetch("/api/tenants", { cacheBust: true });
      let data: unknown = null;
      try {
        data = await response.json();
      } catch {
        setState({
          kind: "error",
          code: "PARSE",
          explanation: errorExplanation("PARSE"),
        });
        return;
      }

      if (
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof (data as Record<string, unknown>).error === "string"
      ) {
        const code = (data as Record<string, unknown>).error as string;
        const explanation = errorExplanation(code);
        if (DEGRADED_CODES.has(code)) {
          setState({ kind: "degraded", code, explanation });
          return;
        }
        setState({ kind: "error", code, explanation });
        return;
      }

      if (!response.ok) {
        const code = `HTTP_${response.status}`;
        setState({
          kind: "error",
          code,
          explanation: errorExplanation(code),
        });
        return;
      }

      const rows = extractTenantRows(data);
      if (rows === "error") {
        setState({
          kind: "error",
          code: "PARSE",
          explanation: errorExplanation("PARSE"),
        });
        return;
      }
      if (rows === "empty") {
        setLastSyncAt(new Date());
        setState({ kind: "empty" });
        return;
      }

      setLastSyncAt(new Date());
      setState({ kind: "success", rows });
    } catch {
      setState({
        kind: "error",
        code: "NETWORK",
        explanation: errorExplanation("NETWORK"),
      });
    }
  }, [onTenantsRoute]);

  useEffect(() => {
    if (!onTenantsRoute) {
      return;
    }
    void loadRegistry();
  }, [loadRegistry, retryNonce, onTenantsRoute]);

  if (!onTenantsRoute) {
    return null;
  }

  const provenance = resolveTenantProvenance(state);
  const lastUpdated = lastSyncAt ? formatSyncTime(lastSyncAt) : null;

  if (state.kind === "loading") {
    return (
      <div className={styles.tenantLoadingPanel}>
        [ LOADING ] tenant registry...
      </div>
    );
  }

  if (state.kind === "empty") {
    return (
      <article className={`${styles.proofCard} ${styles.emptyCard}`}>
        <ProvenanceStrip
          label="EMPTY"
          source={TENANT_SOURCE}
          lastUpdated={lastUpdated}
        />
        <span className={styles.metricLabel}>TENANT_REGISTRY //</span>
        <p className={styles.emptyHeadline}>
          [ EMPTY ] no operator accounts provisioned on carrier
        </p>
      </article>
    );
  }

  if (state.kind === "degraded") {
    return (
      <article className={`${styles.proofCard} ${styles.degradedCard}`}>
        <ProvenanceStrip
          label="OFFLINE"
          source={TENANT_SOURCE}
          lastUpdated={lastUpdated}
        />
        <span className={styles.metricLabel}>TENANT_REGISTRY //</span>
        <p className={styles.degradedHeadline}>
          [ DEGRADED ] carrier link pending — registry not yet live
        </p>
        <div className={styles.auditMeta}>
          <div className={styles.auditMetaRow}>
            <span className={styles.auditMetaLabel}>ERROR_CODE //</span>
            <span>{state.code}</span>
          </div>
          <div className={styles.auditMetaRow}>
            <span className={styles.auditMetaLabel}>EXPLANATION //</span>
            <span>{state.explanation}</span>
          </div>
          {lastSyncAt ? (
            <div className={styles.auditMetaRow}>
              <span className={styles.auditMetaLabel}>LAST_SYNC //</span>
              <span>{formatSyncTime(lastSyncAt)}</span>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className={styles.tenantRetryButton}
          onClick={() => {
            setRetryNonce((value) => value + 1);
          }}
        >
          RETRY //
        </button>
      </article>
    );
  }

  if (state.kind === "error") {
    return (
      <article className={`${styles.proofCard} ${styles.offlineCard}`}>
        <ProvenanceStrip
          label="OFFLINE"
          source={TENANT_SOURCE}
          lastUpdated={lastUpdated}
        />
        <span className={styles.metricLabel}>TENANT_REGISTRY //</span>
        <div className={styles.auditMeta}>
          <div className={styles.auditMetaRow}>
            <span className={styles.auditMetaLabel}>ERROR_CODE //</span>
            <span>{state.code}</span>
          </div>
          <div className={styles.auditMetaRow}>
            <span className={styles.auditMetaLabel}>EXPLANATION //</span>
            <span>{state.explanation}</span>
          </div>
          {lastSyncAt ? (
            <div className={styles.auditMetaRow}>
              <span className={styles.auditMetaLabel}>LAST_SYNC //</span>
              <span>{formatSyncTime(lastSyncAt)}</span>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className={styles.tenantRetryButton}
          onClick={() => {
            setRetryNonce((value) => value + 1);
          }}
        >
          RETRY //
        </button>
      </article>
    );
  }

  return (
    <article className={styles.proofCard}>
      <ProvenanceStrip
        label={provenance}
        source={TENANT_SOURCE}
        lastUpdated={lastUpdated}
        demoNote={
          state.rows.some((row) => row.simulation)
            ? "SIMULATION rows flagged in tenant registry"
            : null
        }
      />
      <span className={styles.metricLabel}>TENANT_REGISTRY //</span>
      <div className={styles.recoveryTableWrap}>
        <div className={`${styles.auditRow} ${styles.auditHeader} ${styles.tenantTableHeader}`}>
          <span>TENANT_ID //</span>
          <span>EMAIL //</span>
          <span>KEYS //</span>
          <span>LAST_ACTIVE //</span>
        </div>
        {state.rows.map((row) => (
          <div key={`${row.tenantId}-${row.email}`} className={styles.auditRow}>
            <span>
              {row.tenantId}
              {row.simulation ? " [SIMULATION]" : ""}
            </span>
            <span>{row.email}</span>
            <span>{row.keys}</span>
            <span>{row.lastActive}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
