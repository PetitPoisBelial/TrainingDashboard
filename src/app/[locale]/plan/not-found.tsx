import Link from "next/link";
import { getLocaleContext } from "@/i18n/request-locale";
import { localePath } from "@/i18n/locales";
export default async function NotFound() {
  const { locale, dictionary } = await getLocaleContext();
  return <section className="empty-state"><h1>{dictionary.plans.missingTitle}</h1><p>{dictionary.plans.missing}</p><Link className="back-link" href={localePath(locale, "/plan")}>{dictionary.plans.back}</Link></section>;
}
