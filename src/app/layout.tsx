import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell/app-shell";
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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
