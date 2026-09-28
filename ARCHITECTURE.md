# Architecture

## Statut

Ce document décrit l'architecture de la V0 implémentée. La validation sur iPhone réel et le déploiement Vercel restent à effectuer.

## Principes

- Construire uniquement ce qui est nécessaire à la phase actuelle.
- Séparer le métier de l'entraînement de sa présentation dans l'interface.
- Garder les données mockées remplaçables par une source serveur ultérieure.
- Favoriser les composants simples et composables.
- Ne pas introduire de dépendance ou de couche d'abstraction sans besoin concret.
- Préserver une expérience mobile-first, en particulier sur Safari iOS.

## Architecture de la V0

La V0 repose sur une application Next.js en TypeScript strict utilisant l'App Router. Elle est alimentée par des données TypeScript locales et ne comporte ni API interne, ni base de données, ni authentification, ni gestionnaire d'état global.

Le flux de données est volontairement direct :

```text
Données locales typées
        ↓
Sélecteurs métier purs
        ↓
Composants de la fonctionnalité Training
        ↓
Pages Next.js
```

Les responsabilités principales seront séparées ainsi :

- **Pages et layouts** : navigation et composition des écrans ;
- **Composants UI** : présentation réutilisable ;
- **Domaine entraînement** : types et règles représentant semaines, séances et blocs ;
- **Données locales** : fixtures ou données mockées indépendantes des composants ;
- **Utilitaires** : formatage des dates, distances, durées et allures ;
- **PWA** : manifeste, icônes, métadonnées et comportement installable.

La structure initiale recommandée est :

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── manifest.ts
│   ├── globals.css
│   └── workouts/
│       └── [workoutId]/
│           └── page.tsx
├── features/
│   └── training/
│       ├── components/
│       ├── data/
│       │   └── training-weeks.ts
│       ├── model/
│       │   ├── types.ts
│       │   └── selectors.ts
│       └── formatting/
└── public/
    └── icons/
