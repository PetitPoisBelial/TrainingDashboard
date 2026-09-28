import type { LocalDate, TrainingWeek, Workout } from "./types";

// UTC is used only for calendar arithmetic, never to decide the current day.
export function addDays(date: LocalDate, count: number): LocalDate {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + count);
  return value.toISOString().slice(0, 10) as LocalDate;
}
export function parisDate(now: Date): LocalDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}` as LocalDate;
}
export function weekStart(date: LocalDate): LocalDate {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  return addDays(date, -((weekday + 6) % 7));
}
export const weekEnd = (startsOn: LocalDate) => addDays(startsOn, 6);
export const runningDistance = (workouts: readonly Workout[]) =>
  workouts.reduce(
    (sum, workout) =>
      sum +
      (workout.sport === "running"
        ? (workout.plannedVolume.distanceMeters ?? 0)
        : 0),
    0,
  );
export const workoutsOn = (workouts: readonly Workout[], date: LocalDate) =>
  workouts.filter((workout) => workout.scheduledOn === date);
export function daysOfWeek(startsOn: LocalDate, workouts: readonly Workout[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(startsOn, index);
    const sessions = workoutsOn(workouts, date);
    return {
      date,
      workouts: sessions,
      runningMeters: runningDistance(sessions),
    };
  });
}
// Today is included: V0 has no completion status or scheduled time.
export const nextKeyWorkout = (workouts: readonly Workout[], date: LocalDate) =>
  [...workouts]
    .filter((w) => w.isKeyWorkout && w.scheduledOn >= date)
    .sort((a, b) => a.scheduledOn.localeCompare(b.scheduledOn))[0];
export const findWeek = (weeks: readonly TrainingWeek[], date: LocalDate) =>
  weeks.find((week) => week.startsOn === weekStart(date));
export const findWorkout = (weeks: readonly TrainingWeek[], id: string) =>
  weeks.flatMap((week) => week.workouts).find((workout) => workout.id === id);
