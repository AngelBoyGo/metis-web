import PageShell from "@/components/PageShell";
import BriefingForm from "@/components/BriefingForm";
import { generateLocaleParams, resolveLocale, dictionaryFor } from "@/lib/locale-page";

type Props = { params: Promise<{ lang: string }> };

export async function generateStaticParams() {
  return generateLocaleParams();
}

export async function generateMetadata({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  return { title: `${d.contact.title} — Metis LLC`, description: d.contact.interimLine };
}

export default async function ContactPage({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);

  return (
    <PageShell lang={lang} dict={d}>
      <article className="support-page contact-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{d.contact.title}</h1>
        </header>
        <section className="support-section">
          <h2 className="support-section-title font-serif">{d.ui.office}</h2>
          <p className="support-prose">{d.company.address.formatted}</p>
        </section>
        <section className="support-section">
          <p className="support-prose contact-interim">{d.contact.interimLine}</p>
          <p className="contact-response font-mono">{d.contact.responseTarget}</p>
        </section>
        <section className="support-section">
          <h2 className="support-section-title font-serif">{d.ui.briefingRequest}</h2>
          <BriefingForm form={d.contact.form} errors={d.contact.errors} />
        </section>
      </article>
    </PageShell>
  );
}
