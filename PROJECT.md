# Training Dashboard

## Vision

Training Dashboard est une application web personnelle de suivi d'entraînement, principalement consacrée à la course à pied et secondairement au vélo.

L'application doit fournir une lecture immédiate et utile de la semaine d'entraînement : ce qui était prévu, ce qui a été réalisé et, à terme, la manière dont la charge et les performances évoluent.

Le produit est conçu en priorité pour une utilisation quotidienne sur iPhone. Il doit fonctionner comme une PWA installable, rapide, lisible et agréable sur mobile, tout en restant utilisable sur ordinateur.

## Utilisateur cible

Le projet est personnel et mono-utilisateur. Il répond aux besoins d'un coureur régulier réalisant généralement 75 à 100 km par semaine, avec plusieurs footings, environ deux séances de qualité et une pratique régulière du vélo.

Le produit n'a pas vocation à devenir un SaaS multi-utilisateur dans sa première conception.

## Besoin métier

Le dashboard doit comprendre davantage qu'un volume kilométrique. Une semaine et une séance peuvent comporter différents types d'efforts :

- endurance fondamentale ;
- sortie longue ;
- tempo ou seuil ;
- répétitions courtes ou longues ;
- récupérations ;
- échauffement, éducatifs et retour au calme ;
- vélo et autres activités complémentaires.

Une séance structurée telle que `4 × 2000 m @ 3'30–3'32/km, récupération 2 min` doit pouvoir être représentée sans perdre sa structure.

## Objectifs fonctionnels

À terme, l'application doit permettre de croiser :

- le plan d'entraînement prévu ;
- les activités réellement effectuées, d'abord via Strava ;
- les données de séance : distance, durée, allure, fréquence cardiaque, intervalles et dénivelé ;
- les sensations : RPE, fatigue, sommeil, état des jambes et commentaires ;
- l'historique et les tendances d'entraînement.

Les principaux domaines fonctionnels sont :

1. dashboard de la semaine actuelle ;
2. plan d'entraînement et séances structurées ;
3. import des activités Strava ;
4. association entre séance prévue et activité réalisée ;
5. analyse des séances et des répétitions ;
6. historique, statistiques et tendances ;
7. saisie rapide du ressenti.

## Principes produit

Les priorités du projet sont, dans cet ordre :

1. simplicité ;
2. utilité ;
3. fiabilité ;
4. automatisation.

Chaque fonctionnalité doit répondre à un besoin concret de suivi. L'objectif n'est pas de reproduire Strava, mais de présenter les informations réellement utiles à la planification et à l'analyse de l'entraînement.

## Stack privilégiée

- TypeScript ;
- React ;
- Next.js ;
- PWA responsive et mobile-first ;
- Git et GitHub ;
- Vercel pour le déploiement ;
- Supabase/PostgreSQL uniquement lorsqu'une persistance serveur devient nécessaire.

Le code doit rester typé, lisible, modulaire et maintenable. Une solution simple est préférable à une architecture prématurément complexe.

## Contraintes de sécurité

- Les secrets OAuth et les jetons sensibles ne doivent jamais être exposés dans le frontend.
- Aucun secret ne doit être ajouté au dépôt Git.
- Les échanges nécessitant un secret doivent être effectués côté serveur.
- Strava est la première intégration externe prévue ; Garmin reste une possibilité ultérieure.

## Phase actuelle

La **V0 — Dashboard local** est terminée et validée. Le prochain jalon est le **cadrage de la V1 — Gestion des plans**, détaillé dans `ROADMAP.md`.

La V0 fournit une application utilisable avec des données locales ou mockées : semaine actuelle, séances prévues, kilométrage prévu, détail d'une séance et expérience mobile/PWA en français et en anglais. La V1 prévoit la gestion de plusieurs plans, l'import/export `.xlsx` et une persistance privée synchronisée entre ordinateur et iPhone. Ses choix techniques restent à définir avant implémentation ; Strava est prévu en V2.

