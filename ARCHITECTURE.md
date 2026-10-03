# Architecture

## Statut

La V0 est clôturée. La navigation et l'internationalisation sont déployées sur Vercel. L'installation, l'affichage standalone, l'expérience générale et la restauration de la langue mémorisée ont été validés sur iPhone réel. L'utilisateur a confirmé la recette finale des liens, de la navigation clavier et des safe areas. L'architecture de la V1 — Gestion des plans est validée ; le prochain jalon est l'implémentation progressive du domaine, de l'accès privé et de la persistance décrite dans `docs/V1_PLANS_DESIGN.md`.

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
│   ├── manifest.ts
│   ├── globals.css
│   └── [locale]/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── not-found.tsx
│       ├── [...missing]/page.tsx
│       ├── plan/page.tsx
│       ├── activities/page.tsx
│       ├── insights/page.tsx
│       └── workouts/[workoutId]/page.tsx
├── proxy.ts
├── i18n/
│   ├── locales.ts
│   ├── request-locale.ts
│   ├── get-dictionary.ts
│   └── dictionaries/
│       ├── fr.ts
│       └── en.ts
├── components/
│   └── app-shell/
│       ├── app-shell.tsx
│       ├── navigation-items.ts
│       ├── primary-navigation.tsx
│       └── language-switcher.tsx
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

La V0 n'introduit ni bibliothèque de composants, ni gestionnaire d'état global. Les fondations visuelles peuvent rester dans les styles globaux et les styles propres aux composants dans des CSS Modules. Les dossiers de fonctionnalités futures ne sont créés que lorsqu'ils contiennent une première responsabilité métier réelle ; une page placeholder ne justifie pas à elle seule un module vide.

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
- Un menu principal permet de naviguer entre Accueil, Plan, Activités et Analyses.
- Le menu indique la section active et reste utilisable au clavier et avec un lecteur d'écran.
- Les sections qui ne possèdent pas encore de fonctionnalité affichent un placeholder explicite plutôt qu'un écran vide.
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

## Écrans et navigation

### Shell d'application

Toutes les pages fonctionnelles partagent un shell fourni par le layout racine. Ce shell est responsable du cadre visuel général, de la zone de contenu et du menu principal. Il ne contient aucune logique métier liée à l'entraînement.

Le menu utilise une seule configuration typée contenant, pour chaque section, son libellé, son chemin, son icône et ses éventuels chemins secondaires. Cette configuration alimente les variantes mobile et ordinateur afin d'éviter deux navigations divergentes.

La navigation et le sélecteur de langue sont les seuls Client Components du shell. Le layout et le contenu des pages restent des Server Components.

### Comportement responsive du menu

- Sur mobile, le menu principal est une barre fixe en bas, adaptée à l'utilisation à une main et aux safe areas iOS.
- Sur ordinateur, les mêmes entrées sont présentées dans une barre latérale stable ou compacte.
- La zone de contenu réserve l'espace nécessaire au menu afin qu'aucune information ne soit masquée.
- Chaque destination reste un lien réel : le rechargement, les liens directs et les boutons précédent/suivant du navigateur fonctionnent normalement.
- L'entrée active expose `aria-current="page"`, possède un libellé visible et conserve une zone tactile d'au moins 44 px.

Une barre inférieure est préférée à un menu hamburger : avec quatre destinations principales, elle rend les sections immédiatement visibles et demande moins d'actions sur iPhone. Une navigation haute est écartée car elle est moins accessible à une main et s'adapte moins bien aux petits écrans.

### Sections principales

| Section | Route | Rôle en V0 |
| --- | --- | --- |
| Accueil | `/[locale]` | Dashboard hebdomadaire existant |
| Plan | `/[locale]/plan` | Placeholder pour la consultation future du plan |
| Activités | `/[locale]/activities` | Placeholder pour les activités futures |
| Analyses | `/[locale]/insights` | Placeholder pour les analyses futures |

Les routes sont déclarées par des fichiers `page.tsx` explicites. Une route dynamique générique telle que `/[section]` est évitée : chaque section pourra ainsi acquérir son propre layout, ses métadonnées et ses dépendances sans condition centrale.

