export type LocalDate = `${number}-${number}-${number}`;
export type Target = Readonly<
  { kind: "distance"; meters: number } | { kind: "duration"; seconds: number }
>;
export type Pace = Readonly<{ fast: number; slow: number }>;
export type SegmentRole =
  "warmup" | "continuous" | "recovery" | "drills" | "cooldown" | "other";
export type WorkoutBlock = Readonly<
  | {
      kind: "segment";
      role: SegmentRole;
      target?: Target;
      pace?: Pace;
      notes?: string;
    }
  | {
      kind: "repeats";
      count: number;
      effort: Target;
      pace?: Pace;
      recovery?: Target;
      notes?: string;
    }
>;
export type Workout = Readonly<{
  id: string;
  scheduledOn: LocalDate;
  sport: "running" | "cycling";
  category: "easy" | "recovery" | "long-run" | "tempo" | "intervals" | "other";
  title: string;
  isKeyWorkout: boolean;
  plannedVolume: Readonly<{
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
