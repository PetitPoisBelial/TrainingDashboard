import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getLocaleContext } from "@/i18n/request-locale";
import { readPage, loadPagePlan } from "@/features/plans/server/read-page";

import { routePlanId } from "@/features/plans/server/route-ids";
import { planPath } from "@/features/plans/model/paths";
import { ReadError } from "@/features/plans/components/read-error";
// Existence check is above the child loading boundary to preserve HTTP 404.
export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ planId: string }> }) {
  const { locale, dictionary } = await getLocaleContext();
  const id = routePlanId((await params).planId);
  if (!id.ok) notFound();
  const result = await readPage((db) => loadPagePlan(db, id.value));
  if (!result.ok) return <ReadError reason={result.reason} dictionary={dictionary} href={planPath(locale, id.value)} />;
  if (!result.value) notFound();
  return children;
}
