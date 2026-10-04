"use client";
import { useParams } from "next/navigation";
import { fr } from "@/i18n/dictionaries/fr";
import { en } from "@/i18n/dictionaries/en";
import styles from "@/features/plans/components/plans.module.css";
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const params = useParams();
  const t = (params.locale === "en" ? en : fr).plans;
  return <section className={styles.card} role="alert"><h1>{t.errorTitle}</h1><p>{t.persistence}</p><button className={styles.control} onClick={retry}>{t.retry}</button></section>;
}
