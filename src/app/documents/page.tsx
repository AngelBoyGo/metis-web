import PageShell from "@/components/PageShell";
import { documents } from "@/content/site";

export const metadata = {
  title: "Documents — Metis LLC",
  description: documents.intro,
};

export default function DocumentsPage() {
  return (
    <PageShell>
      <article className="support-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{documents.title}</h1>
          <p className="support-lead">{documents.intro}</p>
        </header>
        <div className="doc-grid doc-grid-page">
          {documents.cards.map((doc) => (
            <article key={doc.id} className="doc-card">
              <h2 className="doc-card-name font-serif">{doc.name}</h2>
              <p className="doc-card-meta font-mono">
                {doc.version} · {doc.audience}
              </p>
              <p className="doc-card-desc">{doc.description}</p>
              {doc.availability === "download" && doc.href ? (
                <a href={doc.href} className="doc-card-action" download>
                  Download PDF
                </a>
              ) : (
                <span className="doc-card-on-request">Available on request</span>
              )}
            </article>
          ))}
        </div>
      </article>
    </PageShell>
  );
}
