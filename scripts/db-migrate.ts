import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { connectionUrl } from "../src/server/db/config";

async function main() {
  if (!["development", "preview", "production"].includes(process.env.TRAINING_MIGRATION_ENV ?? "") ||
      process.env.TRAINING_CONFIRM_MIGRATION !== process.env.TRAINING_MIGRATION_ENV) {
    throw new Error("Set TRAINING_MIGRATION_ENV and matching TRAINING_CONFIRM_MIGRATION explicitly");
  }
  if (process.env.VERCEL) throw new Error("Migrations cannot run in Vercel builds/functions");
  const pool = new Pool({ connectionString: connectionUrl(process.env.TRAINING_MIGRATION_DATABASE_URL, "TRAINING_MIGRATION_DATABASE_URL"), max: 1 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: "src/server/db/migrations" });
    // Idempotent initialization belongs to this explicit command, never to a read.
    await pool.query("INSERT INTO application_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING");
    console.log("db.migration.complete");
  } finally {
    await pool.end();
  }
}
main().catch(() => { console.error("db.migration.failed: check configuration, authorization and database state locally; no connection details logged"); process.exitCode = 1; });
