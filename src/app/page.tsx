"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  LANG_LABELS,
  LANGS,
  type Lang,
  type PortalMetric,
} from "@/context/translations";

function tickMetrics(metrics: PortalMetric[], tick: number): PortalMetric[] {
  return metrics.map((metric, index) => {
    if (metric.unit === "%" && !metric.label.toLowerCase().includes("status")) {
      const base = parseFloat(metric.value);
      const delta = ((tick + index) % 5) * 0.2 - 0.4;
      const next = Math.min(99.9, Math.max(0, base + delta));
      return { ...metric, value: next.toFixed(1) };
    }
    if (metric.unit === "ms") {
      const base = parseFloat(metric.value);
      const delta = ((tick + index) % 3) * 0.1;
      return { ...metric, value: (base + delta).toFixed(1) };
    }
    return metric;
  });
}

function PortalMetrics({ baseMetrics }: { baseMetrics: PortalMetric[] }) {
  const [metrics, setMetrics] = useState(baseMetrics);
  const tickRef = useRef(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      tickRef.current += 1;
      setMetrics(tickMetrics(baseMetrics, tickRef.current));
    }, 3000);
    return () => window.clearInterval(interval);
  }, [baseMetrics]);

  return (
    <div className="portal-metrics" role="group">
      {metrics.map((metric) => (
        <div key={metric.label} className="metric-cell">
          <p className="metric-label">{metric.label}</p>
          <p className="metric-value">
            {metric.value}
            {metric.unit && (
              <span className="metric-unit">{metric.unit}</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="shell">
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
              {LANG_LABELS[code as Lang]}
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
        <div className="portal-grid">
          <PortalMetrics
            key={lang}
            baseMetrics={t.portal.metrics}
          />
          <div className="portal-streams">
            <p className="portal-streams-title">{t.portal.streamsLabel}</p>
            {t.portal.streams.map((stream) => (
              <div key={stream} className="stream-line">
                <span className="stream-id">{stream}</span>
                <span className="stream-status">ACTIVE</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}
