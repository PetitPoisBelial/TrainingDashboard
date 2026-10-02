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

## Workflow Git obligatoire

Toute modification durable (code, configuration ou documentation) doit passer par une branche dédiée et une pull request (PR), même pour un changement mineur.

### Protection de main et isolation

- Considérer `main` comme la référence stable : ne pas y développer, committer ou pousser directement, ni réécrire son historique.
- Avant de commencer, examiner `git status`, les branches, les worktrees et les PR concernés ; préserver les changements existants.
- Utiliser un worktree isolé et une branche préfixée `codex/` par tâche cohérente. Réutiliser le worktree de cette même tâche s'il existe ; ne pas mélanger plusieurs objectifs indépendants.
- Partir de `origin/main` après un fetch. Si une tâche dépend d'une branche non fusionnée, identifier explicitement cette dépendance et sa base dans la PR.

### Travail parallèle et conflits

- Répartir les tâches parallèles entre des worktrees et branches distincts, avec des périmètres et des fichiers clairement attribués. Ne jamais faire écrire plusieurs agents simultanément dans le même worktree.
- Repérer les fichiers partagés avant les modifications ; coordonner ou séquencer leur édition et annoncer les dépendances entre tâches.
- Vérifier régulièrement l'évolution de la base et des PR liées, notamment avant de publier ou de mettre à jour une PR. Éviter les reformatages globaux, renommages et changements de dépendances sans rapport avec la tâche.
- Avant un merge ou rebase de synchronisation, conserver un état propre et sauvegarder les travaux utiles par des commits ciblés. Ne jamais écraser le travail d'une autre tâche.
- Résoudre chaque conflit en lisant les deux intentions et le contexte métier ; ne pas accepter globalement « ours » ou « theirs ». Si l'intention reste ambiguë, demander un arbitrage à l'utilisateur.
- Après résolution, relire le diff complet et relancer les vérifications concernées. Ne pas réécrire une branche partagée ; sur une branche dédiée déjà publiée, n'utiliser `--force-with-lease` qu'après coordination explicite avec ses contributeurs, jamais `--force`.

### Périmètre des PR et commits

- Une PR doit porter un seul objectif cohérent et rester assez petite pour être relue et validée facilement. Séparer les changements indépendants ; justifier les changements transversaux indispensables.
- Ne pas inclure de nettoyage opportuniste, de fichiers générés sans nécessité, de secrets ou de modifications provenant d'une autre tâche.
- Créer des commits ciblés, avec un message décrivant clairement le changement et sa raison. Examiner le diff puis indexer explicitement les fichiers ou portions utiles ; relire le diff indexé avant chaque commit.
- Pousser la branche dédiée et ouvrir une PR vers `main`. Les PR dépendantes doivent préciser l'ordre de fusion ; utiliser une PR en brouillon tant que le travail ou une dépendance empêche sa validation.

### Vérifications et description obligatoire de PR

- Avant de demander la validation, examiner le diff par rapport à la base, exécuter `git diff --check` et contrôler la liste des fichiers modifiés ainsi que l'état Git.
- Exécuter les vérifications de la section Validation en proportion du changement. Pour une modification uniquement documentaire, contrôler le contenu, les liens concernés et le diff ; expliquer pourquoi les vérifications applicatives ne s'appliquent pas.
- Corriger les régressions introduites et signaler précisément toute vérification impossible, échouée ou restant manuelle. Ne jamais présenter une vérification non exécutée comme réussie.
- La description de chaque PR doit contenir :
  - le problème ou besoin et le résultat attendu ;
  - le périmètre final des changements et les décisions utiles à la revue ;
  - les vérifications exécutées avec leurs résultats, ainsi que celles non exécutées et leur raison ;
  - les risques, limites et contrôles manuels nécessaires, y compris iPhone/Safari iOS si pertinent ;
  - les dépendances éventuelles, leur PR et l'ordre de fusion, ou l'absence de dépendance.

### Validation, fusion et suivi

- La validation finale et la fusion dans `main` sont réservées à l'utilisateur. L'agent fournit l'URL de la PR et les résultats des vérifications, puis attend ; il ne fusionne pas et n'active pas la fusion automatique.
- Après une fusion effectuée par l'utilisateur, récupérer `origin/main` et synchroniser les branches dépendantes avant de poursuivre. Adapter la synchronisation au mode de fusion, notamment après un squash, afin de ne pas réintroduire les commits déjà intégrés.
- Recontrôler les conflits, le diff restant, la base des PR et les vérifications affectées ; mettre à jour leurs descriptions et dépendances.
- Conserver le worktree tant que la PR reste ouverte ou qu'un travail utile en dépend. Après confirmation de la fusion et de l'absence de travail à préserver, archiver ou supprimer le worktree dédié et nettoyer sa branche devenue inutile.
- Avant tout nettoyage, vérifier les changements non commités, fichiers non suivis ou ignorés utiles et commits non poussés ; les préserver. Utiliser l'archivage de l'application pour les worktrees qu'elle gère. Ne jamais supprimer le worktree d'une tâche encore active.

### Exception : réparation urgente explicitement demandée

- Une urgence supposée, un petit diff ou un gain de temps ne constituent pas une exception. Seule une demande explicite de l'utilisateur pour une réparation urgente peut autoriser une dérogation précisément définie.
- Conserver par défaut le workflow branche, worktree et PR. Si l'utilisateur demande de le contourner, consigner le motif, le périmètre minimal et les étapes exceptionnellement autorisées ; demander une précision si ces limites sont ambiguës.
- L'exception ne vaut que pour cette réparation : aucun changement annexe, aucune réécriture de `main`, aucune perte de travaux existants. La validation finale et la fusion restent réservées à l'utilisateur ; l'urgence seule n'autorise jamais un push direct sur `main`.
- Effectuer les vérifications possibles avant livraison, signaler celles différées et fournir un bilan traçable (diff, commits, résultats et limites). Régulariser les étapes différées dès que possible et revenir immédiatement au workflow normal.

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
