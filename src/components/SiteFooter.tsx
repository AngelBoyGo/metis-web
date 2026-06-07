import Link from "next/link";
import { localePath } from "@/content/i18n/config";
import type { Locale } from "@/content/i18n/types";
import type { SiteContent } from "@/content/i18n/types";

type SiteFooterProps = {
  lang: Locale;
  dict: SiteContent;
};

export default function SiteFooter({ lang, dict }: SiteFooterProps) {
  const { company, contact, footer } = dict;

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <p className="site-footer-name">{company.name}</p>
          <p className="site-footer-address">{company.address.formatted}</p>
          <p className="site-footer-interim">{contact.interimLine}</p>
        </div>
        <nav className="site-footer-legal" aria-label="Legal">
          {footer.legal.map((item) => (
            <Link key={item.segment} href={localePath(lang, item.segment)}>
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="site-footer-copy">{footer.copyright}</p>
      </div>
    </footer>
  );
}
