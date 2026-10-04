import assert from "node:assert/strict";
import test from "node:test";
import { developmentSeedTarget } from "./seed-config";
const env = { TRAINING_SEED_ENV: "development", TRAINING_CONFIRM_SEED: "development", TRAINING_SEED_DATABASE_URL: "postgresql://localhost/training_dashboard_test", TRAINING_SEED_ALLOWED_HOST: "localhost", TRAINING_SEED_ALLOWED_DATABASE: "training_dashboard_test", TRAINING_SEED_TARGET_NAME: "local-test" };
test("seed requires explicit recognized non-production target", () => {
  assert.equal(developmentSeedTarget(env).name, "local-test");
  assert.equal(developmentSeedTarget({ ...env, TRAINING_SEED_ENV: "preview", TRAINING_CONFIRM_SEED: "preview" }).environment, "preview");
  for (const override of [{ NODE_ENV: "production" }, { VERCEL_ENV: "production" }, { VERCEL: "1" }, { TRAINING_SEED_ENV: "production", TRAINING_CONFIRM_SEED: "production" }, { TRAINING_CONFIRM_SEED: "" }, { TRAINING_SEED_ALLOWED_HOST: "other" }, { TRAINING_SEED_ALLOWED_DATABASE: "other" }, { TRAINING_SEED_TARGET_NAME: "production" }, { TRAINING_SEED_TARGET_NAME: "https://sensitive" }, { TRAINING_PRODUCTION_DATABASE_URL: env.TRAINING_SEED_DATABASE_URL }]) {
    assert.throws(() => developmentSeedTarget({ ...env, ...override }));
  }
});
