import type { applicationState, trainingPlans, workoutBlocks, workouts } from "../../../server/db/schema";
import type { LocalDate, Pace, Target, Workout, WorkoutBlock } from "../../training/model/types";
import { parseLocalDate, parseWorkoutId } from "../../training/model/validation";
import type { TrainingPlan, TrainingPlanId } from "../model/types";
import { createTrainingPlan, parseTrainingPlanId } from "../model/validation";
import { InvalidPlanError, PersistenceError } from "./errors";

export type PlanRow = typeof trainingPlans.$inferSelect;
export type WorkoutRow = typeof workouts.$inferSelect;
export type BlockRow = typeof workoutBlocks.$inferSelect;
export type BlockInsert = typeof workoutBlocks.$inferInsert;
export type StateRow = typeof applicationState.$inferSelect;
const invalid = (): never => { throw new PersistenceError("persistence.invalid-data"); };
function date(value: string): LocalDate {
  const result = parseLocalDate(value);
  return result.ok ? result.value : invalid();
}
function planId(value: string): TrainingPlanId {
  const result = parseTrainingPlanId(value);
  return result.ok ? result.value : invalid();
}
function target(meters: number | null, seconds: number | null): Target | undefined {
  if (meters !== null && seconds !== null) return invalid();
  if (meters !== null) return { kind: "distance", meters };
  if (seconds !== null) return { kind: "duration", seconds };
}
function pace(fast: number | null, slow: number | null): Pace | undefined {
  if ((fast === null) !== (slow === null)) return invalid();
  return fast !== null && slow !== null ? { fast, slow } : undefined;
}
export function blockFromRow(row: BlockRow): WorkoutBlock {
  const effort = target(row.targetMeters, row.targetSeconds);
  const recoveryTarget = target(row.recoveryMeters, row.recoverySeconds);
  const recoveryPace = pace(row.recoveryPaceFast, row.recoveryPaceSlow);
  const common = {
    ...(row.label !== null ? { label: row.label } : {}),
    ...(row.notes !== null ? { notes: row.notes } : {}),
    ...(pace(row.paceFast, row.paceSlow) ? { pace: pace(row.paceFast, row.paceSlow) } : {}),
  };
  if (row.kind === "segment") {
    if (!row.role || !["warmup", "continuous", "recovery", "drills", "cooldown", "other"].includes(row.role) || row.repeatCount !== null || recoveryTarget || recoveryPace || row.recoveryNotes !== null) return invalid();
    return { kind: "segment", role: row.role, ...common, ...(effort ? { target: effort } : {}) };
  }
  if (row.kind !== "repeats" || row.role !== null || !effort || row.repeatCount === null ||
      (!recoveryTarget && (recoveryPace || row.recoveryNotes !== null))) return invalid();
  return {
    kind: "repeats", count: row.repeatCount, effort, ...common,
    ...(recoveryTarget ? { recovery: {
      target: recoveryTarget,
      ...(recoveryPace ? { pace: recoveryPace } : {}),
      ...(row.recoveryNotes !== null ? { notes: row.recoveryNotes } : {}),
    } } : {}),
  };
}
export function blockToRow(block: WorkoutBlock, workoutId: string, position: number): BlockInsert {
  const effort = block.kind === "segment" ? block.target : block.effort;
  const recovery = block.kind === "repeats" ? block.recovery : undefined;
  return {
    workoutId, position, kind: block.kind,
    role: block.kind === "segment" ? block.role : null,
    repeatCount: block.kind === "repeats" ? block.count : null,
    label: block.label ?? null, notes: block.notes ?? null,
    targetMeters: effort?.kind === "distance" ? effort.meters : null,
    targetSeconds: effort?.kind === "duration" ? effort.seconds : null,
    paceFast: block.pace?.fast ?? null, paceSlow: block.pace?.slow ?? null,
    recoveryMeters: recovery?.target.kind === "distance" ? recovery.target.meters : null,
    recoverySeconds: recovery?.target.kind === "duration" ? recovery.target.seconds : null,
    recoveryPaceFast: recovery?.pace?.fast ?? null, recoveryPaceSlow: recovery?.pace?.slow ?? null,
    recoveryNotes: recovery?.notes ?? null,
  };
}
export function workoutToRow(workout: Workout, parentId: string, position: number): WorkoutRow {
  return {
    id: workout.id, planId: parentId, position, scheduledOn: workout.scheduledOn,
    sport: workout.sport, category: workout.category, title: workout.title, isKey: workout.isKeyWorkout,
    plannedDistanceMeters: workout.plannedVolume.distanceMeters ?? null,
    plannedDurationSeconds: workout.plannedVolume.durationSeconds ?? null,
    notes: workout.notes ?? null,
  };
}
export function validatedPlan(candidate: TrainingPlan): TrainingPlan {
  const result = createTrainingPlan(candidate);
  if (!result.ok) throw new InvalidPlanError(result.errors);
  return result.value;
}
export function planToRows(candidate: TrainingPlan) {
  const plan = validatedPlan(candidate);
  const positions = new Map<string, number>();
  return {
    plan: { id: plan.id, name: plan.name, startsOn: plan.startsOn, endsOn: plan.endsOn, description: plan.description ?? null },
    workouts: plan.workouts.map((workout) => {
      const position = positions.get(workout.scheduledOn) ?? 0;
      positions.set(workout.scheduledOn, position + 1);
      return workoutToRow(workout, plan.id, position);
    }),
    blocks: plan.workouts.flatMap((workout) => workout.blocks.map((block, position) => blockToRow(block, workout.id, position))),
  };
}
export type StoredPlan = Readonly<{ plan: TrainingPlan; revision: number; createdAt: Date; updatedAt: Date }>;
function revision(value: number): number {
  return Number.isSafeInteger(value) && value > 0 ? value : invalid();
}
export function planFromRows(row: PlanRow, sessions: readonly WorkoutRow[], blocks: readonly BlockRow[]): StoredPlan {
  if (sessions.some((w) => w.planId !== row.id) || blocks.some((b) => !sessions.some((w) => w.id === b.workoutId))) return invalid();
  const positions = new Set<string>();
  const blockPositions = new Set<string>();
  for (const item of [...sessions, ...blocks]) {
    if (!Number.isInteger(item.position) || item.position < 0) return invalid();
    const isSession = "scheduledOn" in item;
    const key = isSession ? `${item.scheduledOn}:${item.position}` : `${item.workoutId}:${item.position}`;
    const seen = isSession ? positions : blockPositions;
    if (seen.has(key)) return invalid();
    seen.add(key);
  }
  const candidate: TrainingPlan = {
    id: planId(row.id), name: row.name, startsOn: date(row.startsOn), endsOn: date(row.endsOn),
    ...(row.description !== null ? { description: row.description } : {}),
    workouts: [...sessions].sort((a, b) => a.scheduledOn.localeCompare(b.scheduledOn) || a.position - b.position).map((w) => {
      const id = parseWorkoutId(w.id);
      if (!id.ok || !["running", "cycling"].includes(w.sport) || !["easy", "recovery", "long-run", "tempo", "intervals", "race", "other"].includes(w.category)) return invalid();
      return {
        id: id.value, scheduledOn: date(w.scheduledOn), sport: w.sport, category: w.category,
        title: w.title, isKeyWorkout: w.isKey,
        plannedVolume: {
          ...(w.plannedDistanceMeters !== null ? { distanceMeters: w.plannedDistanceMeters } : {}),
          ...(w.plannedDurationSeconds !== null ? { durationSeconds: w.plannedDurationSeconds } : {}),
        },
        blocks: blocks.filter((b) => b.workoutId === w.id).sort((a, b) => a.position - b.position).map(blockFromRow),
        ...(w.notes !== null ? { notes: w.notes } : {}),
      };
    }),
  };
  try {
    return { plan: validatedPlan(candidate), revision: revision(row.revision), createdAt: row.createdAt, updatedAt: row.updatedAt };
  } catch { return invalid(); }
}
export function stateFromRow(row: StateRow) {
  if (row.id !== 1) return invalid();
  return { activePlanId: row.activePlanId === null ? null : planId(row.activePlanId), revision: revision(row.revision), updatedAt: row.updatedAt };
}
