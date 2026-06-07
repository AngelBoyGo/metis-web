import type { Locale } from "@/content/i18n/types";
import type { SiteContent } from "@/content/i18n/types";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import HtmlLang from "./HtmlLang";

type PageShellProps = {
  children: React.ReactNode;
  lang: Locale;
  dict: SiteContent;
  navMode?: "routes" | "anchors";
};

export default function PageShell({ children, lang, dict, navMode = "routes" }: PageShellProps) {
  return (
    <div className="page-shell">
      <HtmlLang lang={lang} />
      <SiteNav lang={lang} dict={dict} mode={navMode} />
      <main className="page-main">{children}</main>
      <SiteFooter lang={lang} dict={dict} />
    </div>
  );
}
