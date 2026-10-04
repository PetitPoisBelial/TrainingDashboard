import type { Metadata } from "next";
import { WorkoutDetail } from "@/features/training/components/workout-detail";
import { notFound } from "next/navigation";
import { getLocaleContext } from "@/i18n/request-locale";
import { localePath } from "@/i18n/locales";
import { getTrainingWeeks } from "@/features/training/data/localized-training-weeks";
import { findWorkout } from "@/features/training/model/selectors";


type Props = { params: Promise<{ locale: string; workoutId: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, dictionary } = await getLocaleContext();
  const workout = findWorkout(
    getTrainingWeeks(locale),
    (await params).workoutId,
  );
  return { title: workout?.title ?? dictionary.metadata.missing };
}
export default async function WorkoutPage({ params }: Props) {
  const { locale, dictionary } = await getLocaleContext();
  const workout = findWorkout(
    getTrainingWeeks(locale),
    (await params).workoutId,
  );
  if (!workout) notFound();
  return <WorkoutDetail workout={workout} locale={locale} dictionary={dictionary} backHref={localePath(locale)} backLabel={dictionary.workout.back} />;
}
