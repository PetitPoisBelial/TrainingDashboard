import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { connectionUrl } from "./config";
import * as schema from "./schema";

export type Database = ReturnType<typeof drizzle<typeof schema>>;
const globalDb = globalThis as typeof globalThis & { trainingDatabase?: Database };

// Lazy: no configuration, connection or migration at import/build time.
export function getDatabase(): Database {
  if (!globalDb.trainingDatabase) {
    const pool = new Pool({
      connectionString: connectionUrl(process.env.TRAINING_DATABASE_URL, "TRAINING_DATABASE_URL"),
      max: 4,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 10000,
    });
    pool.on("error", () => console.error("db.pool.unexpected-error"));
    if (process.env.VERCEL) attachDatabasePool(pool);
    globalDb.trainingDatabase = drizzle(pool, { schema });
  }
  return globalDb.trainingDatabase;
}
