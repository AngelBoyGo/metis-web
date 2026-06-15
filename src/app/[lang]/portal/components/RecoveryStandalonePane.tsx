"use client";

import { useEffect, useState } from "react";
import type { HardwareTraceResponse } from "@/app/api/hardware/trace/trace-structured";
import { apiFetch, OFFLINE_MESSAGE } from "./apiFetch";
import { formatSyncTime } from "./usage-utils";
import {
  Artix7StatusPanel,
  eventField,
  hasParsedRecoveryContent,
  isHardwareTraceResponse,
  ProvenanceStrip,
  RecoveryEventTable,
  RecoveryMetadataStrip,
  ReflashDaemonPanel,
  resolveTraceProvenance,
  SerialBridgePanel,
  StandaloneMetaRow,
  telemetryField,
  TRACE_SOURCE,
} from "./trace-standalone-shared";
import styles from "../dashboard/portal.module.css";

const POLL_MS = 6000;

type FetchPhase = "loading" | "offline" | "ready";

export default function RecoveryStandalonePane() {
  const [phase, setPhase] = useState<FetchPhase>("loading");
  const [trace, setTrace] = useState<HardwareTraceResponse | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const response = await apiFetch("/api/hardware/trace", { cacheBust: true });
        if (!active) {
          return;
        }
        if (!response.ok) {
          throw new Error(`trace status ${response.status}`);
        }
        const data: unknown = await response.json();
        if (!active) {
          return;
        }
        setPhase("ready");
        setLastUpdated(formatSyncTime(new Date()));
        if (isHardwareTraceResponse(data)) {
          setTrace(data);
        } else {
          setTrace(null);
        }
      } catch {
        if (active) {
          console.log(OFFLINE_MESSAGE);
          setPhase("offline");
          setTrace(null);
        }
      }
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
        [ LOADING ] recovery telemetry carrier link...
      </div>
    );
  }

  if (phase === "offline") {
    return (
      <article className={`${styles.proofCard} ${styles.offlineCard}`}>
        <ProvenanceStrip
          label="OFFLINE"
          source={TRACE_SOURCE}
          lastUpdated={lastUpdated}
        />
        <span className={styles.metricLabel}>RECOVERY_TELEMETRY //</span>
        <p className={styles.offlineHeadline}>{OFFLINE_MESSAGE}</p>
        <p className={styles.standaloneSubtext}>
          Carrier trace endpoint unreachable — network throw on fetch.
        </p>
      </article>
    );
  }

  if (!trace) {
    return (
      <article className={`${styles.proofCard} ${styles.emptyCard}`}>
        <ProvenanceStrip
          label="EMPTY"
          source={TRACE_SOURCE}
          lastUpdated={lastUpdated}
        />
        <span className={styles.metricLabel}>RECOVERY_TELEMETRY //</span>
        <p className={styles.emptyHeadline}>
          [ EMPTY ] trace contract unavailable
        </p>
      </article>
    );
  }

  const provenance = resolveTraceProvenance(false, trace);
  const recoveryClock = trace.recoveryClock;
  const populated = hasParsedRecoveryContent(trace);
  const demoNote = trace.standaloneNote;

  if (!populated) {
    return (
      <article className={`${styles.proofCard} ${styles.emptyCard}`}>
        <ProvenanceStrip
          label={provenance}
          source={TRACE_SOURCE}
          lastUpdated={lastUpdated}
          demoNote={demoNote}
        />
        <span className={styles.metricLabel}>RECOVERY_TELEMETRY //</span>
        <RecoveryMetadataStrip trace={trace} recoveryClock={recoveryClock} />
        <p className={styles.emptyHeadline}>
          [ EMPTY ] no parsed recovery events yet
        </p>
        <p className={styles.standaloneSubtext}>
          HTTP 200 · mode={trace.mode} · carrier link present · awaiting trace stream
        </p>
        <SerialBridgePanel serialBridge={trace.serialBridge} />
      </article>
    );
  }

  const events =
    trace.recoveryEvents.length > 0
      ? trace.recoveryEvents
      : [
          {
            evtId: trace.lastRecoveryEvent.evtId,
            trigger: trace.lastRecoveryEvent.trigger,
            fpgaFamily: trace.artix7.device,
            daemonState: trace.reflashDaemon.status,
            serialBridge: [
              trace.serialBridge.port8044,
              trace.serialBridge.port8045,
            ]
              .filter((value) => value?.trim())
              .join(" · ") || null,
            lastEventAt: trace.lastRecoveryEvent.timestamp,
          },
        ];

  return (
    <div className={styles.standaloneStack}>
      <article className={styles.proofCard}>
        <ProvenanceStrip
          label={provenance}
          source={TRACE_SOURCE}
          lastUpdated={lastUpdated}
          demoNote={demoNote}
        />
        <span className={styles.metricLabel}>RECOVERY_TELEMETRY //</span>
        <RecoveryMetadataStrip trace={trace} recoveryClock={recoveryClock} />
        {trace.stream ? (
          <dl className={styles.streamFields}>
            <div className={styles.streamRow}>
              <dt>processing speed</dt>
              <dd>{telemetryField(trace.stream.processingSpeed)}</dd>
            </div>
            <div className={styles.streamRow}>
              <dt>data throughput</dt>
              <dd>{telemetryField(trace.stream.dataThroughput)}</dd>
            </div>
            <div className={styles.streamRow}>
              <dt>worst negative slack setup margin</dt>
              <dd>{telemetryField(trace.stream.worstNegativeSlackSetupMargin)}</dd>
            </div>
          </dl>
        ) : null}
      </article>

      <article className={styles.proofCard}>
        <span className={styles.metricLabel}>RECOVERY_EVENT_LOG //</span>
        <RecoveryEventTable events={events} />
        <div className={styles.auditMeta}>
          <StandaloneMetaRow
            label="EVT_ID //"
            value={eventField(trace.lastRecoveryEvent.evtId)}
          />
          <StandaloneMetaRow
            label="TRIGGER //"
            value={eventField(trace.lastRecoveryEvent.trigger)}
          />
          <StandaloneMetaRow
            label="RESULT //"
            value={eventField(trace.lastRecoveryEvent.result)}
          />
        </div>
      </article>

      <Artix7StatusPanel artix7={trace.artix7} />
      <ReflashDaemonPanel reflashDaemon={trace.reflashDaemon} />
      <SerialBridgePanel serialBridge={trace.serialBridge} />
    </div>
  );
}
