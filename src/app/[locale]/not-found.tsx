import Link from "next/link";
import { getDocumentLocale } from "@/i18n/request-locale";
import { localePath } from "@/i18n/locales";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function NotFound() {
  const locale = await getDocumentLocale();
  const { notFound: text } = await getDictionary(locale);
  return (
    <section className="empty-state">
      <p className="eyebrow">404</p>
      <h1>{text.title}</h1>
      <p>{text.message}</p>
      <Link className="back-link" href={localePath(locale)}>
        ← {text.back}
      </Link>
    </section>
  );
}
