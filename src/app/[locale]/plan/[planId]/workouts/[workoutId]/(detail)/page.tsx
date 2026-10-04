import { notFound } from "next/navigation";
import { getLocaleContext } from "@/i18n/request-locale";
import { WorkoutDetail } from "@/features/training/components/workout-detail";
import { weekStart } from "@/features/training/model/selectors";
import { routeWorkoutId } from "@/features/plans/server/route-ids";
import { routePlanId } from "@/features/plans/server/route-ids";
import { planPath, planWorkoutPath } from "@/features/plans/model/paths";

import { readPage, loadPageWorkout } from "@/features/plans/server/read-page";
import { ReadError } from "@/features/plans/components/read-error";
export default async function Page({ params }: { params: Promise<{ planId: string; workoutId: string }> }) {
  const { locale, dictionary } = await getLocaleContext();
  const values = await params;
  const plan = routePlanId(values.planId), workout = routeWorkoutId(values.workoutId);
  if (!plan.ok || !workout.ok) notFound();
  const result = await readPage((db) => loadPageWorkout(db, plan.value, workout.value));
  if (!result.ok) return <ReadError reason={result.reason} dictionary={dictionary} href={planWorkoutPath(locale, plan.value, workout.value)} />;
  if (!result.value) notFound();
  return <WorkoutDetail workout={result.value} locale={locale} dictionary={dictionary} backHref={planPath(locale, plan.value, weekStart(result.value.scheduledOn))} backLabel={dictionary.plans.backWeek} />;
}
