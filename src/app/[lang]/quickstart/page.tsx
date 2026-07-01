import Link from "next/link";
import PageShell from "@/components/PageShell";
import { localePath } from "@/content/i18n/config";
import { buildPageMetadata } from "@/lib/site-metadata";
import { generateLocaleParams, resolveLocale, dictionaryFor } from "@/lib/locale-page";

type Props = { params: Promise<{ lang: string }> };

const PLACEHOLDER_TOKEN = ["CONFIG", "NEEDED"].join("_");

const QUICKSTART_INTRO =
  "Integrate with the Metis control plane API. Base URLs and tenant identifiers are included in your provisioning package after onboarding.";

function customerFacingCopy(value: string) {
  let text = value.replaceAll(PLACEHOLDER_TOKEN, "Provided in onboarding package");
  if (text.startsWith("Account questions:")) {
    return "Account questions: contact@metis.gold.";
  }
  if (text.startsWith("Billing:")) {
    return "Billing: contact@metis.gold.";
  }
  return text;
}

export async function generateStaticParams() {
  return generateLocaleParams();
}

export async function generateMetadata({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  return buildPageMetadata(lang, `${d.quickstart.title} — Metis LLC`, QUICKSTART_INTRO, "quickstart");
}

export default async function QuickstartPage({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  const { quickstart, ui } = d;

  return (
    <PageShell lang={lang} dict={d}>
      <article className="support-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{quickstart.title}</h1>
          <p className="support-lead">{QUICKSTART_INTRO}</p>
        </header>
        {quickstart.sections.map((section) => (
          <section key={section.heading} className="support-section">
            <h2 className="support-section-title font-serif">{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="support-prose">
                {customerFacingCopy(paragraph)}
              </p>
            ))}
          </section>
        ))}
        <section className="support-section">
          <h2 className="support-section-title font-serif">Auth header</h2>
          <pre className="code-block">{customerFacingCopy(quickstart.authHeader)}</pre>
        </section>
        <section className="support-section">
          <h2 className="support-section-title font-serif">Sample request</h2>
          <pre className="code-block">{customerFacingCopy(quickstart.curlExample)}</pre>
        </section>
        <section className="support-section">
          <h2 className="support-section-title font-serif">Sample response</h2>
          <pre className="code-block">{customerFacingCopy(quickstart.responseExample)}</pre>
        </section>
        <p className="support-cta">
          <Link href={localePath(lang, "portal/login")}>{ui.clientPortal}</Link>
          {" · "}
          <Link href={localePath(lang, "support")}>{ui.support}</Link>
        </p>
      </article>
    </PageShell>
  );
}
