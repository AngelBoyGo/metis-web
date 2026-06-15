import { generateLocaleParams, resolveLocale, dictionaryFor } from "@/lib/locale-page";
import { buildPageMetadata } from "@/lib/site-metadata";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateStaticParams() {
  return generateLocaleParams();
}

export async function generateMetadata({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  return buildPageMetadata(lang, d.meta.title, d.meta.description);
}

export default function LangLayout({ children }: Props) {
  return children;
}
