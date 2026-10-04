import assert from "node:assert/strict";
import test from "node:test";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { Pool, type PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";
import { testConnectionUrl } from "../../src/server/db/config";
import * as schema from "../../src/server/db/schema";
import { insertPlanAggregateIfAbsent } from "../../src/features/plans/server/persistence";
import { demoPlan } from "../../src/features/plans/model/demo-plan";
import { planPath, planWorkoutPath } from "../../src/features/plans/model/paths";

test("production HTTP read routes on dedicated local PostgreSQL only (requires pnpm build)", async (t) => {
  const url = testConnectionUrl(process.env);
  const pool = new Pool({ connectionString: url, max: 3, connectionTimeoutMillis: 3000 });
  const db = drizzle(pool, { schema });
  let owned = false;
  let lock: PoolClient | undefined;
  let server: ReturnType<typeof spawn> | undefined;
  const base = "http://127.0.0.1:3104";
  try {
    lock = await pool.connect();
    const result = await lock.query("SELECT pg_try_advisory_lock(87493021) AS locked");
    if (!result.rows[0].locked) throw new Error("http.test.database-busy");
    const existing = await pool.query("SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind IN ('r','v','m','S') UNION ALL SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e' UNION ALL SELECT 1 FROM pg_namespace WHERE nspname = 'drizzle'");
    if (existing.rowCount) throw new Error("http.test.requires-empty-database");
    await migrate(db, { migrationsFolder: "src/server/db/migrations" });
    owned = true;
    await db.insert(schema.applicationState).values({ id: 1 });
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3104"], {
      env: { ...process.env, TRAINING_DATABASE_URL: url, NODE_ENV: "production" }, stdio: "ignore",
    });
    server.on("error", () => {});
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      try { if ((await fetch(`${base}/fr/plan`)).status === 200) { ready = true; break; } } catch {}
      if (server.exitCode !== null) break;
      await delay(100);
    }
    assert.ok(ready, "local HTTP server must start from existing production build");
    await t.test("empty and inactive are separate states", async () => {
      const response = await fetch(`${base}/fr/plan`);
      const html = await response.text();
      assert.ok(html.includes("Aucun plan enregistré"));
      assert.ok(html.includes("Aucun plan actif"));
      assert.ok(response.headers.get("cache-control")?.includes("no-store"));
    });
    await insertPlanAggregateIfAbsent(db, demoPlan);
    for (const locale of ["fr", "en"] as const) {
      await t.test(`${locale}: persisted list, detail, rest, invalid week and canonical workout`, async () => {
        const list = await fetch(`${base}/${locale}/plan`);
        assert.equal(list.status, 200);
        assert.ok((await list.text()).includes(demoPlan.name));
        for (const path of [planPath(locale, demoPlan.id), planPath(locale, demoPlan.id, "2026-09-21"), planWorkoutPath(locale, demoPlan.id, demoPlan.workouts[2].id)]) {
          const response = await fetch(base + path);
          assert.equal(response.status, 200);
          assert.ok(response.headers.get("cache-control")?.includes("no-store"));
        }
        const rest = await fetch(base + planPath(locale, demoPlan.id, "2026-10-05"));
        assert.ok((await rest.text()).includes(locale === "fr" ? "Semaine sans séance" : "Week without workouts"));
        const invalid = await fetch(base + planPath(locale, demoPlan.id) + "?week=invalid");
        assert.ok((await invalid.text()).includes(locale === "fr" ? "La semaine demandée est invalide" : "The requested week is invalid"));
        const workout = await fetch(base + planWorkoutPath(locale, demoPlan.id, demoPlan.workouts[2].id));
        assert.ok((await workout.text()).includes("?week=2026-09-28"));
      });
      await t.test(`${locale}: unknown plan, workout and foreign association return HTTP 404`, async () => {
        for (const path of [planPath(locale, "unknown"), planWorkoutPath(locale, demoPlan.id, "unknown"), planWorkoutPath(locale, demoPlan.id, "2026-09-29-intervalles")]) {
          assert.equal((await fetch(base + path)).status, 404);
        }
      });
      await t.test(`${locale}: V0 routes still work`, async () => {
        assert.equal((await fetch(`${base}/${locale}`)).status, 200);
        assert.equal((await fetch(`${base}/${locale}/workouts/2026-09-29-intervalles`)).status, 200);
        assert.equal((await fetch(`${base}/${locale}/workouts/unknown`)).status, 404);
      });
    }
    await t.test("database failure is never empty or 404; recovery rereads PostgreSQL", async () => {
      await db.execute(sql`ALTER TABLE training_plans RENAME TO temporarily_unavailable`);
      try {
        for (const path of ["/fr/plan", planPath("fr", demoPlan.id)]) {
          const response = await fetch(base + path);
          assert.notEqual(response.status, 404);
          const html = await response.text();
          assert.ok(html.includes("La lecture des plans a échoué"));
          assert.ok(!html.includes("Aucun plan enregistré"));
          assert.ok(!html.includes(url));
        }
      } finally { await db.execute(sql`ALTER TABLE temporarily_unavailable RENAME TO training_plans`); }
      assert.equal((await fetch(base + planPath("fr", demoPlan.id))).status, 200);
    });
  } finally {
    if (server && server.exitCode === null) {
      const stopped = once(server, "exit");
      server.kill();
      await stopped;
    }
    try {
      if (owned) await db.transaction(async (tx) => {
        await tx.execute(sql`DROP TABLE application_state, workout_blocks, workouts, training_plans`);
        await tx.execute(sql`DROP TYPE block_kind, workout_category, segment_role, sport`);
        await tx.execute(sql`DROP TABLE drizzle.__drizzle_migrations`);
        await tx.execute(sql`DROP SCHEMA drizzle`);
      });
    } finally {
      if (lock) { await lock.query("SELECT pg_advisory_unlock(87493021)"); lock.release(); }
      await pool.end();
    }
  }
});
