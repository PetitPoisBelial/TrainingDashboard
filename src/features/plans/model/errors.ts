import type { TrainingIssue } from "../../training/model/validation";
import type { WorkoutId } from "../../training/model/types";

export type PlanIssue =
  | TrainingIssue
  | Readonly<{ code: "plan.name.empty"; path: "name" }>
  | Readonly<{
      code: "plan.name.too-long";
      path: "name";
      params: Readonly<{ max: number; actual: number }>;
    }>
  | Readonly<{ code: "plan.period.invalid"; path: "endsOn" }>
  | Readonly<{
      code:
        | "plan.workout.outside-period"
        | "plan.workout.duplicate-id"
        | "plan.period.excludes-workouts";
      path: string;
      workoutIds: readonly WorkoutId[];
    }>;
