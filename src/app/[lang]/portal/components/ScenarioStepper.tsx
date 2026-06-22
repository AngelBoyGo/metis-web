"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./apiFetch";
import { DEMO_SCENARIO_STAGES, type ScenarioStage } from "./demo-fixtures";
import styles from "../dashboard/portal.module.css";

type ScenarioStep = ScenarioStage;

const FALLBACK_STEPS: ScenarioStep[] = DEMO_SCENARIO_STAGES;

type ApiStage = {
  id?: string;
  label?: string;
  fields?: ScenarioStage["fields"];
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
  const [demoMode, setDemoMode] = useState(true);
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
          setDemoMode(false);
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
      {demoMode ? (
        <div className={styles.demoBadge}>[PRODUCTION_INGESTION_TUNNEL] //</div>
      ) : null}
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
        <span className={styles.metricLabel}>INGESTION_OUTPUT //</span>
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
