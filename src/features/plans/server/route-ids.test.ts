import assert from "node:assert/strict";
import test from "node:test";
import { routePlanId, routeWorkoutId } from "./route-ids";
test("route IDs decode once, retain opaque delimiters and reject malformed escapes", () => {
  assert.deepEqual(routePlanId("demo%3Av1%3Aread-vertical"), { ok: true, value: "demo:v1:read-vertical" });
  assert.deepEqual(routeWorkoutId("a%2Fb"), { ok: true, value: "a/b" });
  assert.deepEqual(routePlanId("a%252Fb"), { ok: true, value: "a%2Fb" });
  assert.equal(routePlanId("bad%escape").ok, false);
});
