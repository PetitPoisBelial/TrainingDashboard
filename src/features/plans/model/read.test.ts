import assert from "node:assert/strict";
import test from "node:test";
import { demoPlan, DEMO_PLAN_ID } from "./demo-plan";
import { validateTrainingPlan } from "./validation";
import { planSummary, selectPlanWeek } from "./read";
import { planPath, planWorkoutPath } from "./paths";
test("demo is valid, stable and includes distinct sports, structured work, partial and rest weeks", () => {
  assert.deepEqual(validateTrainingPlan(demoPlan), []);
  assert.equal(demoPlan.id, DEMO_PLAN_ID);
  assert.ok(demoPlan.workouts.every((w) => w.id.startsWith("demo:v1:")));
  assert.equal(new Set(demoPlan.workouts.map((w) => w.id)).size, 9);
  assert.ok(demoPlan.workouts.some((w) => w.category === "race"));
  assert.ok(demoPlan.workouts.some((w) => w.blocks.some((b) => b.kind === "repeats" && b.recovery)));
});
test("summaries use injected dates, independent activation and separated totals", () => {
  for (const [today, status] of [["2026-09-22", "planned"], ["2026-09-23", "in-progress"], ["2026-10-18", "in-progress"], ["2026-10-19", "finished"]] as const) {
    const summary = planSummary(demoPlan, null, today);
    assert.equal(summary.status, status);
    assert.equal(summary.active, false);
    assert.deepEqual(summary.totals, { runningMeters: 114000, cyclingMeters: 20000, cyclingSeconds: 3600, workoutCount: 9 });
  }
});
test("week selection normalizes Monday, handles partial coverage, rest and invalid input", () => {
  const selected = selectPlanWeek(demoPlan, undefined, "2026-10-04");
  assert.equal(selected.week.startsOn, "2026-09-28");
  assert.deepEqual(selected.week.workouts.filter((w) => w.scheduledOn === "2026-09-30").map((w) => w.sport), ["running", "cycling"]);
  assert.equal(selectPlanWeek(demoPlan, "2026-10-07", "2026-10-04").week.workouts.length, 0);
  assert.equal(selectPlanWeek(demoPlan, undefined, "2027-01-01").week.coveredStartsOn, "2026-09-23");
  for (const requested of ["bad", "2026-02-30", "2027-01-01", ["2026-10-05", "2026-10-12"]]) {
    const result = selectPlanWeek(demoPlan, requested, "2026-10-04");
    assert.equal(result.invalid, true);
    assert.equal(result.week.startsOn, "2026-09-21");
  }
});
test("canonical links preserve locale, week and encode opaque identifiers", () => {
  assert.equal(planPath("en", "a/b", "2026-10-05"), "/en/plan/a%2Fb?week=2026-10-05");
  assert.equal(planWorkoutPath("fr", "a", "b/c"), "/fr/plan/a/workouts/b%2Fc");
});
