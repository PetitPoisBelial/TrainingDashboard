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

Les tests couvrent les dates Paris, les frontières de semaine, les années bissextiles, le repos, plusieurs séances par jour, l'exclusion du vélo, les séances clés, les données absentes, les unités, les redirections de locale, la conservation des URL et la parité des dictionnaires FR/EN.

## Navigation

Le menu partagé propose **Accueil** (`/fr`), **Plan** (`/fr/plan`), **Activités** (`/fr/activities`) et **Analyses** (`/fr/insights`). Les mêmes pages sont disponibles sous `/en`. Le menu reste en bas sur mobile et devient latéral à partir de 1000 px. Le détail d'une séance active la section Plan. Les trois nouvelles sections affichent des pages d'attente explicites.

Le sélecteur **FR | EN** se trouve dans l'en-tête mobile et sous le menu latéral sur ordinateur. Il conserve la page, les paramètres et l'ancre, et mémorise le choix pendant un an. `/` et les anciennes URL sans locale redirigent vers ce choix, ou vers le français par défaut. Une URL explicite `/fr` ou `/en` conserve toujours sa propre langue. Les dates et nombres suivent `fr-FR` ou `en-GB`, avec des unités métriques.

Les liens s'ouvrent directement et le menu indique la section active. Pour la recette mobile, vérifier que les derniers éléments du contenu restent accessibles au-dessus du menu et de l'indicateur d'accueil iOS. Pour la recette clavier, vérifier les liens au Tab, leur focus visible, puis Entrée pour naviguer.

## Données locales

Modifier `src/features/training/data/training-weeks.ts`. Les traductions anglaises des textes de démonstration sont dans `localized-training-weeks.ts` ; les textes d'une nouvelle séance restent dans leur langue d'origine tant qu'aucune traduction n'est ajoutée. La semaine d'exemple du **28 septembre au 4 octobre 2026** contient 92 km de course et une sortie vélo de 20 km / 1 h. En dehors de cette période, l'accueil indique que le plan est absent ; les liens directs vers les séances restent accessibles.

Pour ajouter une semaine, utiliser un lundi ISO pour `startsOn`, des dates comprises entre lundi et dimanche et des identifiants de séance uniques dans tout le jeu de données. Les distances sont en mètres, les durées et allures en secondes (allure par km). Le volume global est explicite ; il n'est pas déduit des blocs mixtes. Les récupérations se situent entre les répétitions.

La date courante est celle d'Europe/Paris, calculée côté serveur à chaque requête. Recharger une page restée ouverte après minuit.

## iPhone / PWA

Après déploiement HTTPS, ouvrir le site dans Safari, puis **Partager → Sur l'écran d'accueil**. Vérifier l'icône, le lancement autonome, les safe areas, le retour depuis une séance et l'absence de débordement en portrait/paysage. La connexion reste nécessaire : aucun cache hors ligne n'est prévu.

La V0 est clôturée : l'installation et l'affichage PWA sur iPhone, la langue mémorisée, les liens, la navigation clavier et les safe areas ont été validés. Les contrôles locaux sous Chromium complètent cette recette sur appareil réel.

## Vercel

Le dépôt est lié à Vercel : [production](https://training-dashboard-snowy.vercel.app/), branche `main`. Les autres branches produisent des Preview. Installation : `pnpm install --frozen-lockfile` ; build : `pnpm build`. Aucun secret ni variable d'environnement n'est nécessaire pour cette V0. La navigation et l'internationalisation sont déployées.

Après redéploiement, vérifier `/fr` et `/en`, `/en/workouts/2026-09-29-intervalles`, une séance inconnue (404), `/manifest.webmanifest`, le changement de langue et l'installation iPhone.

Voir `PROJECT.md`, `ARCHITECTURE.md` et `ROADMAP.md` pour le périmètre et les décisions.