Les placeholders partagent un petit composant de présentation, mais chaque page conserve son titre et son texte. Ils ne simulent aucune donnée et ne préfigurent pas les modèles métier futurs.

### Dashboard hebdomadaire — `/[locale]`

Le dashboard affiche la période, le kilométrage de course prévu, les séances regroupées par jour, la séance du jour et la prochaine séance importante. Il permet d'accéder au détail de chaque séance. Son contenu reste une page verticale ; l'ajout du menu global ne transforme pas le dashboard en ensemble d'onglets internes.

### Détail d'une séance — `/[locale]/workouts/[workoutId]`

Cette page rappelle la date, le sport, la catégorie et le volume global. Elle affiche les blocs dans l'ordre, formate les distances, durées, répétitions et allures, présente les consignes éventuelles et propose un retour simple vers la semaine.

Une route dédiée est préférée à une modale afin de simplifier la navigation mobile, les liens directs et le rafraîchissement de la page.

Le détail d'une séance reste dans le shell global. Sémantiquement, le chemin `/[locale]/workouts/[workoutId]` appartient à la section Plan pour déterminer l'état actif du menu, même si la séance a été ouverte depuis l'Accueil.

### Fonctionnalités exclues de la V0

- création ou édition d'un plan ;
- historique et statistiques ;
- réglages ;
- connexion utilisateur ;
- activités réalisées ;
- intégrations externes.

## Internationalisation français / anglais

### Statut et périmètre

Le français et l'anglais sont implémentés localement. Ils couvrent l'interface, la navigation, les métadonnées, les formats de dates et les contenus de démonstration. Ils n'introduisent ni traduction automatique ni gestion éditoriale complexe.

Les locales applicatives sont limitées à :

- `fr`, locale par défaut, formatée avec `fr-FR` ;
- `en`, formatée avec `en-GB` afin de conserver les unités métriques et les conventions européennes.

### Routage localisé

La locale fait partie de l'URL et constitue la source de vérité :

```text
/fr
/en
/fr/plan
/en/plan
/fr/workouts/[workoutId]
/en/workouts/[workoutId]
```

Les pages fonctionnelles sont regroupées sous `app/[locale]/`. Les pages valident le paramètre dynamique à l'exécution et toute valeur autre que `fr` ou `en` produit une réponse 404. Le layout racine conserve le shell français pour les erreurs de locale invalide. Une route de secours `[...missing]` rend les URL inconnues avec l'état 404 traduit ; elle ne sert aucune section métier.

La locale est lue côté serveur via `next/root-params`, l'API générée de Next.js 16.3 pour les paramètres situés avant le layout racine. Aucun en-tête personnalisé ni état global n'est nécessaire.

Un `src/proxy.ts` redirige les chemins sans locale vers leur équivalent localisé. Il exclut les ressources internes Next.js, le manifeste, les icônes et les fichiers statiques. La racine `/` et les anciennes URL telles que `/plan` restent ainsi utilisables.

La préférence est conservée pendant un an dans le cookie non sensible `training-locale`, avec `Path=/`, `SameSite=Lax` et `Secure` sur HTTPS. En l'absence de préférence valide, le français est utilisé. L'URL localisée prévaut toujours sur ce cookie. Aucune détection automatique via `Accept-Language` n'est nécessaire pour cette application personnelle.

Le sélecteur remplace uniquement le segment de locale et conserve la page, l'identifiant de séance et les paramètres de navigation courants. Le changement utilise un remplacement d'historique afin de ne pas ajouter une entrée artificielle à chaque bascule de langue.

### Dictionnaires typés

Les traductions intégrées sont placées dans une couche dédiée :

```text
src/i18n/
├── locales.ts
├── get-dictionary.ts
└── dictionaries/
    ├── fr.ts
    └── en.ts
```

Le dictionnaire français définit la structure de référence. Le dictionnaire anglais doit satisfaire le même type afin que toute clé manquante soit détectée par TypeScript. Les dictionnaires sont chargés côté serveur et seules les portions nécessaires aux composants interactifs sont transmises au client.

Cette couche traduit :

- les entrées de navigation et le shell ;
- les titres, descriptions et états vides des pages ;
- les libellés du dashboard ;
- les catégories de séance et rôles des blocs ;
- les jours, dates, durées, distances et allures ;
- les métadonnées et textes d'accessibilité.

