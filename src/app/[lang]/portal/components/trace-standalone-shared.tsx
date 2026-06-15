import type {
  Artix7Status,
  HardwareTraceResponse,
  RecoveryEventEntry,
  ReflashDaemon,
  SerialBridge,
} from "@/app/api/hardware/trace/trace-structured";
import styles from "../dashboard/portal.module.css";

export const NOT_REPORTED = "NOT_REPORTED";
export const TRACE_FIELD_UNAVAILABLE = "TRACE_FIELD_UNAVAILABLE";
export const TRACE_SOURCE = "/api/hardware/trace";

export type ProvenanceLabel = "LIVE" | "OFFLINE" | "EMPTY" | "DEMO";

export function eventField(value: string | null | undefined): string {
  return value?.trim() ? value.trim() : NOT_REPORTED;
}

export function telemetryField(value: string | null | undefined): string {
  return value?.trim() ? value.trim() : TRACE_FIELD_UNAVAILABLE;
}

export function isDemoTrace(trace: HardwareTraceResponse): boolean {
  const note = trace.standaloneNote?.toUpperCase() ?? "";
  return note.includes("DEMO") || note.includes("SIMULATION");
}

export function resolveTraceProvenance(
  fetchOffline: boolean,
  trace: HardwareTraceResponse | null,
): ProvenanceLabel {
  if (fetchOffline) {
    return "OFFLINE";
  }
  if (!trace) {
    return "EMPTY";
  }
  if (isDemoTrace(trace)) {
    return "DEMO";
  }
  if (trace.eventCount > 0 || trace.recoveryEvents.length > 0) {
    return trace.mode === "LIVE" ? "LIVE" : "EMPTY";
  }
  return trace.mode === "LIVE" ? "LIVE" : "EMPTY";
}

export function hasParsedRecoveryContent(trace: HardwareTraceResponse): boolean {
  if (trace.eventCount > 0 || trace.recoveryEvents.length > 0) {
    return true;
  }
  const last = trace.lastRecoveryEvent;
  return Boolean(
    last.evtId?.trim() ||
      last.trigger?.trim() ||
      last.timestamp?.trim() ||
      last.result?.trim(),
  );
}

type MetaRowProps = {
  label: string;
  value: string;
};

export function StandaloneMetaRow({ label, value }: MetaRowProps) {
  return (
    <div className={styles.standaloneMetaRow}>
      <span className={styles.auditMetaLabel}>{label}</span>
      <span className={styles.standaloneMetaValue}>{value}</span>
    </div>
  );
}

type ProvenanceStripProps = {
  label: ProvenanceLabel;
  source: string;
  lastUpdated: string | null;
  demoNote?: string | null;
};

export function ProvenanceStrip({
  label,
  source,
  lastUpdated,
  demoNote,
}: ProvenanceStripProps) {
  const badgeClass =
    label === "LIVE"
      ? styles.provenanceLive
      : label === "OFFLINE"
        ? styles.provenanceOffline
        : label === "DEMO"
          ? styles.provenanceDemo
          : styles.provenanceEmpty;

  return (
    <div className={styles.provenanceStrip}>
      <span className={`${styles.provenanceBadge} ${badgeClass}`}>{label}</span>
      <StandaloneMetaRow label="SOURCE //" value={source} />
      <StandaloneMetaRow
        label="LAST_UPDATED //"
        value={lastUpdated ?? NOT_REPORTED}
      />
      {demoNote ? (
        <p className={styles.demoBadge}>{demoNote}</p>
      ) : null}
    </div>
  );
}

type RecoveryMetadataStripProps = {
  trace: HardwareTraceResponse;
  recoveryClock: string | null;
};

export function RecoveryMetadataStrip({
  trace,
  recoveryClock,
}: RecoveryMetadataStripProps) {
  const lastEventAt =
    trace.recoveryEvents[trace.recoveryEvents.length - 1]?.lastEventAt ??
    trace.lastRecoveryEvent.timestamp;

  return (
    <div className={styles.metadataStrip}>
      <StandaloneMetaRow label="MODE //" value={telemetryField(trace.mode)} />
      <StandaloneMetaRow
        label="RECOVERY_CLOCK //"
        value={telemetryField(recoveryClock)}
      />
      <StandaloneMetaRow
        label="LAST_EVENT_AT //"
        value={eventField(lastEventAt)}
      />
      <StandaloneMetaRow
        label="EVENT_COUNT //"
        value={String(trace.eventCount)}
      />
      <StandaloneMetaRow label="STATUS //" value={telemetryField(trace.status)} />
    </div>
  );
}

