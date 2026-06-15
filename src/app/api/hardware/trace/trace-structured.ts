import {
  extractRecoveryClock,
  type TraceStreamFields,
} from "@/app/[lang]/portal/components/trace-parser";

export type TraceMode = "LIVE" | "STANDALONE";

export type RecoveryEventEntry = {
  evtId: string | null;
  trigger: string | null;
  fpgaFamily: string | null;
  daemonState: string | null;
  serialBridge: string | null;
  lastEventAt: string | null;
};

export type LastRecoveryEvent = {
  evtId: string | null;
  trigger: string | null;
  reflash: string | null;
  wnsSlack: string | null;
  duration: string | null;
  result: string | null;
  timestamp: string | null;
};

export type Artix7Status = {
  device: string | null;
  sramConfig: string | null;
  gateClamp: string | null;
  wnsSlack: string | null;
  lastFlash: string | null;
};

export type ReflashDaemon = {
  status: string | null;
  recoveryTarget: string | null;
  nullBuffer: string | null;
  lastSoak: string | null;
};

export type SerialBridge = {
  port8044: string | null;
  port8045: string | null;
  comTerminal: string | null;
  note: string | null;
};

export type HardwareTraceResponse = {
  status: string;
  rows: string[];
  stream: TraceStreamFields | null;
  offline: boolean;
  offlineMessage: string;
  mode: TraceMode;
  standaloneNote: string | null;
  recoveryClock: string | null;
  eventCount: number;
  recoveryEvents: RecoveryEventEntry[];
  lastRecoveryEvent: LastRecoveryEvent;
  artix7: Artix7Status;
  reflashDaemon: ReflashDaemon;
  serialBridge: SerialBridge;
};

type FieldPatterns = RegExp[];

function pickField(rows: string[], patterns: FieldPatterns): string | null {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const line = rows[index];
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match?.[1]) {
        return match[1].trim();
      }
    }
  }
  return null;
}

function pickFieldInContext(
  rows: string[],
  contextPattern: RegExp,
  patterns: FieldPatterns,
): string | null {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (!contextPattern.test(rows[index])) {
      continue;
    }
    for (let scan = index; scan >= Math.max(0, index - 4); scan -= 1) {
      const line = rows[scan];
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match?.[1]) {
          return match[1].trim();
        }
      }
    }
  }
  return pickField(rows, patterns);
}

function streamWnsSlack(stream: TraceStreamFields | null): string | null {
  return stream?.worstNegativeSlackSetupMargin?.trim() ?? null;
}

function streamRecoveryDuration(stream: TraceStreamFields | null): string | null {
  if (!stream?.processingSpeed) {
    return null;
  }
  const match = stream.processingSpeed.match(/([\d.]+)\s*(?:s(?:ec(?:onds?)?)?)/i);
  if (match) {
    return `${match[1]}s`;
  }
  return stream.processingSpeed.trim();
}

/**
 * Parse standalone bench note from log rows when present.
 */
export function extractStandaloneNote(rows: string[]): string | null {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const match = rows[index].match(/\[STANDALONE(?:_MODE)?\]\s*(.+)/i);
    if (match?.[1]) {
      return `[STANDALONE_MODE] ${match[1].trim()}`;
    }
  }
  return null;
}

/**
 * Parse last recovery event fields from log rows.
 */
export function extractLastRecoveryEvent(
  rows: string[],
  stream: TraceStreamFields | null,
): LastRecoveryEvent {
  const context = /RECOVERY[_\s-]?EVENT|LAST_RECOVERY_EVENT/i;
  return {
    evtId: pickFieldInContext(rows, context, [
      /evt[_\s-]?id[=:\s/]+([^\s|;,]+)/i,
      /(EVT_RECOVERY_[^\s|;,]+)/i,
    ]),
    trigger: pickFieldInContext(rows, context, [
      /trigger[=:\s/]+([^\s|;,]+)/i,
      /(BROWNOUT_[^\s|;,]+)/i,
    ]),
    reflash: pickFieldInContext(rows, context, [
      /reflash[=:\s/]+([^\s|;,]+)/i,
      /(flash_only\.tcl)/i,
    ]),
    wnsSlack:
      pickFieldInContext(rows, context, [/wns[_\s-]?slack[=:\s/]+([^\s|;,]+)/i]) ??
      streamWnsSlack(stream),
    duration:
      pickFieldInContext(rows, context, [/duration[=:\s/]+([^\s|;,]+)/i]) ??
      streamRecoveryDuration(stream),
    result: pickFieldInContext(rows, context, [/result[=:\s/]+([^\s|;,]+)/i]),
    timestamp: pickFieldInContext(rows, context, [
      /timestamp[=:\s/]+(\d{4}-\d{2}-\d{2}T[^\s|;,]+)/i,
      /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/,
    ]),
  };
}

