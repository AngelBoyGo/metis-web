const ANALYTICS_SIGNATURE = "[ANALYTICS_METRIC_TRACE_STREAM //]";

export type TraceStreamFields = {
  processingSpeed: string | null;
  dataThroughput: string | null;
  worstNegativeSlackSetupMargin: string | null;
};

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
 * Extract recovery clock label from trace stream fields or raw rows.
 */
export function extractRecoveryClock(
  stream: TraceStreamFields | null,
  rows: string[],
): string | null {
  if (stream?.processingSpeed) {
    const match = stream.processingSpeed.match(/([\d.]+)\s*seconds?/i);
    if (match) {
      return `${match[1]} Seconds`;
    }
    return stream.processingSpeed;
  }

  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const line = rows[index];
    const recoveryMatch = line.match(/recovery[=:\s]+([\d.]+\s*seconds?)/i);
    if (recoveryMatch) {
      return recoveryMatch[1].replace(/\s+/g, " ");
    }
  }

  return null;
}
