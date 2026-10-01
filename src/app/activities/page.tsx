import type { Metadata } from "next";
import { SectionPlaceholder } from "@/components/app-shell/section-placeholder";

export const metadata: Metadata = { title: "Activités" };

export default function ActivitiesPage() {
  return <SectionPlaceholder
    title="Vos activités"
    description="Garder une trace de chaque effort."
    icon="activity"
    message="Vous retrouverez ici vos entraînements réalisés lorsque l’import des activités sera disponible. Pour le moment, seules les séances prévues sont consultables depuis l’accueil."
  />;
}
