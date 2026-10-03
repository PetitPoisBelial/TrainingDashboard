# Conception V1 — Gestion des plans

## Statut du document

Ce document décrit l'architecture validée de la V1 le 3 octobre 2026. Il complète `ARCHITECTURE.md`, qui conserve les décisions durables, et `ROADMAP.md`, qui pilote les lots d'implémentation.

La V1 doit permettre de créer, importer, consulter, activer, modifier, exporter et supprimer plusieurs plans privés synchronisés entre ordinateur et iPhone. Elle reste strictement mono-utilisateur. Strava, la collaboration, le fonctionnement hors connexion et l'historique complet des modifications restent hors périmètre.

## Décisions structurantes

- Le modèle interne de Training Dashboard est la source de vérité.
- PostgreSQL est la persistance principale ; le fichier `.xlsx` est un format d'échange versionné.
- La base recommandée est Neon PostgreSQL intégrée à Vercel.
- Tous les déploiements contenant des données réelles sont protégés par Vercel Authentication.
- L'expérience de connexion doit être validée dans Safari et dans la PWA installée avant l'enregistrement de données réelles. Supabase Auth avec un compte précréé et les inscriptions désactivées constitue le repli si cette expérience est insuffisante.
- Drizzle fournit le schéma TypeScript, les requêtes et les migrations SQL versionnées. Il ne remplace pas le modèle métier.
- Les Server Components sont utilisés par défaut. Les données privées et les secrets ne quittent jamais le serveur.
- Les formulaires utilisent un brouillon local par entité et un enregistrement explicite.
- Une révision optimiste empêche les écrasements silencieux entre ordinateur et iPhone.
- Un plan créé ou importé est inactif jusqu'à une activation explicite.
- Les sauvegardes combinent la restauration native du fournisseur et des dumps PostgreSQL conservés hors fournisseur.

## Vue d'ensemble

```text
Navigateur / PWA
        │
        ├── Server Components ──→ requêtes serveur ──→ PostgreSQL
        │
        ├── formulaires client ─→ Server Actions ───→ commandes atomiques
        │
        ├── fichier XLSX ───────→ Route Handler ─────→ analyse et import
        │
        └── téléchargement ←──── Route Handler ←───── génération XLSX
                                      │
                                      └── modèle métier interne
```

Le domaine Training reste indépendant de Plans. La feature Plans dépend des types et sélecteurs Training. Les pages assurent la composition : le dashboard charge le plan actif, en dérive la semaine courante puis transmet un `TrainingWeek` aux composants existants.

## Modèle métier

### Entités et objets-valeurs

- `TrainingPlan` est la racine d'agrégat et possède un identifiant stable.
- `Workout` reste une entité avec un identifiant stable et appartient à un plan.
- `WorkoutBlock` reste un objet-valeur ordonné dans une séance. Une ligne de base peut avoir un identifiant technique, mais celui-ci n'appartient ni au contrat métier ni au format d'export.
- `TrainingWeek` est une projection calculée, jamais une donnée persistée.
- `ActivePlanSelection` est un état applicatif séparé du plan.

Les identifiants exposés au code métier sont des types opaques tels que `TrainingPlanId` et `WorkoutId`. Leur implémentation PostgreSQL peut utiliser des UUID sans rendre le domaine dépendant de ce format.

### Données stockées

Un plan stocke son identifiant, son nom, ses dates inclusives, sa description facultative et ses séances ordonnées. Les métadonnées de persistance ajoutent une révision, une date de création et une date de dernière modification.

Une séance stocke sa date, son ordre parmi les séances du même jour, son sport, sa catégorie, son titre, son importance, son volume global prévu, ses notes et ses blocs ordonnés.

L'ordre des séances et des blocs est explicite dans la persistance. Dans le modèle métier, l'ordre du tableau reste l'ordre d'exécution.

### Données dérivées

Les données suivantes ne sont jamais persistées :

- semaines du plan et semaines partielles de début ou de fin ;
- statut temporel `planned`, `in-progress` ou `finished` ;
- semaine courante ;
- totaux hebdomadaires et totaux du plan ;
- nombre de séances ;
- prochaine séance importante ;
- libellés et formats localisés.

Le statut temporel utilise la date courante dans `Europe/Paris`. L'activation reste indépendante de ce statut : un plan futur ou terminé peut être activé après un avertissement.

### Invariants

