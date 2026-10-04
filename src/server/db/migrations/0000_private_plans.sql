CREATE TYPE "public"."block_kind" AS ENUM('segment', 'repeats');--> statement-breakpoint
CREATE TYPE "public"."workout_category" AS ENUM('easy', 'recovery', 'long-run', 'tempo', 'intervals', 'race', 'other');--> statement-breakpoint
CREATE TYPE "public"."segment_role" AS ENUM('warmup', 'continuous', 'recovery', 'drills', 'cooldown', 'other');--> statement-breakpoint
CREATE TYPE "public"."sport" AS ENUM('running', 'cycling');--> statement-breakpoint
CREATE TABLE "application_state" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"active_plan_id" text,
	"revision" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "application_state_singleton" CHECK ("application_state"."id" = 1),
	CONSTRAINT "application_state_revision_positive" CHECK ("application_state"."revision" > 0)
);
--> statement-breakpoint
CREATE TABLE "training_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"description" text,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_id_valid" CHECK (length("training_plans"."id") > 0 AND "training_plans"."id" = btrim("training_plans"."id")),
	CONSTRAINT "plan_name_valid" CHECK (length(btrim("training_plans"."name")) BETWEEN 1 AND 120),
	CONSTRAINT "plan_period_valid" CHECK ("training_plans"."starts_on" <= "training_plans"."ends_on" AND "training_plans"."starts_on" >= DATE '0001-01-01' AND "training_plans"."ends_on" <= DATE '9999-12-31'),
	CONSTRAINT "plan_revision_positive" CHECK ("training_plans"."revision" > 0)
);
--> statement-breakpoint
CREATE TABLE "workout_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" text NOT NULL,
	"position" integer NOT NULL,
	"kind" "block_kind" NOT NULL,
	"role" "segment_role",
	"label" text,
	"repeat_count" integer,
	"target_meters" double precision,
	"target_seconds" double precision,
	"pace_fast" double precision,
	"pace_slow" double precision,
	"recovery_meters" double precision,
	"recovery_seconds" double precision,
	"recovery_pace_fast" double precision,
	"recovery_pace_slow" double precision,
	"recovery_notes" text,
	"notes" text,
	CONSTRAINT "block_position_unique" UNIQUE("workout_id","position"),
	CONSTRAINT "block_position_nonnegative" CHECK ("workout_blocks"."position" >= 0),
	CONSTRAINT "block_shape_valid" CHECK (("workout_blocks"."kind" = 'segment' AND "workout_blocks"."role" IS NOT NULL AND "workout_blocks"."repeat_count" IS NULL AND "workout_blocks"."recovery_meters" IS NULL AND "workout_blocks"."recovery_seconds" IS NULL AND "workout_blocks"."recovery_pace_fast" IS NULL AND "workout_blocks"."recovery_pace_slow" IS NULL AND "workout_blocks"."recovery_notes" IS NULL) OR ("workout_blocks"."kind" = 'repeats' AND "workout_blocks"."role" IS NULL AND "workout_blocks"."repeat_count" IS NOT NULL AND "workout_blocks"."repeat_count" > 0 AND ("workout_blocks"."target_meters" IS NOT NULL OR "workout_blocks"."target_seconds" IS NOT NULL))),
	CONSTRAINT "block_target_exclusive" CHECK ("workout_blocks"."target_meters" IS NULL OR "workout_blocks"."target_seconds" IS NULL),
	CONSTRAINT "block_recovery_exclusive" CHECK ("workout_blocks"."recovery_meters" IS NULL OR "workout_blocks"."recovery_seconds" IS NULL),
	CONSTRAINT "block_recovery_required" CHECK (("workout_blocks"."recovery_meters" IS NOT NULL OR "workout_blocks"."recovery_seconds" IS NOT NULL) OR ("workout_blocks"."recovery_pace_fast" IS NULL AND "workout_blocks"."recovery_pace_slow" IS NULL AND "workout_blocks"."recovery_notes" IS NULL)),
	CONSTRAINT "block_pace_valid" CHECK (("workout_blocks"."pace_fast" IS NULL AND "workout_blocks"."pace_slow" IS NULL) OR ("workout_blocks"."pace_fast" IS NOT NULL AND "workout_blocks"."pace_slow" IS NOT NULL AND "workout_blocks"."pace_fast" > 0 AND "workout_blocks"."pace_fast" <= "workout_blocks"."pace_slow" AND "workout_blocks"."pace_slow" < 'Infinity'::float8)),
	CONSTRAINT "block_recovery_pace_valid" CHECK (("workout_blocks"."recovery_pace_fast" IS NULL AND "workout_blocks"."recovery_pace_slow" IS NULL) OR ("workout_blocks"."recovery_pace_fast" IS NOT NULL AND "workout_blocks"."recovery_pace_slow" IS NOT NULL AND "workout_blocks"."recovery_pace_fast" > 0 AND "workout_blocks"."recovery_pace_fast" <= "workout_blocks"."recovery_pace_slow" AND "workout_blocks"."recovery_pace_slow" < 'Infinity'::float8)),
	CONSTRAINT "block_target_0_positive" CHECK ("workout_blocks"."target_meters" IS NULL OR ("workout_blocks"."target_meters" > 0 AND "workout_blocks"."target_meters" < 'Infinity'::float8)),
	CONSTRAINT "block_target_1_positive" CHECK ("workout_blocks"."target_seconds" IS NULL OR ("workout_blocks"."target_seconds" > 0 AND "workout_blocks"."target_seconds" < 'Infinity'::float8)),
	CONSTRAINT "block_target_2_positive" CHECK ("workout_blocks"."recovery_meters" IS NULL OR ("workout_blocks"."recovery_meters" > 0 AND "workout_blocks"."recovery_meters" < 'Infinity'::float8)),
	CONSTRAINT "block_target_3_positive" CHECK ("workout_blocks"."recovery_seconds" IS NULL OR ("workout_blocks"."recovery_seconds" > 0 AND "workout_blocks"."recovery_seconds" < 'Infinity'::float8))
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" text PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"scheduled_on" date NOT NULL,
	"position" integer NOT NULL,
	"sport" "sport" NOT NULL,
	"category" "workout_category" NOT NULL,
	"title" text NOT NULL,
	"is_key" boolean NOT NULL,
	"planned_distance_meters" double precision,
	"planned_duration_seconds" double precision,
	"notes" text,
	CONSTRAINT "workout_day_position_unique" UNIQUE("plan_id","scheduled_on","position"),
	CONSTRAINT "workout_id_valid" CHECK (length("workouts"."id") > 0 AND "workouts"."id" = btrim("workouts"."id")),
	CONSTRAINT "workout_position_nonnegative" CHECK ("workouts"."position" >= 0),
	CONSTRAINT "workout_date_valid" CHECK ("workouts"."scheduled_on" BETWEEN DATE '0001-01-01' AND DATE '9999-12-31'),
	CONSTRAINT "workout_distance_positive" CHECK ("workouts"."planned_distance_meters" IS NULL OR ("workouts"."planned_distance_meters" > 0 AND "workouts"."planned_distance_meters" < 'Infinity'::float8)),
	CONSTRAINT "workout_duration_positive" CHECK ("workouts"."planned_duration_seconds" IS NULL OR ("workouts"."planned_duration_seconds" > 0 AND "workouts"."planned_duration_seconds" < 'Infinity'::float8)),
	CONSTRAINT "workout_volume_required" CHECK (("workouts"."sport" = 'running' AND "workouts"."planned_distance_meters" IS NOT NULL) OR ("workouts"."sport" = 'cycling' AND ("workouts"."planned_distance_meters" IS NOT NULL OR "workouts"."planned_duration_seconds" IS NOT NULL)))
);
--> statement-breakpoint
ALTER TABLE "application_state" ADD CONSTRAINT "application_state_active_plan_id_training_plans_id_fk" FOREIGN KEY ("active_plan_id") REFERENCES "public"."training_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_blocks" ADD CONSTRAINT "workout_blocks_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_plan_id_training_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."training_plans"("id") ON DELETE cascade ON UPDATE no action;