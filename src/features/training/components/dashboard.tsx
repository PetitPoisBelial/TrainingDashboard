import Link from "next/link";
import { dateLabel, kilometers, volume } from "../formatting";
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
}: {
  today: LocalDate;
  week?: TrainingWeek;
}) {
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
        <p className="eyebrow">LE PLAN, UN JOUR À LA FOIS</p>
        <h1>
          Votre semaine<span className="accent">.</span>
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
          <h2>Aucune semaine renseignée</h2>
          <p>
            Le plan de cette semaine n’est pas encore disponible. Les données
            d’exemple couvrent le 28 septembre au 4 octobre 2026.
          </p>
        </section>
      )}
      <div className="overview">
        <section className="volume-panel" aria-labelledby="volume-title">
          <p id="volume-title" className="eyebrow">
            COURSE À PIED · VOLUME PRÉVU
          </p>
          <p className="big-number">
            {week ? kilometers(total) : "—"}
            <span>km</span>
          </p>
          <p className="volume-caption">
            {week
              ? `${runningCount} séances pour construire la régularité.`
              : "En attente de votre plan."}
          </p>
          <div
            className="week-bars"
            aria-label="Répartition du kilométrage de course prévu"
          >
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
          <p className="fine-print">Distances en km · vélo exclu</p>
        </section>
        <section className="focus-panel" aria-labelledby="today-title">
          <div className="section-top">
            <p className="eyebrow">AUJOURD’HUI</p>
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
              <WorkoutCard key={workout.id} workout={workout} />
            ))
          ) : (
            <p className="rest-copy">
              {week
                ? "Place à la récupération. Une journée pour laisser le corps assimiler."
                : "Aucune séance renseignée pour aujourd’hui."}
            </p>
          )}
          <div className="next-key">
            <p className="eyebrow">PROCHAIN RENDEZ-VOUS CLÉ</p>
            {key ? (
              <Link href={`/workouts/${key.id}`}>
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
              <p>
                {week
                  ? "Aucune autre séance clé cette semaine."
                  : "À venir avec votre prochain plan."}
              </p>
            )}
          </div>
        </section>
      </div>
      <section className="schedule" aria-labelledby="schedule-title">
        <div className="schedule-heading">
          <div>
            <p className="eyebrow">VOTRE FEUILLE DE ROUTE</p>
            <h2 id="schedule-title">Les 7 jours</h2>
          </div>
          <span className="subtle-label">
            {workouts.length} séances prévues
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
                  <span className="today-label">Aujourd’hui</span>
                )}
              </div>
              <div className="day-workouts">
                {day.workouts.length ? (
                  day.workouts.map((workout) => (
                    <WorkoutCard key={workout.id} workout={workout} />
                  ))
                ) : (
                  <div className="rest-day">
                    <span aria-hidden="true">—</span>
                    <div>
                      <h3>{week ? "Repos" : "Non renseigné"}</h3>
                      <p>
                        {week
                          ? "Récupérer fait aussi partie du plan."
                          : "Le plan de cette journée n’est pas disponible."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <p className="day-total">
                {week ? `${kilometers(day.runningMeters)} km` : "—"}
                <span>course</span>
              </p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