/**
 * Parse Artix-7 status fields from log rows.
 */
export function extractArtix7Status(
  rows: string[],
  stream: TraceStreamFields | null,
): Artix7Status {
  const context = /ARTIX[_\s-]?7/i;
  return {
    device: pickFieldInContext(rows, context, [
      /device[=:\s/]+([^|;,]+)/i,
      /(Artix-7[^|;,]+)/i,
    ]),
    sramConfig: pickFieldInContext(rows, context, [/sram[_\s-]?config[=:\s/]+([^|;,]+)/i]),
    gateClamp: pickFieldInContext(rows, context, [/gate[_\s-]?clamp[=:\s/]+([^\s|;,]+)/i]),
    wnsSlack:
      pickFieldInContext(rows, context, [/wns[_\s-]?slack[=:\s/]+([^\s|;,]+)/i]) ??
      streamWnsSlack(stream),
    lastFlash: pickFieldInContext(rows, context, [/last[_\s-]?flash[=:\s/]+([^|;,]+)/i]),
  };
}

/**
 * Parse reflash daemon fields from log rows.
 */
export function extractReflashDaemon(
  rows: string[],
  stream: TraceStreamFields | null,
): ReflashDaemon {
  const context = /REFLASH[_\s-]?DAEMON/i;
  return {
    status: pickFieldInContext(rows, context, [/status[=:\s/]+([^|;,]+)/i]),
    recoveryTarget:
      pickFieldInContext(rows, context, [/recovery[_\s-]?target[=:\s/]+([^\s|;,]+)/i]) ??
      streamRecoveryDuration(stream),
    nullBuffer: pickFieldInContext(rows, context, [/null[_\s-]?buffer[=:\s/]+([^|;,]+)/i]),
    lastSoak: pickFieldInContext(rows, context, [/last[_\s-]?soak[=:\s/]+([^|;,]+)/i]),
  };
}

/**
 * Parse serial bridge fields from log rows.
 */
export function extractSerialBridge(rows: string[]): SerialBridge {
  const context = /SERIAL[_\s-]?BRIDGE|PORT[_\s-]?804[45]/i;
  const note = extractStandaloneNote(rows);
  return {
    port8044: pickFieldInContext(rows, context, [
      /port[_\s-]?8044[=:\s/]+([^|;,]+)/i,
      /8044[=:\s/]+([^|;,]+)/i,
    ]),
    port8045: pickFieldInContext(rows, context, [
      /port[_\s-]?8045[=:\s/]+([^|;,]+)/i,
      /8045[=:\s/]+([^|;,]+)/i,
    ]),
    comTerminal: pickFieldInContext(rows, context, [/com[_\s-]?terminal[=:\s/]+([^\s|;,]+)/i]),
    note,
  };
}

