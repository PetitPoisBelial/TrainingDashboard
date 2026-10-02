# Instructions pour les agents

## Contexte

Training Dashboard est une application personnelle de suivi d'entraînement, pensée d'abord pour la course à pied et l'utilisation quotidienne sur iPhone.

Avant toute modification importante, lire :

1. `PROJECT.md` pour la vision et le périmètre ;
2. `ARCHITECTURE.md` pour les choix techniques actuels ;
3. `ROADMAP.md` pour la phase et la priorité en cours.

La **V0 — Dashboard local** est clôturée. Le prochain jalon est le **cadrage de la V1 — Gestion des plans**, conformément à `ROADMAP.md`. La persistance privée, le contrôle d'accès et le modèle `.xlsx` doivent être définis avant leur implémentation. Strava reste prévu en V2.

## Principes de travail

- Privilégier simplicité, utilité et fiabilité.
- Ne pas ajouter de fonctionnalité hors du périmètre demandé.
- Ne pas préparer prématurément Strava, Supabase ou une architecture multi-utilisateur.
- Préserver un code TypeScript strict, lisible et modulaire.
- Séparer la logique métier de l'entraînement des composants de présentation.
- Concevoir mobile-first et vérifier les conséquences sur iPhone/Safari iOS.
- Réutiliser les conventions et composants existants avant d'en créer de nouveaux.
- Justifier toute nouvelle dépendance ; éviter celles qui n'apportent pas une valeur nette.
- Mettre à jour la documentation lorsqu'une décision structurante change.

## Sécurité

- Ne jamais écrire de secret, jeton, identifiant OAuth ou valeur sensible dans le code ou la documentation versionnée.
- Ne jamais placer une opération nécessitant un secret dans le frontend.
- Utiliser des variables d'environnement et du code serveur pour les futures intégrations sensibles.
- Ne pas ajouter de fichier `.env` réel au dépôt.

## Méthode d'implémentation

Pour une tâche de code :

1. examiner les fichiers concernés et les changements existants ;
2. confirmer le périmètre à partir de la roadmap ;
3. réaliser le changement minimal cohérent ;
4. exécuter les vérifications pertinentes disponibles ;
5. corriger les régressions causées par le changement ;
6. résumer le résultat et les vérifications effectuées.

Ne pas réécrire ou supprimer des modifications existantes sans rapport avec la tâche.

## Validation

Lorsque le projet sera initialisé, utiliser les scripts définis dans `package.json`. Avant de considérer une tâche terminée, exécuter en proportion du changement :

- lint ;
- vérification TypeScript ;
- tests pertinents ;
- build de production pour les changements structurants ou liés au déploiement.

Si une vérification ne peut pas être exécutée, le signaler explicitement.

## Documentation

- Ajouter les décisions techniques durables à `ARCHITECTURE.md`.
- Mettre à jour l'avancement et le prochain jalon dans `ROADMAP.md`.
- Modifier `PROJECT.md` uniquement si la vision ou le périmètre produit change.
- Garder `README.md` orienté vers l'installation et l'utilisation pratique du dépôt.

## Limites actuelles

Tant que la V0 n'est pas terminée :

- pas d'intégration Strava ;
- pas de base de données distante ;
- pas d'authentification utilisateur ;
- pas d'analytics avancés ;
- pas d'abstraction destinée à un hypothétique produit SaaS.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
