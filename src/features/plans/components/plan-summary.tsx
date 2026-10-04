import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/locales";
import { dateLabel, duration, kilometers } from "../../training/formatting";
import type { PlanSummary } from "../model/read";
import styles from "./plans.module.css";

export function PlanSummaryContent({ summary, locale, dictionary }: { summary: PlanSummary; locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.plans;
  const date = (value: PlanSummary["startsOn"]) => dateLabel(value, { day: "numeric", month: "short", year: "numeric" }, locale);
  return <>
    <p className="period">{date(summary.startsOn)} – {date(summary.endsOn)}</p>
    <div className={styles.meta}><span>{t[summary.status]}</span><span>{summary.active ? t.active : t.inactive}</span></div>
    <dl className={styles.totals}>
      <div><dt>{t.sessions}</dt><dd>{summary.totals.workoutCount}</dd></div>
      <div><dt>{t.running}</dt><dd>{kilometers(summary.totals.runningMeters, locale)} km</dd></div>
      <div><dt>{t.cycling}</dt><dd>{kilometers(summary.totals.cyclingMeters, locale)} km</dd></div>
      <div><dt>{t.cyclingTime}</dt><dd>{duration(summary.totals.cyclingSeconds, locale)}</dd></div>
    </dl>
  </>;
}
