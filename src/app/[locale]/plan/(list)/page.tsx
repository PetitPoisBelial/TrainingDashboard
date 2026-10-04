import Link from "next/link";
import { getLocaleContext } from "@/i18n/request-locale";
import { localePath } from "@/i18n/locales";
import { listPlanSummaries } from "@/features/plans/server/persistence";
import { readPage } from "@/features/plans/server/read-page";
import { planPath } from "@/features/plans/model/paths";
import { PlanSummaryContent } from "@/features/plans/components/plan-summary";
import { ReadError } from "@/features/plans/components/read-error";
import styles from "@/features/plans/components/plans.module.css";
export default async function PlansPage() {
  const { locale, dictionary } = await getLocaleContext();
  const result = await readPage(listPlanSummaries);
  const t = dictionary.plans;
  if (!result.ok) return <ReadError reason={result.reason} dictionary={dictionary} href={localePath(locale, "/plan")} />;
  return <div className={styles.stack}>
    <header className="page-heading"><h1>{t.title}</h1><p className={styles.copy}>{t.introduction}</p></header>
    {!result.value.activePlanId && <aside className={styles.card}><h2>{t.noActive}</h2><p className={styles.copy}>{t.noActiveDescription}</p></aside>}
    {!result.value.plans.length ? <section className={styles.card}><h2>{t.emptyTitle}</h2><p className={styles.copy}>{t.empty}</p></section> : result.value.plans.map((summary) => <article className={styles.card} key={summary.id}>
      <h2>{summary.name}</h2>{summary.description && <p className={styles.copy}>{summary.description}</p>}<PlanSummaryContent summary={summary} locale={locale} dictionary={dictionary} /><Link className={styles.control} href={planPath(locale, summary.id)} aria-label={`${t.open} : ${summary.name}`}>{t.open} →</Link>
    </article>)}
  </div>;
}
