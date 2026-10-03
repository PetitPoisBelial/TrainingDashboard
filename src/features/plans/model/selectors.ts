import {
  addDays,
  runningDistance,
  weekEnd,
  weekStart,
} from "../../training/model/selectors";
import type { LocalDate, TrainingWeek, Workout } from "../../training/model/types";
import type { PlanStatus, TrainingPlan } from "./types";

export function planStatus(plan: TrainingPlan, referenceDate: LocalDate): PlanStatus {
  if (referenceDate < plan.startsOn) return "planned";
  return referenceDate > plan.endsOn ? "finished" : "in-progress";
}

export type PlanWeek = TrainingWeek &
  Readonly<{
    coveredStartsOn: LocalDate;
    coveredEndsOn: LocalDate;
  }>;

function withinWeek(date: LocalDate, startsOn: LocalDate): boolean {
  const elapsed =
    Date.parse(`${date}T12:00:00Z`) - Date.parse(`${startsOn}T12:00:00Z`);
  return elapsed >= 0 && elapsed < 7 * 86400000;
}

// date can be any day of the calendar week, including its uncovered edge.
export function projectTrainingWeek(
  plan: TrainingPlan,
  date: LocalDate,
): PlanWeek | undefined {
  const startsOn = weekStart(date);
  if (
    startsOn > plan.endsOn ||
    (startsOn < plan.startsOn && !withinWeek(plan.startsOn, startsOn))
  ) {
    return undefined;
  }
  return {
    id: `${plan.id}:${startsOn}`,
    startsOn,
    coveredStartsOn: startsOn < plan.startsOn ? plan.startsOn : startsOn,
    coveredEndsOn: withinWeek(plan.endsOn, startsOn)
      ? plan.endsOn : weekEnd(startsOn),
    workouts: plan.workouts
      .filter((w) => withinWeek(w.scheduledOn, startsOn))
      .sort((a, b) => a.scheduledOn.localeCompare(b.scheduledOn)),
  };
}

// A current-date lookup distinguishes outside-period from an empty/rest week.
export function planWeekOn(
  plan: TrainingPlan,
  date: LocalDate,
): PlanWeek | undefined {
  return date < plan.startsOn || date > plan.endsOn
    ? undefined : projectTrainingWeek(plan, date);
}

export function planWeeks(plan: TrainingPlan): readonly PlanWeek[] {
  const weeks: PlanWeek[] = [];
  for (let start = weekStart(plan.startsOn); start <= plan.endsOn; start = addDays(start, 7)) {
    weeks.push(projectTrainingWeek(plan, start)!);
    // Stop before arithmetic would overflow the last supported four-digit year.
    if (withinWeek(plan.endsOn, start)) break;
  }
  return weeks;
}

export function workoutTotals(workouts: readonly Workout[]) {
  const cycling = workouts.filter((w) => w.sport === "cycling");
  return {
    runningMeters: runningDistance(workouts),
    cyclingMeters: cycling.reduce(
      (sum, w) => sum + (w.plannedVolume.distanceMeters ?? 0), 0,
    ),
    cyclingSeconds: cycling.reduce(
      (sum, w) => sum + (w.plannedVolume.durationSeconds ?? 0), 0,
    ),
    workoutCount: workouts.length,
  };
}
export const planTotals = (plan: TrainingPlan) => workoutTotals(plan.workouts);
