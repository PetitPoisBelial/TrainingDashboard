import assert from "node:assert/strict";
import test from "node:test";
import { isNavigationItemActive, navigationItems } from "./navigation-items";

const activeLabels = (pathname: string) =>
  navigationItems
    .filter((item) => isNavigationItemActive(item, pathname))
    .map((item) => item.label);

test("primary destinations have exactly one active entry", () => {
  for (const item of navigationItems) {
    assert.deepEqual(activeLabels(item.href), [item.label]);
  }
});

test("workout details and nested plan routes belong to Plan", () => {
  assert.deepEqual(activeLabels("/workouts/2026-09-29-intervalles"), ["Plan"]);
  assert.deepEqual(activeLabels("/plan/week"), ["Plan"]);
  assert.deepEqual(activeLabels("/activities/example"), ["Activités"]);
});

test("matching respects segment boundaries and unknown pages", () => {
  assert.deepEqual(activeLabels("/planning"), []);
  assert.deepEqual(activeLabels("/workouts-archive/example"), []);
  assert.deepEqual(activeLabels("/unknown"), []);
  assert.deepEqual(activeLabels("/insights/"), ["Analyses"]);
});
