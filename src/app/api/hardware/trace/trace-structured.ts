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
