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
  return { title: `${d.publicSector.title} — Metis LLC`, description: d.publicSector.intro };
}

export default async function PublicSectorPage({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  const { publicSector, ui } = d;

  return (
    <PageShell lang={lang} dict={d}>
      <article className="support-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{publicSector.title}</h1>
          <p className="support-lead">{publicSector.intro}</p>
        </header>
        <section className="support-section">
          <h2 className="support-section-title font-serif">{ui.services}</h2>
          <ul className="bullet-list">
            {publicSector.services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
        <section className="support-section">
          <h2 className="support-section-title font-serif">
            {publicSector.howEngagementsBegin.title}
          </h2>
          <ol className="steps-list">
            {publicSector.howEngagementsBegin.steps.map((step, i) => (
              <li key={step}>
                <span className="step-num">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </section>
        <p className="support-cta">
          <Link href={localePath(lang, "contact")}>{ui.requestBriefingCta}</Link>
        </p>
      </article>
    </PageShell>
  );
}
