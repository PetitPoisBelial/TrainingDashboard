import { locale as rootLocale } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale, localeFromPreference } from "./locales";
import { getDictionary } from "./get-dictionary";
export async function getLocaleContext() {
  const locale = await rootLocale();
  if (!isLocale(locale)) notFound();
  return { locale, dictionary: await getDictionary(locale) };
}

export async function getDocumentLocale() {
  return localeFromPreference(await rootLocale());
}
