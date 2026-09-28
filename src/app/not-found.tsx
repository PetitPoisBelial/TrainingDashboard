import Link from "next/link";
export default function NotFound() {
  return (
    <section className="empty-state">
      <p className="eyebrow">404</p>
      <h1>Séance ou page introuvable</h1>
      <p>Ce lien ne correspond à aucune séance du plan local.</p>
      <Link className="back-link" href="/">
        ← Retrouver la semaine actuelle
      </Link>
    </section>
  );
}
