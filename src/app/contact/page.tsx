import PageShell from "@/components/PageShell";
import BriefingForm from "@/components/BriefingForm";
import { contact, company } from "@/content/site";

export const metadata = {
  title: "Contact — Metis LLC",
  description: contact.interimLine,
};

export default function ContactPage() {
  return (
    <PageShell>
      <article className="support-page contact-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{contact.title}</h1>
        </header>
        <section className="support-section">
          <h2 className="support-section-title font-serif">Office</h2>
          <p className="support-prose">{company.address.formatted}</p>
        </section>
        <section className="support-section">
          <p className="support-prose contact-interim">{contact.interimLine}</p>
          <p className="contact-response font-mono">{contact.responseTarget}</p>
        </section>
        <section className="support-section">
          <h2 className="support-section-title font-serif">Briefing request</h2>
          <BriefingForm />
        </section>
      </article>
    </PageShell>
  );
}
