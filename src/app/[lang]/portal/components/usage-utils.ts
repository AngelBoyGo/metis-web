export const FLAT_TIER_RATE = 0.000002;
export const USAGE_ALLOCATION_BYTES = 100 * 1_000_000;
export const HISTORY_POINTS = 12;

export type Counter = {
  label: string;
  value: string | number;
};

export function formatCounterLabel(key: string): string {
  return `${key.replace(/_/g, " ").toUpperCase()} //`;
}

export function extractByteVolume(data: unknown): number | null {
  try {
    if (!data || typeof data !== "object") {
      return null;
    }

    const record = data as Record<string, unknown>;

    if (typeof record.bytes === "number") {
      return record.bytes;
    }
    if (typeof record.byte_volume === "number") {
      return record.byte_volume;
    }

    const aliases = [record.volume_bytes, record.total_bytes];
    for (const value of aliases) {
      if (typeof value === "number") {
        return value;
      }
    }

    const nested = record.counters ?? record.billing ?? record.metrics;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      for (const [key, value] of Object.entries(nested as Record<string, unknown>)) {
        if (
          typeof value === "number" &&
          (key.includes("byte") || key.includes("volume") || key.includes("data"))
        ) {
          return value;
        }
      }
    }

    if (record.counters && typeof record.counters === "object") {
      return 0;
    }

    return null;
  } catch {
    return null;
  }
}

export function extractCounters(data: unknown): Counter[] {
  try {
    if (!data || typeof data !== "object") {
      return [];
    }

    const record = data as Record<string, unknown>;
    const nested = record.counters ?? record.billing ?? record.metrics;

    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return Object.entries(nested as Record<string, unknown>).map(([key, value]) => ({
        label: formatCounterLabel(key),
        value: typeof value === "number" || typeof value === "string" ? value : String(value),
      }));
    }

    return [];
  } catch {
    return [];
  }
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) {
    return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
  }
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(2)} MB`;
  }
  if (bytes >= 1_000) {
    return `${(bytes / 1_000).toFixed(2)} KB`;
  }
  return `${bytes} B`;
}

export function formatCurrency(bytes: number): string {
  const estimate = bytes * FLAT_TIER_RATE;
  return `$${estimate.toFixed(4)}`;
}

export function formatSyncTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function billingCycleLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function counterValue(
  counters: Counter[],
  matcher: (label: string) => boolean,
): string | number | null {
  const hit = counters.find((entry) => matcher(entry.label.toLowerCase()));
  return hit ? hit.value : null;
}
