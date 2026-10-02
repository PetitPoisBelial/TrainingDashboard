import assert from "node:assert/strict";
import test from "node:test";
import { fr } from "./dictionaries/fr";
import { en } from "./dictionaries/en";
import {
  isLocale,
  legacyLocaleRedirect,
  localeFromPreference,
  switchLocaleHref,
  withoutLocale,
} from "./locales";
import {
  dateLabel,
  duration,
  kilometers,
  volume,
} from "../features/training/formatting";
import {
  getTrainingWeeks,
  englishDemoCopy,
} from "../features/training/data/localized-training-weeks";
import { trainingWeeks } from "../features/training/data/training-weeks";

function keys(value: object): string[] {
  return Object.entries(value)
    .flatMap(([key, child]) =>
      typeof child === "object"
        ? keys(child).map((nested) => key + "." + nested)
        : [key],
    )
    .sort();
}
test("English and French dictionaries share every key", () => {
  assert.deepEqual(keys(en), keys(fr));
});
test("locale validation and preference fallback", () => {
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("de"), false);
  assert.equal(isLocale("toString"), false);
  assert.equal(localeFromPreference("invalid"), "fr");
  assert.equal(localeFromPreference("en"), "en");
});
test("switching preserves workout, search parameters and hash", () => {
  assert.equal(
    switchLocaleHref(
      "/fr/workouts/2026-09-29-intervalles?day=2&note=a%20b#blocks",
      "en",
    ),
    "/en/workouts/2026-09-29-intervalles?day=2&note=a%20b#blocks",
  );
  assert.equal(switchLocaleHref("/en?view=week", "fr"), "/fr?view=week");
  assert.equal(withoutLocale("/english/plan"), "/english/plan");
});
test("legacy redirects respect preference without redirect loops", () => {
  assert.equal(legacyLocaleRedirect("/"), "/fr");
  assert.equal(legacyLocaleRedirect("/plan", "en"), "/en/plan");
  assert.equal(
    legacyLocaleRedirect("/workouts/example", "en"),
    "/en/workouts/example",
  );
  for (const path of [
    "/fr",
    "/en/plan",
    "/de/plan",
    "/manifest.webmanifest",
    "/icons/icon-192.png",
    "/planning",
  ]) {
    assert.equal(legacyLocaleRedirect(path), undefined);
  }
});
test("regional formatting keeps metric units and Paris calendar dates", () => {
  assert.equal(kilometers(12500, "fr"), "12,5");
  assert.equal(kilometers(12500, "en"), "12.5");
  assert.equal(dateLabel("2026-10-02", undefined, "fr"), "vendredi 2 octobre");
  assert.equal(dateLabel("2026-10-02", undefined, "en"), "Friday 2 October");
  assert.equal(duration(3661, "en"), "1 hr 1 min 1 sec");
  assert.equal(
    volume({ ...trainingWeeks[0].workouts[0], plannedVolume: {} }, "en"),
    "Open volume",
  );
});
test("all demo editorial content is translated without changing training data", () => {
  const english = getTrainingWeeks("en");
  assert.equal(getTrainingWeeks("fr"), trainingWeeks);
  for (const [index, week] of trainingWeeks.entries()) {
    for (const [workoutIndex, original] of week.workouts.entries()) {
      const copy = english[index].workouts[workoutIndex];
      assert.ok(englishDemoCopy[original.id]);
      assert.equal(copy.id, original.id);
      assert.deepEqual(copy.plannedVolume, original.plannedVolume);
      assert.equal(copy.blocks.length, original.blocks.length);
      if (original.notes)
        assert.ok(copy.notes && copy.notes !== original.notes);
      for (const [blockIndex, block] of original.blocks.entries()) {
        if (block.notes)
          assert.ok(
            copy.blocks[blockIndex].notes &&
              copy.blocks[blockIndex].notes !== block.notes,
          );
      }
    }
  }
});
