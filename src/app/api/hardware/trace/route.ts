import { open } from "fs/promises";
import { NextResponse } from "next/server";
import { buildStructuredTracePayload } from "./trace-structured";

export type {
  Artix7Status,
  HardwareTraceResponse,
  LastRecoveryEvent,
  ReflashDaemon,
  SerialBridge,
  TraceMode,
} from "./trace-structured";

export const dynamic = "force-dynamic";

const LOG_PATH =
  process.env.REFLASH_LOG_PATH ?? "/app/site/logs/reflash_daemon.log";
const INITIALIZING_STATUS = "INITIALIZING_CARRIER_LINK //";
const ACTIVE_STATUS = "CARRIER_LINK_ACTIVE //";
const ANALYTICS_SIGNATURE = "[ANALYTICS_METRIC_TRACE_STREAM //]";
const OFFLINE_MESSAGE = "[OFFLINE] TELEMETRY_CARRIER_LINK_DISCONNECTED //";
const TAIL_ROWS = 50;

export type TraceStreamFields = {
  processingSpeed: string | null;
  dataThroughput: string | null;
  worstNegativeSlackSetupMargin: string | null;
};

/**
 * Strip ASCII control characters from a log line.
 */
function sanitizeLine(line: string): string {
  return line.replace(/[\x00-\x1F\x7F]/g, "").trim();
}

/**
 * Parse ANALYTICS_METRIC_TRACE_STREAM fields from a single log line.
 */
export function parseAnalyticsTraceLine(line: string): TraceStreamFields | null {
  const markerIndex = line.indexOf(ANALYTICS_SIGNATURE);
  if (markerIndex < 0) {
    return null;
  }

  const payload = line.slice(markerIndex + ANALYTICS_SIGNATURE.length).trim();
  const fields: TraceStreamFields = {
    processingSpeed: null,
    dataThroughput: null,
    worstNegativeSlackSetupMargin: null,
  };

  const speedMatch = payload.match(/processing\s+speed[=:\s]+([^|;,]+)/i);
  const throughputMatch = payload.match(/data\s+throughput[=:\s]+([^|;,]+)/i);
  const slackMatch = payload.match(
    /worst\s+negative\s+slack\s+setup\s+margin[=:\s]+([^|;,]+)/i,
  );

  if (speedMatch) {
    fields.processingSpeed = speedMatch[1].trim();
  }
  if (throughputMatch) {
    fields.dataThroughput = throughputMatch[1].trim();
  }
  if (slackMatch) {
    fields.worstNegativeSlackSetupMargin = slackMatch[1].trim();
  }

  if (
    fields.processingSpeed ||
    fields.dataThroughput ||
    fields.worstNegativeSlackSetupMargin
  ) {
    return fields;
  }

  return null;
}

/**
 * Scan tail rows for the latest structured analytics trace line.
 */
export function extractLatestStream(rows: string[]): TraceStreamFields | null {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const parsed = parseAnalyticsTraceLine(rows[index]);
    if (parsed) {
      return parsed;
    }
  }
  return null;
}

/**
 * Read the reflash daemon log and return the last non-empty sanitized rows.
 */
async function readTraceTail(): Promise<{
  status: string;
  rows: string[];
  stream: TraceStreamFields | null;
  offline: boolean;
  offlineMessage: string;
}> {
  let handle: Awaited<ReturnType<typeof open>> | null = null;
  try {
    handle = await open(LOG_PATH, "r");
    const raw = await handle.readFile("utf8");
    const rows = raw
      .split(/\r?\n/)
      .map(sanitizeLine)
      .filter((line) => line.length > 0)
      .slice(-TAIL_ROWS);

    const stream = extractLatestStream(rows);
    const disconnected = rows.length === 0;

    return {
      status: disconnected ? INITIALIZING_STATUS : ACTIVE_STATUS,
      rows,
      stream,
      offline: disconnected,
      offlineMessage: OFFLINE_MESSAGE,
    };
  } catch {
    return {
      status: INITIALIZING_STATUS,
      rows: [],
      stream: null,
      offline: true,
      offlineMessage: OFFLINE_MESSAGE,
    };
  } finally {
    await handle?.close();
  }
}

export async function GET() {
  const payload = buildStructuredTracePayload(await readTraceTail());

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}
