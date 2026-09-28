import Link from "next/link";
import { categories, sports, volume } from "../formatting";
import type { Workout } from "../model/types";

export function WorkoutCard({ workout }: { workout: Workout }) {
  return (
    <Link className="workout-card" href={`/workouts/${workout.id}`}>
      <div>
        <span className={`tag tag-${workout.category}`}>
          {categories[workout.category]}
        </span>
        <span className="sport">{sports[workout.sport]}</span>
        <h3>{workout.title}</h3>
        <p className="card-volume">
          {volume(workout)} <span>prévus</span>
        </p>
      </div>
      <span className="arrow" aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}