Les titres, notes et commentaires saisis librement à l'avenir restent dans leur langue d'origine. `localized-training-weeks.ts` fournit les textes anglais des seules séances de démonstration identifiées, sans modifier les fixtures françaises ni les types du domaine. Toute séance sans traduction de démonstration conserve son texte original.

### Composant de sélection

Un composant partagé propose un choix explicite `FR | EN` :

- dans la zone utilitaire de la barre latérale sur ordinateur ;
- dans l'en-tête sur mobile, sans ajouter une cinquième destination au menu principal ;
- avec un état courant perceptible visuellement et exposé aux technologies d'assistance.

Seul ce sélecteur et la navigation nécessitent du code client. Les pages, dictionnaires et composants de contenu restent des Server Components par défaut.

### PWA et métadonnées

Le manifeste conserve un nom neutre et `start_url: "/"`. Au lancement de la PWA, la racine redirige vers la préférence mémorisée. La balise `lang` du document et les métadonnées des pages correspondent à la locale de l'URL.

### Dépendances et seuil d'évolution

Aucune bibliothèque d'internationalisation n'est ajoutée en V0. Deux locales et un volume réduit de textes peuvent être gérés avec les primitives de Next.js, des dictionnaires TypeScript et `Intl`.

Une bibliothèque dédiée telle que `next-intl` ne sera réévaluée qu'en présence d'un besoin concret : nombreuses règles de pluriel, messages riches, nouvelles langues ou contribution de traducteurs externes.

### Validation attendue

- toutes les routes principales fonctionnent en français et en anglais ;
- `/` redirige vers la préférence enregistrée ou vers `/fr` par défaut ;
- le sélecteur conserve la route et les paramètres courants ;
- `<html lang>` et les métadonnées correspondent à la locale ;
- les dates utilisent `fr-FR` ou `en-GB` ;
- les deux dictionnaires possèdent les mêmes clés ;
- la navigation directe, précédent/suivant et le lancement PWA restent fonctionnels ;
- le lint, la vérification TypeScript, les tests et le build de production réussissent.

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

## Modèle métier cible de la V1

La V1 introduit un plan d'entraînement complet au-dessus des séances existantes. Le modèle reste composé d'objets TypeScript immuables et de fonctions pures. Les identifiants internes, les détails de persistance et les métadonnées techniques ne doivent pas contaminer les règles sportives.

### `TrainingPlan`

Un plan contient :

- `id` : identifiant interne stable ;
- `name` : nom court du plan ;
- `startsOn` et `endsOn` : dates locales ISO inclusives ;
- `description` : objectif, contexte ou consignes générales facultatives ;
- `workouts` : liste ordonnée de toutes les séances du plan.

La forme TypeScript cible est :

```ts
type TrainingPlan = Readonly<{
  id: string;
  name: string;
  startsOn: LocalDate;
  endsOn: LocalDate;
  description?: string;
  workouts: readonly Workout[];
}>;
```

Les semaines ne sont pas la source de vérité du plan. Elles sont des vues calculées en regroupant les séances du lundi au dimanche, y compris lorsque la première ou la dernière semaine n'est couverte que partiellement par les dates du plan. Cette règle évite de dupliquer les dates, facilite l'import `.xlsx` et permet de recalculer immédiatement les semaines après le déplacement d'une séance.

Le kilométrage hebdomadaire de course est la somme des distances globales prévues des séances de course. Le vélo possède son propre total et n'est jamais additionné au kilométrage de course. Aucun total hebdomadaire n'est stocké.

Invariants :

- `startsOn` est antérieur ou égal à `endsOn` ;
- chaque séance est comprise dans les dates inclusives du plan ;
- les identifiants de séance sont uniques dans le plan ;
- plusieurs séances peuvent partager une date et conservent l'ordre défini dans le plan.

### Contrat du domaine implémenté au lot 2

`plans/model` dépend uniquement du domaine Training. La construction d'un plan et le changement de période renvoient un résultat discriminé `ok`, avec une valeur ou des erreurs codées et des chemins de champs. Les erreurs transversales identifient les séances concernées. Ces fonctions attendent un candidat typé ; le décodage des objets de formulaire, de base ou de fichier restera dans leurs adaptateurs respectifs.

