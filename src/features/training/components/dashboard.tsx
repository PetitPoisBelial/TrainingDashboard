import Link from "next/link";
import {
  dateLabel as formatDate,
  kilometers as formatKilometers,
  volume as formatVolume,
} from "../formatting";
import { localePath, type Locale } from "@/i18n/locales";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Workout } from "../model/types";
import {
  daysOfWeek,
  nextKeyWorkout,
  runningDistance,
  weekEnd,
  weekStart,
  workoutsOn,
} from "../model/selectors";
import type { LocalDate, TrainingWeek } from "../model/types";
import { WorkoutCard } from "./workout-card";

export function Dashboard({
  today,
  week,
  locale,
  dictionary,
}: {
  today: LocalDate;
  week?: TrainingWeek;
  locale: Locale;
  dictionary: Dictionary;
}) {
  const t = dictionary.dashboard;
  const dateLabel = (
    date: LocalDate,
    options?: Parameters<typeof formatDate>[1],
  ) => formatDate(date, options, locale);
  const kilometers = (meters: number) => formatKilometers(meters, locale);
  const volume = (workout: Workout) =>
    formatVolume(workout, locale, dictionary.workout.unknownVolume);
  const startsOn = weekStart(today);
  const workouts = week?.workouts ?? [];
  const days = daysOfWeek(startsOn, workouts);
  const current = workoutsOn(workouts, today);
  const key = nextKeyWorkout(workouts, today);
  const total = runningDistance(workouts);
  const max = Math.max(...days.map((day) => day.runningMeters));
  const runningCount = workouts.filter((w) => w.sport === "running").length;
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>
          {t.title}
          <span className="accent">.</span>
        </h1>
        <p className="period">
          {dateLabel(startsOn, { day: "numeric", month: "long" })} —{" "}
          {dateLabel(weekEnd(startsOn), {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>
      {!week && (
        <section className="empty-state">
          <h2>{t.missingTitle}</h2>
          <p>{t.missing}</p>
        </section>
      )}
      <div className="overview">
        <section className="volume-panel" aria-labelledby="volume-title">
          <p id="volume-title" className="eyebrow">
            {t.volume}
          </p>
          <p className="big-number">
            {week ? kilometers(total) : "—"}
            <span>km</span>
          </p>
          <p className="volume-caption">
            {week
              ? (runningCount === 1
                  ? t.consistencyOne
                  : t.consistencyMany
                ).replace("{count}", String(runningCount))
              : t.waiting}
          </p>
          <div className="week-bars" aria-label={t.distribution}>
            {days.map((day) => (
              <div
                className={`bar-day ${day.date === today ? "bar-today" : ""}`}
                key={day.date}
              >
                <span className="bar-value">
                  {week ? kilometers(day.runningMeters) : "—"}
                </span>
                <div className="bar-track">
                  <span
                    style={{
                      height: `${max ? Math.max(4, (day.runningMeters / max) * 100) : 4}%`,
                    }}
                  />
                </div>
                <span>{dateLabel(day.date, { weekday: "short" })}</span>
              </div>
            ))}
          </div>
          <p className="fine-print">{t.units}</p>
        </section>
        <section className="focus-panel" aria-labelledby="today-title">
          <div className="section-top">
            <p className="eyebrow">{t.today}</p>
            <span className="live-dot" aria-hidden="true" />
          </div>
          <h2 id="today-title">
            {dateLabel(today, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h2>
          {current.length ? (
            current.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                locale={locale}
                dictionary={dictionary}
              />
            ))
          ) : (
            <p className="rest-copy">{week ? t.restToday : t.missingToday}</p>
          )}
          <div className="next-key">
            <p className="eyebrow">{t.next}</p>
            {key ? (
              <Link href={localePath(locale, `/workouts/${key.id}`)}>
                <span>
                  {dateLabel(key.scheduledOn, {
                    weekday: "long",
                    day: "numeric",
                  })}{" "}
                  · {volume(key)}
                </span>
                <strong>
                  {key.title}
                  <span aria-hidden="true"> →</span>
                </strong>
              </Link>
            ) : (
              <p>{week ? t.noKey : t.waitingKey}</p>
            )}
          </div>
        </section>
      </div>
      <section className="schedule" aria-labelledby="schedule-title">
        <div className="schedule-heading">
          <div>
            <p className="eyebrow">{t.roadmap}</p>
            <h2 id="schedule-title">{t.days}</h2>
          </div>
          <span className="subtle-label">
            {(workouts.length === 1 ? t.plannedOne : t.plannedMany).replace(
              "{count}",
              String(workouts.length),
            )}
          </span>
        </div>
        <ol className="days-list">
          {days.map((day) => (
            <li
              className={`day-row ${day.date === today ? "is-today" : ""}`}
              key={day.date}
              aria-current={day.date === today ? "date" : undefined}
            >
              <div className="day-label">
                <span>{dateLabel(day.date, { weekday: "long" })}</span>
                <strong>{dateLabel(day.date, { day: "2-digit" })}</strong>
                {day.date === today && (
                  <span className="today-label">{t.today}</span>
                )}
              </div>
              <div className="day-workouts">
                {day.workouts.length ? (
                  day.workouts.map((workout) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      locale={locale}
                      dictionary={dictionary}
                    />
                  ))
                ) : (
                  <div className="rest-day">
                    <span aria-hidden="true">—</span>
                    <div>
                      <h3>{week ? t.rest : t.unknown}</h3>
                      <p>{week ? t.recovery : t.missingDay}</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="day-total">
                {week ? `${kilometers(day.runningMeters)} km` : "—"}
                <span>{t.running}</span>
              </p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
