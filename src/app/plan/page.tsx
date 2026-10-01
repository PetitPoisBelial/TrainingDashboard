import type { Metadata } from "next";
import { SectionPlaceholder } from "@/components/app-shell/section-placeholder";

export const metadata: Metadata = { title: "Plan" };

export default function PlanPage() {
  return <SectionPlaceholder
    title="Votre plan"
    description="Donner un cap à chaque semaine."
    icon="calendar"
    message="Cet espace accueillera la consultation de votre plan d’entraînement. Pour le moment, retrouvez les séances prévues et leur détail depuis l’accueil."
  />;
}
