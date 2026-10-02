import type { Metadata } from "next";
import { SectionPlaceholder } from "@/components/app-shell/section-placeholder";
import { getLocaleContext } from "@/i18n/request-locale";
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getLocaleContext();
  return { title: dictionary.navigation.insights };
}
export default async function Page() {
  const { locale, dictionary } = await getLocaleContext();
  return (
    <SectionPlaceholder
      {...dictionary.placeholders.insights}
      locale={locale}
      text={dictionary.placeholders}
      icon="chart"
    />
  );
}
