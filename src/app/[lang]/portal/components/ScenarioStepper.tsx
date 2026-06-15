"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./apiFetch";
import styles from "../dashboard/portal.module.css";

type ScenarioField = {
  key: string;
  value: string;
};

type ScenarioStep = {
  id: string;
  label: string;
  fields: ScenarioField[];
  output: string;
  progress: number | null;
  progressComplete?: boolean;
};

const FALLBACK_STEPS: ScenarioStep[] = [
  {
    id: "onboarding",
    label: "ONBOARDING",
    fields: [
      {
        key: "ACTION",
        value: "Steve opens metis.gold/en/portal/login · enterprise registration",
      },
      {
        key: "STEALTH_GATE",
        value: "Unauthenticated scan of /dashboard → notFound() → HTTP 404",
      },
      {
        key: "RESULT",
        value: "Session cookie issued · operator record created in metis.db",
      },
    ],
    output:
      "[STAGE_01] operator=steve@autonomouslogistics.io session=ACTIVE · dashboard_scan_blocked=YES · http_status=404_stealth",
    progress: null,
  },
  {
    id: "token",
    label: "TOKEN ISSUANCE",
    fields: [
      { key: "KEY_PREFIX", value: "mgk_live_au_" },
      { key: "TTL", value: "3600s · one-time reveal" },
      {
        key: "SCOPE",
        value: "ingest:write · ledger:read · vault:rotate",
      },
      { key: "HASH", value: "sha256:9c4e2a1f… · at rest" },
    ],
    output:
      "[STAGE_02] prefix=mgk_live_au_… scope=ingest:write, ledger:read plaintext_window=OPEN · ttl=3600s credential_hash=sha256:9c4e2a1f… · stored=YES",
    progress: 28,
  },
  {
    id: "submit",
    label: "JOB SUBMIT",
    fields: [
      { key: "JOB_ID", value: "JOB_AU_7939_X9" },
      { key: "CARRIER_LANE", value: "LANE_05_AXIS_CLAMP" },
      { key: "FILTER_COEFFICIENT", value: "LSB <= 2" },
      { key: "QUEUE", value: "lane_primary · priority=NORMAL" },
    ],
    output:
      "[STAGE_03] job_id=JOB_AU_7939_X9 lane=LANE_05_AXIS_CLAMP filter_coeff=LSB<=2 · queue=lane_primary state=QUEUED · bytes_in=0 · progress=45%",
    progress: 45,
  },
  {
    id: "status",
    label: "STATUS BAR",
    fields: [
      { key: "JOB_ID", value: "JOB_AU_7939_X9" },
      { key: "CARRIER_LANE", value: "LANE_05_AXIS_CLAMP" },
      { key: "BYTES_PROCESSED", value: "4,218,560" },
      { key: "TRANSACTION_RATE", value: "12.4 req/s" },
    ],
    output:
      "[STAGE_04] job_id=JOB_AU_7939_X9 progress=67% bytes_processed=4218560 · poll_interval=5s transaction_rate=12.4 req/s · lane=LANE_05_AXIS_CLAMP",
    progress: 67,
  },
  {
    id: "download",
    label: "DOWNLOAD ARTIFACT",
    fields: [
      { key: "JOB_ID", value: "JOB_AU_7939_X9" },
      { key: "FILE", value: "seattle_lidar_trajectory_au_compressed.bin" },
      {
        key: "SIZE",
        value: "847 MB (compressed from 4 GB · ratio 4.72:1)",
      },
      {
        key: "CORRECTION",
        value: "AU radial offset applied · LSB filter pass confirmed",
      },
      { key: "CHECKSUM", value: "sha256:7f3a91c2… · verified" },
    ],
    output:
      "[STAGE_05] artifact=seattle_lidar_trajectory_au_compressed.bin size=847MB ratio=4.72:1 checksum=sha256:7f3a91c2… download=READY · correction=AU_radial",
    progress: 100,
  },
  {
    id: "revoke",
    label: "REVOKE RECEIPT",
    fields: [
      { key: "CREDENTIAL", value: "mgk_live_au_… · last4=9X2F" },
      { key: "REVOKE_ACTION", value: "POST /api/keys/revoke · hard delete" },
      {
        key: "LEDGER",
        value: "api_keys rows 1 → 0 · SHA-256 hash purged",
      },
    ],
    output:
      "[STAGE_06] revoke_id=RVK_AU_0041 credential=mgk_live_au_… rows_deleted=1 ledger_state=CLEAN · receipt=ISSUED",
    progress: null,
    progressComplete: true,
  },
];

