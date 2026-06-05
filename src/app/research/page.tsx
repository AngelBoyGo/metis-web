import PageShell from "@/components/PageShell";
import { research } from "@/content/site";

export const metadata = {
  title: "Research — Metis LLC",
  description: research.summary,
};

export default function ResearchPage() {
  return (
    <PageShell>
      <article className="support-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{research.title}</h1>
        </header>
        <article className="research-card research-card-page">
          <p className="research-meta font-mono">
            {research.publication.journal} · {research.publication.date}
          </p>
          <h2 className="research-title font-serif">{research.publication.title}</h2>
          <p className="support-prose">{research.summary}</p>
          <p className="support-prose">{research.whyItMatters}</p>
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
          <h3 className="support-section-title font-serif">Related directions</h3>
          <ul className="bullet-list">
            {research.relatedDirections.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </article>
      </article>
    </PageShell>
  );
}
