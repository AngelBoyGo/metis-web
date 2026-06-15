"use client";

import { useEffect, useState } from "react";
import type { HardwareTraceResponse } from "@/app/api/hardware/trace/trace-structured";
import { apiFetch, OFFLINE_MESSAGE } from "./apiFetch";
import { formatSyncTime } from "./usage-utils";
import {
  Artix7StatusPanel,
  eventField,
  isHardwareTraceResponse,
  NOT_REPORTED,
  ProvenanceStrip,
  ReflashDaemonPanel,
  SerialBridgePanel,
  StandaloneMetaRow,
  telemetryField,
  TRACE_SOURCE,
  type ProvenanceLabel,
} from "./trace-standalone-shared";
import styles from "../dashboard/portal.module.css";

const POLL_MS = 6000;
const HEALTH_SOURCE = "/api/hardware/health";

type FetchPhase = "loading" | "offline" | "ready";

type HardwareHealthPayload = {
  port_8044_state?: string;
  port_8045_state?: string;
  ports?: Record<string, boolean | string>;
  com_terminal?: string | boolean;
  com?: string | boolean;
  demo_mode_available?: boolean;
};

type PortSnapshot = {
  port8044: string;
  port8045: string;
  comTerminal: string;
  demoModeAvailable: string | null;
};

function parsePortState(value: boolean | string | undefined): string {
  if (typeof value === "boolean") {
    return value ? "REACHABLE" : "UNREACHABLE";
  }
  if (typeof value === "string" && value.trim()) {
    return value.trim().toUpperCase();
  }
  return "NOT_REPORTED";
}

function parseHealthPorts(data: unknown): PortSnapshot | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const record = data as HardwareHealthPayload;
  const port8044 =
    record.port_8044_state ??
    parsePortState(record.ports?.["8044"] ?? record.ports?.port_8044);
  const port8045 =
    record.port_8045_state ??
    parsePortState(record.ports?.["8045"] ?? record.ports?.port_8045);

  const comRaw = record.com_terminal ?? record.com;
  let comTerminal = "NOT_REPORTED";
  if (typeof comRaw === "boolean") {
    comTerminal = comRaw ? "CONNECTED" : "DISCONNECTED";
  } else if (typeof comRaw === "string" && comRaw.trim()) {
    comTerminal = comRaw.trim().toUpperCase();
  }

  const demoModeAvailable =
    typeof record.demo_mode_available === "boolean"
      ? record.demo_mode_available
        ? "AVAILABLE"
        : "UNAVAILABLE"
      : null;

  const hasAny =
    port8044 !== "NOT_REPORTED" ||
    port8045 !== "NOT_REPORTED" ||
    comTerminal !== "NOT_REPORTED" ||
    demoModeAvailable !== null;

  if (!hasAny) {
    return null;
  }

  return { port8044, port8045, comTerminal, demoModeAvailable };
}

function tracePortSnapshot(trace: HardwareTraceResponse): PortSnapshot {
  return {
    port8044: eventField(trace.serialBridge.port8044),
    port8045: eventField(trace.serialBridge.port8045),
    comTerminal: eventField(trace.serialBridge.comTerminal),
    demoModeAvailable: null,
  };
}

function mergeSnapshots(
  health: PortSnapshot | null,
  trace: PortSnapshot | null,
): PortSnapshot {
  const base: PortSnapshot = {
    port8044: "NOT_REPORTED",
    port8045: "NOT_REPORTED",
    comTerminal: "NOT_REPORTED",
    demoModeAvailable: null,
  };

  for (const source of [trace, health]) {
    if (!source) {
      continue;
    }
    if (source.port8044 !== "NOT_REPORTED") {
      base.port8044 = source.port8044;
    }
    if (source.port8045 !== "NOT_REPORTED") {
      base.port8045 = source.port8045;
    }
    if (source.comTerminal !== "NOT_REPORTED") {
      base.comTerminal = source.comTerminal;
    }
    if (source.demoModeAvailable !== null) {
      base.demoModeAvailable = source.demoModeAvailable;
    }
  }

  return base;
}

