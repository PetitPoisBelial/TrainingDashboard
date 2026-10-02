import Link from "next/link";
import { localePath, type Locale } from "@/i18n/locales";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { NavigationIcon } from "./navigation-icon";
import type { NavigationIcon as IconName } from "./navigation-items";
import styles from "./section-placeholder.module.css";

type Props = Readonly<{
  title: string;
  description: string;
  icon: IconName;
  message: string;
  locale: Locale;
  text: Dictionary["placeholders"];
}>;
export function SectionPlaceholder({
  title,
  description,
  icon,
  message,
  locale,
  text,
}: Props) {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">{text.eyebrow}</p>
        <h1>
          {title}
          <span className="accent">.</span>
        </h1>
        <p className="period">{description}</p>
      </header>
      <section className={styles.panel} aria-labelledby="placeholder-title">
        <span className={styles.icon}>
          <NavigationIcon name={icon} />
        </span>
        <span className={styles.badge}>{text.badge}</span>
        <h2 id="placeholder-title">{text.heading}</h2>
        <p>{message}</p>
        <Link className="back-link" href={localePath(locale)}>
          ← {text.back}
        </Link>
      </section>
    </>
  );
}
