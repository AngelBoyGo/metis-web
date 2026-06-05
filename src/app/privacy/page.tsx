import PageShell from "@/components/PageShell";
import { privacy } from "@/content/site";

export const metadata = {
  title: "Privacy — Metis LLC",
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <article className="support-page legal-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{privacy.title}</h1>
          <p className="support-meta font-mono">Last updated: {privacy.lastUpdated}</p>
        </header>
        {privacy.sections.map((section) => (
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
