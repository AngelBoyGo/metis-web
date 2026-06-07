import PageShell from "@/components/PageShell";
import { generateLocaleParams, resolveLocale, dictionaryFor } from "@/lib/locale-page";

type Props = { params: Promise<{ lang: string }> };

export async function generateStaticParams() {
  return generateLocaleParams();
}

export async function generateMetadata({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  return { title: `${d.privacy.title} — Metis LLC` };
}

export default async function PrivacyPage({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);

  return (
    <PageShell lang={lang} dict={d}>
      <article className="support-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{d.privacy.title}</h1>
          <p className="support-lead font-mono">{d.privacy.lastUpdated}</p>
        </header>
        {d.privacy.sections.map((section) => (
          <section key={section.heading} className="support-section">
            <h2 className="support-section-title font-serif">{section.heading}</h2>
            {section.body.map((p) => (
              <p key={p.slice(0, 32)} className="support-prose">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>
    </PageShell>
  );
}