function serialBridgeLabel(bridge: SerialBridge): string | null {
  const parts = [bridge.port8044, bridge.port8045, bridge.comTerminal].filter(
    (value) => value?.trim(),
  );
  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * Count recovery event markers present in log rows.
 */
export function countRecoveryEventMarkers(rows: string[]): number {
  let count = 0;
  for (const line of rows) {
    if (/EVT_RECOVERY_|RECOVERY[_\s-]?EVENT/i.test(line)) {
      count += 1;
    }
  }
  return count;
}

/**
 * Parse structured recovery event entries from log rows.
 */
export function extractRecoveryEvents(
  rows: string[],
  stream: TraceStreamFields | null,
  artix7: Artix7Status,
  reflashDaemon: ReflashDaemon,
  serialBridge: SerialBridge,
): RecoveryEventEntry[] {
  const entries: RecoveryEventEntry[] = [];
  const bridgeLabel = serialBridgeLabel(serialBridge);
  const fpgaFamily = artix7.device?.trim() ?? null;
  const daemonState = reflashDaemon.status?.trim() ?? null;

  for (let index = 0; index < rows.length; index += 1) {
    if (!/EVT_RECOVERY_|RECOVERY[_\s-]?EVENT/i.test(rows[index])) {
      continue;
    }
    const window = rows.slice(Math.max(0, index - 2), index + 4);
    const evtId = pickField(window, [
      /evt[_\s-]?id[=:\s/]+([^\s|;,]+)/i,
      /(EVT_RECOVERY_[^\s|;,]+)/i,
    ]);
    const trigger = pickField(window, [
      /trigger[=:\s/]+([^\s|;,]+)/i,
      /(BROWNOUT_[^\s|;,]+)/i,
    ]);
    const lastEventAt = pickField(window, [
      /timestamp[=:\s/]+(\d{4}-\d{2}-\d{2}T[^\s|;,]+)/i,
      /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/,
    ]);

    if (!evtId && !trigger && !lastEventAt) {
      continue;
    }

    entries.push({
      evtId,
      trigger,
      fpgaFamily,
      daemonState,
      serialBridge: bridgeLabel,
      lastEventAt,
    });
  }

  const last = extractLastRecoveryEvent(rows, stream);
  const lastHasData = Boolean(
    last.evtId?.trim() ||
      last.trigger?.trim() ||
      last.timestamp?.trim() ||
      last.result?.trim(),
  );

  if (entries.length === 0 && lastHasData) {
    entries.push({
      evtId: last.evtId,
      trigger: last.trigger,
      fpgaFamily,
      daemonState,
      serialBridge: bridgeLabel,
      lastEventAt: last.timestamp,
    });
  }

  return entries;
}

/**
 * Build structured trace payload from sanitized log rows.
 */
export function buildStructuredTracePayload(
  base: Omit<
    HardwareTraceResponse,
    | "mode"
    | "standaloneNote"
    | "recoveryClock"
    | "eventCount"
    | "recoveryEvents"
    | "lastRecoveryEvent"
    | "artix7"
    | "reflashDaemon"
    | "serialBridge"
  >,
): HardwareTraceResponse {
  const mode: TraceMode = base.rows.length > 0 ? "LIVE" : "STANDALONE";
  const artix7 = extractArtix7Status(base.rows, base.stream);
  const reflashDaemon = extractReflashDaemon(base.rows, base.stream);
  const serialBridge = extractSerialBridge(base.rows);
  const recoveryEvents = extractRecoveryEvents(
    base.rows,
    base.stream,
    artix7,
    reflashDaemon,
    serialBridge,
  );
  const markerCount = countRecoveryEventMarkers(base.rows);

  return {
    ...base,
    mode,
    standaloneNote: extractStandaloneNote(base.rows),
    recoveryClock: extractRecoveryClock(base.stream, base.rows),
    eventCount: Math.max(markerCount, recoveryEvents.length),
    recoveryEvents,
    lastRecoveryEvent: extractLastRecoveryEvent(base.rows, base.stream),
    artix7,
    reflashDaemon,
    serialBridge,
  };
}

const STANDALONE_STATUS =
  "[STANDALONE_MODE] Bench serial required on 8044/8045";

function readString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function formatSeconds(value: number | null): string | null {
  if (value === null) {
    return null;
  }
  return `${value}s`;
}

function nestedRecord(
  root: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const value = root[key];
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function pickString(
  obj: Record<string, unknown>,
  snake: string,
  camel: string,
): string | null {
  return readString(obj[snake]) ?? readString(obj[camel]);
}

/**
 * Unwrap `{ data: ... }` envelopes from carrier trace responses.
 */
export function extractTraceDataRoot(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const record = raw as Record<string, unknown>;
  if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
    return record.data as Record<string, unknown>;
  }
  return record;
}

/**
 * Detect carrier STANDALONE bench payloads (snake_case keys).
 */
export function isBackendStandaloneTrace(raw: unknown): boolean {
  const root = extractTraceDataRoot(raw);
  if (!root) {
    return false;
  }
  if (root.mode === "STANDALONE") {
    return true;
  }
  return (
    "recovery_clock_s" in root ||
    "serial_bridge" in root ||
    "reflash_daemon" in root ||
    "evt_id" in root
  );
}

/**
 * Detect normalized camelCase trace payloads from the local parser.
 */
export function isNormalizedTracePayload(raw: unknown): raw is HardwareTraceResponse {
  if (!raw || typeof raw !== "object") {
    return false;
  }
  const record = raw as Record<string, unknown>;
  return record.mode === "LIVE" || record.mode === "STANDALONE";
}

/**
 * Map snake_case carrier trace payloads into the frontend contract.
 */
export function normalizeBackendTracePayload(raw: unknown): HardwareTraceResponse {
  const root = extractTraceDataRoot(raw) ?? {};
  const artix7Raw = nestedRecord(root, "artix7");
  const serialRaw = nestedRecord(root, "serial_bridge");
  const daemonRaw = nestedRecord(root, "reflash_daemon");

  const recoveryClockS = readNumber(root.recovery_clock_s);
  const recoveryTargetS = readNumber(daemonRaw.recovery_target_s);

  const artix7: Artix7Status = {
    device: pickString(artix7Raw, "device", "device"),
    sramConfig: pickString(artix7Raw, "sram_config", "sramConfig"),
    gateClamp: pickString(artix7Raw, "gate_clamp", "gateClamp"),
    wnsSlack: pickString(artix7Raw, "wns_slack", "wnsSlack"),
    lastFlash: pickString(artix7Raw, "last_flash", "lastFlash"),
  };

  const note =
    readString(root.note) ??
    readString(root.standalone_note) ??
    readString(root.standaloneNote);

  const serialBridge: SerialBridge = {
    port8044:
      pickString(serialRaw, "port_8044", "port8044") ??
      pickString(serialRaw, "port8044", "port8044"),
    port8045:
      pickString(serialRaw, "port_8045", "port8045") ??
      pickString(serialRaw, "port8045", "port8045"),
    comTerminal:
      pickString(serialRaw, "com_terminal", "comTerminal") ??
      pickString(serialRaw, "comTerminal", "comTerminal"),
    note,
  };

  const reflashDaemon: ReflashDaemon = {
    status: pickString(daemonRaw, "status", "status"),
    recoveryTarget:
      formatSeconds(recoveryTargetS) ??
      pickString(daemonRaw, "recovery_target", "recoveryTarget"),
    nullBuffer: pickString(daemonRaw, "null_buffer", "nullBuffer"),
    lastSoak: pickString(daemonRaw, "last_soak", "lastSoak"),
  };

  const evtId = readString(root.evt_id) ?? readString(root.evtId);
  const trigger = readString(root.trigger);
  const lastEventAt =
    readString(root.last_event_at) ??
    readString(root.lastEventAt) ??
    readString(root.last_eventAt);

  const eventCount =
    readNumber(root.event_count) ?? readNumber(root.eventCount) ?? 0;

  const lastRecoveryEvent: LastRecoveryEvent = {
    evtId,
    trigger,
    reflash: null,
    wnsSlack: artix7.wnsSlack,
    duration: formatSeconds(recoveryClockS),
    result: null,
    timestamp: lastEventAt,
  };

  const mode: TraceMode = root.mode === "LIVE" ? "LIVE" : "STANDALONE";
  const controlStatus =
    readString(root.control_plane_status) ??
    readString(root.controlPlaneStatus);
  const status =
    controlStatus ??
    readString(root.status) ??
    (mode === "STANDALONE" ? STANDALONE_STATUS : "INITIALIZING_CARRIER_LINK //");

  const bridgeLabel = [serialBridge.port8044, serialBridge.port8045, serialBridge.comTerminal]
    .filter((value) => value?.trim())
    .join(" · ") || null;

  const recoveryEvents: RecoveryEventEntry[] = [];
  if (evtId || trigger || lastEventAt) {
    recoveryEvents.push({
      evtId,
      trigger,
      fpgaFamily: artix7.device,
      daemonState: reflashDaemon.status,
      serialBridge: bridgeLabel,
      lastEventAt,
    });
  }

  const rows = Array.isArray(root.rows)
    ? (root.rows as string[]).filter((line) => typeof line === "string")
    : [];

  return {
    status,
    rows,
    stream:
      root.stream && typeof root.stream === "object"
        ? (root.stream as TraceStreamFields)
        : null,
    offline: root.offline === true,
    offlineMessage:
      readString(root.offlineMessage) ??
      readString(root.offline_message) ??
      "",
    mode,
    standaloneNote: note,
    recoveryClock: formatSeconds(recoveryClockS),
    eventCount: Math.max(eventCount, recoveryEvents.length),
    recoveryEvents,
    lastRecoveryEvent,
    artix7,
    reflashDaemon,
    serialBridge,
  };
}
