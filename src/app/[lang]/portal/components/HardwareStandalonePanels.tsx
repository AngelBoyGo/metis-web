"use client";

import { useEffect, useState } from "react";
import type { HardwareTraceResponse } from "@/app/api/hardware/trace/trace-structured";
import { apiFetch } from "./apiFetch";
import {
  Artix7StatusPanel,
  isHardwareTraceResponse,
  ReflashDaemonPanel,
  SerialBridgePanel,
} from "./trace-standalone-shared";
import styles from "../dashboard/portal.module.css";

const POLL_MS = 6000;

export default function HardwareStandalonePanels() {
  const [trace, setTrace] = useState<HardwareTraceResponse | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const response = await apiFetch("/api/hardware/trace", { cacheBust: true });
        if (!active) {
          return;
        }
        if (!response.ok) {
          return;
        }
        const data: unknown = await response.json();
        if (!active) {
          return;
        }
        if (isHardwareTraceResponse(data)) {
          setTrace(data);
        }
      } catch {
        if (active) {
          setTrace(null);
        }
      }
    }

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, POLL_MS);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (trace?.mode !== "STANDALONE") {
    return null;
  }

  return (
    <div className={`${styles.proofGrid} ${styles.standaloneStack}`}>
      <Artix7StatusPanel artix7={trace.artix7} mode={trace.mode} />
      <ReflashDaemonPanel reflashDaemon={trace.reflashDaemon} mode={trace.mode} />
      <SerialBridgePanel serialBridge={trace.serialBridge} mode={trace.mode} />
    </div>
  );
}
