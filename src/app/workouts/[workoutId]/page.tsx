import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { trainingWeeks } from "@/features/training/data/training-weeks";
import { findWorkout } from "@/features/training/model/selectors";
import {
  categories,
  dateLabel,
  pace,
  roles,
  sports,
  target,
  volume,
} from "@/features/training/formatting";

type Props = { params: Promise<{ workoutId: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const workout = findWorkout(trainingWeeks, (await params).workoutId);
  return { title: workout?.title ?? "Séance introuvable" };
}
export default async function WorkoutPage({ params }: Props) {
  const workout = findWorkout(trainingWeeks, (await params).workoutId);
  if (!workout) notFound();
  return (
    <article className="detail">
      <Link className="back-link" href="/">
        ← Retour à la semaine actuelle
      </Link>
      <header className="page-heading">
        <p className="eyebrow">{dateLabel(workout.scheduledOn)}</p>
        <h1>
          {workout.title}
          <span className="accent">.</span>
        </h1>
        <div className="detail-meta">
          <span className={`tag tag-${workout.category}`}>
            {categories[workout.category]}
          </span>
          <span>{sports[workout.sport]}</span>
          {workout.isKeyWorkout && <span>Séance clé</span>}
        </div>
      </header>
      <section className="detail-volume">
        <p className="eyebrow">VOLUME GLOBAL PRÉVU</p>
        <p>{volume(workout)}</p>
      </section>
      {workout.notes && (
        <aside className="coach-note">
          <h2>Le fil conducteur</h2>
          <p>{workout.notes}</p>
        </aside>
      )}
      <section className="blocks-section">
        <p className="eyebrow">PAS À PAS</p>
        <h2>Le déroulé</h2>
        <ol className="blocks">
          {workout.blocks.map((block, index) => (
            <li key={index}>
              <span className="block-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="eyebrow">
                  {block.kind === "segment" ? roles[block.role] : "Répétitions"}
                </p>
                <h3>
                  {block.kind === "segment"
                    ? block.target
                      ? target(block.target)
                      : "À votre rythme"
                    : `${block.count} × ${target(block.effort)}`}
                </h3>
                {block.pace && (
                  <p className="block-pace">À {pace(block.pace)}</p>
                )}
                {block.kind === "repeats" && block.recovery && (
                  <p className="recovery">
                    Récupération : {target(block.recovery)} entre les
                    répétitions
                  </p>
                )}
                {block.notes && <p className="block-note">{block.notes}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>
      <Link className="back-link" href="/">
        ← Retour à la semaine actuelle
      </Link>
    </article>
  );
}
