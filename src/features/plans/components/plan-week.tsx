import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/locales";
import { WorkoutCard } from "../../training/components/workout-card";
import { dateLabel } from "../../training/formatting";
import { daysOfWeek } from "../../training/model/selectors";
import type { TrainingPlan } from "../model/types";
import type { selectPlanWeek } from "../model/read";
import { planPath, planWorkoutPath } from "../model/paths";
import styles from "./plans.module.css";
export function PlanWeek({ plan, selection, locale, dictionary }: { plan: TrainingPlan; selection: ReturnType<typeof selectPlanWeek>; locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.plans;
  const { week, previous, next } = selection;
  const days = daysOfWeek(week.startsOn, week.workouts).filter((day) => day.date >= week.coveredStartsOn && day.date <= week.coveredEndsOn);
  return <section className={styles.stack}>
    <h2>{t.week}</h2><p className="period">{dateLabel(week.coveredStartsOn, undefined, locale)} – {dateLabel(week.coveredEndsOn, undefined, locale)}</p>
    <nav className={styles.navigation} aria-label={t.navigation}>
      {previous ? <Link className={styles.control} href={planPath(locale, plan.id, previous)}>← {t.previous}</Link> : <span className={`${styles.control} ${styles.disabled}`} aria-disabled="true">← {t.previous}</span>}
      {next ? <Link className={styles.control} href={planPath(locale, plan.id, next)}>{t.next} →</Link> : <span className={`${styles.control} ${styles.disabled}`} aria-disabled="true">{t.next} →</span>}
    </nav>
    {selection.invalid && <p role="status" className={styles.copy}>{t.invalidWeek}</p>}
    {!week.workouts.length ? <div className={styles.card}><h3>{t.rest}</h3><p className={styles.copy}>{t.restDescription}</p></div> : days.map((day) => <section className={styles.day} key={day.date}><h3>{dateLabel(day.date, undefined, locale)}</h3>{day.workouts.length ? day.workouts.map((workout) => <WorkoutCard key={workout.id} workout={workout} locale={locale} dictionary={dictionary} href={planWorkoutPath(locale, plan.id, workout.id)} />) : <p>{dictionary.dashboard.rest}</p>}</section>)}
  </section>;
}
