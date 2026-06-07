import HomePage from "@/components/HomePage";
import { generateLocaleParams, resolveLocale, dictionaryFor } from "@/lib/locale-page";

type Props = { params: Promise<{ lang: string }> };

export async function generateStaticParams() {
  return generateLocaleParams();
}

export async function generateMetadata({ params }: Props) {
  const lang = await resolveLocale(params);
  const d = dictionaryFor(lang);
  return { title: d.meta.title, description: d.meta.description };
}

export default async function Page({ params }: Props) {
  const lang = await resolveLocale(params);
  return <HomePage lang={lang} dict={dictionaryFor(lang)} />;
}
