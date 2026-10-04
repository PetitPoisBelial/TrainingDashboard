import { getLocaleContext } from "@/i18n/request-locale";
export default async function Loading() { const { dictionary } = await getLocaleContext(); return <p className="empty-state" role="status" aria-live="polite">{dictionary.plans.loadingList}</p>; }
