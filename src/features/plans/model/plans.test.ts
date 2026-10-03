import assert from "node:assert/strict";
import test from "node:test";
import { trainingWeeks } from "../../training/data/training-weeks";
import { daysOfWeek, nextKeyWorkout, runningDistance } from "../../training/model/selectors";
import type { LocalDate, TrainingWeek, Workout, WorkoutBlock, WorkoutId } from "../../training/model/types";
import { parseLocalDate, parseWorkoutId, validateWorkout } from "../../training/model/validation";
import { changePlanPeriod, createTrainingPlan, normalizePlanName, parseTrainingPlanId, PLAN_NAME_MAX_LENGTH, validateTrainingPlan } from "./validation";
import { planStatus, planTotals, planWeekOn, planWeeks, projectTrainingWeek, workoutTotals } from "./selectors";
import type { TrainingPlan, TrainingPlanId } from "./types";

const plan: TrainingPlan = {
  id: "demo-plan" as TrainingPlanId,
  name: "Training",
  startsOn: "2026-09-28",
  endsOn: "2026-10-04",
  workouts: trainingWeeks[0].workouts,
};
const workout = plan.workouts[0];
const codes = (candidate: TrainingPlan) => validateTrainingPlan(candidate).map((e) => e.code);
const withWorkout = (session: Workout): TrainingPlan => ({ ...plan, workouts: [session] });

test("opaque identifiers preserve arbitrary stable values and reject malformed boundaries", () => {
  assert.deepEqual(parseWorkoutId("session:abc"), { ok: true, value: "session:abc" });
  assert.deepEqual(parseTrainingPlanId("legacy-plan"), { ok: true, value: "legacy-plan" });
  for (const input of ["", " ", " padded", "padded ", 1, null]) {
    assert.equal(parseWorkoutId(input).ok, false);
    assert.equal(parseTrainingPlanId(input).ok, false);
  }
  // @ts-expect-error Identifiers of different entities cannot be interchanged.
  const wrongId: WorkoutId = plan.id;
  assert.equal(wrongId, plan.id);
});

test("local date boundaries enforce ISO width, real days and leap years", () => {
  for (const value of ["2028-02-29", "2026-12-31", "0099-01-01", "9999-12-31"]) assert.equal(parseLocalDate(value).ok, true);
  for (const value of ["2026-02-29", "2026-04-31", "2026-13-01", "2026-00-01", "2026-01-00", "2026-1-01", "0000-01-01", "2026-01-01T00:00:00Z", null]) assert.equal(parseLocalDate(value).ok, false);
  assert.ok(codes({ ...plan, startsOn: "2026-02-30" }).includes("date.invalid"));
  assert.ok(codes(withWorkout({ ...workout, scheduledOn: "2026-09-31" })).includes("date.invalid"));
});

test("valid plan preserves the V0 demo and normalizes its name", () => {
  assert.deepEqual(validateTrainingPlan(plan), []);
  const result = createTrainingPlan({ ...plan, name: "  Training\n  2026  " });
  assert.ok(result.ok);
  assert.equal(result.value.name, "Training 2026");
  assert.equal(normalizePlanName("\t \n"), "");
  assert.deepEqual(result.value.workouts, plan.workouts);
  assert.ok(createTrainingPlan({ ...plan, workouts: [] }).ok);
});

test("empty names, normalized maximum and Unicode length are enforced", () => {
  assert.deepEqual(codes({ ...plan, name: " \n\t " }), ["plan.name.empty"]);
  for (const unit of ["a", "🏃"]) {
    assert.ok(createTrainingPlan({ ...plan, name: ` ${unit.repeat(PLAN_NAME_MAX_LENGTH)} ` }).ok);
    const errors = validateTrainingPlan({ ...plan, name: unit.repeat(PLAN_NAME_MAX_LENGTH + 1) });
    assert.deepEqual(errors, [{ code: "plan.name.too-long", path: "name", params: { max: 120, actual: 121 } }]);
  }
});

test("period is inclusive, supports one day and rejects reversed bounds", () => {
  assert.ok(codes({ ...plan, startsOn: plan.endsOn, endsOn: plan.startsOn }).includes("plan.period.invalid"));
  assert.deepEqual(validateTrainingPlan({ ...plan, startsOn: workout.scheduledOn, endsOn: workout.scheduledOn, workouts: [workout] }), []);
  assert.deepEqual(validateTrainingPlan(plan), []); // sessions exactly on both bounds
  for (const date of ["2026-09-27", "2026-10-05"] as const) {
    const errors = validateTrainingPlan(withWorkout({ ...workout, scheduledOn: date }));
    assert.deepEqual(errors, [{ code: "plan.workout.outside-period", path: "workouts.0.scheduledOn", workoutIds: [workout.id] }]);
  }
});

