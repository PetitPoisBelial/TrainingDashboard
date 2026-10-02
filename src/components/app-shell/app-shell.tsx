import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { localePath, type Locale } from "@/i18n/locales";
import { PrimaryNavigation } from "./primary-navigation";
import { LanguageSwitcher } from "./language-switcher";
import styles from "./app-shell.module.css";

export function AppShell({
  children,
  locale,
  dictionary,
}: Readonly<{
  children: React.ReactNode;
  locale: Locale;
  dictionary: Dictionary;
}>) {
  return (
    <>
      <a className="skip-link" href="#content">
        {dictionary.shell.skip}
      </a>
      <div className={styles.frame}>
        <div className={styles.sidebar}>
          <PrimaryNavigation
            locale={locale}
            labels={dictionary.navigation}
            heading={dictionary.shell.heading}
            label={dictionary.shell.navigation}
          />
          <div className={styles.desktopLanguage}>
            <LanguageSwitcher
              locale={locale}
              label={dictionary.shell.language}
            />
          </div>
        </div>
        <div className={`shell ${styles.content}`}>
          <header className="site-header">
            <Link
              className="brand"
              href={localePath(locale)}
              aria-label={dictionary.shell.homeLabel}
            >
              <span className="brand-mark" aria-hidden="true">
                ↗
              </span>
              <span>
                training<span className="brand-light"> / dashboard</span>
              </span>
            </Link>
            <div className={styles.utilities}>
              <span className={`demo-badge ${styles.demoBadge}`}>
                {dictionary.shell.demo}
              </span>
              <div className={styles.mobileLanguage}>
                <LanguageSwitcher
                  locale={locale}
                  label={dictionary.shell.language}
                />
              </div>
            </div>
          </header>
          <main id="content" tabIndex={-1}>
            {children}
          </main>
          <footer className="site-footer">
            <span>{dictionary.shell.motto}</span>
            <span>{dictionary.shell.local}</span>
          </footer>
        </div>
      </div>
    </>
  );
}
