import "server-only";
import { isDeepStrictEqual } from "node:util";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { Database } from "../../../server/db/client";
import { applicationState, trainingPlans, workoutBlocks, workouts } from "../../../server/db/schema";
import type { TrainingPlan, TrainingPlanId } from "../model/types";
import { InvalidPlanError, PersistenceError, RevisionConflictError } from "./errors";
import { planFromRows, planToRows, stateFromRow, validatedPlan } from "./mappings";
import type { LocalDate, WorkoutId } from "../../training/model/types";
import { planSummary } from "../model/read";

type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
async function safe<T>(operation: () => Promise<T>): Promise<T> {
  try { return await operation(); }
  catch (error) {
    if (error instanceof InvalidPlanError || error instanceof PersistenceError || error instanceof RevisionConflictError) throw error;
    // Driver errors may include query parameters, notes and connection details.
    throw new PersistenceError("persistence.failure");
  }
}
function expectedRevision(value: number) {
  if (!Number.isSafeInteger(value) || value < 1 || value >= 2147483647) throw new PersistenceError("persistence.invalid-data");
}
async function insertChildren(tx: Transaction, rows: ReturnType<typeof planToRows>) {
  if (rows.workouts.length) await tx.insert(workouts).values(rows.workouts);
  if (rows.blocks.length) await tx.insert(workoutBlocks).values(rows.blocks);
}

export async function loadPlan(db: Database, id: TrainingPlanId) {
  return safe(() => db.transaction(async (tx) => {
    const [row] = await tx.select().from(trainingPlans).where(eq(trainingPlans.id, id));
    if (!row) return undefined;
    const sessions = await tx.select().from(workouts).where(eq(workouts.planId, id));
    const blocks = sessions.length ? await tx.select().from(workoutBlocks).where(inArray(workoutBlocks.workoutId, sessions.map((w) => w.id))) : [];
    return planFromRows(row, sessions, blocks);
  }, { isolationLevel: "repeatable read", accessMode: "read only" }));
}

// Internal foundation for fixtures/import tests; no UI, server action or route.
export async function insertPlanAggregate(db: Database, candidate: TrainingPlan) {
  const rows = planToRows(candidate);
  return safe(() => db.transaction(async (tx) => {
    const [row] = await tx.insert(trainingPlans).values(rows.plan).returning();
    await insertChildren(tx, rows);
    return { revision: row.revision };
  }));
}
export async function replacePlanAggregate(db: Database, candidate: TrainingPlan, expected: number) {
  expectedRevision(expected);
  const rows = planToRows(candidate);
  return safe(() => db.transaction(async (tx) => {
    const [row] = await tx.update(trainingPlans).set({ ...rows.plan, revision: sql`${trainingPlans.revision} + 1`, updatedAt: sql`now()` })
      .where(and(eq(trainingPlans.id, candidate.id), eq(trainingPlans.revision, expected))).returning();
    if (!row) throw new RevisionConflictError("plan", expected);
    await tx.delete(workouts).where(eq(workouts.planId, candidate.id));
    await insertChildren(tx, rows);
    return { revision: row.revision };
  }));
}
export async function loadApplicationState(db: Database) {
  return safe(async () => {
    const [row] = await db.select().from(applicationState).where(eq(applicationState.id, 1));
    if (!row) throw new PersistenceError("persistence.state-missing");
    return stateFromRow(row);
  });
}

export async function listPlanSummaries(db: Database, today: LocalDate) {
  return safe(() => db.transaction(async (tx) => {
    const [state] = await tx.select().from(applicationState).where(eq(applicationState.id, 1));
    if (!state) throw new PersistenceError("persistence.state-missing");
    const selection = stateFromRow(state);
    const plans = await tx.select().from(trainingPlans).orderBy(asc(trainingPlans.startsOn), asc(trainingPlans.id));
    const sessions = plans.length ? await tx.select().from(workouts).where(inArray(workouts.planId, plans.map((p) => p.id))) : [];
    const blocks = sessions.length ? await tx.select().from(workoutBlocks).where(inArray(workoutBlocks.workoutId, sessions.map((w) => w.id))) : [];
    return { activePlanId: selection.activePlanId, plans: plans.map((row) => {
      const children = sessions.filter((w) => w.planId === row.id);
      const ids = new Set(children.map((w) => w.id));
      return planSummary(planFromRows(row, children, blocks.filter((b) => ids.has(b.workoutId))).plan, selection.activePlanId, today);
    }) };
  }, { isolationLevel: "repeatable read", accessMode: "read only" }));
}

export async function loadPlanWorkout(db: Database, planId: TrainingPlanId, workoutId: WorkoutId) {
  const stored = await loadPlan(db, planId);
  return stored?.plan.workouts.find((workout) => workout.id === workoutId);
}

// Insert-only: existing aggregates are never replaced, even with reserved IDs.
export async function insertPlanAggregateIfAbsent(db: Database, candidate: TrainingPlan) {
  const plan = validatedPlan(candidate);
  const rows = planToRows(plan);
  return safe(() => db.transaction(async (tx) => {
    const inserted = await tx.insert(trainingPlans).values(rows.plan).onConflictDoNothing({ target: trainingPlans.id }).returning();
    if (!inserted.length) {
      const [row] = await tx.select().from(trainingPlans).where(eq(trainingPlans.id, plan.id));
      const sessions = await tx.select().from(workouts).where(eq(workouts.planId, plan.id));
      const blocks = sessions.length ? await tx.select().from(workoutBlocks).where(inArray(workoutBlocks.workoutId, sessions.map((w) => w.id))) : [];
      if (!row || !isDeepStrictEqual(planFromRows(row, sessions, blocks).plan, plan)) {
        throw new PersistenceError("persistence.invalid-data");
      }
      return "already-present" as const;
    }
    await insertChildren(tx, rows);
    return "created" as const;
  }));
}
export async function replaceActivePlan(db: Database, id: TrainingPlanId | null, expected: number) {
  expectedRevision(expected);
  return safe(() => db.transaction(async (tx) => {
    const [row] = await tx.update(applicationState).set({ activePlanId: id, revision: sql`${applicationState.revision} + 1`, updatedAt: sql`now()` })
      .where(and(eq(applicationState.id, 1), eq(applicationState.revision, expected))).returning();
    if (!row) throw new RevisionConflictError("application-state", expected);
    return stateFromRow(row);
  }));
}
