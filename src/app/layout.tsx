import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Training Dashboard", template: "%s · Training Dashboard" },
  description: "Votre semaine d’entraînement, simplement.",
  applicationName: "Training Dashboard",
  appleWebApp: { capable: true, statusBarStyle: "black", title: "Training" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0d1420",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <a className="skip-link" href="#content">
          Aller au contenu
        </a>
        <div className="shell">
          <header className="site-header">
            <Link
              className="brand"
              href="/"
              aria-label="Training Dashboard — accueil"
            >
              <span className="brand-mark" aria-hidden="true">
                ↗
              </span>
              <span>
                training<span className="brand-light"> / dashboard</span>
              </span>
            </Link>
            <span className="demo-badge">Plan de démonstration</span>
          </header>
          <main id="content">{children}</main>
          <footer className="site-footer">
            <span>Un jour après l’autre.</span>
            <span>Données locales · V0</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
