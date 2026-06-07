import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { planner, plannerScenarios } from "@/content/site";
import { scorePlan } from "@/utils/plannerEngine";

type Props = { params: Promise<{ scenario: string }> };

export function generateStaticParams() {
  return plannerScenarios.map((sc) => ({ scenario: sc.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { scenario: slug } = await params;
  const sc = plannerScenarios.find((s) => s.slug === slug);
  if (!sc) return { title: "Scenario — Metis LLC" };
  return {
    title: `${sc.title} — Metis Planner`,
    description: sc.blurb,
  };
}

export default async function ScenarioPage({ params }: Props) {
  const { scenario: slug } = await params;
  const scenario = plannerScenarios.find((s) => s.slug === slug);
  if (!scenario) notFound();

  const result = scorePlan(scenario.brief);

  return (
    <PageShell>
      <article className="planner-scenario-page">
        <header className="planner-scenario-header">
          <p className="planner-scenario-page-code font-mono">{scenario.code}</p>
          <h1 className="planner-scenario-page-title font-serif">{scenario.title}</h1>
          <p className="planner-scenario-page-blurb">{scenario.blurb}</p>
          <Link href="/plan" className="section-cta-inline">
            {planner.backToPlanner}
          </Link>
        </header>

        <section className="planner-scenario-brief">
          <h2 className="planner-verify-title font-serif">{planner.verifyTitle}</h2>
          <ul className="planner-matrix">
            <li>
              <span className="planner-matrix-key">{planner.verifyFields.category}</span>
              <span>{scenario.brief.category.replace(/_/g, " ")}</span>
            </li>
            <li>
              <span className="planner-matrix-key">{planner.verifyFields.budget}</span>
              <span>{scenario.brief.budget}</span>
            </li>
            <li>
              <span className="planner-matrix-key">{planner.verifyFields.deployment}</span>
              <span>{scenario.brief.deployment}</span>
            </li>
            <li>
              <span className="planner-matrix-key">{planner.verifyFields.privacy}</span>
              <span>{scenario.brief.privacyPriority ? "yes" : "no"}</span>
            </li>
            <li>
              <span className="planner-matrix-key">{planner.verifyFields.codeComfort}</span>
              <span>{scenario.brief.codeComfort}</span>
            </li>
          </ul>
        </section>

        <section className="planner-results">
          <h2 className="planner-results-title font-serif">{planner.resultsTitle}</h2>
          <ol className="planner-ranked">
            {result.ranked.map((rec, i) => (
              <li
                key={rec.candidate.id}
                className={`planner-rec${rec.candidate.id === result.primaryRecommendationId ? " planner-rec-primary" : ""}`}
              >
                <div className="planner-rec-head">
                  <span className="planner-rec-rank font-mono">{i + 1}</span>
                  <h3 className="planner-rec-name font-serif">{rec.candidate.name}</h3>
                  {rec.candidate.id === result.primaryRecommendationId && (
                    <span className="planner-rec-badge font-mono">{planner.primaryBadge}</span>
                  )}
                  <span className="planner-rec-score font-mono">{rec.total}</span>
                </div>
                <p className="planner-rec-summary">{rec.candidate.summary}</p>
                <ul className="planner-rec-rationale">
                  {rec.rationale.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      </article>
    </PageShell>
  );
}
