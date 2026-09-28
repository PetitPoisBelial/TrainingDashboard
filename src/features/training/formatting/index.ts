import type {
  LocalDate,
  Pace,
  SegmentRole,
  Target,
  Workout,
} from "../model/types";

const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
export const kilometers = (meters: number) => number.format(meters / 1000);
export function duration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return [
    hours ? `${hours} h` : "",
    minutes ? `${minutes} min` : "",
    remainder || !seconds ? `${remainder} s` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
export const target = (value: Target) =>
  value.kind === "distance"
    ? value.meters < 1000
      ? `${number.format(value.meters)} m`
      : `${kilometers(value.meters)} km`
    : duration(value.seconds);
const paceValue = (seconds: number) =>
  `${Math.floor(seconds / 60)}′${String(seconds % 60).padStart(2, "0")}`;
export const pace = (value: Pace) =>
  `${paceValue(value.fast)}${value.fast === value.slow ? "" : `–${paceValue(value.slow)}`}/km`;
export const dateLabel = (
  date: LocalDate,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
  },
) =>
  new Intl.DateTimeFormat("fr-FR", { ...options, timeZone: "UTC" }).format(
    new Date(`${date}T12:00:00Z`),
  );
export const volume = (workout: Workout) =>
  [
    workout.plannedVolume.distanceMeters !== undefined
      ? `${kilometers(workout.plannedVolume.distanceMeters)} km`
      : "",
    workout.plannedVolume.durationSeconds !== undefined
      ? duration(workout.plannedVolume.durationSeconds)
      : "",
  ]
    .filter(Boolean)
    .join(" · ") || "Volume libre";
export const categories: Record<Workout["category"], string> = {
  easy: "Endurance",
  recovery: "Récupération",
  "long-run": "Sortie longue",
  tempo: "Seuil",
  intervals: "Intervalles",
  other: "Complémentaire",
};
export const sports: Record<Workout["sport"], string> = {
  running: "Course à pied",
  cycling: "Vélo",
};
export const roles: Record<SegmentRole, string> = {
  warmup: "Échauffement",
  continuous: "Effort continu",
  recovery: "Récupération",
  drills: "Éducatifs",
  cooldown: "Retour au calme",
  other: "Complément",
};
