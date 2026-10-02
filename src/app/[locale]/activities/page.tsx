import type { Metadata } from "next";
import { SectionPlaceholder } from "@/components/app-shell/section-placeholder";
import { getLocaleContext } from "@/i18n/request-locale";
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getLocaleContext();
  return { title: dictionary.navigation.activities };
}
export default async function Page() {
  const { locale, dictionary } = await getLocaleContext();
  return (
    <SectionPlaceholder
      {...dictionary.placeholders.activities}
      locale={locale}
      text={dictionary.placeholders}
      icon="activity"
    />
  );
}
