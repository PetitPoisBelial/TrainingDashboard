import type { LocalDate, Workout } from "../../training/model/types";

declare const trainingPlanIdBrand: unique symbol;
export type TrainingPlanId = string & { readonly [trainingPlanIdBrand]: true };
export type TrainingPlan = Readonly<{
  id: TrainingPlanId;
  name: string;
  startsOn: LocalDate;
  endsOn: LocalDate;
  description?: string;
  // Chronological order; array order is execution order for equal dates.
  workouts: readonly Workout[];
}>;
export type PlanStatus = "planned" | "in-progress" | "finished";
