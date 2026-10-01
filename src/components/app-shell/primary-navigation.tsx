"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavigationItemActive, navigationItems } from "./navigation-items";
import { NavigationIcon } from "./navigation-icon";
import styles from "./app-shell.module.css";

export function PrimaryNavigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.navigation} aria-label="Navigation principale">
      <p className={styles.navigationHeading}>VOTRE ENTRAÎNEMENT</p>
      <ul className={styles.navigationList}>
        {navigationItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={styles.navigationLink}
              aria-current={
                isNavigationItemActive(item, pathname) ? "page" : undefined
              }
            >
              <NavigationIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
