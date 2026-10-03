import type { LocalDate, Pace, Target, Workout, WorkoutId } from "./types";

export type TrainingErrorCode =
  | "id.invalid"
  | "date.invalid"
  | "volume.required"
  | "value.positive"
  | "target.invalid"
  | "repetitions.invalid"
  | "pace.invalid";
export type TrainingIssue = Readonly<{
  code: TrainingErrorCode;
  path: string;
}>;
export type ValidationResult<T, E = TrainingIssue> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; errors: readonly E[] }>;

// Identity is preserved: reject whitespace-only or padded values, never trim IDs.
export const isOpaqueId = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value === value.trim();

export function parseWorkoutId(value: unknown): ValidationResult<WorkoutId> {
  return isOpaqueId(value)
    ? { ok: true, value: value as WorkoutId }
    : { ok: false, errors: [{ code: "id.invalid", path: "id" }] };
}

export function isLocalDate(value: unknown): value is LocalDate {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  if (value.slice(0, 4) === "0000") return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function parseLocalDate(value: unknown): ValidationResult<LocalDate> {
  return isLocalDate(value)
    ? { ok: true, value }
    : { ok: false, errors: [{ code: "date.invalid", path: "date" }] };
}

const positive = (value: number | undefined): value is number =>
  value !== undefined && Number.isFinite(value) && value > 0;

export function validateTarget(
  target: Target,
  path: string,
): readonly TrainingIssue[] {
  // Also reject an ambiguous target at a typed boundary supplied by an adapter.
  if (target.kind === "distance" && !("seconds" in target)) {
    return positive(target.meters)
      ? [] : [{ code: "value.positive", path: `${path}.meters` }];
  }
  if (target.kind === "duration" && !("meters" in target)) {
    return positive(target.seconds)
      ? [] : [{ code: "value.positive", path: `${path}.seconds` }];
  }
  return [{ code: "target.invalid", path }];
}

export function validatePace(pace: Pace, path: string): readonly TrainingIssue[] {
  return positive(pace.fast) && positive(pace.slow) && pace.fast <= pace.slow
    ? [] : [{ code: "pace.invalid", path }];
}

function validateVolume(workout: Workout): readonly TrainingIssue[] {
  const errors: TrainingIssue[] = [];
  const { distanceMeters, durationSeconds } = workout.plannedVolume;
  for (const [field, value] of Object.entries(workout.plannedVolume)) {
    if (value !== undefined && !positive(value)) {
      errors.push({ code: "value.positive", path: `plannedVolume.${field}` });
    }
  }
  const missing = workout.sport === "running"
    ? !positive(distanceMeters)
    : !positive(distanceMeters) && !positive(durationSeconds);
  if (missing) {
    errors.push({ code: "volume.required", path: "plannedVolume" });
  }
  return errors;
}

export function validateWorkout(workout: Workout): readonly TrainingIssue[] {
  const errors: TrainingIssue[] = [...validateVolume(workout)];
  if (!isOpaqueId(workout.id)) {
    errors.push({ code: "id.invalid", path: "id" });
  }
  if (!isLocalDate(workout.scheduledOn)) {
    errors.push({ code: "date.invalid", path: "scheduledOn" });
  }
  workout.blocks.forEach((block, index) => {
    const path = `blocks.${index}`;
    if (block.pace) errors.push(...validatePace(block.pace, `${path}.pace`));
    if (block.kind === "segment") {
      // Free drills/segments remain valid, as in V0.
      if (block.target) {
        errors.push(...validateTarget(block.target, `${path}.target`));
      }
    } else {
      if (!Number.isInteger(block.count) || block.count <= 0) {
        errors.push({ code: "repetitions.invalid", path: `${path}.count` });
      }
      errors.push(...validateTarget(block.effort, `${path}.effort`));
      if (block.recovery) {
        errors.push(
          ...validateTarget(block.recovery.target, `${path}.recovery.target`),
        );
        if (block.recovery.pace) {
          errors.push(
            ...validatePace(block.recovery.pace, `${path}.recovery.pace`),
          );
        }
      }
    }
  });
  return errors;
}

// Only a simple easy/recovery workout can supply its implicit continuous segment.
export function normalizeWorkout(workout: Workout): Workout {
  if (
    workout.blocks.length ||
    (workout.category !== "easy" && workout.category !== "recovery")
  ) return workout;
  const { distanceMeters, durationSeconds } = workout.plannedVolume;
  const target: Target | undefined = positive(distanceMeters)
    ? { kind: "distance", meters: distanceMeters }
    : positive(durationSeconds)
      ? { kind: "duration", seconds: durationSeconds } : undefined;
  return target
    ? { ...workout, blocks: [{ kind: "segment", role: "continuous", target }] }
    : workout;
}
