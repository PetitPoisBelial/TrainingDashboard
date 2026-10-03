import type { WorkoutId } from "../model/types";
import type { TrainingWeek } from "../model/types";

export const trainingWeeks: readonly TrainingWeek[] = [
  {
    id: "2026-09-28",
    startsOn: "2026-09-28",
    workouts: [
      {
        id: "2026-09-28-endurance" as WorkoutId,
        scheduledOn: "2026-09-28",
        sport: "running",
        category: "easy",
        title: "Reprendre le rythme",
        isKeyWorkout: false,
        plannedVolume: { distanceMeters: 12000 },
        blocks: [
          {
            kind: "segment",
            role: "continuous",
            target: { kind: "distance", meters: 12000 },
            pace: { fast: 285, slow: 315 },
            notes: "Une allure aisée, qui permet de discuter.",
          },
        ],
        notes: "Rester souple et relâché. Ne pas chercher la vitesse.",
      },
      {
        id: "2026-09-29-intervalles" as WorkoutId,
        scheduledOn: "2026-09-29",
        sport: "running",
        category: "intervals",
        title: "4 × 2 000 m",
        isKeyWorkout: true,
        plannedVolume: { distanceMeters: 16000 },
        blocks: [
          {
            kind: "segment",
            role: "warmup",
            target: { kind: "duration", seconds: 1200 },
            notes: "Monter progressivement en température.",
          },
          {
            kind: "segment",
            role: "drills",
            target: { kind: "duration", seconds: 300 },
            notes: "Gammes et quelques accélérations progressives.",
          },
          {
            kind: "repeats",
            count: 4,
            effort: { kind: "distance", meters: 2000 },
            pace: { fast: 210, slow: 212 },
            recovery: { target: { kind: "duration", seconds: 120 } },
            notes:
              "Trois récupérations trottées, uniquement entre les répétitions.",
          },
          {
            kind: "segment",
            role: "cooldown",
            target: { kind: "duration", seconds: 900 },
            notes: "Courir très facilement.",
          },
        ],
        notes:
          "Chercher la régularité sur les quatre répétitions. Volume global estimé, récupérations incluses.",
      },
      {
        id: "2026-09-30-endurance" as WorkoutId,
        scheduledOn: "2026-09-30",
        sport: "running",
        category: "easy",
        title: "Footing en aisance",
        isKeyWorkout: false,
        plannedVolume: { distanceMeters: 14000 },
        blocks: [
          {
            kind: "segment",
            role: "continuous",
            target: { kind: "distance", meters: 14000 },
            pace: { fast: 285, slow: 315 },
          },
        ],
      },
      {
        id: "2026-09-30-velo" as WorkoutId,
        scheduledOn: "2026-09-30",
        sport: "cycling",
        category: "recovery",
        title: "Tourner les jambes",
        isKeyWorkout: false,
        plannedVolume: { distanceMeters: 20000, durationSeconds: 3600 },
        blocks: [
          {
            kind: "segment",
            role: "continuous",
            target: { kind: "duration", seconds: 3600 },
            notes: "Terrain plat, faible résistance et cadence confortable.",
          },
        ],
      },
      {
        id: "2026-10-01-seuil" as WorkoutId,
        scheduledOn: "2026-10-01",
        sport: "running",
        category: "tempo",
        title: "Le tempo juste",
        isKeyWorkout: true,
        plannedVolume: { distanceMeters: 16000 },
        blocks: [
          {
            kind: "segment",
            role: "warmup",
            target: { kind: "duration", seconds: 1200 },
          },
          {
            kind: "repeats",
            count: 3,
            effort: { kind: "duration", seconds: 600 },
            pace: { fast: 225, slow: 230 },
            recovery: { target: { kind: "duration", seconds: 120 } },
            notes: "Deux récupérations trottées entre les trois efforts.",
          },
          {
            kind: "segment",
            role: "cooldown",
            target: { kind: "duration", seconds: 600 },
          },
        ],
        notes:
          "Un effort soutenu mais maîtrisé. Le volume total reste une estimation.",
      },
      {
        id: "2026-10-03-facile" as WorkoutId,
        scheduledOn: "2026-10-03",
        sport: "running",
        category: "recovery",
        title: "Garder de la fraîcheur",
        isKeyWorkout: false,
        plannedVolume: { distanceMeters: 10000 },
        blocks: [
          {
            kind: "segment",
            role: "continuous",
            target: { kind: "distance", meters: 10000 },
            notes:
              "Sans contrainte d’allure. Préserver les jambes pour demain.",
          },
        ],
      },
      {
        id: "2026-10-04-longue" as WorkoutId,
        scheduledOn: "2026-10-04",
        sport: "running",
        category: "long-run",
        title: "Prendre le temps",
        isKeyWorkout: true,
        plannedVolume: { distanceMeters: 24000 },
        blocks: [
          {
            kind: "segment",
            role: "continuous",
            target: { kind: "distance", meters: 20000 },
            pace: { fast: 280, slow: 300 },
          },
          {
            kind: "segment",
            role: "cooldown",
            target: { kind: "distance", meters: 4000 },
            notes: "Finir tranquillement, sans accélérer.",
          },
        ],
        notes:
          "Prévoir de l’eau et un ravitaillement. Une sortie en endurance, sans objectif de performance.",
      },
    ],
  },
];
