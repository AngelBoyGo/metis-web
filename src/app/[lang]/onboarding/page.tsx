import PageShell from "@/components/PageShell";
import OnboardingForm from "@/components/OnboardingForm";
import { buildPageMetadata } from "@/lib/site-metadata";
import { generateLocaleParams, resolveLocale, dictionaryFor } from "@/lib/locale-page";

type Props = { params: Promise<{ lang: string }> };

export async function generateStaticParams() {
  return generateLocaleParams();
}

export async function generateMetadata({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  return buildPageMetadata(lang, `${d.startPilot.title} — Metis LLC`, d.startPilot.intro, "onboarding");
}

/** Localized onboarding alias for the existing pilot intake workflow. */
export default async function OnboardingPage({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);

  return (
    <PageShell lang={lang} dict={d}>
      <article className="support-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{d.startPilot.title}</h1>
          <p className="support-lead">{d.startPilot.intro}</p>
        </header>
        <section className="support-section">
          <OnboardingForm
            form={d.startPilot.form}
            errors={d.startPilot.errors}
            confirmation={d.startPilot.confirmation}
          />
        </section>
      </article>
    </PageShell>
  );
}
