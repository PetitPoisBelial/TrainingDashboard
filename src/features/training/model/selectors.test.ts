import assert from "node:assert/strict";
import test from "node:test";
import { trainingWeeks } from "../data/training-weeks";
import { duration, pace, volume } from "../formatting";
import {
  addDays,
  daysOfWeek,
  findWeek,
  findWorkout,
  nextKeyWorkout,
  parisDate,
  runningDistance,
  weekEnd,
  weekStart,
  workoutsOn,
} from "./selectors";

const week = trainingWeeks[0];
test("Monday–Sunday calendar across months and years", () => {
  assert.equal(weekStart("2027-01-03"), "2026-12-28");
  assert.equal(weekEnd("2026-09-28"), "2026-10-04");
  assert.equal(weekStart("2026-09-28"), "2026-09-28");
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
});
test("Paris current date at midnight and DST boundaries", () => {
  assert.equal(parisDate(new Date("2026-09-27T22:30:00Z")), "2026-09-28");
  assert.equal(parisDate(new Date("2026-12-31T23:30:00Z")), "2027-01-01");
  assert.equal(parisDate(new Date("2026-03-29T01:30:00Z")), "2026-03-29");
  assert.equal(addDays("2026-10-24", 2), "2026-10-26");
});
test("seven days include rest and multiple workouts; cycling is excluded", () => {
  const days = daysOfWeek(week.startsOn, week.workouts);
  assert.equal(days.length, 7);
  assert.equal(days[4].workouts.length, 0);
  assert.equal(days[2].workouts.length, 2);
  assert.equal(days[2].runningMeters, 14000);
  assert.equal(runningDistance(week.workouts), 92000);
  assert.equal(workoutsOn(week.workouts, "2026-09-28").length, 1);
  assert.equal(
    runningDistance([
      { ...week.workouts[0], plannedVolume: { durationSeconds: 1800 } },
    ]),
    0,
  );
});
test("next key workout includes today, handles unordered data and end of week", () => {
  assert.equal(
    nextKeyWorkout([...week.workouts].reverse(), "2026-09-29")?.id,
    "2026-09-29-intervalles",
  );
  assert.equal(
    nextKeyWorkout(week.workouts, "2026-09-30")?.id,
    "2026-10-01-seuil",
  );
  assert.equal(nextKeyWorkout(week.workouts, "2026-10-05"), undefined);
});
test("missing data is explicit and safe", () => {
  assert.equal(findWeek(trainingWeeks, "2026-10-05"), undefined);
  assert.equal(findWeek(trainingWeeks, "2026-10-04"), week);
  assert.equal(findWorkout(trainingWeeks, "unknown"), undefined);
  assert.equal(daysOfWeek("2026-10-05", []).length, 7);
  assert.equal(runningDistance([]), 0);
});
test("fixtures preserve invariants and structured intervals", () => {
  const ids = new Set<string>();
  for (const item of trainingWeeks) {
    assert.equal(weekStart(item.startsOn), item.startsOn);
    for (const workout of item.workouts) {
      assert.ok(
        workout.scheduledOn >= item.startsOn &&
          workout.scheduledOn <= weekEnd(item.startsOn),
      );
      assert.ok(!ids.has(workout.id));
      ids.add(workout.id);
    }
  }
  const blocks = findWorkout(trainingWeeks, "2026-09-29-intervalles")!.blocks;
  assert.equal(blocks[0].kind, "segment");
  assert.deepEqual(blocks[2], {
    kind: "repeats",
    count: 4,
    effort: { kind: "distance", meters: 2000 },
    pace: { fast: 210, slow: 212 },
    recovery: { target: { kind: "duration", seconds: 120 } },
    notes: "Trois récupérations trottées, uniquement entre les répétitions.",
  });
});
test("formats units without losing seconds, range or unknown volumes", () => {
  assert.equal(duration(3661), "1 h 1 min 1 s");
  assert.equal(pace({ fast: 210, slow: 212 }), "3′30–3′32/km");
  assert.equal(pace({ fast: 210, slow: 210 }), "3′30/km");
  assert.equal(
    volume({ ...week.workouts[0], plannedVolume: {} }),
    "Volume libre",
  );
});
