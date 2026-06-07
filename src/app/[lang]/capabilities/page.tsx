import Link from "next/link";
import PageShell from "@/components/PageShell";
import { localePath } from "@/content/i18n/config";
import { generateLocaleParams, resolveLocale, dictionaryFor } from "@/lib/locale-page";

type Props = { params: Promise<{ lang: string }> };

export async function generateStaticParams() {
  return generateLocaleParams();
}

export async function generateMetadata({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  return { title: `${d.capabilities.title} — Metis LLC`, description: d.capabilities.intro };
}

export default async function CapabilitiesPage({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  const { capabilities, ui } = d;

  return (
    <PageShell lang={lang} dict={d}>
      <article className="support-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{capabilities.title}</h1>
          <p className="support-lead">{capabilities.intro}</p>
        </header>
        {capabilities.categories.map((cat) => (
          <section key={cat.id} className="support-section">
            <h2 className="support-section-title font-serif">{cat.title}</h2>
            <p className="support-prose">{cat.summary}</p>
            <ul className="bullet-list">
              {cat.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
        <section className="support-section">
          <h2 className="support-section-title font-serif">
            {capabilities.engagementModels.title}
          </h2>
          <div className="engagement-grid">
            {capabilities.engagementModels.items.map((m) => (
              <div key={m.name} className="engagement-item">
                <p className="engagement-name">{m.name}</p>
                <p className="engagement-desc">{m.description}</p>
              </div>
            ))}
          </div>
        </section>
        <p className="support-cta">
          <Link href={localePath(lang, "contact")}>{ui.requestBriefingCta}</Link>
        </p>
      </article>
    </PageShell>
  );
}
