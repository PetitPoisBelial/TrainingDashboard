import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { localePath, type Locale } from "@/i18n/locales";
import { volume } from "../formatting";
import type { Workout } from "../model/types";

export function WorkoutCard({
  workout,
  locale,
  dictionary,
}: {
  workout: Workout;
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <Link
      className="workout-card"
      href={localePath(locale, `/workouts/${workout.id}`)}
    >
      <div>
        <span className={`tag tag-${workout.category}`}>
          {dictionary.categories[workout.category]}
        </span>
        <span className="sport">{dictionary.sports[workout.sport]}</span>
        <h3>{workout.title}</h3>
        <p className="card-volume">
          {volume(workout, locale, dictionary.workout.unknownVolume)}{" "}
          <span>{dictionary.dashboard.planned}</span>
        </p>
      </div>
      <span className="arrow" aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}
