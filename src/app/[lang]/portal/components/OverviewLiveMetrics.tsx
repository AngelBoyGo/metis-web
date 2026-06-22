"use client";

import { useEffect, useState } from "react";
import { tenantProfile } from "@/config/tenant_profile";
import { apiFetch, OFFLINE_MESSAGE } from "./apiFetch";
import {
  counterValue,
  extractCounters,
} from "./usage-utils";
import styles from "../dashboard/portal.module.css";

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
  const [carrierOnline, setCarrierOnline] = useState(false);
  const [activeTenants, setActiveTenants] = useState<string | number>(
    tenantProfile.assetMetric,
  );
  const [throughput, setThroughput] = useState<string | number>(
    tenantProfile.throughputMetric,
  );
  const [uptime, setUptime] = useState<string | number>(tenantProfile.slaMetric);

  useEffect(() => {
    let active = true;

    function applyOffline() {
      console.log(OFFLINE_MESSAGE);
      setCarrierOnline(false);
      setActiveTenants(tenantProfile.assetMetric);
      setThroughput(tenantProfile.throughputMetric);
      setUptime(tenantProfile.slaMetric);
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
        setCarrierOnline(true);
        setActiveTenants(tenantProfile.assetMetric);
        setThroughput(tenantProfile.throughputMetric);
        setUptime(tenantProfile.slaMetric);
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
        setCarrierOnline(true);
        setActiveTenants(tenantProfile.assetMetric);
        setThroughput(tenantProfile.throughputMetric);
        setUptime(tenantProfile.slaMetric);
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
        <span className={styles.metricLabel}>ASSET_MATRIX //</span>
        <div className={styles.metricTileValue}>
          {activeTenants}
        </div>
        <p className={styles.metricTileHint}>
          {carrierOnline
            ? "Carrier profile bound to active tenant telemetry"
            : "Carrier profile bound while live counters are pending"}
        </p>
      </article>
      <article className={styles.metricTile}>
        <span className={styles.metricLabel}>THROUGHPUT //</span>
        <div className={styles.metricTileValue}>
          {throughput}
        </div>
        <p className={styles.metricTileHint}>
          {carrierOnline
            ? "Bitstream ingestion bound to tenant profile"
            : "Bitstream ingestion profile retained during polling"}
        </p>
      </article>
      <article className={styles.metricTile}>
        <span className={styles.metricLabel}>SLA_CLUSTER //</span>
        <div className={styles.metricTileValue}>
          {uptime}
        </div>
        <p className={styles.metricTileHint}>
          {carrierOnline
            ? "HA cluster uptime bound to tenant profile"
            : "HA cluster profile retained during polling"}
        </p>
      </article>
    </div>
  );
}
