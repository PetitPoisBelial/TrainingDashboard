import type { Metadata, Viewport } from "next";
import { getDocumentLocale } from "@/i18n/request-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { AppShell } from "@/components/app-shell/app-shell";
import "../globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary(await getDocumentLocale());
  return {
    title: {
      default: "Training Dashboard",
      template: "%s · Training Dashboard",
    },
    description: dictionary.metadata.description,
    applicationName: "Training Dashboard",
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, statusBarStyle: "black", title: "Training" },
    icons: {
      icon: "/icons/icon-192.png",
      apple: "/icons/apple-touch-icon.png",
    },
  };
}
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0d1420",
  colorScheme: "dark",
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getDocumentLocale();
  return (
    <html lang={locale}>
      <body>
        <AppShell locale={locale} dictionary={await getDictionary(locale)}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
