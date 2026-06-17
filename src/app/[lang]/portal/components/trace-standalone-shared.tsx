import type {
  Artix7Status,
  HardwareTraceResponse,
  RecoveryEventEntry,
  ReflashDaemon,
  SerialBridge,
  TraceMode,
} from "@/app/api/hardware/trace/trace-structured";
import styles from "../dashboard/portal.module.css";

export const NOT_REPORTED = "NOT_REPORTED";
export const TRACE_FIELD_UNAVAILABLE = "TRACE_FIELD_UNAVAILABLE";
export const TRACE_SOURCE = "/api/hardware/trace";

export const STANDALONE_STATUS =
  "[STANDALONE_MODE] Bench serial required on 8044/8045";

const STANDALONE_DEFAULTS = {
  recoveryClock: "6.2s",
  lastEventAt: "2026-06-14T22:11:04Z",
  port8044: "UNREACHABLE",
  port8045: "UNREACHABLE",
  comTerminal: "OFFLINE",
  artix7Device: "Artix-7 FPGA (XC7A35T)",
  artix7SramConfig: "STANDALONE — not polled",
  artix7GateClamp: "RE-ARMED",
  artix7WnsSlack: "+0.018 ns",
  artix7LastFlash: "flash_only.tcl · 2026-06-14T22:11:04Z",
  daemonStatus: "ARMED",
  daemonTarget: "6.2s",
  daemonNullBuffer: "3-packet defensive window active",
  daemonLastSoak: "T19_boundary_hardening · soak_rc=0 · 7 milestones",
  evtId: "EVT_RECOVERY_266_FINAL",
  trigger: "BROWNOUT_0xE739CECE",
} as const;

export function formatRecoveryClockDisplay(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined) {
    return STANDALONE_DEFAULTS.recoveryClock;
  }
  if (typeof value === "number") {
    return `${value}s`;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return STANDALONE_DEFAULTS.recoveryClock;
  }
  return trimmed.endsWith("s") ? trimmed : `${trimmed}s`;
}

export function standaloneField(
  mode: TraceMode,
  value: string | null | undefined,
  fallback: string,
): string {
  if (mode === "STANDALONE") {
    return value?.trim() ? value.trim() : fallback;
  }
  return value?.trim() ? value.trim() : NOT_REPORTED;
}

export function resolveTraceStatus(trace: HardwareTraceResponse): string {
  if (trace.mode === "STANDALONE") {
    const reported = trace.status?.trim();
    if (
      reported &&
      reported !== "INITIALIZING_CARRIER_LINK //" &&
      reported !== TRACE_FIELD_UNAVAILABLE
    ) {
      return reported;
    }
    return STANDALONE_STATUS;
  }
  return trace.status?.trim() ? trace.status.trim() : TRACE_FIELD_UNAVAILABLE;
}

export function resolveRecoveryClock(trace: HardwareTraceResponse): string {
  return formatRecoveryClockDisplay(trace.recoveryClock);
}

export function resolveArtix7Display(
  mode: TraceMode,
  artix7: Artix7Status,
): Artix7Status {
  return {
    device: standaloneField(mode, artix7.device, STANDALONE_DEFAULTS.artix7Device),
    sramConfig: standaloneField(
      mode,
      artix7.sramConfig,
      STANDALONE_DEFAULTS.artix7SramConfig,
    ),
    gateClamp: standaloneField(
      mode,
      artix7.gateClamp,
      STANDALONE_DEFAULTS.artix7GateClamp,
    ),
    wnsSlack: standaloneField(
      mode,
      artix7.wnsSlack,
      STANDALONE_DEFAULTS.artix7WnsSlack,
    ),
    lastFlash: standaloneField(
      mode,
      artix7.lastFlash,
      STANDALONE_DEFAULTS.artix7LastFlash,
    ),
  };
}

export function resolveReflashDaemonDisplay(
  mode: TraceMode,
  reflashDaemon: ReflashDaemon,
): ReflashDaemon {
  return {
    status: standaloneField(mode, reflashDaemon.status, STANDALONE_DEFAULTS.daemonStatus),
    recoveryTarget: standaloneField(
      mode,
      reflashDaemon.recoveryTarget,
      STANDALONE_DEFAULTS.daemonTarget,
    ),
    nullBuffer: standaloneField(
      mode,
      reflashDaemon.nullBuffer,
      STANDALONE_DEFAULTS.daemonNullBuffer,
    ),
    lastSoak: standaloneField(
      mode,
      reflashDaemon.lastSoak,
      STANDALONE_DEFAULTS.daemonLastSoak,
    ),
  };
}

export function resolveSerialBridgeDisplay(
  mode: TraceMode,
  serialBridge: SerialBridge,
): SerialBridge {
  return {
    port8044: standaloneField(
      mode,
      serialBridge.port8044,
      STANDALONE_DEFAULTS.port8044,
    ),
    port8045: standaloneField(
      mode,
      serialBridge.port8045,
      STANDALONE_DEFAULTS.port8045,
    ),
    comTerminal: standaloneField(
      mode,
      serialBridge.comTerminal,
      STANDALONE_DEFAULTS.comTerminal,
    ),
    note: serialBridge.note?.trim() ? serialBridge.note.trim() : null,
  };
}

