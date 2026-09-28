# Training Dashboard

Dashboard personnel de course à pied, mobile-first. La V0 affiche un plan local, les sept jours de la semaine, le volume de course, les séances du jour, la prochaine séance clé et le détail des blocs. Aucune base de données, authentification ou intégration externe.

## Démarrer

Prérequis : Node.js 22.13+ et pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Ouvrir http://localhost:3000. Pour le serveur de production :

```sh
pnpm build
pnpm start
```

## Vérifier

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Les tests couvrent les dates Paris, les frontières de semaine, les années bissextiles, le repos, plusieurs séances par jour, l'exclusion du vélo, les séances clés, les données absentes et les unités.

## Données locales

Modifier `src/features/training/data/training-weeks.ts`. La semaine d'exemple du **28 septembre au 4 octobre 2026** contient 92 km de course et une sortie vélo de 20 km / 1 h. En dehors de cette période, l'accueil indique que le plan est absent ; les liens directs vers les séances restent accessibles.

Pour ajouter une semaine, utiliser un lundi ISO pour `startsOn`, des dates comprises entre lundi et dimanche et des identifiants de séance uniques dans tout le jeu de données. Les distances sont en mètres, les durées et allures en secondes (allure par km). Le volume global est explicite ; il n'est pas déduit des blocs mixtes. Les récupérations se situent entre les répétitions.

La date courante est celle d'Europe/Paris, calculée côté serveur à chaque requête. Recharger une page restée ouverte après minuit.

## iPhone / PWA

Après déploiement HTTPS, ouvrir le site dans Safari, puis **Partager → Sur l'écran d'accueil**. Vérifier l'icône, le lancement autonome, les safe areas, le retour depuis une séance et l'absence de débordement en portrait/paysage. La connexion reste nécessaire : aucun cache hors ligne n'est prévu.

Le manifeste, les icônes PNG et les métadonnées Apple sont présents. Les contrôles locaux ont été réalisés sous Chromium, pas sur Safari iOS réel.

## Vercel

Le dépôt n'est pas encore lié à un projet Vercel. Importer ce dépôt dans le compte souhaité, sélectionner le preset Next.js et conserver la racine du dépôt. Installation : `pnpm install --frozen-lockfile` ; build : `pnpm build`. Aucun secret ni variable d'environnement n'est nécessaire pour cette V0.

Après déploiement, vérifier l'accueil, `/workouts/2026-09-29-intervalles`, une séance inconnue (404), `/manifest.webmanifest` et l'installation iPhone. Le déploiement distant reste non vérifié.

Voir `PROJECT.md`, `ARCHITECTURE.md` et `ROADMAP.md` pour le périmètre et les décisions.
