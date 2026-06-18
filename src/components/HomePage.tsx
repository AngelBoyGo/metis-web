import Image from "next/image";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import BriefingForm from "@/components/BriefingForm";
import { localePath } from "@/content/i18n/config";
import type { Locale } from "@/content/i18n/types";
import type { SiteContent } from "@/content/i18n/types";

type HomePageProps = {
  lang: Locale;
  dict: SiteContent;
};

export default function HomePage({ lang, dict }: HomePageProps) {
  const {
    hero,
    overview,
    capabilities,
    whyMetis,
    leadership,
    research,
    publicSector,
    security,
    documents,
    contact,
    company,
    ui,
  } = dict;

  return (
    <PageShell lang={lang} dict={dict} navMode="anchors">
      <section className="hero section-anchor" id="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow font-mono">{hero.eyebrow}</p>
          <h1 className="hero-headline font-serif">{hero.headline}</h1>
          <p className="hero-description">{hero.description}</p>
          <div className="hero-pillars">
            {capabilities.categories.map((cat) => (
              <article key={cat.id} className="hero-pillar">
                <p className="hero-pillar-title font-serif">{cat.title}</p>
                <p className="hero-pillar-summary">{cat.summary}</p>
              </article>
            ))}
          </div>
          <div className="hero-actions">
            <Link href={localePath(lang, "start-pilot")} className="btn-primary">
              {ui.startPilot}
            </Link>
            <Link href={localePath(lang, "start-pilot")} className="btn-secondary">
              {ui.requestAccess}
            </Link>
            <Link href={localePath(lang, "pricing")} className="btn-secondary">
              {ui.pricing}
            </Link>
            <Link href={localePath(lang, "contact")} className="btn-secondary">
              {ui.requestBriefing}
            </Link>
            <Link href={localePath(lang, "portal/login")} className="btn-secondary">
              {ui.clientPortal}
            </Link>
            <a
              href="/documents/METIS_Capability_Statement.pdf"
              className="btn-secondary"
              download
            >
              {ui.capabilityStatement}
            </a>
          </div>
        </div>
      </section>

      <section className="section section-anchor" id="overview">
        <div className="section-inner">
          <h2 className="section-title font-serif">{overview.title}</h2>
          {overview.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="section-prose">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="section section-anchor" id="capabilities">
        <div className="section-inner">
          <h2 className="section-title font-serif">{capabilities.title}</h2>
          <p className="section-intro">{capabilities.intro}</p>
          <div className="card-grid">
            {capabilities.categories.map((cat) => (
              <article key={cat.id} className="card">
                <h3 className="card-title font-serif">{cat.title}</h3>
                <p className="card-summary">{cat.summary}</p>
                <ul className="card-list">
                  {cat.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="subsection">
            <h3 className="subsection-title font-serif">
              {capabilities.engagementModels.title}
            </h3>
            <div className="engagement-grid">
              {capabilities.engagementModels.items.map((m) => (
                <div key={m.name} className="engagement-item">
                  <p className="engagement-name">{m.name}</p>
                  <p className="engagement-desc">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="section-cta">
            <Link href={localePath(lang, "capabilities")}>{ui.viewCapabilities}</Link>
          </p>
        </div>
      </section>

      <section className="section section-anchor" id="why-metis">
        <div className="section-inner">
          <h2 className="section-title font-serif">{whyMetis.title}</h2>
          <div className="why-grid">
            {whyMetis.points.map((point) => (
              <article key={point.title} className="why-card">
                <h3 className="why-card-title font-serif">{point.title}</h3>
                <p>{point.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-anchor" id="leadership">
        <div className="section-inner leadership-block">
          <h2 className="section-title font-serif">{ui.leadership}</h2>
          <div className="leadership-layout">
            <div className="leadership-portrait">
              <Image
                src="/principal_genesis.png"
                alt={`${leadership.name}, ${leadership.title}`}
                width={320}
                height={400}
                priority
              />
            </div>
            <div className="leadership-copy">
              <p className="leadership-name font-serif">{leadership.name}</p>
              <p className="leadership-title">{leadership.title}</p>
              <p className="section-prose">{leadership.bio}</p>
              <ul className="focus-list">
                {leadership.focusAreas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
              <p className="leadership-location">{leadership.location}</p>
              <Link href={localePath(lang, "leadership")} className="section-cta-inline">
                {ui.fullLeadership}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-anchor" id="research">
        <div className="section-inner">
          <h2 className="section-title font-serif">{research.title}</h2>
          <article className="research-card">
            <p className="research-meta font-mono">
              {research.publication.journal} · {research.publication.date}
            </p>
            <h3 className="research-title font-serif">{research.publication.title}</h3>
            <p className="section-prose">{research.summary}</p>
            <p className="section-prose">{research.whyItMatters}</p>
            <p className="research-doi font-mono">
              DOI{" "}
              <a
                href={research.publication.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {research.publication.doi}
              </a>
            </p>
            <Link href={localePath(lang, "research")} className="section-cta-inline">
              {ui.researchDetails}
            </Link>
          </article>
        </div>
      </section>

      <section className="section section-anchor" id="public-sector">
        <div className="section-inner">
          <h2 className="section-title font-serif">{publicSector.title}</h2>
          <p className="section-intro">{publicSector.intro}</p>
          <ul className="bullet-list">
            {publicSector.services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <div className="subsection">
            <h3 className="subsection-title font-serif">
              {publicSector.howEngagementsBegin.title}
            </h3>
            <ol className="steps-list">
              {publicSector.howEngagementsBegin.steps.map((step, i) => (
                <li key={step}>
                  <span className="step-num">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <Link href={localePath(lang, "public-sector")} className="section-cta-inline">
            {ui.publicSectorEngagement}
          </Link>
        </div>
      </section>

      <section className="section section-anchor" id="security">
        <div className="section-inner">
          <h2 className="section-title font-serif">{security.title}</h2>
          <ul className="bullet-list">
            {security.statements.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-anchor" id="documents">
        <div className="section-inner">
          <h2 className="section-title font-serif">{documents.title}</h2>
          <p className="section-intro">{documents.intro}</p>
          <div className="doc-grid">
            {documents.cards.map((doc) => (
              <article key={doc.id} className="doc-card">
                <h3 className="doc-card-name font-serif">{doc.name}</h3>
                <p className="doc-card-meta font-mono">
                  {doc.version} · {doc.audience}
                </p>
                <p className="doc-card-desc">{doc.description}</p>
                {doc.availability === "download" && doc.href ? (
                  <a href={doc.href} className="doc-card-action" download>
                    {doc.downloadLabel}
                  </a>
                ) : (
                  <span className="doc-card-on-request">{doc.onRequestLabel}</span>
                )}
              </article>
            ))}
          </div>
          <Link href={localePath(lang, "documents")} className="section-cta-inline">
            {ui.allDocuments}
          </Link>
        </div>
      </section>

      <section className="section section-anchor" id="contact">
        <div className="section-inner contact-section">
          <h2 className="section-title font-serif">{contact.title}</h2>
          <p className="section-prose">{company.address.formatted}</p>
          <p className="section-prose contact-interim">{contact.interimLine}</p>
          <p className="contact-response font-mono">{contact.responseTarget}</p>
          <div className="contact-layout">
            <BriefingForm form={contact.form} errors={contact.errors} />
          </div>
          <p className="section-cta">
            <Link href={localePath(lang, "contact")}>{ui.contactPage}</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