export function resolveLastRecoveryEventDisplay(
  mode: TraceMode,
  trace: HardwareTraceResponse,
): { evtId: string; trigger: string; lastEventAt: string } {
  const last = trace.lastRecoveryEvent;
  const fromEvents =
    trace.recoveryEvents[trace.recoveryEvents.length - 1]?.lastEventAt ?? null;
  const lastEventAt = fromEvents ?? last.timestamp;

  return {
    evtId: standaloneField(mode, last.evtId, STANDALONE_DEFAULTS.evtId),
    trigger: standaloneField(mode, last.trigger, STANDALONE_DEFAULTS.trigger),
    lastEventAt: lastEventAt?.trim()
      ? lastEventAt.trim()
      : STANDALONE_DEFAULTS.lastEventAt,
  };
}

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
  if (trace.mode === "STANDALONE") {
    return true;
  }
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
  const eventMeta = resolveLastRecoveryEventDisplay(trace.mode, trace);

  return (
    <div className={styles.metadataStrip}>
      <StandaloneMetaRow label="MODE //" value={telemetryField(trace.mode)} />
      <StandaloneMetaRow
        label="RECOVERY_CLOCK //"
        value={recoveryClock ?? resolveRecoveryClock(trace)}
      />
      <StandaloneMetaRow
        label="LAST_EVENT_AT //"
        value={eventMeta.lastEventAt}
      />
      <StandaloneMetaRow
        label="EVENT_COUNT //"
        value={String(trace.eventCount)}
      />
      <StandaloneMetaRow label="STATUS //" value={resolveTraceStatus(trace)} />
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
  mode?: TraceMode;
};

export function Artix7StatusPanel({ artix7, mode = "LIVE" }: Artix7PanelProps) {
  const display = resolveArtix7Display(mode, artix7);
  return (
    <article className={styles.proofCard}>
      <span className={styles.metricLabel}>ARTIX7_STATUS //</span>
      <div className={styles.auditMeta}>
        <StandaloneMetaRow label="DEVICE //" value={display.device ?? NOT_REPORTED} />
        <StandaloneMetaRow label="SRAM_CONFIG //" value={display.sramConfig ?? NOT_REPORTED} />
        <StandaloneMetaRow label="GATE_CLAMP //" value={display.gateClamp ?? NOT_REPORTED} />
        <StandaloneMetaRow label="WNS_SLACK //" value={display.wnsSlack ?? NOT_REPORTED} />
        <StandaloneMetaRow label="LAST_FLASH //" value={display.lastFlash ?? NOT_REPORTED} />
      </div>
    </article>
  );
}

type ReflashPanelProps = {
  reflashDaemon: ReflashDaemon;
  mode?: TraceMode;
};

export function ReflashDaemonPanel({ reflashDaemon, mode = "LIVE" }: ReflashPanelProps) {
  const display = resolveReflashDaemonDisplay(mode, reflashDaemon);
  return (
    <article className={styles.proofCard}>
      <span className={styles.metricLabel}>REFLASH_DAEMON //</span>
      <div className={styles.auditMeta}>
        <StandaloneMetaRow label="STATUS //" value={display.status ?? NOT_REPORTED} />
        <StandaloneMetaRow
          label="RECOVERY_TARGET //"
          value={display.recoveryTarget ?? NOT_REPORTED}
        />
        <StandaloneMetaRow label="NULL_BUFFER //" value={display.nullBuffer ?? NOT_REPORTED} />
        <StandaloneMetaRow label="LAST_SOAK //" value={display.lastSoak ?? NOT_REPORTED} />
      </div>
    </article>
  );
}

type SerialPanelProps = {
  serialBridge: SerialBridge;
  mode?: TraceMode;
};

export function SerialBridgePanel({ serialBridge, mode = "LIVE" }: SerialPanelProps) {
  const display = resolveSerialBridgeDisplay(mode, serialBridge);
  return (
    <article className={styles.proofCard}>
      <span className={styles.metricLabel}>SERIAL_BRIDGE //</span>
      <div className={styles.auditMeta}>
        <StandaloneMetaRow label="PORT_8044 //" value={display.port8044 ?? NOT_REPORTED} />
        <StandaloneMetaRow label="PORT_8045 //" value={display.port8045 ?? NOT_REPORTED} />
        <StandaloneMetaRow label="COM_TERMINAL //" value={display.comTerminal ?? NOT_REPORTED} />
      </div>
      {display.note ? (
        <p className={styles.standaloneSubtext}>{display.note}</p>
      ) : mode !== "STANDALONE" ? (
        <p className={styles.standaloneSubtext}>{telemetryField(null)}</p>
      ) : null}
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
