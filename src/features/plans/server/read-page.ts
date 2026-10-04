import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { getDatabase } from "../../../server/db/client";
import { DatabaseConfigurationError } from "../../../server/db/config";
import { parisDate } from "../../training/model/selectors";
import { PersistenceError } from "./errors";
import { loadPlan } from "./persistence";
import type { WorkoutId } from "../../training/model/types";
import type { TrainingPlanId } from "../model/types";

// React memoization lasts one server render only, never across private requests.
export const loadPagePlan = cache(loadPlan);
export async function loadPageWorkout(db: ReturnType<typeof getDatabase>, planId: TrainingPlanId, workoutId: WorkoutId) {
  return (await loadPagePlan(db, planId))?.plan.workouts.find((workout) => workout.id === workoutId);
}

export async function readPage<T>(read: (db: ReturnType<typeof getDatabase>, today: ReturnType<typeof parisDate>) => Promise<T>) {
  await connection();
  try { return { ok: true as const, value: await read(getDatabase(), parisDate(new Date())) }; }
  catch (error) {
    if (error instanceof DatabaseConfigurationError) return { ok: false as const, reason: "configuration" as const };
    if (error instanceof PersistenceError) return { ok: false as const, reason: "persistence" as const };
    throw new Error("plans.read.failure");
  }
}