Le nom est normalisé en supprimant les blancs périphériques et en réduisant les suites de blancs à un espace. Sa limite est de **120 points de code Unicode après normalisation**. Les identifiants opaques sont des chaînes non vides sans blancs périphériques, sans contrainte UUID ; les constructeurs de frontière préservent leur valeur. `LocalDate` conserve sa forme TypeScript compatible V0 et un parseur vérifie les dates calendaires réelles au format exact `YYYY-MM-DD` (années 0001 à 9999).

La construction trie les séances par date de façon stable : l'ordre du tableau est conservé pour une même date et représente la position d'exécution. Aucune position redondante n'est ajoutée à l'objet métier. La projection `PlanWeek` est compatible avec `TrainingWeek` et expose les bornes de couverture du plan pour les semaines partielles. `planWeekOn` refuse une date hors période ; `projectTrainingWeek` accepte n'importe quel jour d'une semaine intersectant le plan, notamment son lundi. Les projections attendent un plan préalablement validé.

`Workout` garde ses volumes facultatifs pour préserver les fixtures historiques non quantifiées, en particulier `raceBlock2026`. Les volumes requis selon le sport sont imposés par la validation à la construction d'un plan V1, sans inventer de distance pour ces exemples. Les segments libres restent permis ; un footing simple sans bloc reçoit un segment continu lors de la construction. La récupération est structurée sous `target`, avec allure et notes facultatives, et les blocs peuvent porter un `label`. La source du dashboard reste celle de la V0.

### Activation et statut temporel

L'activation n'est pas un statut métier du plan : l'application conserve séparément la référence du plan actif et garantit qu'il n'en existe au plus qu'un. Un nouveau plan importé est inactif jusqu'à une action explicite de l'utilisateur.

Le statut temporel est calculé à partir de la date courante dans le fuseau `Europe/Paris` :

- `planned` avant `startsOn` ;
- `in-progress` entre `startsOn` et `endsOn`, bornes incluses ;
- `finished` après `endsOn`.

Un plan terminé reste consultable. Aucun état `archived` ni brouillon persistant n'est nécessaire dans le premier périmètre : l'aperçu d'import existe avant la création atomique du plan.

### `Workout`

Une séance conserve les champs de la V0 : date, sport, catégorie, titre, importance, volume global, blocs ordonnés et notes facultatives. La V1 ajoute la catégorie `race` et précise les volumes obligatoires selon le sport.

Pour une séance de course :

- la distance globale prévue est obligatoire et strictement positive ;
- la durée globale reste facultative ;
- la distance est une estimation assumée, utilisée pour les totaux quotidiens et hebdomadaires.

Pour une séance de vélo, au moins une distance ou une durée globale est requise. Cette souplesse correspond aux sorties prescrites principalement en durée.

La forme cible peut être exprimée par une union discriminée `RunningWorkout | CyclingWorkout`, partageant les champs suivants :

```ts
type WorkoutCommon = Readonly<{
  id: string;
  scheduledOn: LocalDate;
  category:
    | "easy"
    | "recovery"
    | "long-run"
    | "tempo"
    | "intervals"
    | "race"
    | "other";
  title: string;
  isKeyWorkout: boolean;
  notes?: string;
  blocks: readonly WorkoutBlock[];
}>;
```

Une course est une séance de catégorie `race`, généralement importante, et non une entité séparée. Un jour sans séance dans un plan actif représente un jour de repos. Un footing simple possède un unique bloc `segment`, généré automatiquement par l'éditeur ou l'import afin de ne pas imposer une saisie redondante à l'utilisateur.

Le volume global d'une séance ne doit pas être recalculé depuis ses blocs. Par exemple, une séance de 16 km peut contenir des récupérations prescrites en durée et des éducatifs sans distance connue. Les blocs décrivent le déroulé ; le volume global fournit l'estimation utilisée par le calendrier.

### `WorkoutBlock`

L'union `segment | repeats` est conservée. Les deux variantes reçoivent un `label` facultatif pour nommer simplement un bloc tel que « Allure semi » ou « Bloc principal ».

Une récupération attachée à un bloc de répétitions devient un objet structuré :

```ts
type Recovery = Readonly<{
  target: Target;
  pace?: Pace;
  notes?: string;
}>;
```

