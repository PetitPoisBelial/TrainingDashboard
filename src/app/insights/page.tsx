import type { Metadata } from "next";
import { SectionPlaceholder } from "@/components/app-shell/section-placeholder";

export const metadata: Metadata = { title: "Analyses" };

export default function InsightsPage() {
  return <SectionPlaceholder
    title="Vos analyses"
    description="Prendre du recul sur votre entraînement."
    icon="chart"
    message="Cet espace présentera les tendances de votre entraînement lorsque votre historique sera disponible. En attendant, le volume prévu et sa répartition sont visibles sur l’accueil."
  />;
}
