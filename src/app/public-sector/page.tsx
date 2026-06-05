import Link from "next/link";
import PageShell from "@/components/PageShell";
import { publicSector } from "@/content/site";

export const metadata = {
  title: "Public Sector — Metis LLC",
  description: publicSector.intro,
};

export default function PublicSectorPage() {
  return (
    <PageShell>
      <article className="support-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{publicSector.title}</h1>
          <p className="support-lead">{publicSector.intro}</p>
        </header>
        <section className="support-section">
          <h2 className="support-section-title font-serif">Services</h2>
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
          <Link href="/contact">Request a briefing →</Link>
        </p>
      </article>
    </PageShell>
  );
}