Le bloc `repeats` conserve un nombre de répétitions, une cible d'effort en distance ou en durée, une allure facultative et une récupération facultative. La récupération intégrée ne s'applique qu'entre les répétitions. Une récupération autonome entre deux grands blocs reste un bloc `segment` de rôle `recovery`.

L'ordre des blocs dans le tableau constitue leur ordre d'exécution. Une position explicite sera utilisée dans la persistance et le fichier `.xlsx`, sans être dupliquée dans chaque objet métier imbriqué.

Les objectifs restent exacts en V1 : une séance possède une distance estimée unique et un bloc une distance ou une durée unique. Une prescription souple telle que `18–22 km`, une alternative ou une condition est représentée par une valeur choisie accompagnée de `notes`. Les plages d'allure restent structurées par leurs bornes rapide et lente.

### Format `.xlsx` de référence

Le classeur comporte exactement trois feuilles canoniques, non localisées afin de garantir un format stable : `Plan`, `Sessions` et `Blocks`. Il transporte les données métier du plan, mais jamais son état actif, ses identifiants internes de base de données ou des données réalisées.

#### Feuille `Plan`

Une seule ligne de données avec les colonnes obligatoires `name`, `starts_on` et `ends_on`, plus la colonne facultative `description`.

#### Feuille `Sessions`

Une ligne par séance avec les colonnes :

- `session_ref` : référence unique dans le classeur, utilisée par `Blocks` ;
- `date`, `sport`, `category`, `title` ;
- `distance_km`, `duration_min` ;
- `is_key` ;
- `notes`.

`distance_km` est obligatoire pour la course. Pour le vélo, `distance_km` ou `duration_min` doit être renseigné. `session_ref` sert uniquement aux relations dans le fichier ; l'import génère de nouveaux identifiants internes.

#### Feuille `Blocks`

Une ligne par bloc avec les colonnes :

- `session_ref` et `position` ;
- `kind`, `role` et `label` ;
- `repeat_count` ;
- `distance_km` ou `duration_min` pour la cible du segment ou de l'effort ;
- `pace_fast` et `pace_slow` ;
- `recovery_distance_km` ou `recovery_duration_min` ;
- `recovery_pace_fast`, `recovery_pace_slow` et `recovery_notes` ;
- `notes`.

Pour `kind = segment`, `repeat_count` et les champs de récupération restent vides. Pour `kind = repeats`, `repeat_count` est obligatoire et `role` reste vide. Une seule cible parmi distance et durée peut être renseignée pour un effort ou une récupération.

Le classeur utilise des unités lisibles : kilomètres, minutes et allures au format `mm:ss/km`. La couche d'import convertit ces valeurs vers les unités canoniques du domaine : mètres, secondes et secondes par kilomètre. L'export effectue la conversion inverse.

L'import valide entièrement le classeur et affiche un aperçu avant toute écriture. Sa confirmation crée le plan et toutes ses séances et blocs de manière atomique. Un export réimporté produit toujours un nouveau plan inactif avec de nouveaux identifiants internes.

### Données différées après la V1

Le modèle V1 ne contient pas encore :

- activité réalisée ou statut de réalisation ;
- identifiant Strava ou données cardiaques ;
- RPE et sensations post-séance ;
- association prévu/réalisé ;
- moteur de phases ou de génération automatique de plans ;
- historique complet des modifications.

## Frontend et serveur

- Utiliser les Server Components par défaut lorsque cela simplifie le rendu.
- Ajouter un Client Component uniquement lorsqu'une interaction ou une API navigateur l'exige.
- Utiliser des Server Actions pour les formulaires et commandes applicatives ordinaires de la V1.
- Réserver les Route Handlers aux échanges binaires d'import et d'export `.xlsx`.
- Garder les brouillons de formulaire dans un état client local ; ne pas ajouter de store global.
- Ne jamais importer le client PostgreSQL ou une dépendance XLSX dans un composant client.
- Toute future opération Strava nécessitant un secret devra être exécutée côté serveur.

## Persistance

La V0 utilise des données locales ou mockées versionnées dans le dépôt.

