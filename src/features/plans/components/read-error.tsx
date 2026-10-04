import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import styles from "./plans.module.css";
export function ReadError({ reason, dictionary, href }: { reason: "configuration" | "persistence"; dictionary: Dictionary; href: string }) {
  const t = dictionary.plans;
  return <section className={styles.card} role="alert"><h1>{t.errorTitle}</h1><p className={styles.copy}>{t[reason]}</p><a className={styles.control} href={href}>{t.retry}</a><Link className="back-link" href={href.split("/plan")[0]}>{dictionary.placeholders.back}</Link></section>;
}
