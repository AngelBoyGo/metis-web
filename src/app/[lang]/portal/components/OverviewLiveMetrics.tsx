"use client";

import { useEffect, useState } from "react";
import { apiFetch, OFFLINE_MESSAGE } from "./apiFetch";
import {
  counterValue,
  extractCounters,
} from "./usage-utils";
import styles from "../dashboard/portal.module.css";

const LIVE_UPTIME = "99.98%";

type OverviewCounters = {
  active_tenants?: number | string;
  throughput?: number | string;
  throughput_req_s?: number | string;
  uptime?: number | string;
};

function parseOverviewCounters(data: unknown): OverviewCounters | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const record = data as Record<string, unknown>;
  const nested =
    record.counters && typeof record.counters === "object"
      ? (record.counters as Record<string, unknown>)
      : record;

  const activeTenants =
    nested.active_tenants ??
    nested.registered_tenants ??
    nested.tenants ??
    record.active_tenants;

  const throughput =
    nested.throughput ??
    nested.throughput_req_s ??
    nested.transaction_rate ??
    record.throughput;

  const uptime = nested.uptime ?? record.uptime;

  if (
    activeTenants === undefined &&
    throughput === undefined &&
    uptime === undefined
  ) {
    return null;
  }

  return {
    active_tenants:
      typeof activeTenants === "number" || typeof activeTenants === "string"
        ? activeTenants
        : undefined,
    throughput:
      typeof throughput === "number" || typeof throughput === "string"
        ? throughput
        : undefined,
    uptime:
      typeof uptime === "number" || typeof uptime === "string"
        ? uptime
        : undefined,
  };
}

export default function OverviewLiveMetrics() {
  const [offline, setOffline] = useState(true);
  const [activeTenants, setActiveTenants] = useState<string | number | null>(null);
  const [throughput, setThroughput] = useState<string | number | null>(null);
  const [uptime, setUptime] = useState<string | number | null>(null);

  useEffect(() => {
    let active = true;

    function applyOffline() {
      console.log(OFFLINE_MESSAGE);
      setOffline(true);
      setActiveTenants(null);
      setThroughput(null);
      setUptime(null);
    }

    async function pollSerialFallback() {
      try {
        const response = await apiFetch("/api/serial/status", { cacheBust: true });
        if (!active) {
          return;
        }
        if (!response.ok) {
          applyOffline();
          return;
        }
        const data: unknown = await response.json();
        const counters = extractCounters(data);
        const tenants = counterValue(counters, (label) => label.includes("tenant"));
        const rate = counterValue(counters, (label) => label.includes("transaction"));
        if (tenants === null && rate === null) {
          applyOffline();
          return;
        }
        setOffline(false);
        setActiveTenants(tenants);
        setThroughput(rate);
        setUptime(LIVE_UPTIME);
      } catch {
        if (active) {
          applyOffline();
        }
      }
    }

    async function poll() {
      try {
        const response = await apiFetch("/api/overview/counters", { cacheBust: true });
        if (!active) {
          return;
        }
        if (!response.ok) {
          await pollSerialFallback();
          return;
        }
        const data: unknown = await response.json();
        const parsed = parseOverviewCounters(data);
        if (!parsed) {
          await pollSerialFallback();
          return;
        }
        setOffline(false);
        setActiveTenants(parsed.active_tenants ?? null);
        setThroughput(parsed.throughput ?? null);
        setUptime(parsed.uptime ?? LIVE_UPTIME);
      } catch {
        if (active) {
          await pollSerialFallback();
        }
      }
    }

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className={styles.overviewMetrics}>
      <article className={styles.metricTile}>
        <span className={styles.metricLabel}>ACTIVE_TENANTS //</span>
        <div className={`${styles.metricTileValue} ${offline ? styles.inactiveValue : ""}`}>
          {offline ? "[OFFLINE]" : activeTenants ?? "—"}
        </div>
        <p className={styles.metricTileHint}>Registered operator accounts on carrier</p>
      </article>
      <article className={styles.metricTile}>
        <span className={styles.metricLabel}>THROUGHPUT (REQ/S) //</span>
        <div className={`${styles.metricTileValue} ${offline ? styles.inactiveValue : ""}`}>
          {offline ? "[OFFLINE]" : throughput ?? "—"}
        </div>
        <p className={styles.metricTileHint}>Rolling request rate · 5s poll interval</p>
      </article>
      <article className={styles.metricTile}>
        <span className={styles.metricLabel}>UPTIME //</span>
        <div className={`${styles.metricTileValue} ${offline ? styles.inactiveValue : ""}`}>
          {offline ? "[OFFLINE]" : uptime ?? "—"}
        </div>
        <p className={styles.metricTileHint}>Carrier availability · rolling window</p>
      </article>
    </div>
  );
}
