# Architecture

## Statut

Ce document décrit l'architecture initiale visée. Les décisions qui ne sont pas encore validées sont indiquées comme telles et ne doivent pas être considérées comme définitives.

## Principes

- Construire uniquement ce qui est nécessaire à la phase actuelle.
- Séparer le métier de l'entraînement de sa présentation dans l'interface.
- Garder les données mockées remplaçables par une source serveur ultérieure.
- Favoriser les composants simples et composables.
- Ne pas introduire de dépendance ou de couche d'abstraction sans besoin concret.
- Préserver une expérience mobile-first, en particulier sur Safari iOS.

## Architecture cible de la V0

La V0 repose sur une application Next.js en TypeScript utilisant l'App Router.

Les responsabilités principales seront séparées ainsi :

- **Pages et layouts** : navigation et composition des écrans ;
- **Composants UI** : présentation réutilisable ;
- **Domaine entraînement** : types et règles représentant semaines, séances et blocs ;
- **Données locales** : fixtures ou données mockées indépendantes des composants ;
- **Utilitaires** : formatage des dates, distances, durées et allures ;
- **PWA** : manifeste, icônes, métadonnées et comportement installable.

Une structure indicative pourra être utilisée après l'initialisation de Next.js :

```text
src/
├── app/
├── components/
├── features/
│   └── training/
│       ├── components/
│       ├── data/
│       ├── types/
│       └── utils/
└── lib/
```

Cette arborescence est une direction, pas une obligation : elle doit évoluer selon le code réellement nécessaire.

## Modèle métier initial

Les concepts à modéliser en V0 sont :

- `TrainingWeek` : période hebdomadaire et ensemble des séances prévues ;
- `Workout` : séance planifiée à une date donnée ;
- `WorkoutBlock` : partie structurée d'une séance ;
- objectifs de distance, durée, allure ou récupération ;
- type de sport et catégorie de séance.

Le format exact des types TypeScript doit être décidé avant leur implémentation. Pour les blocs aux propriétés différentes, une union discriminée est à évaluer afin de conserver un typage sûr.

## Flux de données en V0

```text
Données mockées → modèle métier → composants de fonctionnalité → pages
```

Les composants ne doivent pas dépendre directement de Strava ou d'une base de données. Une future source de données doit pouvoir remplacer les mocks sans réécrire l'interface complète.

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

Le niveau de fonctionnement hors connexion requis pour la V0 reste à décider. L'installation PWA ne doit pas entraîner une stratégie de cache complexe prématurée.

## Intégration Strava future

L'intégration appartient à la V1. Elle devra respecter les règles suivantes :

- OAuth traité côté serveur ;
- secrets uniquement dans des variables d'environnement sécurisées ;
- jetons jamais exposés dans le bundle client ni versionnés ;
- modèle Strava converti vers le modèle interne via une couche d'adaptation ;
- composants métier indépendants du format brut de l'API Strava.

## Qualité

Les commandes exactes seront renseignées après l'initialisation du projet. Le socle devra au minimum permettre :

- vérification TypeScript ;
- lint ;
- build de production ;
- tests ciblés sur la logique métier lorsqu'elle devient non triviale.

## Journal des décisions

Toute décision structurante doit être ajoutée ici avec sa date, son contexte et sa justification.

| Date | Décision | Statut |
| --- | --- | --- |
| 2026-09-28 | Construire une V0 locale avant toute intégration Strava ou base serveur | Validée |
| 2026-09-28 | Utiliser Next.js, React et TypeScript avec une approche mobile-first | Validée |
| 2026-09-28 | Utiliser l'App Router pour le socle Next.js | À confirmer lors de l'initialisation |

