import { getDictionary, isLocale, locales } from "@/content/i18n/config";
import { portalRobots } from "@/lib/site-metadata";
import PortalSiteLink from "./PortalSiteLink";
import styles from "./auth.module.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export const metadata = portalRobots;

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function PortalLayout({ children, params }: Props) {
  const { lang: rawLang } = await params;
  const lang = isLocale(rawLang) ? rawLang : "en";
  const dict = getDictionary(lang);

  return (
    <div className={styles.shell}>
      <div className={styles.portalTopBar}>
        <PortalSiteLink label={dict.ui.returnToSite} />
      </div>
      {children}
    </div>
  );
}