type ApiStage = {
  id?: string;
  label?: string;
  fields?: ScenarioField[];
  output?: string;
  progress?: number | null;
  progressComplete?: boolean;
};

function normalizeStages(raw: unknown): ScenarioStep[] | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const list = Array.isArray(record.stages)
    ? record.stages
    : Array.isArray(raw)
      ? raw
      : null;

  if (!list || list.length === 0) {
    return null;
  }

  return list.map((entry, index) => {
    const stage = entry as ApiStage;
    const fallback = FALLBACK_STEPS[index] ?? FALLBACK_STEPS[FALLBACK_STEPS.length - 1];
    return {
      id: stage.id ?? fallback.id,
      label: stage.label ?? fallback.label,
      fields:
        Array.isArray(stage.fields) && stage.fields.length > 0
          ? stage.fields
          : fallback.fields,
      output: stage.output ?? fallback.output,
      progress:
        stage.progress !== undefined ? stage.progress : fallback.progress,
      progressComplete: stage.progressComplete ?? fallback.progressComplete,
    };
  });
}

type Props = {
  demoStep?: number;
};

export default function ScenarioStepper({ demoStep }: Props) {
  const [steps, setSteps] = useState<ScenarioStep[]>(FALLBACK_STEPS);
  const [activeStage, setActiveStage] = useState(demoStep ?? 1);
  const stepIndex = Math.min(Math.max(activeStage, 1), 6) - 1;
  const step = steps[stepIndex] ?? FALLBACK_STEPS[0];

  useEffect(() => {
    let active = true;

    async function loadStages() {
      try {
        const response = await apiFetch("/api/jobs/scenario/stages", {
          cacheBust: true,
        });
        if (!active) {
          return;
        }
        if (!response.ok) {
          return;
        }
        const data: unknown = await response.json();
        const normalized = normalizeStages(data);
        if (normalized && normalized.length > 0) {
          setSteps(normalized);
        }
      } catch {
        /* fallback stages remain active */
      }
    }

    void loadStages();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (demoStep !== undefined) {
      setActiveStage(demoStep);
    }
  }, [demoStep]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>CUSTOMER_SCENARIO //</div>
      <div className={styles.stepperTrack}>
        {steps.map((entry, index) => {
          const stageNum = index + 1;
          const done = stageNum < activeStage;
          const active = stageNum === activeStage;
          return (
            <button
              key={entry.id}
              type="button"
              className={`${styles.stepNode} ${done ? styles.stepDone : ""} ${active ? styles.stepActive : ""}`}
              onClick={() => setActiveStage(stageNum)}
            >
              <span className={styles.stepIndex}>
                {String(stageNum).padStart(2, "0")}
              </span>
              <span className={styles.stepLabel}>{entry.label} //</span>
            </button>
          );
        })}
      </div>
      <div className={styles.currentStageRow}>
        <span className={styles.metricLabel}>CURRENT_STAGE //</span>
        <span className={styles.currentStageName}>{step.label}</span>
      </div>
      <div className={`${styles.stepContextCard} ${styles.stepContextCardBelowTabs}`}>
        <span className={styles.metricLabel}>
          STAGE {String(activeStage).padStart(2, "0")} — {step.label} //
        </span>
        <dl className={styles.stepContextGrid}>
          {step.fields.map((field) => (
            <div key={field.key} className={styles.stepContextRow}>
              <dt>{field.key} //</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
        <span className={styles.metricLabel}>SIMULATED_OUTPUT //</span>
        <pre className={styles.stepContextOutput}>{step.output}</pre>
        {typeof step.progress === "number" ? (
          <>
            <div className={styles.stepProgressBar}>
              <div
                className={styles.stepProgressFill}
                style={{ width: `${step.progress}%` }}
              />
            </div>
            <div className={styles.stepProgressLabel}>
              PROGRESS // {step.progress}%
            </div>
          </>
        ) : step.progressComplete ? (
          <div className={styles.stepProgressLabel}>PROGRESS // complete</div>
        ) : null}
      </div>
    </section>
  );
}
