import PageShell from "@/components/PageShell";
import { generateLocaleParams, resolveLocale, dictionaryFor } from "@/lib/locale-page";

type Props = { params: Promise<{ lang: string }> };

export async function generateStaticParams() {
  return generateLocaleParams();
}

export async function generateMetadata({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  return { title: `${d.research.title} — Metis LLC`, description: d.research.summary };
}

export default async function ResearchPage({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  const { research, ui } = d;

  return (
    <PageShell lang={lang} dict={d}>
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
          <h3 className="support-section-title font-serif">{ui.relatedDirections}</h3>
          <ul className="bullet-list">
            {research.relatedDirections.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </article>
    </PageShell>
  );
}
