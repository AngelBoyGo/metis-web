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
  detail: string;
  fields: ScenarioField[];
  output: string;
  progress: number;
};

const FALLBACK_STEPS: ScenarioStep[] = [
  {
    id: "onboarding",
    label: "Onboarding",
    detail: "Operator account provisioned · session cookie issued · tenant lane reserved",
    fields: [
      { key: "OPERATOR", value: "steve@mfgbench.local" },
      { key: "TENANT_ID", value: "TNT-AU-7939" },
      { key: "SESSION", value: "sess_8f2a91c4 · httponly · samesite=strict" },
      { key: "CARRIER_LANE", value: "LANE_05_AXIS_CLAMP · pending token" },
    ],
    output:
      "[STAGE_01] operator=steve@mfgbench.local tenant=TNT-AU-7939\nsession_cookie=issued · secure · httponly\nlane_reservation=LANE_05_AXIS_CLAMP · status=PROVISIONED",
    progress: 12,
  },
  {
    id: "token",
    label: "Token issuance",
    detail: "Credential generated · one-time plaintext window · SHA-256 hash stored",
    fields: [
      { key: "KEY_PREFIX", value: "mgk_live_au_" },
      { key: "TTL", value: "3600s · one-time reveal" },
      { key: "SCOPE", value: "ingest:write · ledger:read · vault:rotate" },
      { key: "HASH", value: "sha256:9c4e2a1f… · at rest" },
    ],
    output:
      "[STAGE_02] prefix=mgk_live_au_… scope=ingest:write,ledger:read\nplaintext_window=OPEN · ttl=3600s\ncredential_hash=sha256:9c4e2a1f… · stored=YES",
    progress: 28,
  },
  {
    id: "submit",
    label: "Job submit",
    detail: "Ingestion job queued on carrier lane · filter coefficient gate active",
    fields: [
      { key: "JOB_ID", value: "JOB_AU_7939_X9" },
      { key: "CARRIER_LANE", value: "LANE_05_AXIS_CLAMP" },
      { key: "FILTER_COEFFICIENT", value: "LSB <= 2" },
      { key: "QUEUE", value: "lane_primary · priority=NORMAL" },
    ],
    output:
      "[STAGE_03] job_id=JOB_AU_7939_X9 lane=LANE_05_AXIS_CLAMP\nfilter_coeff=LSB<=2 · queue=lane_primary\nstate=QUEUED · bytes_in=0 · progress=45%",
    progress: 45,
  },
  {
    id: "status",
    label: "Status bar",
    detail: "Poll interval active · byte counters accruing · lane telemetry live",
    fields: [
      { key: "JOB_ID", value: "JOB_AU_7939_X9" },
      { key: "CARRIER_LANE", value: "LANE_05_AXIS_CLAMP" },
      { key: "BYTES_PROCESSED", value: "4,218,560" },
      { key: "TRANSACTION_RATE", value: "12.4 req/s" },
    ],
    output:
      "[STAGE_04] job_id=JOB_AU_7939_X9 progress=67%\nbytes_processed=4218560 · poll_interval=5s\ntransaction_rate=12.4 req/s · lane=LANE_05_AXIS_CLAMP",
    progress: 67,
  },
  {
    id: "download",
    label: "Download artifact",
    detail: "Output bundle sealed · checksum attached · artifact ready for export",
    fields: [
      { key: "JOB_ID", value: "JOB_AU_7939_X9" },
      { key: "ARTIFACT", value: "bundle_au_7939_x9.tar.gz" },
      { key: "CHECKSUM", value: "sha256:e3b0c44298fc1c14…" },
      { key: "SIZE", value: "18.2 MB · sealed=YES" },
    ],
    output:
      "[STAGE_05] job_id=JOB_AU_7939_X9\nbundle=bundle_au_7939_x9.tar.gz · size=18.2 MB\nchecksum=sha256:e3b0c442… · sealed=YES · progress=100%",
    progress: 100,
  },
  {
    id: "revoke",
    label: "Revoke receipt",
    detail: "Credential revoked · db.delete · audit entry recorded",
    fields: [
      { key: "KEY_PREFIX", value: "mgk_live_au_" },
      { key: "RECEIPT_ID", value: "RCV-AU-0091" },
      { key: "AUDIT_REF", value: "AUD-2024-7939" },
      { key: "ROWS_PURGED", value: "1 → 0 · SHA-256 receipt" },
    ],
    output:
      "[STAGE_06] receipt_id=RCV-AU-0091\nkey=mgk_live_au_… · db.delete · rows_purged=1→0\naudit_ref=AUD-2024-7939 · status=REVOKED",
    progress: 100,
  },
];

type ApiStage = {
  id?: string;
  label?: string;
  detail?: string;
  fields?: ScenarioField[];
  output?: string;
  progress?: number;
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
      detail: stage.detail ?? fallback.detail,
      fields:
        Array.isArray(stage.fields) && stage.fields.length > 0
          ? stage.fields
          : fallback.fields,
      output: stage.output ?? fallback.output,
      progress:
        typeof stage.progress === "number" ? stage.progress : fallback.progress,
    };
  });
}

type Props = {
  demoStep?: number;
};

export default function ScenarioStepper({ demoStep }: Props) {
  const [steps, setSteps] = useState<ScenarioStep[]>(FALLBACK_STEPS);
  const [activeIndex, setActiveIndex] = useState(demoStep ?? 0);
  const step = steps[activeIndex] ?? FALLBACK_STEPS[0];

  useEffect(() => {
    let active = true;

    async function loadStages() {
      try {
        const response = await apiFetch("/api/jobs/scenario/stages", { cacheBust: true });
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
        /* local fallback stages remain active */
      }
    }

    void loadStages();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (demoStep !== undefined) {
      setActiveIndex(demoStep);
    }
  }, [demoStep]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>CUSTOMER_SCENARIO //</div>
      <div className={styles.stepperTrack}>
        {steps.map((entry, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          return (
            <button
              key={entry.id}
              type="button"
              className={`${styles.stepNode} ${done ? styles.stepDone : ""} ${active ? styles.stepActive : ""}`}
              onClick={() => setActiveIndex(index)}
            >
              <span className={styles.stepIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.stepLabel}>{entry.label.toUpperCase()} //</span>
            </button>
          );
        })}
      </div>
      <div className={`${styles.stepContextCard} ${styles.stepContextCardBelowTabs}`}>
        <span className={styles.metricLabel}>
          STAGE_{String(activeIndex + 1).padStart(2, "0")}_CONTEXT //
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
        <div className={styles.stepProgressBar}>
          <div
            className={styles.stepProgressFill}
            style={{ width: `${step.progress}%` }}
          />
        </div>
        <div className={styles.stepProgressLabel}>{step.progress}% COMPLETE //</div>
      </div>
      <div className={styles.stepDetailPanel}>
        <span className={styles.metricLabel}>CURRENT_STAGE //</span>
        <div className={styles.stepDetailHero}>{step.label}</div>
        <p className={styles.stepDetailBody}>{step.detail}</p>
      </div>
    </section>
  );
}
