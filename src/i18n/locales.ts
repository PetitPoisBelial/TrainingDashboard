export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";
export const localeCookie = "training-locale";
export const intlLocales: Record<Locale, string> = { fr: "fr-FR", en: "en-GB" };
export const isLocale = (value: string): value is Locale =>
  locales.some((locale) => locale === value);
export const localeFromPreference = (value?: string): Locale =>
  value && isLocale(value) ? value : defaultLocale;
export const localePath = (locale: Locale, path = "/") =>
  `/${locale}${path === "/" ? "" : path}`;
export function withoutLocale(pathname: string) {
  const first = pathname.split("/")[1];
  return isLocale(first) ? pathname.slice(first.length + 1) || "/" : pathname;
}
export function switchLocaleHref(href: string, locale: Locale) {
  const url = new URL(href, "https://training.local");
  return (
    localePath(locale, withoutLocale(url.pathname)) + url.search + url.hash
  );
}
export function legacyLocaleRedirect(pathname: string, preference?: string) {
  const legacy = ["/plan", "/activities", "/insights", "/workouts"];
  if (
    pathname !== "/" &&
    !legacy.some((path) => pathname === path || pathname.startsWith(path + "/"))
  )
    return undefined;
  return localePath(localeFromPreference(preference), pathname);
}
