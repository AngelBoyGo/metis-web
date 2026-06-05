import Link from "next/link";
import { company, contact, footer } from "@/content/site";

export default function SiteFooter() {
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
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="site-footer-copy">{footer.copyright}</p>
      </div>
    </footer>
  );
}
