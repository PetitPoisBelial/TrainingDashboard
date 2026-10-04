import { trainingWeeks } from "../../training/data/training-weeks";
import type { WorkoutId } from "../../training/model/types";
import type { TrainingPlan, TrainingPlanId } from "./types";
import { createTrainingPlan } from "./validation";

export const DEMO_PLAN_ID = "demo:v1:read-vertical" as TrainingPlanId;
const candidate: TrainingPlan = {
  id: DEMO_PLAN_ID,
  name: "Démonstration — préparation 10 km",
  description: "Plan fictif de démonstration : entraînement, semaine de récupération complète puis course. Aucune donnée personnelle.",
  startsOn: "2026-09-23", endsOn: "2026-10-18",
  workouts: [
    { ...trainingWeeks[0].workouts[0], id: "demo:v1:introduction" as WorkoutId, scheduledOn: "2026-09-23" },
    ...trainingWeeks[0].workouts.map((workout) => ({ ...workout, id: `demo:v1:${workout.id}` as WorkoutId })),
    { ...trainingWeeks[0].workouts[0], id: "demo:v1:race" as WorkoutId, scheduledOn: "2026-10-18", category: "race", title: "10 km de démonstration", isKeyWorkout: true,
      plannedVolume: { distanceMeters: 10000 }, blocks: [{ kind: "segment", role: "continuous", label: "Course", target: { kind: "distance", meters: 10000 }, pace: { fast: 215, slow: 225 } }], notes: "Course fictive. Partir régulièrement et finir selon les sensations." },
  ],
};
const result = createTrainingPlan(candidate);
if (!result.ok) throw new Error("demo.invalid");
export const demoPlan = result.value;
