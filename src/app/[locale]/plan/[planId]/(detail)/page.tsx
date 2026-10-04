import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocaleContext } from "@/i18n/request-locale";
import { localePath } from "@/i18n/locales";
import { readPage, loadPagePlan } from "@/features/plans/server/read-page";
import { loadApplicationState } from "@/features/plans/server/persistence";
import { routePlanId } from "@/features/plans/server/route-ids";
import { planSummary, selectPlanWeek } from "@/features/plans/model/read";
import { PlanSummaryContent } from "@/features/plans/components/plan-summary";
import { PlanWeek } from "@/features/plans/components/plan-week";
import { ReadError } from "@/features/plans/components/read-error";
import { planPath } from "@/features/plans/model/paths";
import styles from "@/features/plans/components/plans.module.css";
export default async function PlanPage({ params, searchParams }: { params: Promise<{ planId: string }>; searchParams: Promise<{ week?: string | string[] }> }) {
  const { locale, dictionary } = await getLocaleContext();
  const id = routePlanId((await params).planId);
  if (!id.ok) notFound();
  const query = await searchParams;
  const result = await readPage(async (db, today) => {
    const stored = await loadPagePlan(db, id.value);
    if (!stored) return undefined;
    const state = await loadApplicationState(db);
    return { plan: stored.plan, summary: planSummary(stored.plan, state.activePlanId, today), selection: selectPlanWeek(stored.plan, query.week, today) };
  });
  if (!result.ok) return <ReadError reason={result.reason} dictionary={dictionary} href={planPath(locale, id.value)} />;
  if (!result.value) notFound();
  const { plan, summary, selection } = result.value;
  return <article className={styles.stack}>
    <Link className="back-link" href={localePath(locale, "/plan")}>← {dictionary.plans.back}</Link>
    <header className="page-heading"><h1>{plan.name}</h1>{plan.description && <p className={styles.copy}>{plan.description}</p>}</header>
    <div className={styles.card}><PlanSummaryContent summary={summary} locale={locale} dictionary={dictionary} /></div>
    <PlanWeek plan={plan} selection={selection} locale={locale} dictionary={dictionary} />
  </article>;
}
