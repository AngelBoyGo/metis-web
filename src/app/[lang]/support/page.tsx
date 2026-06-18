import Link from "next/link";
import PageShell from "@/components/PageShell";
import { localePath } from "@/content/i18n/config";
import { buildPageMetadata } from "@/lib/site-metadata";
import { generateLocaleParams, resolveLocale, dictionaryFor } from "@/lib/locale-page";

type Props = { params: Promise<{ lang: string }> };

export async function generateStaticParams() {
  return generateLocaleParams();
}

export async function generateMetadata({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  return buildPageMetadata(lang, `${d.support.title} — Metis LLC`, d.support.intro, "support");
}

export default async function SupportPage({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  const { support, ui } = d;

  return (
    <PageShell lang={lang} dict={d}>
      <article className="support-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{support.title}</h1>
          <p className="support-lead">{support.intro}</p>
        </header>
        <section className="support-section">
          <h2 className="support-section-title font-serif">Contacts</h2>
          <dl className="support-contact-list">
            {support.contacts.map((contact) => (
              <div key={contact.role} className="support-contact-row">
                <dt>{contact.role}</dt>
                <dd>{contact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="support-section">
          <h2 className="support-section-title font-serif">Response times</h2>
          <dl className="support-contact-list">
            {support.responseTimes.map((item) => (
              <div key={item.label} className="support-contact-row">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className="support-prose">{support.hours}</p>
        </section>
        <section className="support-section">
          <h2 className="support-section-title font-serif">{support.escalation.title}</h2>
          <ol className="steps-list">
            {support.escalation.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
        <section className="support-section">
          <h2 className="support-section-title font-serif">{support.incidents.title}</h2>
          {support.incidents.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="support-prose">
              {paragraph}
            </p>
          ))}
        </section>
        <p className="support-cta">
          <Link href={localePath(lang, "contact")}>{ui.contactPage}</Link>
          {" · "}
          <Link href={localePath(lang, "quickstart")}>{ui.quickstart}</Link>
        </p>
      </article>
    </PageShell>
  );
}
