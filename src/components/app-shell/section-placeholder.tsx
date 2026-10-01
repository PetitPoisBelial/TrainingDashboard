import Link from "next/link";
import { NavigationIcon } from "./navigation-icon";
import type { NavigationIcon as IconName } from "./navigation-items";
import styles from "./section-placeholder.module.css";

type Props = Readonly<{
  title: string;
  description: string;
  icon: IconName;
  message: string;
}>;

export function SectionPlaceholder({ title, description, icon, message }: Props) {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">VOTRE ENTRAÎNEMENT</p>
        <h1>{title}<span className="accent">.</span></h1>
        <p className="period">{description}</p>
      </header>
      <section className={styles.panel} aria-labelledby="placeholder-title">
        <span className={styles.icon}><NavigationIcon name={icon} /></span>
        <span className={styles.badge}>À venir</span>
        <h2 id="placeholder-title">Cet espace prend forme</h2>
        <p>{message}</p>
        <Link className="back-link" href="/">← Consulter la semaine actuelle</Link>
      </section>
    </>
  );
}
