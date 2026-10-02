import type { Locale } from "@/i18n/locales";
import type { TrainingWeek } from "../model/types";
import { trainingWeeks } from "./training-weeks";

type DemoCopy = Readonly<{
  title: string;
  notes?: string;
  blockNotes: readonly (string | undefined)[];
}>;
export const englishDemoCopy: Readonly<Record<string, DemoCopy>> = {
  "2026-09-28-endurance": {
    title: "Find your rhythm",
    notes: "Stay loose and relaxed. Do not chase speed.",
    blockNotes: ["An easy pace that lets you hold a conversation."],
  },
  "2026-09-29-intervalles": {
    title: "4 × 2,000 m",
    notes:
      "Aim for consistency across all four repetitions. Estimated total volume includes recovery.",
    blockNotes: [
      "Warm up gradually.",
      "Running drills and a few progressive strides.",
      "Three jogging recoveries, only between repetitions.",
      "Run very easily.",
    ],
  },
  "2026-09-30-endurance": { title: "An easy run", blockNotes: [undefined] },
  "2026-09-30-velo": {
    title: "Keep the legs moving",
    blockNotes: ["Flat terrain, low resistance and a comfortable cadence."],
  },
  "2026-10-01-seuil": {
    title: "Find the right tempo",
    notes:
      "A sustained but controlled effort. The total volume is an estimate.",
    blockNotes: [
      undefined,
      "Two jogging recoveries between the three efforts.",
      undefined,
    ],
  },
  "2026-10-03-facile": {
    title: "Stay fresh",
    blockNotes: ["No pace target. Save your legs for tomorrow."],
  },
  "2026-10-04-longue": {
    title: "Take your time",
    notes:
      "Bring water and fuel. An endurance run without a performance target.",
    blockNotes: [undefined, "Finish gently, without speeding up."],
  },
};

// Only the built-in demo is translated. Future user-written text keeps its original language.
export function getTrainingWeeks(locale: Locale): readonly TrainingWeek[] {
  if (locale === "fr") return trainingWeeks;
  return trainingWeeks.map((week) => ({
    ...week,
    workouts: week.workouts.map((workout) => {
      const copy = englishDemoCopy[workout.id];
      if (!copy) return workout;
      return {
        ...workout,
        title: copy.title,
        notes: copy.notes,
        blocks: workout.blocks.map((block, index) => ({
          ...block,
          notes: copy.blockNotes[index],
        })),
      };
    }),
  }));
}
