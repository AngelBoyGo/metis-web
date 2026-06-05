import PageShell from "@/components/PageShell";
import { about, company } from "@/content/site";

export const metadata = {
  title: "About — Metis LLC",
  description: company.oneLiner,
};

export default function AboutPage() {
  return (
    <PageShell>
      <article className="support-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{about.title}</h1>
          <p className="support-lead">{company.oneLiner}</p>
        </header>
        {about.sections.map((section) => (
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
