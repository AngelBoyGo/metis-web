import Image from "next/image";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { localePath } from "@/content/i18n/config";
import { generateLocaleParams, resolveLocale, dictionaryFor } from "@/lib/locale-page";

type Props = { params: Promise<{ lang: string }> };

export async function generateStaticParams() {
  return generateLocaleParams();
}

export async function generateMetadata({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  return { title: `${d.ui.leadership} — Metis LLC`, description: d.leadership.bio };
}

export default async function LeadershipPage({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  const { leadership, ui } = d;

  return (
    <PageShell lang={lang} dict={d}>
      <article className="support-page">
        <header className="support-header">
          <h1 className="support-title font-serif">{ui.leadership}</h1>
        </header>
        <div className="leadership-layout leadership-layout-page">
          <div className="leadership-portrait">
            <Image
              src="/principal_genesis.png"
              alt={`${leadership.name}, ${leadership.title}`}
              width={360}
              height={450}
            />
          </div>
          <div className="leadership-copy">
            <p className="leadership-name font-serif">{leadership.name}</p>
            <p className="leadership-title">{leadership.title}</p>
            <p className="support-prose">{leadership.bio}</p>
            <h2 className="support-section-title font-serif">{ui.focusAreas}</h2>
            <ul className="focus-list">
              {leadership.focusAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
            <h2 className="support-section-title font-serif">
              {leadership.researchAnchor.label}
            </h2>
            <p className="support-prose">{leadership.researchAnchor.citation}</p>
            <p className="research-doi font-mono">
              DOI{" "}
              <a
                href={leadership.researchAnchor.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {leadership.researchAnchor.doi}
              </a>
            </p>
            <p className="leadership-location">{leadership.location}</p>
            <nav className="leadership-links" aria-label="Related pages">
              {leadership.links.map((link) => (
                <Link key={link.segment} href={localePath(lang, link.segment)}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