type RecoveryEventTableProps = {
  events: RecoveryEventEntry[];
};

export function RecoveryEventTable({ events }: RecoveryEventTableProps) {
  return (
    <div className={styles.recoveryTableWrap}>
      <div className={`${styles.auditRow} ${styles.auditHeader} ${styles.recoveryTableHeader}`}>
        <span>EVT_ID //</span>
        <span>TRIGGER //</span>
        <span>FPGA_FAMILY //</span>
        <span>DAEMON_STATE //</span>
        <span>SERIAL_BRIDGE //</span>
        <span>LAST_EVENT_AT //</span>
      </div>
      {events.map((entry, index) => (
        <div
          key={`${entry.evtId ?? "row"}-${entry.lastEventAt ?? index}`}
          className={styles.auditRow}
        >
          <span>{eventField(entry.evtId)}</span>
          <span>{eventField(entry.trigger)}</span>
          <span>{eventField(entry.fpgaFamily)}</span>
          <span>{eventField(entry.daemonState)}</span>
          <span>{eventField(entry.serialBridge)}</span>
          <span>{eventField(entry.lastEventAt)}</span>
        </div>
      ))}
    </div>
  );
}

type Artix7PanelProps = {
  artix7: Artix7Status;
};

export function Artix7StatusPanel({ artix7 }: Artix7PanelProps) {
  return (
    <article className={styles.proofCard}>
      <span className={styles.metricLabel}>ARTIX7_STATUS //</span>
      <div className={styles.auditMeta}>
        <StandaloneMetaRow label="DEVICE //" value={eventField(artix7.device)} />
        <StandaloneMetaRow label="SRAM_CONFIG //" value={eventField(artix7.sramConfig)} />
        <StandaloneMetaRow label="GATE_CLAMP //" value={eventField(artix7.gateClamp)} />
        <StandaloneMetaRow label="WNS_SLACK //" value={eventField(artix7.wnsSlack)} />
        <StandaloneMetaRow label="LAST_FLASH //" value={eventField(artix7.lastFlash)} />
      </div>
    </article>
  );
}

type ReflashPanelProps = {
  reflashDaemon: ReflashDaemon;
};

export function ReflashDaemonPanel({ reflashDaemon }: ReflashPanelProps) {
  return (
    <article className={styles.proofCard}>
      <span className={styles.metricLabel}>REFLASH_DAEMON //</span>
      <div className={styles.auditMeta}>
        <StandaloneMetaRow label="STATUS //" value={eventField(reflashDaemon.status)} />
        <StandaloneMetaRow
          label="RECOVERY_TARGET //"
          value={eventField(reflashDaemon.recoveryTarget)}
        />
        <StandaloneMetaRow label="NULL_BUFFER //" value={eventField(reflashDaemon.nullBuffer)} />
        <StandaloneMetaRow label="LAST_SOAK //" value={eventField(reflashDaemon.lastSoak)} />
      </div>
    </article>
  );
}

type SerialPanelProps = {
  serialBridge: SerialBridge;
};

export function SerialBridgePanel({ serialBridge }: SerialPanelProps) {
  return (
    <article className={styles.proofCard}>
      <span className={styles.metricLabel}>SERIAL_BRIDGE //</span>
      <div className={styles.auditMeta}>
        <StandaloneMetaRow label="PORT_8044 //" value={eventField(serialBridge.port8044)} />
        <StandaloneMetaRow label="PORT_8045 //" value={eventField(serialBridge.port8045)} />
        <StandaloneMetaRow label="COM_TERMINAL //" value={eventField(serialBridge.comTerminal)} />
      </div>
      {serialBridge.note ? (
        <p className={styles.standaloneSubtext}>{serialBridge.note}</p>
      ) : (
        <p className={styles.standaloneSubtext}>{telemetryField(null)}</p>
      )}
    </article>
  );
}

export function isHardwareTraceResponse(data: unknown): data is HardwareTraceResponse {
  if (!data || typeof data !== "object") {
    return false;
  }
  const record = data as Record<string, unknown>;
  return record.mode === "LIVE" || record.mode === "STANDALONE";
}