```

Les Server Components sont utilisés par défaut. Un Client Component n'est ajouté que lorsqu'une interaction ou une API navigateur le justifie. Les données locales sont accessibles par une fonction simple, sans interface générique de repository. Un dossier `lib` ne sera créé que lorsqu'un besoin réellement transversal apparaîtra.

La V0 n'introduit ni bibliothèque de composants, ni gestionnaire d'état global. Les fondations visuelles peuvent rester dans les styles globaux et les styles propres aux composants dans des CSS Modules.

## Critères d'acceptation de la V0

### Fonctionnel

- La page d'accueil affiche la semaine correspondant à la date courante, du lundi au dimanche.
- Les sept jours sont présents, y compris les jours sans entraînement.
- Le kilométrage de course prévu pour la semaine est visible.
- La répartition du kilométrage par jour est compréhensible sans imposer un graphique.
- Chaque séance affiche au minimum son titre, sa catégorie, son jour et son volume prévu lorsqu'il est connu.
- La ou les séances du jour sont clairement identifiées.
- La prochaine séance importante est mise en évidence.
- Une séance ouvre une page de détail dédiée.
- Le détail restitue les blocs dans leur ordre : échauffement, travail principal, récupérations et retour au calme.
- Une séance telle que `4 × 2000 m à 3'30–3'32/km, récupération 2 min` est représentée sans texte ambigu ni perte de structure.
- Les données d'exemple couvrent au moins un footing facile, une séance d'intervalles, une séance tempo ou seuil, une sortie longue et un jour de repos.
- Une semaine absente et un identifiant de séance inconnu produisent un état explicite sans erreur d'exécution.

### Mobile et PWA

- L'interface ne provoque aucun défilement horizontal sur un iPhone courant.
- Les informations principales sont lisibles sans zoom et les contrôles possèdent des zones tactiles confortables.
- Les safe areas iOS sont prises en compte.
- L'application possède un manifeste, des icônes et les métadonnées nécessaires à son ajout à l'écran d'accueil.
- L'application s'ouvre correctement en mode standalone.
- Le fonctionnement hors connexion n'est pas requis en V0 : aucun service worker ou cache applicatif complexe n'est introduit.
- Le rendu reste cohérent et utilisable sur ordinateur.

### Qualité technique

- TypeScript fonctionne en mode strict.
- Les données métier ne sont pas déclarées directement dans les composants.
- Les totaux et recherches sont calculés par des fonctions pures, pas dans le JSX.
- Les composants côté client sont limités aux besoins réels.
- Le lint, la vérification TypeScript et le build de production réussissent.
- Les calculs métier non triviaux sont couverts par des tests ciblés.
- Le déploiement Vercel est fonctionnel.

## Écrans essentiels

### Dashboard hebdomadaire — `/`

Le dashboard affiche la période, le kilométrage de course prévu, les séances regroupées par jour, la séance du jour et la prochaine séance importante. Il permet d'accéder au détail de chaque séance.

La V0 conserve une seule page verticale. Elle ne nécessite ni vue calendrier distincte, ni page de plan séparée, ni navigation par onglets.

### Détail d'une séance — `/workouts/[workoutId]`

Cette page rappelle la date, le sport, la catégorie et le volume global. Elle affiche les blocs dans l'ordre, formate les distances, durées, répétitions et allures, présente les consignes éventuelles et propose un retour simple vers la semaine.

Une route dédiée est préférée à une modale afin de simplifier la navigation mobile, les liens directs et le rafraîchissement de la page.

### Écrans exclus de la V0

- création ou édition d'un plan ;
- historique et statistiques ;
- réglages ;
- connexion utilisateur ;
- activités réalisées ;
- intégrations externes.

## Modèle métier de la V0

Le modèle utilise des objets TypeScript immuables et des fonctions pures. Il ne nécessite pas de classes.

### `TrainingWeek`

Une semaine contient :

- `id` : identifiant stable ;
- `startsOn` : date locale ISO du lundi ;
- `workouts` : liste ordonnée des séances prévues.

La date de fin, le kilométrage total et le regroupement par jour sont dérivés et ne sont pas stockés.

Invariants :

- `startsOn` représente un lundi ;
- la semaine couvre exactement sept jours ;
- chaque séance appartient à cet intervalle ;
- les identifiants des séances sont uniques dans la semaine.

### `Workout`

Une séance contient :

- `id` : identifiant stable ;
- `scheduledOn` : date locale ISO prévue ;
- `sport` : `running` ou `cycling` ;
- `category` : `easy`, `recovery`, `long-run`, `tempo`, `intervals` ou `other` ;
- `title` : libellé humain court ;
- `isKeyWorkout` : indique une séance importante ;
- `plannedVolume` : distance et/ou durée globale prévue ;
- `blocks` : structure détaillée ordonnée ;
- `notes` : consignes générales facultatives.

Le volume global est explicite plutôt que systématiquement recalculé depuis les blocs. Une séance peut comporter des portions en durée, des récupérations ou des éducatifs dont la distance n'est pas déterminable à l'avance.

Le kilométrage hebdomadaire additionne uniquement les distances prévues des séances de course. Le vélo n'est pas mélangé à ce total.

### `WorkoutBlock`

`WorkoutBlock` est une union discriminée limitée à deux variantes.

#### Bloc `segment`

Une portion exécutée une fois, comportant :

- un rôle : échauffement, effort continu, récupération, éducatifs, retour au calme ou autre ;
- un objectif facultatif de distance ou de durée ;
- une cible d'allure facultative ;
- une consigne facultative.

Exemples : `20 min d'échauffement`, `8 km facile`, `15 min au seuil`.

#### Bloc `repeats`

Un ensemble de répétitions, comportant :

- le nombre de répétitions ;
- l'objectif d'effort en distance ou en durée ;
- une cible d'allure facultative ;
- une récupération facultative en distance ou en durée ;
- une consigne facultative.

Cette variante représente directement, par exemple, `4 × 2000 m à 3'30–3'32/km, récupération 2 min`, sans introduire un arbre récursif de blocs.

### Unités et dates

Les valeurs sont conservées dans des unités canoniques :

- distance en mètres ;
- durée en secondes ;
- allure en secondes par kilomètre ;
- dates métier sous forme `YYYY-MM-DD`, sans heure.

