import assert from "node:assert/strict";
import test from "node:test";
import { trainingWeeks } from "../../training/data/training-weeks";
import type { TrainingPlan, TrainingPlanId } from "../model/types";
import { createTrainingPlan } from "../model/validation";
import { InvalidPlanError, PersistenceError } from "./errors";
import { blockFromRow, blockToRow, planFromRows, planToRows, stateFromRow, type BlockRow } from "./mappings";

const candidate: TrainingPlan = { id: "synthetic:plan" as TrainingPlanId, name: "  Synthetic  ", startsOn: "2026-09-28", endsOn: "2026-10-04", workouts: trainingWeeks[0].workouts };
function persisted(input = candidate) {
  const rows = planToRows(input);
  return {
    plan: { ...rows.plan, revision: 1, createdAt: new Date("2026-10-03T00:00Z"), updatedAt: new Date("2026-10-03T00:00Z") },
    workouts: rows.workouts,
    blocks: rows.blocks.map((b, i) => ({ ...b, id: `technical-${i}` } as BlockRow)),
  };
}
test("row/domain round trip preserves dates, opaque IDs, canonical units and nullable values", () => {
  const rows = persisted();
  const expected = createTrainingPlan(candidate);
  assert.ok(expected.ok);
  assert.deepEqual(planFromRows(rows.plan, rows.workouts, rows.blocks).plan, expected.value);
  assert.equal(rows.plan.description, null);
  assert.equal(rows.workouts[0].plannedDurationSeconds, null);
  assert.equal(rows.workouts[0].plannedDistanceMeters, 12000);
});
test("unordered rows restore chronological, same-day and block execution order", () => {
  const rows = persisted();
  const result = planFromRows(rows.plan, [...rows.workouts].reverse(), [...rows.blocks].reverse());
  assert.deepEqual(result.plan.workouts, candidate.workouts);
  assert.deepEqual(rows.workouts.filter((w) => w.scheduledOn === "2026-09-30").map((w) => w.position), [0, 1]);
});
test("structured recovery, decimal units, empty strings and targetless segments survive", () => {
  const blocks = [
    { kind: "segment", role: "drills", label: "", notes: "" },
    { kind: "repeats", count: 3, effort: { kind: "duration", seconds: 60.5 }, pace: { fast: 210.5, slow: 211 }, recovery: { target: { kind: "distance", meters: 200.5 }, pace: { fast: 300, slow: 320 }, notes: "" } },
    { kind: "repeats", count: 1, effort: { kind: "distance", meters: 1 } },
  ] as const;
  for (const [position, block] of blocks.entries()) {
    assert.deepEqual(blockFromRow({ ...blockToRow(block, "w", position), id: "technical" } as BlockRow), block);
  }
  const input = { ...candidate, description: "", workouts: [{ ...candidate.workouts[0], sport: "cycling" as const, category: "other" as const, plannedVolume: { durationSeconds: 60.5 }, blocks, notes: "" }] };
  const rows = persisted(input);
  assert.deepEqual(planFromRows(rows.plan, rows.workouts, rows.blocks).plan, { ...input, name: "Synthetic" });
});
test("invalid reconstructed aggregates and malformed row shapes are refused", () => {
  const rows = persisted();
  for (const bad of [{ ...rows.plan, startsOn: "2026-02-30" }, { ...rows.plan, revision: 0 }, { ...rows.plan, name: "" }]) {
    assert.throws(() => planFromRows(bad, rows.workouts, rows.blocks), PersistenceError);
  }
  assert.throws(() => planFromRows(rows.plan, [{ ...rows.workouts[0], planId: "foreign" }], []), PersistenceError);
  assert.throws(() => planFromRows(rows.plan, [...rows.workouts, rows.workouts[0]], rows.blocks), PersistenceError);
  assert.throws(() => planFromRows(rows.plan, rows.workouts, [...rows.blocks, rows.blocks[0]]), PersistenceError);
  assert.throws(() => planFromRows(rows.plan, [{ ...rows.workouts[0], plannedDistanceMeters: 0 }], []), PersistenceError);
  assert.throws(() => planFromRows(rows.plan, rows.workouts, [{ ...rows.blocks[0], paceFast: 210, paceSlow: null }]), PersistenceError);
  assert.throws(() => planToRows({ ...candidate, name: "" }), InvalidPlanError);
});
test("singleton state maps null and opaque IDs and rejects invalid revisions", () => {
  const row = { id: 1, activePlanId: null, revision: 1, updatedAt: new Date() };
  assert.deepEqual(stateFromRow(row), { activePlanId: null, revision: 1, updatedAt: row.updatedAt });
  assert.equal(stateFromRow({ ...row, activePlanId: candidate.id }).activePlanId, candidate.id);
  assert.throws(() => stateFromRow({ ...row, id: 2 }), PersistenceError);
  assert.throws(() => stateFromRow({ ...row, revision: 0 }), PersistenceError);
});