- `startsOn` est antérieur ou égal à `endsOn`.
- Le nom est non vide après normalisation et sa longueur est bornée.
- Chaque séance appartient à la période inclusive du plan.
- Les identifiants de séance sont uniques dans le plan.
- Plusieurs séances peuvent partager une date et possèdent un ordre déterministe.
- Une séance de course possède une distance globale strictement positive.
- Une séance de vélo possède au moins une distance ou une durée globale strictement positive.
- Les cibles de blocs sont strictement positives et utilisent soit une distance, soit une durée.
- Le nombre de répétitions est un entier strictement positif.
- Une plage d'allure possède une borne rapide inférieure ou égale à la borne lente en secondes par kilomètre.
- Une modification de période qui exclurait des séances est refusée et indique les séances concernées.
- Le volume global d'une séance n'est pas recalculé depuis ses blocs.
- Un footing simple est normalisé avec un bloc `segment`, sans imposer cette saisie redondante à l'utilisateur.

Les contraintes de forme sont validées aux frontières. Les invariants transversaux restent des fonctions métier pures et indépendantes de React, de la base et de la langue.

## Persistance et accès privé

### Contrôle d'accès

Vercel Authentication protège la production et les Preview. Dans cette architecture mono-utilisateur, l'application ne possède pas de table `users` ni de colonne `owner_id` : l'autorisation accordée au membre du projet Vercel est l'identité suffisante.

Toutes les requêtes de données, mutations, analyses d'import et générations d'export passent par le serveur. La chaîne de connexion PostgreSQL et les éventuels secrets ne sont jamais exposés au bundle client.

Ce choix lie l'accès privé à Vercel. Un déploiement futur sur une autre plateforme devra introduire un contrôle d'accès applicatif avant de devenir accessible. Si la connexion Vercel ne fonctionne pas correctement dans la PWA iOS, la V1 bascule vers Supabase Auth avec un seul compte autorisé ; cette décision doit être prise avant l'écriture de données de production.

### Schéma logique minimal

`training_plans` :

- `id` ;
- `name`, `starts_on`, `ends_on`, `description` ;
- `revision` ;
- `created_at`, `updated_at`.

`workouts` :

- `id`, `plan_id` ;
- `scheduled_on`, `position` ;
- `sport`, `category`, `title`, `is_key` ;
- `planned_distance_meters`, `planned_duration_seconds` ;
- `notes`.

`workout_blocks` :

- identifiant technique, `workout_id`, `position` ;
- `kind`, `role`, `label`, `repeat_count` ;
- cible et allure ;
- cible, allure et notes de récupération ;
- notes du bloc.

`application_state` :

- une ligne unique ;
- `active_plan_id` nullable ;
- `revision`, `updated_at`.

La ligne unique de `application_state` garantit qu'il existe au plus un plan actif. Un booléen `is_active` dupliqué sur chaque plan est interdit.

Les clés étrangères, contraintes d'unicité, contraintes positives et suppressions en cascade constituent le dernier filet de cohérence après la validation métier.

### Concurrence entre appareils

Chaque plan possède un compteur `revision` invisible. Une commande transmet la révision qu'elle a lue et met à jour le plan seulement si cette révision est encore courante.

```text
lecture de la révision 7
→ enregistrement attendu sur la révision 7
→ mise à jour atomique et passage à la révision 8
```

Si un autre appareil a déjà créé la révision 8, la commande est refusée avec une erreur de conflit. L'interface propose de recharger ; la V1 ne fusionne pas automatiquement deux modifications. Ce compteur n'est ni un historique de versions ni une copie du plan.

L'état actif possède sa propre révision afin d'éviter deux activations concurrentes contradictoires.

### Environnements, migrations et sauvegardes

- La production utilise une base ou branche PostgreSQL dédiée.
- Le développement et les Preview utilisent une base ou branche séparée et ne reçoivent jamais un secret d'écriture de production.
- Les migrations SQL sont versionnées dans Git et exécutées explicitement avant le code qui en dépend.
- Aucune fonction Vercel ne lance automatiquement des migrations au démarrage.
- Une sauvegarde `pg_dump` est réalisée avant toute migration destructive et périodiquement au minimum une fois par mois pendant la V1.
- Les dumps sont conservés hors du dépôt et hors du fournisseur PostgreSQL.
- La durée de restauration native disponible dans l'offre Neon retenue est vérifiée avant l'enregistrement de données réelles.
- Une restauration avec `pg_restore` est documentée et testée au moins une fois avant la recette finale.

L'export `.xlsx` facilite une récupération métier, mais ne remplace pas une sauvegarde de base complète.

## Organisation de la feature

```text
src/
├── features/
│   ├── training/
│   │   ├── model/
│   │   ├── formatting/
│   │   └── components/
│   └── plans/
│       ├── model/
│       ├── server/
│       ├── xlsx/
│       ├── components/
│       └── forms/
└── server/
    └── db/
```

