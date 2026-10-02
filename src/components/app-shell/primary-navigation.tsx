"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath, withoutLocale, type Locale } from "@/i18n/locales";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { isNavigationItemActive, navigationItems } from "./navigation-items";
import { NavigationIcon } from "./navigation-icon";
import styles from "./app-shell.module.css";

export function PrimaryNavigation({
  locale,
  labels,
  heading,
  label,
}: {
  locale: Locale;
  labels: Dictionary["navigation"];
  heading: string;
  label: string;
}) {
  const pathname = withoutLocale(usePathname());
  return (
    <nav className={styles.navigation} aria-label={label}>
      <p className={styles.navigationHeading}>{heading}</p>
      <ul className={styles.navigationList}>
        {navigationItems.map((item) => (
          <li key={item.href}>
            <Link
              href={localePath(locale, item.href)}
              className={styles.navigationLink}
              aria-current={
                isNavigationItemActive(item, pathname) ? "page" : undefined
              }
            >
              <NavigationIcon name={item.icon} />
              <span>{labels[item.id]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
