"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";

type Counter = {
  label: string;
  value: string | number;
};

const OFFLINE_MESSAGE = "[OFFLINE] TELEMETRY_CARRIER_LINK_DISCONNECTED //";

const OFFLINE_COUNTERS: Counter[] = [
  { label: "REGISTERED_TENANTS //", value: 0 },
  { label: "GROSS_BYTES_PROCESSED //", value: "0 B" },
  { label: "TRANSACTION_RATE //", value: "0.00 req/sec" },
];

function formatLabel(key: string): string {
  return key.replace(/_/g, " ").toUpperCase();
}

function extractCounters(data: unknown): Counter[] {
  try {
    if (!data || typeof data !== "object") {
      return [];
    }

    if (Array.isArray(data)) {
      const sums: Record<string, number> = {};
      for (const row of data) {
        if (!row || typeof row !== "object") {
          continue;
        }
        for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
          if (typeof value === "number") {
            sums[key] = (sums[key] ?? 0) + value;
          }
        }
      }
      return Object.entries(sums).map(([key, value]) => ({
        label: formatLabel(key),
        value,
      }));
    }

    const record = data as Record<string, unknown>;
    const nested = record.counters ?? record.billing ?? record.metrics;

    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return Object.entries(nested as Record<string, unknown>).map(([key, value]) => ({
        label: formatLabel(key),
        value: typeof value === "number" || typeof value === "string" ? value : String(value),
      }));
    }

    return Object.entries(record)
      .filter(([, value]) => typeof value === "number" || typeof value === "string")
      .map(([key, value]) => ({
        label: formatLabel(key),
        value: value as string | number,
      }));
  } catch {
    return [];
  }
}

function applyOfflineState(
  setOffline: (value: boolean) => void,
  setCounters: (value: Counter[]) => void,
  setConsoleLog: (value: string) => void,
) {
  console.log(OFFLINE_MESSAGE);
  setOffline(true);
  setCounters(OFFLINE_COUNTERS);
  setConsoleLog(OFFLINE_MESSAGE);
}

export default function DashboardPage() {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [offline, setOffline] = useState(false);
  const [consoleLog, setConsoleLog] = useState("");
  const [traceLoading, setTraceLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function pollStatus() {
      try {
        const response = await fetch(`/api/serial/status?_ts=${Date.now()}`);
        if (!active) {
          return;
        }
        if (!response.ok) {
          applyOfflineState(setOffline, setCounters, setConsoleLog);
          return;
        }
        let data: unknown;
        try {
          data = await response.json();
        } catch {
          applyOfflineState(setOffline, setCounters, setConsoleLog);
          return;
        }
        if (!active) {
          return;
        }
        const nextCounters = extractCounters(data);
        setCounters(nextCounters);
        setOffline(false);
      } catch {
        if (active) {
          applyOfflineState(setOffline, setCounters, setConsoleLog);
        }
      }
    }

    const timeout = window.setTimeout(() => {
      void pollStatus();
    }, 0);
    const interval = window.setInterval(() => {
      void pollStatus();
    }, 5000);

    return () => {
      active = false;
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  function formatTraceConsole(data: Record<string, unknown>): string {
    const offlineFlag = data.offline === true;
    const offlineMessage =
      typeof data.offlineMessage === "string" ? data.offlineMessage : OFFLINE_MESSAGE;

    if (offlineFlag) {
      return offlineMessage;
    }

    const status = typeof data.status === "string" ? data.status : "";
    const rows = Array.isArray(data.rows)
      ? data.rows.filter((row): row is string => typeof row === "string")
      : [];
    const stream =
      data.stream && typeof data.stream === "object" && !Array.isArray(data.stream)
        ? (data.stream as Record<string, unknown>)
        : null;

    const lines: string[] = [];
    if (status) {
      lines.push(`>> ${status}`);
    }

    if (stream) {
      const speed = stream.processingSpeed ?? stream.processing_speed;
      const throughput = stream.dataThroughput ?? stream.data_throughput;
      const slack =
        stream.worstNegativeSlackSetupMargin ?? stream.worst_negative_slack_setup_margin;

      if (typeof speed === "string" && speed.length > 0) {
        lines.push(`processing speed: ${speed}`);
      }
      if (typeof throughput === "string" && throughput.length > 0) {
        lines.push(`data throughput: ${throughput}`);
      }
      if (typeof slack === "string" && slack.length > 0) {
        lines.push(`Worst Negative Slack setup margin: ${slack}`);
      }
    }

    if (lines.length === 0 && rows.length === 0) {
      return offlineMessage;
    }

    if (rows.length > 0) {
      if (lines.length > 0) {
        lines.push("---");
      }
      lines.push(...rows);
    }

    return lines.join("\n");
  }

  async function handleTrace() {
    setTraceLoading(true);
    setConsoleLog(">> INITIALIZING LINE VALIDATION...\n");
    try {
      const response = await fetch(`/api/hardware/trace?_ts=${Date.now()}`);
      if (!response.ok) {
        setConsoleLog(OFFLINE_MESSAGE);
        return;
      }
      let data: unknown;
      try {
        data = await response.json();
      } catch {
        setConsoleLog(OFFLINE_MESSAGE);
        return;
      }
      if (!data || typeof data !== "object") {
        setConsoleLog(OFFLINE_MESSAGE);
        return;
      }
      setConsoleLog(formatTraceConsole(data as Record<string, unknown>));
    } catch {
      setConsoleLog(OFFLINE_MESSAGE);
    } finally {
      setTraceLoading(false);
    }
  }

  const displayCounters = offline ? OFFLINE_COUNTERS : counters;

  return (
    <div className={styles.mainframe}>
      <header className={styles.header}>
        METIS // OPERATIONAL_CONTROL_CENTER_SEC_07
      </header>

      <section className={styles.grid}>
        {displayCounters.map((counter) => (
          <div
            key={counter.label}
            className={`${styles.card} ${offline ? styles.inactiveCard : ""}`}
          >
            <div
              className={`${styles.cardLabel} ${offline ? styles.inactiveLabel : ""}`}
            >
              {counter.label}
            </div>
            <div
              className={`${styles.cardValue} ${offline ? styles.inactiveValue : ""}`}
            >
              {counter.value}
            </div>
          </div>
        ))}
      </section>

      <section className={styles.consoleContainer}>
        <div className={styles.consoleHeader}>
          <span className={styles.consoleTitle}>HARDWARE_TRACE_CONSOLE</span>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => void handleTrace()}
            disabled={traceLoading}
          >
            INITIALIZE_LINE_VALIDATION //
          </button>
        </div>
        <pre className={styles.consoleLog}>
          {consoleLog || ">> awaiting trace initialization..."}
        </pre>
      </section>
    </div>
  );
}