La V1 utilise Neon PostgreSQL via Vercel comme source de vérité synchronisée. Drizzle fournit le schéma TypeScript, les requêtes et les migrations SQL versionnées. Le modèle métier reste indépendant des tables et aucune abstraction générique de repository n'est introduite sans seconde implémentation réelle.

L'application demeure mono-utilisateur : Vercel Authentication protège tous les déploiements contenant des données réelles, sans table `users` ni colonne `owner_id`. Cette approche doit être validée dans Safari iOS et dans la PWA installée avant l'enregistrement de données de production. Si l'expérience est insuffisante, le repli prévu est Supabase Auth avec un compte précréé et les inscriptions désactivées ; ce changement devra intervenir avant les premières données réelles.

La sélection du plan actif est stockée dans une ligne applicative unique contenant une référence nullable, plutôt que dans un booléen dupliqué sur chaque plan. Chaque plan et cet état applicatif possèdent une révision entière. Une mutation ne réussit que si la révision lue par le formulaire est encore courante, ce qui empêche un appareil d'écraser silencieusement une modification plus récente réalisée sur l'autre.

La production et les Preview utilisent des bases ou branches PostgreSQL séparées. Les migrations sont exécutées explicitement et ne sont jamais lancées au démarrage des fonctions Vercel. Les sauvegardes combinent la restauration native du fournisseur, un `pg_dump` avant toute migration destructive, des dumps périodiques conservés hors fournisseur et un exercice documenté de restauration.

L'import et l'export utilisent un modèle `.xlsx`. Un import crée toujours un nouveau plan avec de nouveaux identifiants internes ; il ne fusionne pas les données et ne met pas à jour un plan existant. Après l'import, les données enregistrées dans l'application constituent la source de vérité. Un plan modifié peut être exporté, édité dans un tableur puis réimporté comme un nouveau plan indépendant.

Le format ajoute une colonne obligatoire `format_version`, initialement égale à `1`, dans la feuille `Plan`. Il n'expose ni identifiant interne, ni état actif, ni métadonnée sensible. Les détails des tables, transactions, flux d'import/export, routes et erreurs sont définis dans `docs/V1_PLANS_DESIGN.md`.

## Déploiement Vercel

Le dépôt GitHub est connecté à Vercel avec `main` comme branche de production.

- **Production** : <https://training-dashboard-snowy.vercel.app/> est l'URL stable destinée à l'installation sur l'iPhone.
- **Preview** : les autres branches et les pull requests servent à tester les changements avant leur fusion.
- Aucun workflow GitHub Actions, fichier `vercel.json`, secret ou variable d'environnement n'est nécessaire pour la V0.
- Les mises à jour de `main` déclenchent un nouveau déploiement de production.

La production V0 reste publique tant qu'elle ne contient que des fixtures non sensibles en lecture seule. Avant tout déploiement V1 connecté à PostgreSQL ou toute donnée réelle, Vercel Authentication doit protéger la production et son fonctionnement doit être vérifié depuis la PWA iPhone.

Les Preview utilisent également la protection Vercel et une base ou branche PostgreSQL distincte de la production. Aucun secret d'écriture de production ne leur est transmis.

## PWA et responsive

Le thème fixe « Bleu nuit & champagne » utilise des variables CSS communes : fond `#0D1420`, surfaces bleutées, texte clair `#E9EDF2`, accents champagne `#D6B778` et sauge `#91B5A0`. Le manifeste et les métadonnées navigateur suivent ce thème sombre. Le sélecteur de thème est différé.

- Concevoir d'abord pour un écran d'iPhone.
- Définir des zones tactiles confortables et une hiérarchie visuelle claire.
- Gérer les safe areas iOS lorsque nécessaire.
- Fournir un manifeste et les métadonnées d'installation.
- Vérifier que l'application reste utilisable sur ordinateur.

Le fonctionnement hors connexion est exclu de la V0. Aucun service worker n'est enregistré. Le manifeste et les icônes PNG (192, 512, maskable et Apple 180 px) permettent l'ajout à l'écran d'accueil, validé sur iPhone réel via HTTPS.

## Intégration Strava future

L'intégration appartient à la V2, après la gestion des plans prévue en V1. Elle devra respecter les règles suivantes :

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

