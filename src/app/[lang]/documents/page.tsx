import PageShell from "@/components/PageShell";
import { generateLocaleParams, resolveLocale, dictionaryFor } from "@/lib/locale-page";

type Props = { params: Promise<{ lang: string }> };

export async function generateStaticParams() {
  return generateLocaleParams();
}

export async function generateMetadata({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  return { title: `${d.documents.title} — Metis LLC`, description: d.documents.intro };
}

export default async function DocumentsPage({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);

  return (
    <PageShell lang={lang} dict={d}>
      <article className="support-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{d.documents.title}</h1>
          <p className="support-lead">{d.documents.intro}</p>
        </header>
        <div className="doc-grid doc-grid-page">
          {d.documents.cards.map((doc) => (
            <article key={doc.id} className="doc-card">
              <h2 className="doc-card-name font-serif">{doc.name}</h2>
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
      </article>
    </PageShell>
  );
}
