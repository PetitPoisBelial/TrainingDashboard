import { connectionUrl, DatabaseConfigurationError } from "../../../server/db/config";

export function developmentSeedTarget(env: Readonly<Record<string, string | undefined>>) {
  const environment = env.TRAINING_SEED_ENV;
  if (env.NODE_ENV === "production" || env.VERCEL_ENV === "production" || env.VERCEL || !["development", "preview"].includes(environment ?? "") || env.TRAINING_CONFIRM_SEED !== environment) {
    throw new DatabaseConfigurationError("seed.non-production-confirmation-required");
  }
  const value = connectionUrl(env.TRAINING_SEED_DATABASE_URL, "TRAINING_SEED_DATABASE_URL");
  const url = new URL(value);
  // Exact operator allowlist, independently checked in Neon before authorization.
  if (!env.TRAINING_SEED_ALLOWED_HOST || url.hostname !== env.TRAINING_SEED_ALLOWED_HOST ||
      !env.TRAINING_SEED_ALLOWED_DATABASE || decodeURIComponent(url.pathname.slice(1)) !== env.TRAINING_SEED_ALLOWED_DATABASE ||
      /prod/i.test(`${url.hostname}/${url.pathname}/${env.TRAINING_SEED_TARGET_NAME ?? ""}`) ||
      !/^[a-zA-Z0-9_-]{1,80}$/.test(env.TRAINING_SEED_TARGET_NAME ?? "") || value === env.TRAINING_PRODUCTION_DATABASE_URL) {
    throw new DatabaseConfigurationError("seed.target-not-recognized");
  }
  return { url: value, environment: environment!, name: env.TRAINING_SEED_TARGET_NAME, host: url.hostname, database: decodeURIComponent(url.pathname.slice(1)) };
}