- `plans/model` contient `TrainingPlan`, les invariants, projections et erreurs typées.
- `plans/server` contient les requêtes, commandes, transactions et mappings PostgreSQL.
- `plans/xlsx` contient le contrat canonique, les conversions, l'analyse et la génération. Les dépendances binaires restent côté serveur.
- `plans/components` contient la présentation sans règle métier.
- `plans/forms` contient les îlots client et leurs brouillons locaux.
- `server/db` contient uniquement le client, le schéma et les migrations partagés.

Une interface générique de repository ne sera ajoutée que si une deuxième implémentation réelle apparaît. Les requêtes et commandes sont des fonctions explicites.

### Requêtes principales

- lister les résumés de plans ;
- charger un plan complet ;
- charger une séance dans son plan ;
- charger le plan actif ;
- dériver la semaine active du dashboard.

### Commandes principales

- créer un plan ;
- modifier les informations générales ;
- créer ou modifier une séance avec ses blocs ;
- déplacer ou supprimer une séance ;
- activer ou désactiver un plan ;
- confirmer un import ;
- supprimer un plan.

Chaque commande valide l'entrée, applique les invariants, contrôle la révision attendue puis exécute une transaction unique.

## Pages et navigation Plan

| Route | Responsabilité |
| --- | --- |
| `/[locale]/plan` | Liste, plan actif, état vide, création et import |
| `/[locale]/plan/new` | Création minimale |
| `/[locale]/plan/import` | Sélection, erreurs, aperçu et confirmation |
| `/[locale]/plan/[planId]` | Détail et semaine sélectionnée |
| `/[locale]/plan/[planId]/edit` | Informations générales |
| `/[locale]/plan/[planId]/workouts/new` | Création d'une séance |
| `/[locale]/plan/[planId]/workouts/[workoutId]` | Détail d'une séance |
| `/[locale]/plan/[planId]/workouts/[workoutId]/edit` | Édition de la séance et des blocs |
| `/api/plans/[planId]/export` | Export binaire protégé |
| `/api/plans/import/preview` | Analyse protégée du fichier |
| `/api/plans/import/confirm` | Confirmation atomique de l'import |

La semaine sélectionnée est portée par le paramètre `?week=YYYY-MM-DD`. La route V0 `/[locale]/workouts/[workoutId]` reste temporairement compatible puis redirige vers la route canonique du plan.

Les pages de consultation sont des Server Components. Les Client Components sont réservés aux formulaires, au sélecteur de fichier, à l'aperçu d'import, à l'éditeur ordonné des blocs, aux avertissements de changements non enregistrés et aux dialogues de confirmation.

Sur mobile, une seule semaine est affichée à la fois. Les actions secondaires sont regroupées dans un menu. Les déplacements disposent toujours de boutons accessibles et ne dépendent pas d'un glisser-déposer. Les états vide, chargement, erreur, absence de plan actif et semaine sans séance sont distincts.

## Création et édition

La création minimale demande un nom, une date de début et une date de fin ; la description est facultative. Elle crée un plan vide et inactif. La duplication est différée.

L'édition utilise un formulaire par entité avec un bouton d'enregistrement :

- un formulaire pour les informations générales ;
- un formulaire unique pour une séance et toute sa collection de blocs ;
- des commandes dédiées pour déplacer et supprimer.

La séance et ses blocs sont enregistrés dans une seule transaction. Aucun bloc partiel n'est visible. Les modifications non enregistrées restent locales au formulaire et déclenchent un avertissement avant navigation ou rechargement. Aucun brouillon persistant ni enregistrement automatique n'est introduit en V1.

## Import `.xlsx`

Le classeur contient exactement les feuilles non localisées `Plan`, `Sessions` et `Blocks`. La feuille `Plan` reçoit la colonne obligatoire `format_version`, initialement égale à `1`.

Il ne contient jamais :

- d'identifiant de base de données ;
- de référence d'utilisateur ;
- d'état actif ;
- de donnée réalisée ;
- de secret ou métadonnée technique inutile.

Les `session_ref` sont locales au classeur. Les dates exportées utilisent `YYYY-MM-DD`, les distances des kilomètres, les durées des minutes et les allures `mm:ss/km`. L'import convertit vers les mètres, secondes et secondes par kilomètre.

### Pipeline

```text
sélection du fichier
→ contrôle client léger
→ lecture serveur
→ validation du classeur
→ conversion en candidat interne
→ validation métier
→ aperçu et avertissements
→ confirmation avec le même fichier
→ nouvelle validation serveur
→ création atomique avec de nouveaux identifiants
```

Le serveur calcule l'empreinte SHA-256 du fichier présenté dans l'aperçu. La confirmation renvoie le même fichier ; le serveur vérifie l'empreinte et refait toutes les validations. Aucune table temporaire ni donnée d'import non confirmée n'est nécessaire.

