import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/server/db/schema";
import { developmentSeedTarget } from "../src/features/plans/server/seed-config";
import { insertPlanAggregateIfAbsent } from "../src/features/plans/server/persistence";
import { demoPlan } from "../src/features/plans/model/demo-plan";

async function main() {
  const target = developmentSeedTarget(process.env);
  const label = `${target.environment} / ${target.name} / ${target.host} / ${target.database}`;
  if (!process.argv.includes("--write")) {
    console.log(`Seed prepared, no connection or write: ${label}. ${demoPlan.workouts.length} demonstration workouts; inactive. Use --write only after authorization.`);
    return;
  }
  const pool = new Pool({ connectionString: target.url, max: 1, connectionTimeoutMillis: 10000 });
  pool.on("error", () => console.error("seed.pool.failure"));
  try {
    console.log(`Seed ${await insertPlanAggregateIfAbsent(drizzle(pool, { schema }), demoPlan)}: ${label}. Demonstration only; application state unchanged.`);
  } finally { await pool.end(); }
}
main().catch(() => { console.error("Seed refused or failed; connection details suppressed. Check the non-production runbook."); process.exitCode = 1; });
