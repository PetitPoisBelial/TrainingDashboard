import {
  isLocalDate,
  isOpaqueId,
  normalizeWorkout,
  validateWorkout,
  type ValidationResult,
} from "../../training/model/validation";
import type { LocalDate } from "../../training/model/types";
import type { PlanIssue } from "./errors";
import type { TrainingPlan, TrainingPlanId } from "./types";

export const PLAN_NAME_MAX_LENGTH = 120;
export const normalizePlanName = (name: string) =>
  name.trim().replace(/\s+/gu, " ");

export function parseTrainingPlanId(value: unknown): ValidationResult<TrainingPlanId> {
  return isOpaqueId(value)
    ? { ok: true, value: value as TrainingPlanId }
    : { ok: false, errors: [{ code: "id.invalid", path: "id" }] };
}

function validatePeriod(
  startsOn: LocalDate,
  endsOn: LocalDate,
): readonly PlanIssue[] {
  const errors: PlanIssue[] = [];
  if (!isLocalDate(startsOn)) {
    errors.push({ code: "date.invalid", path: "startsOn" });
  }
  if (!isLocalDate(endsOn)) errors.push({ code: "date.invalid", path: "endsOn" });
  if (!errors.length && startsOn > endsOn) {
    errors.push({ code: "plan.period.invalid", path: "endsOn" });
  }
  return errors;
}

export function validateTrainingPlan(plan: TrainingPlan): readonly PlanIssue[] {
  const errors: PlanIssue[] = [...validatePeriod(plan.startsOn, plan.endsOn)];
  if (!isOpaqueId(plan.id)) errors.push({ code: "id.invalid", path: "id" });
  const name = normalizePlanName(plan.name);
  const length = Array.from(name).length;
  if (!name) errors.push({ code: "plan.name.empty", path: "name" });
  if (length > PLAN_NAME_MAX_LENGTH) {
    errors.push({
      code: "plan.name.too-long",
      path: "name",
      params: { max: PLAN_NAME_MAX_LENGTH, actual: length },
    });
  }
  const ids = new Set<string>();
  plan.workouts.forEach((workout, index) => {
    const path = `workouts.${index}`;
    errors.push(
      ...validateWorkout(workout).map((error) => ({
        ...error,
        path: `${path}.${error.path}`,
      })),
    );
    if (ids.has(workout.id)) {
      errors.push({
        code: "plan.workout.duplicate-id",
        path: `${path}.id`,
        workoutIds: [workout.id],
      });
    }
    ids.add(workout.id);
    if (
      isLocalDate(plan.startsOn) &&
      isLocalDate(plan.endsOn) &&
      isLocalDate(workout.scheduledOn) &&
      (workout.scheduledOn < plan.startsOn || workout.scheduledOn > plan.endsOn)
    ) {
      errors.push({
        code: "plan.workout.outside-period",
        path: `${path}.scheduledOn`,
        workoutIds: [workout.id],
      });
    }
  });
  return errors;
}

export function createTrainingPlan(
  candidate: TrainingPlan,
): ValidationResult<TrainingPlan, PlanIssue> {
  const errors = validateTrainingPlan(candidate);
  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      ...candidate,
      name: normalizePlanName(candidate.name),
      workouts: candidate.workouts
        .map(normalizeWorkout)
        .sort((a, b) => a.scheduledOn.localeCompare(b.scheduledOn)),
    },
  };
}

export function changePlanPeriod(
  plan: TrainingPlan,
  startsOn: LocalDate,
  endsOn: LocalDate,
): ValidationResult<TrainingPlan, PlanIssue> {
  const errors = validatePeriod(startsOn, endsOn);
  if (errors.length) return { ok: false, errors };
  const excluded = plan.workouts.filter(
    (w) => w.scheduledOn < startsOn || w.scheduledOn > endsOn,
  );
  if (excluded.length) {
    return {
      ok: false,
      errors: [{
        code: "plan.period.excludes-workouts",
        path: "workouts",
        workoutIds: excluded.map((w) => w.id),
      }],
    };
  }
  return createTrainingPlan({ ...plan, startsOn, endsOn });
}
