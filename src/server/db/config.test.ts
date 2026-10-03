import assert from "node:assert/strict";
import test from "node:test";
import { connectionUrl, DatabaseConfigurationError, testConnectionUrl } from "./config";

const local = "postgresql://test:test@localhost:5432/training_dashboard_test";
test("configuration errors name the missing variable without disclosing credentials", () => {
  for (const value of [undefined, "invalid-sensitive-value", "https://test:test@localhost/db"]) {
    assert.throws(() => connectionUrl(value, "TRAINING_DATABASE_URL"), (error: unknown) =>
      error instanceof DatabaseConfigurationError && !error.message.includes("sensitive") && !error.message.includes("test:test"));
  }
  assert.equal(connectionUrl(local, "TRAINING_DATABASE_URL"), local);
});
test("integration guard refuses remote, production, non-dedicated and query-overridden targets", () => {
  assert.equal(testConnectionUrl({ TRAINING_TEST_DATABASE_URL: local }), local);
  for (const env of [
    {}, { TRAINING_DATABASE_URL: local },
    { TRAINING_TEST_DATABASE_URL: local.replace("localhost", "example.neon.tech") },
    { TRAINING_TEST_DATABASE_URL: local.replace("training_dashboard_test", "production") },
    { TRAINING_TEST_DATABASE_URL: local, NODE_ENV: "production" },
    { TRAINING_TEST_DATABASE_URL: local, VERCEL: "1" },
    { TRAINING_TEST_DATABASE_URL: `${local}?host=example.neon.tech` },
    { TRAINING_TEST_DATABASE_URL: `${local}?options=unsafe` },
  ]) assert.throws(() => testConnectionUrl(env), DatabaseConfigurationError);
});