function snapshotPopulated(snapshot: PortSnapshot): boolean {
  return (
    snapshot.port8044 !== "NOT_REPORTED" ||
    snapshot.port8045 !== "NOT_REPORTED" ||
    snapshot.comTerminal !== "NOT_REPORTED"
  );
}

function resolveHealthProvenance(
  phase: FetchPhase,
  healthOk: boolean,
  trace: HardwareTraceResponse | null,
  snapshot: PortSnapshot | null,
): ProvenanceLabel {
  if (phase === "offline") {
    return "OFFLINE";
  }
  if (!healthOk && !trace) {
    return "EMPTY";
  }
  if (!snapshot || !snapshotPopulated(snapshot)) {
    return trace?.mode === "STANDALONE" ? "EMPTY" : "EMPTY";
  }
  if (trace?.mode === "LIVE") {
    return "LIVE";
  }
  if (trace && trace.standaloneNote?.toUpperCase().includes("DEMO")) {
    return "DEMO";
  }
  return healthOk || trace ? "LIVE" : "EMPTY";
}

export default function HardwareHealthPane() {
  const [phase, setPhase] = useState<FetchPhase>("loading");
  const [healthOk, setHealthOk] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [trace, setTrace] = useState<HardwareTraceResponse | null>(null);
  const [healthPorts, setHealthPorts] = useState<PortSnapshot | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      let healthData: unknown = null;
      let localHealthOk = false;
      let localHealthError: string | null = null;
      let localTrace: HardwareTraceResponse | null = null;
      let networkThrow = false;

      try {
        const healthResponse = await apiFetch("/api/hardware/health", {
          cacheBust: true,
        });
        if (!active) {
          return;
        }
        if (healthResponse.ok) {
          localHealthOk = true;
          healthData = await healthResponse.json();
        } else {
          localHealthError = `HTTP_${healthResponse.status}`;
        }
      } catch {
        networkThrow = true;
      }

      try {
        const traceResponse = await apiFetch("/api/hardware/trace", {
          cacheBust: true,
        });
        if (!active) {
          return;
        }
        if (traceResponse.ok) {
          const data: unknown = await traceResponse.json();
          if (isHardwareTraceResponse(data)) {
            localTrace = data;
          }
        }
      } catch {
        networkThrow = true;
      }

      if (!active) {
        return;
      }

      if (networkThrow && !localHealthOk && !localTrace) {
        console.log(OFFLINE_MESSAGE);
        setPhase("offline");
        setHealthOk(false);
        setHealthError(null);
        setTrace(null);
        setHealthPorts(null);
        return;
      }

      setPhase("ready");
      setLastUpdated(formatSyncTime(new Date()));
      setHealthOk(localHealthOk);
      setHealthError(localHealthError);
      setTrace(localTrace);
      setHealthPorts(parseHealthPorts(healthData));
    }

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, POLL_MS);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (phase === "loading") {
    return (
      <div className={styles.tenantLoadingPanel}>
        [ LOADING ] hardware health carrier link...
      </div>
    );
  }

  if (phase === "offline") {
    return (
      <article className={`${styles.proofCard} ${styles.offlineCard}`}>
        <ProvenanceStrip
          label="OFFLINE"
          source={`${HEALTH_SOURCE} · ${TRACE_SOURCE}`}
          lastUpdated={lastUpdated}
        />
        <span className={styles.metricLabel}>HARDWARE_HEALTH //</span>
        <p className={styles.offlineHeadline}>{OFFLINE_MESSAGE}</p>
      </article>
    );
  }

  const tracePorts = trace ? tracePortSnapshot(trace) : null;
  const snapshot = mergeSnapshots(healthPorts, tracePorts);
  const provenance = resolveHealthProvenance(phase, healthOk, trace, snapshot);
  const populated = snapshotPopulated(snapshot);

  if (healthError && !populated && !trace) {
    return (
      <article className={`${styles.proofCard} ${styles.offlineCard}`}>
        <ProvenanceStrip
          label="OFFLINE"
          source={HEALTH_SOURCE}
          lastUpdated={lastUpdated}
        />
        <span className={styles.metricLabel}>HARDWARE_HEALTH //</span>
        <p className={styles.offlineHeadline}>ERROR // {healthError}</p>
        <p className={styles.standaloneSubtext}>
          Carrier health endpoint returned non-OK status.
        </p>
      </article>
    );
  }

  if (!populated) {
    return (
      <div className={styles.standaloneStack}>
        <article className={`${styles.proofCard} ${styles.emptyCard}`}>
          <ProvenanceStrip
            label="EMPTY"
            source={`${HEALTH_SOURCE} · ${TRACE_SOURCE}`}
            lastUpdated={lastUpdated}
            demoNote={trace?.standaloneNote}
          />
          <span className={styles.metricLabel}>HARDWARE_HEALTH //</span>
          <p className={styles.emptyHeadline}>
            [ EMPTY ] port telemetry not reported yet
          </p>
          <div className={styles.auditMeta}>
            <StandaloneMetaRow
              label="PORT_8044_STATE //"
              value={NOT_REPORTED}
            />
            <StandaloneMetaRow
              label="PORT_8045_STATE //"
              value={NOT_REPORTED}
            />
          </div>
        </article>
        {trace ? (
          <>
            <Artix7StatusPanel artix7={trace.artix7} />
            <ReflashDaemonPanel reflashDaemon={trace.reflashDaemon} />
            <SerialBridgePanel serialBridge={trace.serialBridge} />
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.standaloneStack}>
      <article className={styles.proofCard}>
        <ProvenanceStrip
          label={provenance}
          source={
            healthOk
              ? `${HEALTH_SOURCE} · ${TRACE_SOURCE}`
              : TRACE_SOURCE
          }
          lastUpdated={lastUpdated}
          demoNote={trace?.standaloneNote}
        />
        <span className={styles.metricLabel}>HARDWARE_CONNECTIVITY //</span>
        <div className={styles.portGrid}>
          <div className={styles.portRow}>
            <span className={styles.portLabel}>PORT_8044_STATE //</span>
            <span
              className={
                snapshot.port8044 === "REACHABLE" || snapshot.port8044 === "UP"
                  ? styles.portUp
                  : styles.portDown
              }
            >
              {snapshot.port8044}
            </span>
          </div>
          <div className={styles.portRow}>
            <span className={styles.portLabel}>PORT_8045_STATE //</span>
            <span
              className={
                snapshot.port8045 === "REACHABLE" || snapshot.port8045 === "UP"
                  ? styles.portUp
                  : styles.portDown
              }
            >
              {snapshot.port8045}
            </span>
          </div>
          <div className={styles.portRow}>
            <span className={styles.portLabel}>COM_TERMINAL //</span>
            <span
              className={
                snapshot.comTerminal === "CONNECTED"
                  ? styles.portUp
                  : styles.portDown
              }
            >
              {snapshot.comTerminal}
            </span>
          </div>
          {snapshot.demoModeAvailable !== null ? (
            <div className={styles.portRow}>
              <span className={styles.portLabel}>DEMO_MODE_AVAILABLE //</span>
              <span className={styles.portUp}>{snapshot.demoModeAvailable}</span>
            </div>
          ) : null}
        </div>
        {trace ? (
          <p className={styles.standaloneSubtext}>
            TRACE_MODE // {telemetryField(trace.mode)} · STATUS //{" "}
            {telemetryField(trace.status)}
          </p>
        ) : null}
      </article>

      {trace ? (
        <>
          <Artix7StatusPanel artix7={trace.artix7} />
          <ReflashDaemonPanel reflashDaemon={trace.reflashDaemon} />
          <SerialBridgePanel serialBridge={trace.serialBridge} />
        </>
      ) : null}
    </div>
  );
}
