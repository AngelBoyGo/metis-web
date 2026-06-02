"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { TelemetryFrame } from "@/app/api/telemetry/route";
import { useLanguage } from "@/context/LanguageContext";
import {
  LANG_LABELS,
  LANGS,
  type Lang,
} from "@/context/translations";

const PLACEHOLDER_FRAME: TelemetryFrame = {
  clockHz: 8_000_000,
  cycle: 0,
  matrices: 64,
  memoryBoundMb: 8192,
  ops: ["MATMUL::L00", "CONV2D::L03", "ATTN::L06", "REDUCE::L09"],
  ts: 0,
};

function isValidLang(value: string | null): value is Lang {
  return value === "en" || value === "es" || value === "zh" || value === "th";
}

function LocaleSync() {
  const searchParams = useSearchParams();
  const { setLang } = useLanguage();

  useEffect(() => {
    const param = searchParams.get("lang");
    if (isValidLang(param)) {
      setLang(param);
    }
  }, [searchParams, setLang]);

  return null;
}

function TelemetryMatrix({
  frame,
  labels,
}: {
  frame: TelemetryFrame;
  labels: {
    matrixTitle: string;
    clockLabel: string;
    cycleLabel: string;
    matricesLabel: string;
    memoryLabel: string;
    opsLegend: string;
    awaitingLink: string;
    statusActive: string;
  };
}) {
  const linked = frame.ts > 0;

  return (
    <div className="telemetry-matrix" role="log" aria-live="polite">
      <div className="matrix-header">
        <p className="matrix-title">{labels.matrixTitle}</p>
        <span className="matrix-status">
          {linked ? labels.statusActive : labels.awaitingLink}
        </span>
      </div>
      <div className="matrix-stats">
        <div className="matrix-stat">
          <span className="matrix-stat-label">{labels.clockLabel}</span>
          <span className="matrix-stat-value tabular">
            {(frame.clockHz / 1_000_000).toFixed(0)} MHz
          </span>
        </div>
        <div className="matrix-stat">
          <span className="matrix-stat-label">{labels.cycleLabel}</span>
          <span className="matrix-stat-value tabular">{frame.cycle}</span>
        </div>
        <div className="matrix-stat">
          <span className="matrix-stat-label">{labels.matricesLabel}</span>
          <span className="matrix-stat-value tabular">{frame.matrices}</span>
        </div>
        <div className="matrix-stat">
          <span className="matrix-stat-label">{labels.memoryLabel}</span>
          <span className="matrix-stat-value tabular">
            {frame.memoryBoundMb} MB
          </span>
        </div>
      </div>
      <p className="matrix-ops-legend">{labels.opsLegend}</p>
      <div className="matrix-ops-grid">
        {frame.ops.map((op) => (
          <div key={`${frame.cycle}-${op}`} className="matrix-op-cell">
            {op}
          </div>
        ))}
      </div>
    </div>
  );
}

function CommandTerminal({ prompt }: { prompt: string }) {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<string[]>([]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }
    setLog((prev) => [...prev.slice(-11), `${prompt} ${trimmed}`]);
    setInput("");
  };

  return (
    <div className="command-terminal">
      <div className="command-log" role="log">
        {log.length === 0 ? (
          <p className="command-log-empty">—</p>
        ) : (
          log.map((line, index) => (
            <p key={`${index}-${line}`} className="command-log-line">
              {line}
            </p>
          ))
        )}
      </div>
      <form className="command-form" onSubmit={handleSubmit}>
        <label className="command-prompt" htmlFor="metis-command">
          {prompt}
        </label>
        <input
          id="metis-command"
          className="command-input"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  );
}

