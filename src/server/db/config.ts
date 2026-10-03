export class DatabaseConfigurationError extends Error {
  readonly code = "db.configuration";
}

export function connectionUrl(value: string | undefined, variable: string): string {
  if (!value) throw new DatabaseConfigurationError(`${variable} is required`);
  try {
    const url = new URL(value);
    if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || !url.pathname.slice(1)) throw new Error();
    return value;
  } catch {
    throw new DatabaseConfigurationError(`${variable} must be a PostgreSQL URL`);
  }
}

export function testConnectionUrl(env: Readonly<Record<string, string | undefined>>): string {
  // No external URL is accepted, even with an acknowledgement flag.
  const value = connectionUrl(env.TRAINING_TEST_DATABASE_URL, "TRAINING_TEST_DATABASE_URL");
  const url = new URL(value);
  if (env.VERCEL || env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      decodeURIComponent(url.pathname) !== "/training_dashboard_test" ||
      url.search !== "") {
    throw new DatabaseConfigurationError("Integration tests require local training_dashboard_test outside Vercel/production");
  }
  return value;
}
