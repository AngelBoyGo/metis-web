import Link from "next/link";
import PageShell from "@/components/PageShell";
import CheckoutButton from "@/components/CheckoutButton";
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
  return buildPageMetadata(lang, `${d.pricing.title} — Metis LLC`, d.pricing.intro, "pricing");
}

export default async function PricingPage({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  const { pricing, ui } = d;

  const tiers = [
    { key: "pilot" as const, data: pricing.pilot, checkout: true },
    { key: "platform" as const, data: pricing.platform, checkout: true },
    { key: "enterprise" as const, data: pricing.enterprise, checkout: false },
  ];

  return (
    <PageShell lang={lang} dict={d}>
      <article className="support-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{pricing.title}</h1>
          <p className="support-lead">{pricing.intro}</p>
        </header>
        <div className="pricing-grid">
          {tiers.map((tier) => (
            <article key={tier.key} className="pricing-card">
              <h2 className="pricing-card-name font-serif">{tier.data.name}</h2>
              <p className="pricing-card-price">
                {tier.data.price}
                <span className="pricing-card-period"> / {tier.data.period}</span>
              </p>
              <p className="pricing-card-desc">{tier.data.description}</p>
              <ul className="bullet-list">
                {tier.data.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {tier.checkout && tier.key !== "enterprise" ? (
                <CheckoutButton plan={tier.key} label={tier.data.cta} lang={lang} />
              ) : (
                <Link href={localePath(lang, "start-pilot")} className="btn-primary">
                  {tier.data.cta}
                </Link>
              )}
            </article>
          ))}
        </div>
        <p className="support-prose pricing-footnote">{pricing.footnote}</p>
        <p className="support-cta">
          <Link href={localePath(lang, "start-pilot")}>{ui.startPilotCta}</Link>
        </p>
      </article>
    </PageShell>
  );
}
