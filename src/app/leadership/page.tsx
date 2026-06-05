import Image from "next/image";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { leadership } from "@/content/site";

export const metadata = {
  title: "Leadership — Metis LLC",
  description: leadership.bio,
};

export default function LeadershipPage() {
  return (
    <PageShell>
      <article className="support-page">
        <header className="support-header">
          <h1 className="support-title font-serif">Leadership</h1>
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
            <h2 className="support-section-title font-serif">Focus areas</h2>
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
                <Link key={link.href} href={link.href}>
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
