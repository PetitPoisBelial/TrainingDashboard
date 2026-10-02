import type { Locale } from "./locales";
import type { Dictionary } from "./dictionaries/fr";
const dictionaries = {
  fr: () => import("./dictionaries/fr").then((module) => module.fr),
  en: () => import("./dictionaries/en").then((module) => module.en),
};
export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
