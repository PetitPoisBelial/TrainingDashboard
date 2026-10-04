import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/locales";
import type { Workout } from "../model/types";
import { dateLabel, pace, target, volume } from "../formatting";
export function WorkoutDetail({ workout, locale, dictionary, backHref, backLabel }: { workout: Workout; locale: Locale; dictionary: Dictionary; backHref: string; backLabel: string }) {
  const t = dictionary.workout;
  return (
    <article className="detail">
      <Link className="back-link" href={backHref}>
        ← {backLabel}
      </Link>
      <header className="page-heading">
        <p className="eyebrow">
          {dateLabel(workout.scheduledOn, undefined, locale)}
        </p>
        <h1>
          {workout.title}
          <span className="accent">.</span>
        </h1>
        <div className="detail-meta">
          <span className={`tag tag-${workout.category}`}>
            {dictionary.categories[workout.category]}
          </span>
          <span>{dictionary.sports[workout.sport]}</span>
          {workout.isKeyWorkout && <span>{t.key}</span>}
        </div>
      </header>
      <section className="detail-volume">
        <p className="eyebrow">{t.volume}</p>
        <p>{volume(workout, locale, t.unknownVolume)}</p>
      </section>
      {workout.notes && (
        <aside className="coach-note">
          <h2>{t.guidance}</h2>
          <p>{workout.notes}</p>
        </aside>
      )}
      <section className="blocks-section">
        <p className="eyebrow">{t.step}</p>
        <h2>{t.structure}</h2>
        <ol className="blocks">
          {workout.blocks.map((block, index) => (
            <li key={index}>
              <span className="block-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="eyebrow">
                  {block.kind === "segment"
                    ? dictionary.roles[block.role]
                    : t.repeats}
                </p>
                <h3>
                  {block.label && <span>{block.label} · </span>}
                  {block.kind === "segment"
                    ? block.target
                      ? target(block.target, locale)
                      : t.free
                    : `${block.count} × ${target(block.effort, locale)}`}
                </h3>
                {block.pace && (
                  <p className="block-pace">
                    {t.at} {pace(block.pace)}
                  </p>
                )}
                {block.kind === "repeats" && block.recovery && (
                  <div className="recovery">
                    <p>{t.recovery} {target(block.recovery.target, locale)} {t.between}</p>
                    {block.recovery.pace && <p>{t.at} {pace(block.recovery.pace)}</p>}
                    {block.recovery.notes && <p>{block.recovery.notes}</p>}
                  </div>
                )}
                {block.notes && <p className="block-note">{block.notes}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>
      <Link className="back-link" href={backHref}>
        ← {backLabel}
      </Link>
    </article>
  );
}
