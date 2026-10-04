import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getLocaleContext } from "@/i18n/request-locale";
import { readPage, loadPageWorkout } from "@/features/plans/server/read-page";

import { routePlanId } from "@/features/plans/server/route-ids";
import { routeWorkoutId } from "@/features/plans/server/route-ids";
import { planWorkoutPath } from "@/features/plans/model/paths";
import { ReadError } from "@/features/plans/components/read-error";
export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ planId: string; workoutId: string }> }) {
  const { locale, dictionary } = await getLocaleContext();
  const values = await params;
  const plan = routePlanId(values.planId), workout = routeWorkoutId(values.workoutId);
  if (!plan.ok || !workout.ok) notFound();
  const result = await readPage((db) => loadPageWorkout(db, plan.value, workout.value));
  if (!result.ok) return <ReadError reason={result.reason} dictionary={dictionary} href={planWorkoutPath(locale, plan.value, workout.value)} />;
  if (!result.value) notFound();
  return children;
}
