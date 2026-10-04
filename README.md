# Training Dashboard

Dashboard personnel de course à pied, mobile-first. Le dashboard V0 conserve ses données locales, ses sept jours et le détail des blocs. La V1 ajoute la consultation privée des plans enregistrés dans PostgreSQL. Aucune intégration Strava à ce stade.

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

Le menu partagé propose **Accueil** (`/fr`), **Plan** (`/fr/plan`), **Activités** (`/fr/activities`) et **Analyses** (`/fr/insights`). Les mêmes pages sont disponibles sous `/en`. Le menu reste en bas sur mobile et devient latéral à partir de 1000 px. Plan consulte PostgreSQL : liste, détail, semaine sélectionnée par `?week=YYYY-MM-DD` et séances persistées. Activités et Analyses restent des pages d'attente. Le dashboard et `/[locale]/workouts/[workoutId]` conservent les fixtures V0 jusqu'au lot 6.

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

## Fondation PostgreSQL V1 — lot 3

Le lot 3 est clôturé par décision utilisateur du 4 octobre 2026. Les observations
restantes d'expiration/perte de session sont différées et seront traitées comme bugs
si elles se manifestent ; elles ne bloquent pas le lot 4. Les pages Plan lisent
désormais PostgreSQL côté serveur ; le dashboard conserve ses fixtures V0.
`pnpm dev` et `pnpm build` ne demandent aucune variable PostgreSQL.

```sh
pnpm db:generate
pnpm db:check
pnpm test:integration
```

Génération et contrôle Drizzle n'utilisent aucune connexion. Les tests d'intégration
exigent un PostgreSQL local réel et une base vide jetable `training_dashboard_test` ;
configurer `TRAINING_TEST_DATABASE_URL` dans `.env.database.test.local` ignoré.
Ils refusent les URL distantes et la production, et suppriment les objets créés
pendant la suite. `pnpm test` reste indépendant de toute base.

Les migrations sont exclusivement explicites avec `pnpm db:migrate`, après
configuration opérateur et autorisation pour toute cible distante. Voir le
[runbook](docs/V1_DATABASE_RUNBOOK.md) pour les variables, le provisionnement Neon,
la séparation développement/Preview/production et les sauvegardes.
La [checklist d'accès privé](docs/V1_PRIVATE_ACCESS_CHECKLIST.md) conserve les résultats
validés et les observations différées, sans les déclarer réalisées.

## Démonstration PostgreSQL — lot 4

Le seed est une commande opérateur, jamais une migration, un build ou une action UI.
Il crée un plan fictif **inactif**, 9 séances (114 km course, 20 km / 1 h vélo),
du 23 septembre au 18 octobre 2026. Les identifiants `demo:v1:*` lui sont réservés.
Il réutilise les prescriptions V0, inclut une course et une semaine entière de repos.
Les textes libres restent français dans l'interface anglaise.

Configurer les variables `TRAINING_SEED_*` dans le fichier ignoré
`.env.database.local`, selon le [runbook](docs/V1_DATABASE_RUNBOOK.md#seed-de-démonstration--lot-4).
Ne jamais utiliser la production. Vérifier la branche réelle dans Neon, puis obtenir
l'autorisation explicite de l'utilisateur avant toute écriture distante.

```sh
pnpm db:seed:development
# Après contrôle de la cible et autorisation distante :
pnpm db:seed:development --write
```

Sans `--write`, la commande affiche seulement la cible reconnue, sans connexion.
Avec `--write`, elle valide et insère l'agrégat dans une transaction. Une relance
identique ne change aucune ligne. Une collision ou un contenu différent est refusé,
sans écrasement, suppression ou activation. Aucune URL de connexion n'est affichée.
Les schémas doivent déjà avoir été migrés explicitement.

Pour consulter, configurer `TRAINING_DATABASE_URL` localement dans `.env.local`
(ou dans l'environnement du processus) vers la même base non-production,
puis lancer `pnpm dev`. Ouvrir `/fr/plan` ou `/en/plan`.
Sans configuration, Plan affiche un état explicite ; une panne est distincte
d'une base vide et d'une vraie 404. Une semaine invalide ou extérieure au plan
revient à la première semaine avec un message. Aucun cache public n'est ajouté.

Le build réussit sans variable PostgreSQL. Les tests du seed et des lectures font
partie de `pnpm test` et `pnpm test:integration` (PostgreSQL local dédié réel).
Après `pnpm build`, `pnpm test:plans:http` lance un serveur temporaire de production
sur `127.0.0.1:3104`, connecté exclusivement à `TRAINING_TEST_DATABASE_URL`.
Cette suite exige la même base locale vide jetable, applique le schéma et le seed,
contrôle les routes, erreurs et statuts HTTP, puis nettoie les seuls objets créés.
Ne pas l'exécuter simultanément avec les intégrations ou une autre application
sur cette base. Elle ne cible ni Neon ni Vercel.
La recette distante/Preview et iPhone du lot 4 reste à autoriser et à effectuer.
