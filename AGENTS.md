# Instructions pour les agents

## Contexte

Training Dashboard est une application personnelle de suivi d'entraînement, pensée d'abord pour la course à pied et l'utilisation quotidienne sur iPhone.

Avant toute modification importante, lire :

1. `PROJECT.md` pour la vision et le périmètre ;
2. `ARCHITECTURE.md` pour les choix techniques actuels ;
3. `ROADMAP.md` pour la phase et la priorité en cours.

La phase actuelle est la **V0 — Dashboard local**.

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