export default function Home() {
  const { lang, setLang, t } = useLanguage();
  const [frame, setFrame] = useState<TelemetryFrame>(PLACEHOLDER_FRAME);

  useEffect(() => {
    const source = new EventSource("/api/telemetry");

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as TelemetryFrame;
        setFrame(parsed);
      } catch {
        /* ignore malformed frames */
      }
    };

    return () => {
      source.close();
    };
  }, []);

  return (
    <div className="shell" data-lang={lang}>
      <Suspense fallback={null}>
        <LocaleSync />
      </Suspense>

      <nav className="lang-nav" aria-label="Language selection">
        {LANGS.map((code, i) => (
          <span key={code} style={{ display: "contents" }}>
            {i > 0 && (
              <span className="sep" aria-hidden="true">
                |
              </span>
            )}
            <button
              type="button"
              className={lang === code ? "active" : undefined}
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
            >
              {LANG_LABELS[code]}
            </button>
          </span>
        ))}
      </nav>

      <header className="masthead">
        <h1 className="masthead-wordmark">{t.masthead.wordmark}</h1>
        <p className="masthead-meta">{t.masthead.meta}</p>
        <p className="masthead-locator">{t.masthead.locator}</p>
      </header>

      <section className="hero" aria-labelledby="hero-heading">
        <p className="hero-eyebrow">{t.hero.eyebrow}</p>
        <div className="hero-content">
          <h2 id="hero-heading" className="hero-headline">
            {t.hero.headline}
          </h2>
          <p className="hero-description">{t.hero.description}</p>
        </div>
      </section>

      <section className="sectors" aria-labelledby="sectors-label">
        <p id="sectors-label" className="section-label">
          {t.sectors.sectionLabel}
        </p>
        <div className="sectors-grid">
          {t.sectors.items.map((sector) => (
            <article key={sector.index} className="sector-card">
              <p className="sector-index">
                {sector.index} {"//"}
              </p>
              <h3 className="sector-title">{sector.title}</h3>
              <p className="sector-body">{sector.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="genesis" aria-labelledby="genesis-label">
        <p id="genesis-label" className="section-label">
          {t.about.sectionLabel}
        </p>
        <div className="genesis-grid">
          <figure className="genesis-figure">
            <Image
              src="/principal_genesis.png"
              alt={t.about.imageAlt}
              fill
              sizes="(max-width: 900px) 100vw, 40vw"
              className="genesis-image"
              priority
            />
          </figure>
          <div className="genesis-content">
            <h2 className="genesis-principal">{t.about.principalWordmark}</h2>
            <div className="genesis-block">
              <p className="genesis-block-label">{t.about.originLabel}</p>
              <p className="genesis-origin">{t.about.origin}</p>
            </div>
            <div className="genesis-block">
              <p className="genesis-block-label">{t.about.catalystLabel}</p>
              <h3 className="genesis-publication-title">
                {t.about.publicationTitle}
              </h3>
              <p className="genesis-publication-meta">
                {t.about.publicationMeta}
              </p>
            </div>
            <div className="genesis-block">
              <p className="genesis-block-label">{t.about.thesisLabel}</p>
              <p className="genesis-thesis">{t.about.thesis}</p>
            </div>
            <div className="genesis-block">
              <p className="genesis-block-label">{t.about.findingsLabel}</p>
              <div className="findings-matrix" role="table">
                <div className="findings-matrix-header" role="row">
                  <span className="findings-cell findings-code" role="columnheader">
                    CODE
                  </span>
                  <span className="findings-cell findings-label" role="columnheader">
                    PARAMETER
                  </span>
                  <span className="findings-cell findings-value" role="columnheader">
                    STATUS
                  </span>
                </div>
                {t.about.findings.map((row) => (
                  <div key={row.code} className="findings-matrix-row" role="row">
                    <span className="findings-cell findings-code tabular">
                      {row.code}
                    </span>
                    <span className="findings-cell findings-label">
                      {row.label}
                    </span>
                    <span className="findings-cell findings-value tabular">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="portal" aria-labelledby="portal-label">
        <p id="portal-label" className="section-label">
          {t.portal.sectionLabel}
        </p>
        <div className="portal-header-labels">
          <span>{t.portal.systemStatus}</span>
          <span>{t.portal.computeLoad}</span>
          <span>{t.portal.threadAllocation}</span>
          <span>{t.portal.operationalParameters}</span>
        </div>
        <div className="portal-terminal-grid">
          <TelemetryMatrix frame={frame} labels={t.terminal} />
          <CommandTerminal prompt={t.terminal.prompt} />
        </div>
      </section>

      <footer className="footer">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}
