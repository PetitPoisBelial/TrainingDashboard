import assert from "node:assert/strict";
import test from "node:test";
import { Pool, type PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { eq, sql } from "drizzle-orm";
import { testConnectionUrl } from "../../src/server/db/config";
import * as schema from "../../src/server/db/schema";
import type { TrainingPlan, TrainingPlanId } from "../../src/features/plans/model/types";
import type { WorkoutId } from "../../src/features/training/model/types";
import { insertPlanAggregate, loadApplicationState, loadPlan, replaceActivePlan, replacePlanAggregate } from "../../src/features/plans/server/persistence";
import { InvalidPlanError, PersistenceError, RevisionConflictError } from "../../src/features/plans/server/errors";

function fixture(id: string): TrainingPlan {
  return { id: id as TrainingPlanId, name: "Synthetic integration fixture", startsOn: "2026-10-01", endsOn: "2026-10-07", workouts: [
    { id: `${id}:a` as WorkoutId, scheduledOn: "2026-10-02", sport: "running", category: "intervals", title: "Synthetic A", isKeyWorkout: true, plannedVolume: { distanceMeters: 1000.5 }, blocks: [
      { kind: "segment", role: "drills" },
      { kind: "repeats", count: 3, effort: { kind: "distance", meters: 200 }, recovery: { target: { kind: "duration", seconds: 60 }, pace: { fast: 300, slow: 320 } } },
    ] },
    { id: `${id}:b` as WorkoutId, scheduledOn: "2026-10-02", sport: "cycling", category: "other", title: "Synthetic B", isKeyWorkout: false, plannedVolume: { durationSeconds: 600 }, blocks: [] },
  ] };
}
test("PostgreSQL migration, constraints and atomic primitives (empty dedicated local database)", async (t) => {
  // Configuration is checked before Pool construction; never falls back to app URL.
  const pool = new Pool({ connectionString: testConnectionUrl(process.env), max: 4, connectionTimeoutMillis: 3000 });
  const db = drizzle(pool, { schema });
  let owned = false;
  let lock: PoolClient | undefined;
  const { applicationState, trainingPlans, workouts, workoutBlocks } = schema;
  try {
    try {
      lock = await pool.connect();
      const result = await lock.query("SELECT pg_try_advisory_lock(87493021) AS locked");
      if (!result.rows[0].locked) throw new Error();
      const existing = await pool.query("SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind IN ('r','v','m','S') UNION ALL SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e' UNION ALL SELECT 1 FROM pg_namespace WHERE nspname = 'drizzle'");
      if (existing.rowCount) throw new Error();
      await migrate(db, { migrationsFolder: "src/server/db/migrations" });
      owned = true;
      await db.insert(applicationState).values({ id: 1 });
    } catch { throw new Error("db.integration.setup-failed: requires accessible, empty local training_dashboard_test; details suppressed"); }

    await t.test("migration creates four tables and reapplication is idempotent", async () => {
      await migrate(db, { migrationsFolder: "src/server/db/migrations" });
      const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
      assert.deepEqual(tables.rows.map((r) => r.tablename), ["application_state", "training_plans", "workout_blocks", "workouts"]);
      assert.equal((await loadApplicationState(db)).revision, 1);
    });
    await t.test("atomic creation and complete ordered aggregate load", async () => {
      const plan = fixture("creation");
      assert.deepEqual(await insertPlanAggregate(db, plan), { revision: 1 });
      assert.deepEqual((await loadPlan(db, plan.id))?.plan, plan);
      assert.equal(await loadPlan(db, "absent" as TrainingPlanId), undefined);
    });
    await t.test("invalid child rejected before writing", async () => {
      const plan = fixture("invalid");
      const invalid = { ...plan, workouts: [{ ...plan.workouts[0], plannedVolume: { distanceMeters: -1 } }] };
      await assert.rejects(insertPlanAggregate(db, invalid), InvalidPlanError);
      assert.equal(await loadPlan(db, plan.id), undefined);
    });
    await t.test("database child failure rolls back parent and preceding children", async () => {
      const existing = fixture("creation");
      const plan = fixture("rollback");
      const collision = { ...plan, workouts: [plan.workouts[0], { ...plan.workouts[1], id: existing.workouts[1].id }] };
      await assert.rejects(insertPlanAggregate(db, collision), PersistenceError);
      assert.equal(await loadPlan(db, plan.id), undefined);
      assert.deepEqual((await loadPlan(db, existing.id))?.plan, existing);
    });
    await t.test("expected revision succeeds, stale revision refuses and concurrent writes have one winner", async () => {
      const plan = fixture("revisions");
      await insertPlanAggregate(db, plan);
      assert.deepEqual(await replacePlanAggregate(db, { ...plan, name: "First" }, 1), { revision: 2 });
      await assert.rejects(replacePlanAggregate(db, plan, 1), RevisionConflictError);
      const results = await Promise.allSettled([
        replacePlanAggregate(db, { ...plan, name: "Concurrent A" }, 2),
        replacePlanAggregate(db, { ...plan, name: "Concurrent B" }, 2),
      ]);
      assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
      const loser = results.find((r) => r.status === "rejected");
      assert.ok(loser?.status === "rejected" && loser.reason instanceof RevisionConflictError);
      assert.equal((await loadPlan(db, plan.id))?.revision, 3);
    });
    await t.test("failed replacement restores revision, metadata and old children", async () => {
      const plan = fixture("creation");
      const before = await loadPlan(db, plan.id);
      const other = fixture("revisions");
      await assert.rejects(replacePlanAggregate(db, { ...plan, name: "Must rollback", workouts: [{ ...plan.workouts[0], id: other.workouts[0].id }] }, 1), PersistenceError);
      assert.deepEqual(await loadPlan(db, plan.id), before);
    });
    await t.test("singleton state and atomic active replacement with concurrent revision control", async () => {
      await assert.rejects(db.insert(applicationState).values({ id: 2 }));
      await assert.rejects(db.insert(applicationState).values({ id: 1 }));
      const a = fixture("creation"), b = fixture("revisions");
      assert.equal((await replaceActivePlan(db, a.id, 1)).revision, 2);
      await assert.rejects(replaceActivePlan(db, b.id, 1), RevisionConflictError);
      const before = await loadApplicationState(db);
      await assert.rejects(replaceActivePlan(db, "missing" as TrainingPlanId, 2), PersistenceError);
      assert.deepEqual(await loadApplicationState(db), before);
      const results = await Promise.allSettled([replaceActivePlan(db, b.id, 2), replaceActivePlan(db, null, 2)]);
      assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
      assert.equal((await loadApplicationState(db)).revision, 3);
      await replaceActivePlan(db, null, 3);
    });
    await t.test("principal SQL constraints reject invalid bypass writes", async () => {
      const workout = fixture("creation").workouts[0];
      const checks = [
        db.update(trainingPlans).set({ revision: 0 }),
        db.update(trainingPlans).set({ endsOn: "2026-01-01" }),
        db.update(trainingPlans).set({ name: "" }),
        db.update(workouts).set({ position: -1 }),
        db.update(workouts).set({ plannedDistanceMeters: 0 }).where(eq(workouts.id, workout.id)),
        db.update(workouts).set({ plannedDistanceMeters: NaN }).where(eq(workouts.id, workout.id)),
        db.update(workouts).set({ plannedDistanceMeters: Infinity }).where(eq(workouts.id, workout.id)),
        db.update(workouts).set({ plannedDistanceMeters: null }).where(eq(workouts.id, workout.id)),
        db.update(workoutBlocks).set({ paceFast: 200, paceSlow: null }),
        db.update(workoutBlocks).set({ paceFast: 220, paceSlow: 210 }),
        db.update(workoutBlocks).set({ targetMeters: 1, targetSeconds: 1 }),
        db.update(workoutBlocks).set({ repeatCount: 0 }).where(eq(workoutBlocks.kind, "repeats")),
        db.update(workoutBlocks).set({ recoveryNotes: "orphan" }).where(eq(workoutBlocks.kind, "segment")),
        db.update(workouts).set({ position: 0 }).where(eq(workouts.planId, "creation")),
        db.update(workoutBlocks).set({ position: 0 }).where(eq(workoutBlocks.workoutId, workout.id)),
        db.insert(workouts).values({ id: "orphan", planId: "absent", position: 0, scheduledOn: "2026-10-02", sport: "running", category: "easy", title: "Synthetic", isKey: false, plannedDistanceMeters: 1 }),
        db.execute(sql`UPDATE workouts SET sport = 'swimming' WHERE id = ${workout.id}`),
      ];
      for (const query of checks) await assert.rejects(query);
    });
    await t.test("active deletion is restricted; explicit state change and cascades are transactional", async () => {
      const plan = fixture("cascade");
      await insertPlanAggregate(db, plan);
      const current = await loadApplicationState(db);
      await replaceActivePlan(db, plan.id, current.revision);
      await assert.rejects(db.delete(trainingPlans).where(eq(trainingPlans.id, plan.id)));
      await db.transaction(async (tx) => {
        await tx.update(applicationState).set({ activePlanId: null, revision: sql`${applicationState.revision} + 1` });
        await tx.delete(trainingPlans).where(eq(trainingPlans.id, plan.id));
      });
      assert.equal(await loadPlan(db, plan.id), undefined);
      assert.equal((await db.select().from(workouts).where(eq(workouts.planId, plan.id))).length, 0);
      assert.equal((await db.select().from(workoutBlocks).where(eq(workoutBlocks.workoutId, plan.workouts[0].id))).length, 0);
    });
  } finally {
    try {
      if (owned) {
        // Only objects created in this run, after an empty-database check.
        await db.transaction(async (tx) => {
          await tx.execute(sql`DROP TABLE application_state, workout_blocks, workouts, training_plans`);
          await tx.execute(sql`DROP TYPE block_kind, workout_category, segment_role, sport`);
          await tx.execute(sql`DROP TABLE drizzle.__drizzle_migrations`);
          await tx.execute(sql`DROP SCHEMA drizzle`);
        });
      }
    } finally {
      if (lock) {
        try { await lock.query("SELECT pg_advisory_unlock(87493021)"); }
        finally { lock.release(); }
      }
      await pool.end();
    }
  }
});
