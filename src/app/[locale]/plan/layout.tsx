import type { ReactNode } from "react";
import { getLocaleContext } from "@/i18n/request-locale";
export async function generateMetadata() {
  const { dictionary } = await getLocaleContext();
  return { title: dictionary.plans.title };
}
export default function Layout({ children }: { children: ReactNode }) { return children; }