test("duplicate IDs are rejected even across different dates", () => {
  assert.deepEqual(validateTrainingPlan({ ...plan, workouts: [workout, { ...workout, scheduledOn: plan.endsOn }] }), [
    { code: "plan.workout.duplicate-id", path: "workouts.1.id", workoutIds: [workout.id] },
  ]);
});

test("chronological normalization preserves same-day execution order", () => {
  const sameDay = plan.workouts.filter((w) => w.scheduledOn === "2026-09-30").reverse();
  const result = createTrainingPlan({ ...plan, workouts: [plan.workouts.at(-1)!, ...sameDay, workout] });
  assert.ok(result.ok);
  assert.deepEqual(result.value.workouts.map((w) => w.id), [workout.id, ...sameDay.map((w) => w.id), plan.workouts.at(-1)!.id]);
  assert.deepEqual(daysOfWeek(plan.startsOn, result.value.workouts)[2].workouts, sameDay);
  assert.equal(nextKeyWorkout(sameDay.map((w) => ({ ...w, isKeyWorkout: true })), "2026-09-30")?.id, sameDay[0].id);
});

test("running requires distance; cycling accepts distance, duration or both", () => {
  for (const distanceMeters of [undefined, 0, -1, NaN, Infinity]) {
    assert.ok(validateWorkout({ ...workout, plannedVolume: { distanceMeters } }).some((e) => e.code === "volume.required"));
  }
  for (const plannedVolume of [{ distanceMeters: 1 }, { durationSeconds: 1 }, { distanceMeters: 1, durationSeconds: 1 }]) {
    assert.deepEqual(validateWorkout({ ...workout, sport: "cycling", plannedVolume }), []);
  }
  assert.ok(validateWorkout({ ...workout, sport: "cycling", plannedVolume: {} }).some((e) => e.code === "volume.required"));
  for (const bad of [0, -1, NaN, Infinity]) {
    assert.ok(validateWorkout({ ...workout, sport: "cycling", plannedVolume: { distanceMeters: 1, durationSeconds: bad } }).some((e) => e.code === "value.positive"));
    assert.ok(validateWorkout({ ...workout, plannedVolume: { distanceMeters: 1, durationSeconds: bad } }).some((e) => e.code === "value.positive"));
  }
});

test("positive targets, integer repetitions and coherent effort/recovery paces", () => {
  const repeat: WorkoutBlock = { kind: "repeats", count: 4, effort: { kind: "distance", meters: 2000 }, recovery: { target: { kind: "duration", seconds: 120 }, pace: { fast: 300, slow: 320 }, notes: "walk" }, pace: { fast: 210, slow: 212 }, label: "Main" };
  assert.deepEqual(validateWorkout({ ...workout, blocks: [repeat] }), []);
  for (const count of [0, -1, 1.5, Infinity, NaN]) {
    assert.ok(validateWorkout({ ...workout, blocks: [{ ...repeat, count }] }).some((e) => e.code === "repetitions.invalid"));
  }
  for (const value of [0, -1, Infinity, NaN]) {
    for (const target of [{ kind: "distance", meters: value }, { kind: "duration", seconds: value }] as const) {
      for (const block of [{ kind: "segment", role: "continuous", target }, { ...repeat, effort: target }, { ...repeat, recovery: { target } }] as const) {
        assert.ok(validateWorkout({ ...workout, blocks: [block] }).some((e) => e.code === "value.positive"));
      }
    }
  }
  for (const pace of [{ fast: 220, slow: 210 }, { fast: 0, slow: 200 }, { fast: 200, slow: Infinity }, { fast: NaN, slow: 200 }]) {
    assert.ok(validateWorkout({ ...workout, blocks: [{ ...repeat, pace }] }).some((e) => e.code === "pace.invalid"));
    assert.ok(validateWorkout({ ...workout, blocks: [{ ...repeat, recovery: { target: { kind: "duration", seconds: 120 }, pace } }] }).some((e) => e.path === "blocks.0.recovery.pace"));
  }
  const ambiguous = { kind: "distance", meters: 1, seconds: 1 } as const;
  assert.ok(validateWorkout({ ...workout, blocks: [{ ...repeat, effort: ambiguous }] }).some((e) => e.code === "target.invalid"));
  assert.deepEqual(validateWorkout({ ...workout, blocks: [{ kind: "segment", role: "drills" }] }), []);
});

test("simple workout supplies a segment without deriving global volume from blocks", () => {
  const result = createTrainingPlan(withWorkout({ ...workout, blocks: [] }));
  assert.ok(result.ok);
  assert.deepEqual(result.value.workouts[0].blocks, [{ kind: "segment", role: "continuous", target: { kind: "distance", meters: 12000 } }]);
  const mismatch = withWorkout({ ...workout, blocks: [{ kind: "segment", role: "continuous", target: { kind: "distance", meters: 1 } }] });
  assert.ok(createTrainingPlan(mismatch).ok);
  assert.equal(planTotals(mismatch).runningMeters, 12000);
});

