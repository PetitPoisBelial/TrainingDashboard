import { intlLocales, type Locale } from "@/i18n/locales";
import type { LocalDate, Pace, Target, Workout } from "../model/types";

const numbers = {
  fr: new Intl.NumberFormat(intlLocales.fr, { maximumFractionDigits: 1 }),
  en: new Intl.NumberFormat(intlLocales.en, { maximumFractionDigits: 1 }),
};
export const kilometers = (meters: number, locale: Locale = "fr") =>
  numbers[locale].format(meters / 1000);
export function duration(seconds: number, locale: Locale = "fr"): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return [
    hours ? `${hours} ${locale === "en" ? "hr" : "h"}` : "",
    minutes ? `${minutes} min` : "",
    remainder || !seconds
      ? `${remainder} ${locale === "en" ? "sec" : "s"}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}
export const target = (value: Target, locale: Locale = "fr") =>
  value.kind === "distance"
    ? value.meters < 1000
      ? `${numbers[locale].format(value.meters)} m`
      : `${kilometers(value.meters, locale)} km`
    : duration(value.seconds, locale);
const paceValue = (seconds: number) =>
  `${Math.floor(seconds / 60)}′${String(seconds % 60).padStart(2, "0")}`;
export const pace = (value: Pace) =>
  `${paceValue(value.fast)}${value.fast === value.slow ? "" : `–${paceValue(value.slow)}`}/km`;
export const dateLabel = (
  date: LocalDate,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
  },
  locale: Locale = "fr",
) =>
  new Intl.DateTimeFormat(intlLocales[locale], {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
export const volume = (
  workout: Workout,
  locale: Locale = "fr",
  unknownVolume = locale === "fr" ? "Volume libre" : "Open volume",
) =>
  [
    workout.plannedVolume.distanceMeters !== undefined
      ? `${kilometers(workout.plannedVolume.distanceMeters, locale)} km`
      : "",
    workout.plannedVolume.durationSeconds !== undefined
      ? duration(workout.plannedVolume.durationSeconds, locale)
      : "",
  ]
    .filter(Boolean)
    .join(" · ") || unknownVolume;
