export type LocalDate = `${number}-${number}-${number}`;
declare const workoutIdBrand: unique symbol;
export type WorkoutId = string & { readonly [workoutIdBrand]: true };
export type Target = Readonly<
  { kind: "distance"; meters: number } | { kind: "duration"; seconds: number }
>;
export type Pace = Readonly<{ fast: number; slow: number }>;
export type Recovery = Readonly<{ target: Target; pace?: Pace; notes?: string }>;
export type SegmentRole =
  "warmup" | "continuous" | "recovery" | "drills" | "cooldown" | "other";
export type WorkoutBlock = Readonly<
  | {
      kind: "segment";
      role: SegmentRole;
      target?: Target;
      label?: string;
      pace?: Pace;
      notes?: string;
    }
  | {
      kind: "repeats";
      count: number;
      effort: Target;
      label?: string;
      pace?: Pace;
      recovery?: Recovery;
      notes?: string;
    }
>;
export type Workout = Readonly<{
  id: WorkoutId;
  scheduledOn: LocalDate;
  sport: "running" | "cycling";
  category: "easy" | "recovery" | "long-run" | "tempo" | "intervals" | "race" | "other";
  title: string;
  isKeyWorkout: boolean;
  plannedVolume: Readonly<{
    // Legacy demo data may have unknown volume. Plans validate sport requirements.
    distanceMeters?: number;
    durationSeconds?: number;
  }>;
  blocks: readonly WorkoutBlock[];
  notes?: string;
}>;
export type TrainingWeek = Readonly<{
  id: string;
  startsOn: LocalDate;
  workouts: readonly Workout[];
}>;