Les formules sont refusées dans les champs canoniques. Des limites de taille de fichier, de séances et de blocs protègent la fonction serveur avant l'analyse complète.

Les erreurs utilisent un contrat indépendant de la langue :

```text
code
severity: error | warning
path
source: sheet, row, column
params
```

Les dictionnaires FR/EN transforment ces codes en messages. Une empreinte métier identique produit un avertissement de copie probable ; un nom et une période identiques produisent un avertissement de ressemblance. L'utilisateur peut confirmer une copie, mais aucun import ne fusionne ou ne remplace un plan existant.

## Export `.xlsx`

L'export charge le plan complet depuis PostgreSQL, produit la représentation canonique et génère les trois feuilles côté serveur. Les références de séance sont générées pour le classeur, par exemple `S001`, et n'exposent aucun identifiant interne.

Le critère central est le round-trip :

```text
plan interne → export → import → égalité métier
```

Les nouveaux identifiants et métadonnées techniques sont exclus de cette égalité. Un export contient toujours les dernières modifications enregistrées dans l'application.

La dépendance XLSX sera choisie dans le lot d'import après un test ciblé avec Next.js 16. ExcelJS est le premier choix pour la lecture, l'écriture et la mise en forme simple côté serveur ; SheetJS CE reste l'alternative si ce test révèle une incompatibilité.

## Activation et dashboard

L'activation remplace `application_state.active_plan_id` dans une transaction. Si un autre plan est déjà actif, l'interface demande une confirmation. Il n'existe pas de séquence séparée « désactiver puis activer » susceptible de laisser un état intermédiaire.

La suppression du plan actif place la référence à `null` dans la même transaction. Un plan terminé reste consultable et n'est jamais supprimé automatiquement.

Le dashboard distingue :

1. aucun plan actif ;
2. plan actif mais date courante hors de sa période ;
3. semaine active sans séance, qui représente du repos ;
4. semaine active avec séances.

La page du dashboard charge le plan actif, dérive la semaine courante et réutilise les sélecteurs et composants Training existants. Les fixtures V0 restent disponibles pour les tests et les démonstrations, mais ne constituent plus la source de production après ce basculement.

## Validation, internationalisation et accessibilité

- La validation client améliore le retour immédiat ; la validation serveur reste autoritative.
- Une bibliothèque de schémas peut valider les frontières, tandis que les fonctions métier gèrent les invariants transversaux.
- Les erreurs attendues sont des codes typés ; les erreurs inattendues sont journalisées sans exposer de secret.
- Les formats de date, distance, durée et allure utilisent les conventions `fr-FR` et `en-GB` pour l'affichage.
- Le format `.xlsx` reste canonique et non localisé.
- Les erreurs sont liées aux champs et un résumé reçoit le focus après un échec.
- Les confirmations gèrent correctement le focus et sont perceptibles par les technologies d'assistance.
- Les zones tactiles mesurent au moins 44 px.
- Aucun déplacement ne dépend uniquement d'un geste de glisser-déposer.
- Les réponses privées ne sont pas mises en cache par un service worker. Le fonctionnement hors connexion n'est pas un objectif de la V1.

## Stratégie de tests

- Tests unitaires des invariants, sélecteurs, statuts et agrégats.
- Tests unitaires des conversions XLSX et de chaque code d'erreur.
- Tests d'intégration des migrations, contraintes et commandes atomiques sur une base dédiée.
- Tests de concurrence à partir de deux révisions identiques.
- Tests de round-trip export/import hors identifiants.
- Tests des Server Actions et Route Handlers sensibles.
- Parcours de création, import, activation, édition, export et suppression.
- Vérification manuelle dans Safari iOS et dans la PWA installée.
- Lint, vérification TypeScript, tests et build de production pour chaque lot structurant.

## Risques et garde-fous

| Risque | Garde-fou |
| --- | --- |
| Connexion Vercel inconfortable dans la PWA | Test bloquant précoce ; repli Supabase Auth avant les données réelles |
| Écriture Preview dans la production | Secrets et branches PostgreSQL séparés |
| Écrasement entre appareils | Révision optimiste et erreur de conflit |
| Import partiel | Validation complète puis transaction unique |
| Fichier volumineux ou hostile | Limites strictes, rejet des formules et analyse serveur |
| Dates ambiguës | `LocalDate` et texte ISO dans le classeur |
| Éditeur mobile trop complexe | Formulaires par entité, une semaine à la fois, actions accessibles |
| Perte de données | Restauration native, dumps hors fournisseur et exercice de restauration |
| Couplage au tableur | Adaptateurs XLSX autour du modèle interne |

Le découpage détaillé et les critères d'acceptation figurent dans `ROADMAP.md`.