Une cible d'allure peut être exacte ou former une plage entre une borne rapide et une borne lente. La représentation humaine, par exemple `3'30/km`, relève des fonctions de formatage et non des données.

La date courante est interprétée dans le fuseau applicatif `Europe/Paris`, afin que le jour courant ne dépende pas du fuseau du serveur de rendu.

### Sélecteurs métier

La couche métier fournit uniquement les fonctions pures nécessaires pour :

- calculer la date de fin de semaine ;
- regrouper les séances par jour ;
- calculer la distance de course prévue ;
- trouver les séances du jour ;
- trouver la prochaine séance importante ;
- retrouver une séance par identifiant.

### Données exclues de la V0

- statut réalisé ou non réalisé ;
- identifiant provenant d'une plateforme externe ;
- données cardiaques ;
- RPE ou sensations ;
- timestamps de création et de modification ;
- utilisateur ou propriétaire ;
- modèle de persistance ;
- versionnement des séances.

## Frontend et serveur

- Utiliser les Server Components par défaut lorsque cela simplifie le rendu.
- Ajouter un Client Component uniquement lorsqu'une interaction ou une API navigateur l'exige.
- Ne pas créer d'API interne en V0 sans besoin démontré.
- Toute future opération Strava nécessitant un secret devra être exécutée côté serveur.

## Persistance

La V0 utilise des données locales ou mockées versionnées dans le dépôt.

Le choix définitif de la persistance pour les versions suivantes est différé. Supabase/PostgreSQL est une option privilégiée, mais ne doit être ajouté qu'au moment où les besoins de stockage et de synchronisation sont suffisamment définis.

## PWA et responsive

- Concevoir d'abord pour un écran d'iPhone.
- Définir des zones tactiles confortables et une hiérarchie visuelle claire.
- Gérer les safe areas iOS lorsque nécessaire.
- Fournir un manifeste et les métadonnées d'installation.
- Vérifier que l'application reste utilisable sur ordinateur.

Le fonctionnement hors connexion est exclu de la V0. Aucun service worker n'est enregistré. Le manifeste et les icônes PNG (192, 512, maskable et Apple 180 px) permettent l'ajout à l'écran d'accueil, à valider sur iPhone réel via HTTPS.

## Intégration Strava future

L'intégration appartient à la V1. Elle devra respecter les règles suivantes :

- OAuth traité côté serveur ;
- secrets uniquement dans des variables d'environnement sécurisées ;
- jetons jamais exposés dans le bundle client ni versionnés ;
- modèle Strava converti vers le modèle interne via une couche d'adaptation ;
- composants métier indépendants du format brut de l'API Strava.

## Qualité

Le socle utilise pnpm (lockfile versionné), Next.js 16.3.6, React 19.3 et TypeScript 5.9 strict. Commandes :

- `pnpm typecheck` : génération des types de routes puis TypeScript ;
- `pnpm lint` : ESLint et règles Next.js ;
- `pnpm build` : build de production ;
- `pnpm test` : tests natifs Node exécutés avec tsx.

ESLint est fixé à 9.39.5 : ESLint 10 provoque une erreur dans eslint-plugin-react fourni par la configuration Next.js actuelle. Réévaluer cette compatibilité lors d'une mise à jour. tsx est la seule dépendance supplémentaire de test, nécessaire pour exécuter directement les modules TypeScript.

Le dashboard est rendu à chaque requête pour déterminer la date en Europe/Paris, sans date figée au build. Une page laissée ouverte au passage de minuit nécessite un rechargement. La prochaine séance clé inclut le jour courant, car la V0 ne connaît ni heure ni état de réalisation.

La fixture est une semaine fixe du 28 septembre au 4 octobre 2026 : 92 km de course, 20 km de vélo et un vendredi de repos. Elle n'est pas déplacée automatiquement à chaque semaine ; une semaine absente est distinguée d'une semaine de repos. Les identifiants restent stables. Les récupérations des répétitions se placent uniquement entre les efforts.

Les deux écrans utilisent des Server Components, des polices système et une feuille CSS commune pour cette petite V0. Aucun téléchargement de police, bibliothèque UI ou état global n'est nécessaire. Les icônes sont locales.

## Journal des décisions

Toute décision structurante doit être ajoutée ici avec sa date, son contexte et sa justification.

| Date | Décision | Statut |
| --- | --- | --- |
| 2026-09-28 | Construire une V0 locale avant toute intégration Strava ou base serveur | Validée |
| 2026-09-28 | Utiliser Next.js, React et TypeScript avec une approche mobile-first | Validée |
| 2026-09-28 | Utiliser l'App Router pour le socle Next.js | Validée |
| 2026-09-28 | Limiter la V0 au dashboard hebdomadaire et au détail d'une séance | Validée |
| 2026-09-28 | Représenter `WorkoutBlock` par une union discriminée `segment` / `repeats` | Validée |
| 2026-09-28 | Stocker les volumes dans des unités canoniques et dériver les agrégats avec des fonctions pures | Validée |
| 2026-09-28 | Fournir une PWA installable sans imposer de fonctionnement hors connexion en V0 | Validée |
| 2026-09-28 | Conserver une fixture datée et rendre la date Paris à chaque requête, pour distinguer absence de plan et repos | Validée |
| 2026-09-28 | Utiliser pnpm et les tests Node avec tsx ; conserver ESLint 9 compatible avec les règles React actuelles | Validée |

