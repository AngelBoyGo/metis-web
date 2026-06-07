"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { planner, plannerScenarios } from "@/content/site";
import type { IntentBrief, PlanResult } from "@/utils/plannerEngine";
import { fallbackParse } from "@/utils/plannerEngine";
import {
  exportPlan,
  toPrintHTML,
  type ExportFormat,
} from "@/utils/exportFactory";

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

type Phase = "input" | "verify" | "results";

const EXPORT_FORMATS: ExportFormat[] = [
  "plaintext",
  "markdown",
  "html",
  "claude",
  "chatgpt",
];

function isLowEntropy(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 24) return true;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length < 4) return true;
  return false;
}

function formatCategory(cat: string): string {
  return cat.replace(/_/g, " ");
}

export default function PlanPage() {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [previewBrief, setPreviewBrief] = useState<IntentBrief | null>(null);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeExport, setActiveExport] = useState<ExportFormat>("markdown");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const micUnsupported = useSyncExternalStore(
    () => () => {},
    () => !(window.SpeechRecognition ?? window.webkitSpeechRecognition),
    () => false,
  );

  const ensureRecognition = useCallback((): SpeechRecognitionInstance | null => {
    if (recognitionRef.current) return recognitionRef.current;
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (ev) => {
      const transcript = Array.from(ev.results)
        .map((r) => r[0]?.transcript ?? "")
        .join("");
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript).trim());
    };
    rec.onerror = (ev) => {
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        setMicDenied(true);
      }
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    return rec;
  }, []);

  const toggleMic = useCallback(() => {
    const rec = ensureRecognition();
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      setMicDenied(false);
      setListening(true);
      rec.start();
    }
  }, [listening, ensureRecognition]);

  const handleCompilePreview = useCallback(() => {
    setError(null);
    if (!text.trim()) {
      setError(planner.errors.blank);
      return;
    }
    if (isLowEntropy(text)) {
      setError(planner.errors.lowEntropy);
      return;
    }
    setPreviewBrief(fallbackParse(text));
    setPhase("verify");
  }, [text]);

  const handleApprove = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? planner.errors.compileFailed);
        return;
      }
      const data = (await res.json()) as PlanResult;
      setResult(data);
      setPhase("results");
    } catch {
      setError(planner.errors.network);
    } finally {
      setLoading(false);
    }
  }, [text]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    const content = exportPlan(result, activeExport);
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [result, activeExport]);

  const handlePrint = useCallback(() => {
    if (!result) return;
    const html = toPrintHTML(result);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  }, [result]);

  return (
    <PageShell>
      <div className="planner-page">
        <header className="planner-header">
          <p className="planner-eyebrow font-mono">{planner.eyebrow}</p>
          <h1 className="planner-title font-serif">{planner.title}</h1>
          <p className="planner-desc">{planner.description}</p>
        </header>

        {phase === "input" && (
          <section className="planner-input">
            <label className="planner-canvas-label font-mono" htmlFor="intent-canvas">
              {planner.canvasLabel}
            </label>
            <textarea
              id="intent-canvas"
              className="planner-canvas"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError(null);
              }}
              placeholder={planner.canvasPlaceholder}
              rows={8}
            />
            <div className="planner-toolbar">
              {!micUnsupported && (
                <button
                  type="button"
                  className={`planner-mic${listening ? " planner-mic-active" : ""}`}
                  onClick={toggleMic}
                  aria-pressed={listening}
                >
                  {listening ? planner.micActiveLabel : planner.micLabel}
                </button>
              )}
              {micUnsupported && (
                <span className="planner-mic-disabled">{planner.micUnsupported}</span>
              )}
              <button
                type="button"
                className="planner-compile btn-primary"
                onClick={handleCompilePreview}
              >
                {planner.compileLabel}
              </button>
            </div>
            {micDenied && <p className="planner-error">{planner.micDenied}</p>}
            {error && <p className="planner-error">{error}</p>}
          </section>
        )}

        {phase === "verify" && previewBrief && (
          <section className="planner-verify">
            <h2 className="planner-verify-title font-serif">{planner.verifyTitle}</h2>
            <p className="planner-verify-intro">{planner.verifyIntro}</p>
            <ul className="planner-matrix">
              <li>
                <span className="planner-matrix-key">{planner.verifyFields.category}</span>
                <span>{formatCategory(previewBrief.category)}</span>
              </li>
              <li>
                <span className="planner-matrix-key">{planner.verifyFields.budget}</span>
                <span>{previewBrief.budget}</span>
              </li>
              <li>
                <span className="planner-matrix-key">{planner.verifyFields.deployment}</span>
                <span>{previewBrief.deployment}</span>
              </li>
              <li>
                <span className="planner-matrix-key">{planner.verifyFields.privacy}</span>
                <span>{previewBrief.privacyPriority ? "yes" : "no"}</span>
              </li>
              <li>
                <span className="planner-matrix-key">{planner.verifyFields.codeComfort}</span>
                <span>{previewBrief.codeComfort}</span>
              </li>
              {previewBrief.hardwareHint && (
                <li>
                  <span className="planner-matrix-key">{planner.verifyFields.hardware}</span>
                  <span>{previewBrief.hardwareHint}</span>
                </li>
              )}
              {previewBrief.keywords.length > 0 && (
                <li>
                  <span className="planner-matrix-key">{planner.verifyFields.keywords}</span>
                  <span>{previewBrief.keywords.join(", ")}</span>
                </li>
              )}
            </ul>
            <div className="planner-verify-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setPhase("input");
                  setError(null);
                }}
              >
                {planner.verifyBack}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? planner.loading : planner.verifyApprove}
              </button>
            </div>
            {error && <p className="planner-error">{error}</p>}
          </section>
        )}

        {phase === "results" && result && (
          <section className="planner-results">
            <h2 className="planner-results-title font-serif">{planner.resultsTitle}</h2>
            <ol className="planner-ranked">
              {result.ranked.map((rec, i) => (
                <li
                  key={rec.candidate.id}
                  className={`planner-rec${rec.candidate.id === result.primaryRecommendationId ? " planner-rec-primary" : ""}`}
                >
                  <div className="planner-rec-head">
                    <span className="planner-rec-rank font-mono">{i + 1}</span>
                    <h3 className="planner-rec-name font-serif">{rec.candidate.name}</h3>
                    {rec.candidate.id === result.primaryRecommendationId && (
                      <span className="planner-rec-badge font-mono">{planner.primaryBadge}</span>
                    )}
                    <span className="planner-rec-score font-mono">{rec.total}</span>
                  </div>
                  <p className="planner-rec-summary">{rec.candidate.summary}</p>
                  <ul className="planner-rec-rationale">
                    {rec.rationale.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            <div className="planner-export">
              <h3 className="planner-export-title font-serif">{planner.exportTitle}</h3>
              <div className="planner-export-formats">
                {EXPORT_FORMATS.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    className={`planner-export-btn${activeExport === fmt ? " planner-export-btn-active" : ""}`}
                    onClick={() => setActiveExport(fmt)}
                  >
                    {planner.exports[fmt]}
                  </button>
                ))}
              </div>
              <div className="planner-export-actions">
                <button type="button" className="btn-primary" onClick={handleCopy}>
                  {copied ? planner.copiedLabel : planner.copyLabel}
                </button>
                <button type="button" className="btn-secondary" onClick={handlePrint}>
                  {planner.printLabel}
                </button>
              </div>
              <pre className="planner-export-preview">{exportPlan(result, activeExport)}</pre>
            </div>
          </section>
        )}

        <section className="planner-scenarios">
          <h2 className="planner-scenarios-title font-serif">{planner.scenariosTitle}</h2>
          <p className="planner-scenarios-intro">{planner.scenariosIntro}</p>
          <ul className="planner-scenario-list">
            {plannerScenarios.map((sc) => (
              <li key={sc.slug}>
                <Link href={`/plan/${sc.slug}`} className="planner-scenario-link">
                  <span className="planner-scenario-code font-mono">{sc.code}</span>
                  <span className="planner-scenario-name">{sc.title}</span>
                  <span className="planner-scenario-blurb">{sc.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