test("period changes refuse all excluded sessions with stable IDs", () => {
  const result = changePlanPeriod(plan, "2026-09-29", "2026-10-03");
  assert.deepEqual(result, { ok: false, errors: [{ code: "plan.period.excludes-workouts", path: "workouts", workoutIds: [workout.id, plan.workouts.at(-1)!.id] }] });
  assert.ok(changePlanPeriod(plan, plan.startsOn, plan.endsOn).ok);
  assert.ok(changePlanPeriod(plan, "2026-09-01", "2026-11-01").ok);
  assert.equal(changePlanPeriod(plan, "2026-10-01", "2026-09-01").ok, false);
  assert.equal(changePlanPeriod(plan, "2026-02-30", plan.endsOn).ok, false);
});

test("status uses only its explicit date including inclusive edges", () => {
  for (const [date, expected] of [["2026-09-27", "planned"], [plan.startsOn, "in-progress"], ["2026-10-01", "in-progress"], [plan.endsOn, "in-progress"], ["2026-10-05", "finished"]] as const) assert.equal(planStatus(plan, date), expected);
});

test("complete and partial calendar weeks retain coverage and empty weeks", () => {
  assert.equal(planWeeks(plan).length, 1);
  const extended = { ...plan, startsOn: "2026-09-30" as LocalDate, endsOn: "2026-10-13" as LocalDate, workouts: plan.workouts.filter((w) => w.scheduledOn >= "2026-09-30") };
  const weeks = planWeeks(extended);
  assert.deepEqual(weeks.map((w) => [w.startsOn, w.coveredStartsOn, w.coveredEndsOn]), [
    ["2026-09-28", "2026-09-30", "2026-10-04"], ["2026-10-05", "2026-10-05", "2026-10-11"], ["2026-10-12", "2026-10-12", "2026-10-13"],
  ]);
  assert.deepEqual(weeks[1].workouts, []);
  assert.equal(daysOfWeek(weeks[1].startsOn, weeks[1].workouts).length, 7);
  assert.equal(planWeekOn(extended, "2026-09-29"), undefined);
  assert.equal(projectTrainingWeek(extended, "2026-09-28")?.startsOn, "2026-09-28");
  assert.equal(planWeekOn(extended, "2026-10-14"), undefined);
  assert.equal(planWeekOn(extended, "2026-10-06")?.workouts.length, 0);
  assert.equal(projectTrainingWeek(extended, "2026-10-19"), undefined);
});

test("calendar projections cross leap day and year boundaries", () => {
  assert.deepEqual(planWeeks({ ...plan, startsOn: "2028-02-28", endsOn: "2028-03-07", workouts: [] }).map((w) => w.startsOn), ["2028-02-28", "2028-03-06"]);
  assert.deepEqual(planWeeks({ ...plan, startsOn: "2026-12-31", endsOn: "2027-01-05", workouts: [] }).map((w) => w.startsOn), ["2026-12-28", "2027-01-04"]);
  const lastWeek = planWeeks({ ...plan, startsOn: "9999-12-31", endsOn: "9999-12-31", workouts: [] });
  assert.equal(lastWeek.length, 1);
  assert.equal(lastWeek[0].coveredEndsOn, "9999-12-31");
});

test("V0-compatible TrainingWeek and separate sport totals", () => {
  const week: TrainingWeek = projectTrainingWeek(plan, plan.startsOn)!;
  assert.deepEqual(week.workouts, trainingWeeks[0].workouts);
  assert.equal(runningDistance(week.workouts), 92000);
  assert.equal(daysOfWeek(week.startsOn, week.workouts)[4].workouts.length, 0);
  assert.deepEqual(planTotals(plan), { runningMeters: 92000, cyclingMeters: 20000, cyclingSeconds: 3600, workoutCount: 7 });
  assert.deepEqual(workoutTotals([{ ...workout, sport: "cycling", plannedVolume: { durationSeconds: 1800 } }]), { runningMeters: 0, cyclingMeters: 0, cyclingSeconds: 1800, workoutCount: 1 });
  assert.deepEqual(workoutTotals([]), { runningMeters: 0, cyclingMeters: 0, cyclingSeconds: 0, workoutCount: 0 });
});

function freezeDeep(value: object) {
  for (const child of Object.values(value)) if (child && typeof child === "object") freezeDeep(child);
  Object.freeze(value);
}

test("validation, normalization, period changes and projections never mutate inputs", () => {
  const input = structuredClone({ ...plan, name: "  Training  ", workouts: [...plan.workouts].reverse() });
  const original = structuredClone(input);
  freezeDeep(input);
  assert.ok(createTrainingPlan(input).ok);
  validateTrainingPlan(input);
  changePlanPeriod(input, "2026-09-01", "2026-11-01");
  changePlanPeriod(input, "2026-10-01", "2026-10-02");
  planWeeks(input);
  planWeekOn(input, plan.startsOn);
  planStatus(input, plan.startsOn);
  planTotals(input);
  assert.deepEqual(input, original);
});
