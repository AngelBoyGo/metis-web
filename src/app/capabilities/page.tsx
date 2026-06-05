import Link from "next/link";
import PageShell from "@/components/PageShell";
import { capabilities } from "@/content/site";

export const metadata = {
  title: "Capabilities — Metis LLC",
  description: capabilities.intro,
};

export default function CapabilitiesPage() {
  return (
    <PageShell>
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
          <Link href="/contact">Request a briefing →</Link>
        </p>
      </article>
    </PageShell>
  );
}