Le shell partagé, les pages et les détails utilisent des Server Components. La navigation principale utilise `usePathname` après retrait du préfixe de locale ; le sélecteur utilise `router.replace` pour préserver chemin, paramètres et ancre. Les liens et leurs chemins secondaires proviennent de `navigation-items.ts` ; la correspondance respecte les frontières de segments pour ne pas activer Plan sur `/planning`.

Un seul menu change de disposition via CSS : barre fixe en bas sous 1000 px, barre latérale sticky à partir de 1000 px. Le contenu réserve 104 px plus la safe area basse sur mobile. Les styles du shell et des placeholders sont des CSS Modules ; les styles du dashboard et les variables du thème restent communs. Les icônes sont des SVG locaux décoratifs, accompagnés de libellés visibles. Aucun téléchargement de police, bibliothèque UI ou état global n'est nécessaire.

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
| 2026-10-01 | Introduire un shell partagé et quatre sections explicites avec navigation basse sur mobile et latérale sur ordinateur | Validée |
| 2026-10-01 | Conserver des routes explicites et des placeholders sans créer prématurément les modules métier correspondants | Validée |
| 2026-10-02 | Utiliser `main` comme production Vercel stable et réserver les déploiements Preview aux branches et pull requests | Validée |
| 2026-10-02 | Laisser la production V0 publique tant qu'elle ne contient que des fixtures non sensibles en lecture seule | Validée, à réévaluer avant les données réelles |
| 2026-10-02 | Localiser les routes avec les préfixes `/fr` et `/en`, mémoriser le choix par cookie et conserver le français par défaut | Implémentée et déployée |
| 2026-10-02 | Utiliser des dictionnaires TypeScript côté serveur sans dépendance d'internationalisation en V0 | Implémentée et déployée |
| 2026-10-02 | Lire la locale avec `next/root-params` et traduire uniquement les textes éditoriaux des fixtures connues | Implémentée et déployée |
| 2026-10-02 | Insérer une V1 dédiée à la gestion des plans avant l'intégration Strava, désormais prévue en V2 | Validée |
| 2026-10-02 | Synchroniser les plans via une persistance serveur privée entre ordinateur et iPhone, sans objectif multi-utilisateur | Validée, solution technique à choisir |
| 2026-10-02 | Utiliser `.xlsx` pour l'import et l'export ; chaque import crée un nouveau plan sans fusion ni mise à jour | Validée |
| 2026-10-03 | Faire de `TrainingPlan` la source de vérité et dériver les semaines et leurs totaux depuis les séances datées | Validée |
| 2026-10-03 | Exiger une distance globale estimée pour chaque séance de course et séparer les totaux course et vélo | Validée |
| 2026-10-03 | Ajouter la catégorie `race`, conserver les blocs `segment` / `repeats` et structurer la récupération des répétitions | Validée |
| 2026-10-03 | Séparer l'activation choisie du statut temporel calculé et ne stocker ni brouillon ni archive dans le premier périmètre | Validée |
| 2026-10-03 | Structurer le modèle `.xlsx` en trois feuilles canoniques `Plan`, `Sessions` et `Blocks` | Validée |
| 2026-10-03 | Utiliser Neon PostgreSQL via Vercel et Drizzle avec des migrations SQL versionnées pour la persistance V1 | Validée |
| 2026-10-03 | Protéger tous les déploiements contenant des données réelles avec Vercel Authentication, sous réserve d'une validation PWA iOS ; conserver Supabase Auth comme repli | Validée |
| 2026-10-03 | Utiliser des formulaires par entité avec brouillon local et enregistrement explicite, sans autosave ni brouillon persistant | Validée |
| 2026-10-03 | Créer un plan à partir d'un nom et d'une période, puis le laisser inactif jusqu'à une activation explicite | Validée |
| 2026-10-03 | Protéger les mutations par une révision optimiste afin d'empêcher les écrasements silencieux entre appareils | Validée |
| 2026-10-03 | Versionner le format `.xlsx` sans y exposer les identifiants internes ni l'état actif | Validée |
| 2026-10-03 | Combiner restauration native PostgreSQL, dumps hors fournisseur et exercice de restauration | Validée |
| 2026-10-03 | Borner le nom normalisé à 120 points de code Unicode et conserver les volumes inconnus des fixtures V0 hors des plans V1 validés | Implémentée au lot 2 |

