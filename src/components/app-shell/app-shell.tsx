import Link from "next/link";
import { PrimaryNavigation } from "./primary-navigation";
import styles from "./app-shell.module.css";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a className="skip-link" href="#content">Aller au contenu</a>
      <div className={styles.frame}>
        <PrimaryNavigation />
        <div className={`shell ${styles.content}`}>
          <header className="site-header">
            <Link className="brand" href="/" aria-label="Training Dashboard — accueil">
              <span className="brand-mark" aria-hidden="true">↗</span>
              <span>training<span className="brand-light"> / dashboard</span></span>
            </Link>
            <span className="demo-badge">Plan de démonstration</span>
          </header>
          <main id="content" tabIndex={-1}>{children}</main>
          <footer className="site-footer">
            <span>Un jour après l’autre.</span>
            <span>Données locales · V0</span>
          </footer>
        </div>
      </div>
    </>
  );
}
