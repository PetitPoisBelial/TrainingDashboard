import { sql } from "drizzle-orm";
import { boolean, check, date, doublePrecision, integer, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const sport = pgEnum("sport", ["running", "cycling"]);
export const category = pgEnum("workout_category", ["easy", "recovery", "long-run", "tempo", "intervals", "race", "other"]);
export const blockKind = pgEnum("block_kind", ["segment", "repeats"]);
export const segmentRole = pgEnum("segment_role", ["warmup", "continuous", "recovery", "drills", "cooldown", "other"]);
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const trainingPlans = pgTable("training_plans", {
  // Opaque IDs remain text: the domain also accepts stable non-UUID identifiers.
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  startsOn: date("starts_on").notNull(),
  endsOn: date("ends_on").notNull(),
  description: text("description"),
  revision: integer("revision").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: updatedAt(),
}, (t) => [
  check("plan_id_valid", sql`length(${t.id}) > 0 AND ${t.id} = btrim(${t.id})`),
  check("plan_name_valid", sql`length(btrim(${t.name})) BETWEEN 1 AND 120`),
  check("plan_period_valid", sql`${t.startsOn} <= ${t.endsOn} AND ${t.startsOn} >= DATE '0001-01-01' AND ${t.endsOn} <= DATE '9999-12-31'`),
  check("plan_revision_positive", sql`${t.revision} > 0`),
]);

export const workouts = pgTable("workouts", {
  id: text("id").primaryKey(),
  planId: text("plan_id").notNull().references(() => trainingPlans.id, { onDelete: "cascade" }),
  scheduledOn: date("scheduled_on").notNull(),
  position: integer("position").notNull(),
  sport: sport("sport").notNull(),
  category: category("category").notNull(),
  title: text("title").notNull(),
  isKey: boolean("is_key").notNull(),
  plannedDistanceMeters: doublePrecision("planned_distance_meters"),
  plannedDurationSeconds: doublePrecision("planned_duration_seconds"),
  notes: text("notes"),
}, (t) => [
  unique("workout_day_position_unique").on(t.planId, t.scheduledOn, t.position),
  check("workout_id_valid", sql`length(${t.id}) > 0 AND ${t.id} = btrim(${t.id})`),
  check("workout_position_nonnegative", sql`${t.position} >= 0`),
  check("workout_date_valid", sql`${t.scheduledOn} BETWEEN DATE '0001-01-01' AND DATE '9999-12-31'`),
  check("workout_distance_positive", sql`${t.plannedDistanceMeters} IS NULL OR (${t.plannedDistanceMeters} > 0 AND ${t.plannedDistanceMeters} < 'Infinity'::float8)`),
  check("workout_duration_positive", sql`${t.plannedDurationSeconds} IS NULL OR (${t.plannedDurationSeconds} > 0 AND ${t.plannedDurationSeconds} < 'Infinity'::float8)`),
  check("workout_volume_required", sql`(${t.sport} = 'running' AND ${t.plannedDistanceMeters} IS NOT NULL) OR (${t.sport} = 'cycling' AND (${t.plannedDistanceMeters} IS NOT NULL OR ${t.plannedDurationSeconds} IS NOT NULL))`),
]);

export const workoutBlocks = pgTable("workout_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutId: text("workout_id").notNull().references(() => workouts.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  kind: blockKind("kind").notNull(),
  role: segmentRole("role"),
  label: text("label"),
  repeatCount: integer("repeat_count"),
  targetMeters: doublePrecision("target_meters"),
  targetSeconds: doublePrecision("target_seconds"),
  paceFast: doublePrecision("pace_fast"),
  paceSlow: doublePrecision("pace_slow"),
  recoveryMeters: doublePrecision("recovery_meters"),
  recoverySeconds: doublePrecision("recovery_seconds"),
  recoveryPaceFast: doublePrecision("recovery_pace_fast"),
  recoveryPaceSlow: doublePrecision("recovery_pace_slow"),
  recoveryNotes: text("recovery_notes"),
  notes: text("notes"),
}, (t) => [
  unique("block_position_unique").on(t.workoutId, t.position),
  check("block_position_nonnegative", sql`${t.position} >= 0`),
  check("block_shape_valid", sql`(${t.kind} = 'segment' AND ${t.role} IS NOT NULL AND ${t.repeatCount} IS NULL AND ${t.recoveryMeters} IS NULL AND ${t.recoverySeconds} IS NULL AND ${t.recoveryPaceFast} IS NULL AND ${t.recoveryPaceSlow} IS NULL AND ${t.recoveryNotes} IS NULL) OR (${t.kind} = 'repeats' AND ${t.role} IS NULL AND ${t.repeatCount} IS NOT NULL AND ${t.repeatCount} > 0 AND (${t.targetMeters} IS NOT NULL OR ${t.targetSeconds} IS NOT NULL))`),
  check("block_target_exclusive", sql`${t.targetMeters} IS NULL OR ${t.targetSeconds} IS NULL`),
  check("block_recovery_exclusive", sql`${t.recoveryMeters} IS NULL OR ${t.recoverySeconds} IS NULL`),
  check("block_recovery_required", sql`(${t.recoveryMeters} IS NOT NULL OR ${t.recoverySeconds} IS NOT NULL) OR (${t.recoveryPaceFast} IS NULL AND ${t.recoveryPaceSlow} IS NULL AND ${t.recoveryNotes} IS NULL)`),
  check("block_pace_valid", sql`(${t.paceFast} IS NULL AND ${t.paceSlow} IS NULL) OR (${t.paceFast} IS NOT NULL AND ${t.paceSlow} IS NOT NULL AND ${t.paceFast} > 0 AND ${t.paceFast} <= ${t.paceSlow} AND ${t.paceSlow} < 'Infinity'::float8)`),
  check("block_recovery_pace_valid", sql`(${t.recoveryPaceFast} IS NULL AND ${t.recoveryPaceSlow} IS NULL) OR (${t.recoveryPaceFast} IS NOT NULL AND ${t.recoveryPaceSlow} IS NOT NULL AND ${t.recoveryPaceFast} > 0 AND ${t.recoveryPaceFast} <= ${t.recoveryPaceSlow} AND ${t.recoveryPaceSlow} < 'Infinity'::float8)`),
  ...[t.targetMeters, t.targetSeconds, t.recoveryMeters, t.recoverySeconds].map((column, i) =>
    check(`block_target_${i}_positive`, sql`${column} IS NULL OR (${column} > 0 AND ${column} < 'Infinity'::float8)`)),
]);

export const applicationState = pgTable("application_state", {
  id: integer("id").primaryKey().default(1),
  activePlanId: text("active_plan_id").references(() => trainingPlans.id, { onDelete: "restrict" }),
  revision: integer("revision").notNull().default(1),
  updatedAt: updatedAt(),
}, (t) => [
  check("application_state_singleton", sql`${t.id} = 1`),
  check("application_state_revision_positive", sql`${t.revision} > 0`),
]);
