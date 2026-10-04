import type { LocalDate } from "../../training/model/types";
import { localePath, type Locale } from "../../../i18n/locales";
export const planPath = (locale: Locale, id: string, week?: LocalDate) =>
  localePath(locale, `/plan/${encodeURIComponent(id)}`) + (week ? `?week=${week}` : "");
export const planWorkoutPath = (locale: Locale, planId: string, workoutId: string) =>
  `${planPath(locale, planId)}/workouts/${encodeURIComponent(workoutId)}`;
