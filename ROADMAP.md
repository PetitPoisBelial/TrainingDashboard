# Roadmap

## Règles de pilotage

- Terminer une version utilisable avant d'élargir son périmètre.
- Prioriser la valeur quotidienne sur le nombre de fonctionnalités.
- Documenter les décisions structurantes dans `ARCHITECTURE.md`.
- Ne pas anticiper la V1 au prix de la simplicité de la V0.

## V0 — Dashboard local

**Statut : clôturée.** La recette finale des liens, de la navigation clavier et des safe areas a été confirmée par l'utilisateur. L'état actif du menu, le déploiement, l'installation PWA et le choix de langue étaient déjà validés.

### Objectif

Obtenir une PWA mobile-first utilisable sur iPhone pour consulter la semaine et les séances prévues à partir de données locales.

### Cadrage

- [x] Définir les critères d'acceptation de la V0.
- [x] Valider le modèle de `TrainingWeek`, `Workout` et `WorkoutBlock`.
- [x] Définir les premières données d'exemple réalistes.
- [x] Définir la navigation et les écrans essentiels.

### Socle technique

- [x] Initialiser Next.js avec TypeScript.
- [x] Configurer le lint et les scripts de vérification.
- [x] Mettre en place les styles globaux et les conventions UI.
- [x] Appliquer le thème sombre bleu nuit et champagne, avec repères sauge (29 septembre 2026).
- [x] Configurer le manifeste PWA, les icônes et les métadonnées.

### Produit

- [x] Afficher la semaine actuelle.
- [x] Afficher le kilométrage prévu et sa répartition.
- [x] Afficher les séances prévues par jour.
- [x] Mettre en évidence la séance du jour et la prochaine séance importante.
- [x] Créer l'écran de détail d'une séance structurée.
- [x] Assurer une expérience confortable sur iPhone.
- [x] Assurer un rendu cohérent sur ordinateur.

### Navigation multi-page

- [x] Concevoir le shell partagé, les sections principales et le comportement responsive du menu.
- [x] Implémenter une configuration de navigation unique et typée.
- [x] Ajouter la barre de navigation basse sur mobile et sa variante latérale sur ordinateur.
- [x] Ajouter les placeholders explicites Plan, Activités et Analyses.
- [x] Vérifier l'état actif, les liens directs, la navigation clavier et les safe areas iOS.

### Internationalisation français / anglais

- [x] Concevoir le routage localisé, les dictionnaires typés et la persistance du choix.
- [x] Déplacer les routes applicatives sous `app/[locale]/`.
- [x] Ajouter les dictionnaires français et anglais sans dépendance externe.
- [x] Ajouter le sélecteur `FR | EN` et mémoriser la préférence dans un cookie.
- [x] Traduire l'interface, les métadonnées et les contenus de démonstration.
- [x] Vérifier les redirections des anciennes URL, la préférence et les ressources PWA en local.
- [x] Vérifier le lancement PWA avec la langue mémorisée sur iPhone réel.
- [x] Tester les deux langues, le formatage régional et la parité des dictionnaires.

### Validation

- [x] Vérifier le typage, le lint et le build de production.
- [x] Tester les principaux formats de séance avec des données réalistes.
- [x] Vérifier l'installation et l'affichage PWA sur iPhone.
- [x] Déployer la V0 sur Vercel.
- [x] Mettre à jour la documentation du dépôt.

### Hors périmètre

- OAuth et API Strava ;
- base de données serveur ;
- authentification utilisateur ;
- matching automatique prévu/réalisé ;
- analytics avancés ;
- synchronisation Garmin.

## V1 — Gestion des plans

**Statut : lot 2 fusionné dans main ; lot 3 en cours, fondation locale implémentée, validations PostgreSQL et externes en attente.** Les décisions détaillées figurent dans `docs/V1_PLANS_DESIGN.md`. Chaque lot d'implémentation doit rester utilisable et vérifiable après sa fusion.

### Objectif

Permettre d'importer, consulter, activer et faire évoluer plusieurs plans d'entraînement. Un seul plan peut être actif à la fois et devient la source du dashboard et des autres pages concernées. Les données et modifications réalisées dans l'application sont synchronisées entre ordinateur et iPhone.

### Cadrage

- [x] Retenir un fichier `.xlsx` comme format d'import et d'export de la V1.
- [x] Décider qu'un import crée toujours un nouveau plan et ne met jamais à jour un plan existant.
- [x] Exiger une persistance serveur privée et synchronisée entre ordinateur et iPhone, sans objectif multi-utilisateur.
- [x] Définir les trois feuilles, les champs obligatoires et les règles métier principales du modèle `.xlsx`.
- [x] Choisir Neon PostgreSQL via Vercel, Drizzle et des migrations SQL versionnées.
- [x] Choisir Vercel Authentication pour tous les déploiements contenant des données réelles, avec Supabase Auth comme repli si la PWA iOS ne fournit pas une expérience acceptable.
- [x] Définir une stratégie de sauvegarde combinant restauration native, dumps hors fournisseur et exercice de restauration.
- [x] Définir le modèle métier minimal d'un plan, de ses séances et de ses blocs, avec des semaines dérivées.
- [x] Séparer le statut temporel calculé (`planned`, `in-progress`, `finished`) de l'état d'activation choisi par l'utilisateur.
- [x] Retenir des formulaires par entité avec enregistrement explicite et une révision optimiste contre les écrasements entre appareils.
- [x] Définir les critères d'acceptation de la V1.

### Découpage en lots et pull requests

Les lots sont ordonnés. Chaque PR dépend uniquement des lots précédents déjà fusionnés et ne doit pas exiger plusieurs fonctionnalités inachevées en parallèle.

1. [x] **Architecture documentaire** — enregistrer les décisions, critères d'acceptation, flux, routes, schéma logique, risques et ordre des lots.
2. [x] **Domaine et validation** — finaliser `TrainingPlan`, étendre les types Training, ajouter les invariants, projections, erreurs typées et tests purs, sans interface ni persistance.
3. [ ] **Accès privé et persistance** — valider Vercel Authentication dans Safari et la PWA iOS, créer la base de développement, le schéma, les migrations, les transactions, les révisions, la séparation Preview/production et le premier runbook de sauvegarde.
4. [ ] **Lecture verticale des plans** — persister des données de développement puis livrer la liste, l'état vide, le détail, les semaines, les chargements, les erreurs et les 404.
5. [ ] **Création minimale** — créer un plan inactif à partir d'un nom, d'une période et d'une description facultative.
6. [ ] **Activation et dashboard** — gérer l'unique plan actif, confirmer son remplacement et alimenter le dashboard avec une projection `TrainingWeek`.
7. [ ] **Import `.xlsx`** — fournir un modèle, analyser côté serveur, afficher erreurs et aperçu, détecter les ressemblances puis créer atomiquement un plan inactif.
8. [ ] **Export et réimportation** — exporter le format versionné, vérifier sa lisibilité et couvrir le round-trip vers une copie indépendante.
9. [ ] **Édition des informations générales** — modifier nom, période et description avec validation des séances existantes et détection de conflit.
10. [ ] **Gestion des séances** — ajouter, modifier, déplacer et supprimer une séance, puis recalculer les projections.
11. [ ] **Édition des blocs** — modifier les blocs `segment` et `repeats`, leur ordre et leur récupération structurée dans la transaction de la séance.
12. [ ] **Suppression et recette finale** — supprimer un plan actif ou inactif, renforcer les erreurs et conflits, tester une restauration, effectuer la recette bilingue sur iPhone et produire le build final.

Le lot 3 inclut la sauvegarde minimale avant toute donnée personnelle. Le lot 12 vérifie que cette sauvegarde est réellement restaurable ; il ne crée pas la stratégie après coup.

État du lot 3 au 3 octobre 2026 :

- Implémenté : dépendances Drizzle/pg, client serveur paresseux, quatre tables,
  première migration SQL, mappings validés, lectures cohérentes, écritures atomiques
  et révisions conditionnelles ; aucune nouvelle interface et aucune page connectée.
- Vérifié localement : 39 tests unitaires réussis, TypeScript, lint, build de
  production et contrôle des métadonnées Drizzle réussis.
- Préparé : tests PostgreSQL réels séparés, runbook des environnements et sauvegardes,
  checklist Vercel Authentication / Safari / PWA.
- En attente : PostgreSQL local dédié, migration sur base vide, transactions et
  concurrence exécutées réellement ; commande d'intégration refusée avant connexion
  car la variable dédiée n'est pas configurée.
- En attente utilisateur : création Neon, secrets limités par environnement,
  autorisation de migration distante, séparation effective des trois bases/branches,
  activation Vercel, Preview, recette iPhone et décision finale d'accès privé.
- Aucun dump ou exercice de restauration réalisé ; outils PostgreSQL absents.
  Aucun push, PR ou fusion par ce chat. Le lot 3 reste décoché.

### Création dans l'application

- [ ] Afficher un formulaire mobile-first demandant un nom, une date de début, une date de fin et une description facultative.
- [ ] Créer le plan vide et inactif dans une transaction.
- [ ] Afficher les erreurs de forme et les erreurs métier en français et en anglais.
- [ ] Rediriger vers le détail du plan créé sans activer automatiquement celui-ci.
- [ ] Différer la duplication d'un plan tant qu'un besoin concret ne la justifie pas.

### Liste et consultation

- [ ] Remplacer le placeholder Plan par une liste des plans enregistrés, qu'ils aient été créés ou importés.
- [ ] Afficher pour chaque plan son nom, ses dates, son statut temporel et son état actif ou inactif.
- [ ] Conserver les plans terminés dans la liste et permettre de les consulter.
- [ ] Ajouter une page de détail donnant accès aux semaines et aux séances d'un plan.
- [ ] Prévoir des états explicites lorsqu'aucun plan n'existe ou qu'aucun plan n'est actif.

### Import

- [ ] Fournir un fichier modèle `.xlsx` accompagné d'un exemple réaliste.
- [ ] Ajouter `format_version = 1` dans la feuille `Plan` sans exposer d'identifiant interne ni l'état actif.
- [ ] Permettre d'importer un plan depuis le fichier modèle `.xlsx`.
- [ ] Valider le fichier et présenter les erreurs de manière exploitable.
- [ ] Afficher un aperçu avant de confirmer la création du plan.
- [ ] Empêcher qu'un import invalide ou interrompu crée un plan partiel.
- [ ] Avertir en cas de ressemblance avec un plan existant, tout en permettant la création volontaire d'une copie.

### Export

- [ ] Exporter un plan, avec toutes ses modifications, vers le format `.xlsx` de l'application.
- [ ] Produire un fichier exporté lisible et modifiable dans un tableur courant.
- [ ] Permettre de réimporter un fichier exporté comme un nouveau plan indépendant.
- [ ] Générer de nouveaux identifiants internes lors de la réimportation afin de ne pas écraser le plan source.

### Activation et intégration

- [ ] Permettre d'activer un plan depuis la liste ou son détail.
- [ ] Demander confirmation avant de remplacer un plan déjà actif.
- [ ] Désactiver l'ancien plan et activer le nouveau comme une seule opération cohérente.
- [ ] Alimenter le dashboard et les pages concernées à partir du plan actif.
- [ ] Indiquer clairement le plan actif et gérer le cas où aucun plan n'est actif.

### Édition et suppression

- [ ] Modifier le nom, les dates et les informations générales d'un plan.
- [ ] Ajouter, modifier, déplacer ou supprimer une séance et ses blocs structurés.
- [ ] Mettre à jour les jours, les volumes prévus et les totaux dérivés après une modification.
- [ ] Permettre la suppression d'un plan avec une confirmation explicite.
- [ ] Signaler clairement l'impact de la suppression du plan actif sur le dashboard.

### Validation

- [ ] Vérifier qu'un utilisateur non autorisé ne peut ni consulter, ni modifier, ni importer, ni exporter les plans.
- [ ] Vérifier l'authentification, l'expiration de session et la reconnexion dans Safari iOS et dans la PWA installée avant toute donnée réelle.
- [ ] Vérifier les transitions de statut aux dates de début et de fin.
- [ ] Vérifier que plusieurs plans peuvent coexister mais qu'un seul est actif.
- [ ] Distinguer aucun plan actif, date hors période, semaine de repos et semaine contenant des séances.
- [ ] Vérifier la persistance après fermeture et réouverture de la PWA.
- [ ] Vérifier que les modifications réalisées sur ordinateur sont retrouvées sur iPhone, et inversement.
- [ ] Vérifier qu'une modification fondée sur une ancienne révision est refusée sans écraser la version plus récente.
- [ ] Vérifier qu'un plan peut être créé depuis l'application puis enrichi avec des séances et des blocs.
- [ ] Vérifier qu'un import invalide, interrompu ou non confirmé ne crée aucune donnée.
- [ ] Vérifier qu'un export réimporté crée une copie complète sans modifier le plan source.
- [ ] Vérifier que les semaines, statuts et totaux sont dérivés et immédiatement recalculés après une modification.
- [ ] Vérifier la parité des messages français et anglais, la navigation clavier, les retours d'erreur et les zones tactiles de 44 px.
- [ ] Tester l'import, l'édition, l'activation et la suppression sur iPhone.
- [ ] Vérifier que les Preview ne possèdent pas de secret d'écriture vers la base de production.
- [ ] Produire un dump hors fournisseur et réussir un exercice documenté de restauration.
- [ ] Vérifier le typage, le lint, les tests et le build de production.

### Hors périmètre initial

- génération automatique d'un plan ;
- collaboration et gestion multi-utilisateur ;
- historique complet de toutes les modifications ;
- fusion d'un fichier importé avec un plan existant ;
- association avec des activités Strava ;
- analyse avancée des performances.

## V2 — Strava

### Objectif

Importer les activités réalisées et enrichir le dashboard avec les premières données réelles.

- [ ] Définir la stratégie de persistance et de gestion des jetons.
- [ ] Implémenter OAuth Strava côté serveur.
- [ ] Récupérer et stocker les activités pertinentes.
- [ ] Convertir les données Strava vers le modèle interne.
- [ ] Afficher les kilomètres réalisés et les dernières activités.
- [ ] Ajouter des statistiques élémentaires.
- [ ] Gérer les erreurs, expirations de jetons et synchronisations partielles.

## V3 — Plan et réalisé

### Objectif

Comparer une séance prévue à l'activité réellement effectuée.

- [ ] Associer manuellement une activité à une séance.
- [ ] Afficher prévu et réalisé dans une vue commune.
- [ ] Représenter les répétitions et récupérations réalisées.
- [ ] Afficher allure, fréquence cardiaque, distance et durée.
- [ ] Ajouter un historique des séances.
- [ ] Étudier un matching semi-automatique, puis automatique.

## V4 — Analyse avancée

### Objectif

Faire émerger les tendances utiles sans transformer l'application en clone de Strava.

- [ ] Calculer les volumes sur 7 et 28 jours.
- [ ] Visualiser l'évolution hebdomadaire et mensuelle.
- [ ] Analyser régularité, dérive cardiaque et volume à haute intensité.
- [ ] Comparer des séances similaires dans le temps.
- [ ] Ajouter RPE, fatigue, sommeil, jambes et commentaires.
- [ ] Mettre en relation sensations, charge et performances.
- [ ] Intégrer progressivement le vélo aux analyses.
- [ ] Évaluer le suivi du matériel et des chaussures.

## Prochaine décision

La V0 est clôturée et le lot 2 est fusionné. Le jalon courant est la validation réelle du lot 3 : PostgreSQL dédié puis configuration Neon/Vercel et recette d'accès privé. Une Preview des fixtures peut servir au test d'authentification ; le premier déploiement connecté à PostgreSQL restera bloqué tant que Vercel Authentication n'aura pas été validée dans Safari iOS et dans la PWA installée. Le lot 4 ne commence pas avant cette clôture. Les pages Activités et Analyses restent des placeholders ; Strava demeure en V2.

Validation du lot 2 le 3 octobre 2026 : 32 tests purs réussis (16 nouveaux et 16 existants), vérification TypeScript, lint et build de production réussis. Le domaine couvre les identifiants opaques, les dates ISO valides, les invariants du plan et des séances, les changements de période, les statuts explicites, les semaines complètes ou partielles, les semaines de repos et les totaux séparés. Les fixtures et la source du dashboard V0 sont préservées ; seule la lecture de la récupération est adaptée à son objet structuré. Aucune dépendance, persistance, interface de gestion ou fonctionnalité des lots suivants n'est ajoutée.

Recette finale confirmée par l'utilisateur : liens, navigation clavier et safe areas vérifiés. Cette validation complète les contrôles techniques, de production et sur iPhone ci-dessous et clôture la V0.

Validation sur iPhone du 2 octobre 2026 : l'expérience générale, l'installation et l'affichage de la PWA ainsi que son lancement avec la langue mémorisée sont confirmés.

Validation locale de l'internationalisation du 2 octobre 2026 : lint, TypeScript, 16 tests et build réussis. Les 22 contrôles HTTP sur le build de production local couvrent les dix pages FR/EN, les anciennes URL avec préférence et paramètres, les erreurs 404, le manifeste et les icônes. Dans Chromium, la bascule conserve la séance, les paramètres et l'ancre ; le choix est réutilisé à l'ouverture de `/`, et précédent/suivant conservent un historique cohérent. Les textes et l'attribut `lang` des erreurs sont corrects dans le navigateur. Les boutons de langue mesurent 44 × 44 px ; dashboard et détail contrôlés à 320, 390 et 1280 px sans débordement horizontal. Le sélecteur latéral fonctionne au clavier. Ces contrôles ont depuis été complétés par la validation PWA sur iPhone réel décrite ci-dessus.

Validation de production du 2 octobre 2026 : <https://training-dashboard-snowy.vercel.app/> répond correctement en HTTPS. Accueil, Plan, Activités, Analyses et le détail d'une séance ont été parcourus sur le déploiement ; les titres, les états actifs du menu et le rattachement du détail à Plan sont corrects. Le manifeste, la couleur de thème et les liens vers les icônes PWA sont présents dans les métadonnées. L'ajout à l'écran d'accueil et l'affichage standalone ont ensuite été validés sur iPhone réel.

Validation du 1er octobre 2026 : lint, TypeScript, 10 tests (dont 3 sur la navigation) et build réussis. Les quatre sections et le détail répondent en HTTP 200 ; une séance inconnue répond en 404. À cette date, le contrôle interactif et visuel restait à faire : le navigateur intégré avait refusé les actions depuis sa page interne d'erreur de connexion. Ces points ont depuis été validés, y compris les safe areas lors de la recette finale.

Validation locale avant l'ajout de la navigation multi-page : lint, TypeScript, 7 tests métier et build réussis. Dashboard et détail contrôlés dans le navigateur à des largeurs de 320, 390 et 1280 px, sans débordement horizontal ; navigation et réponse 404 vérifiées. Ces contrôles Chromium ne remplacent pas un test sur iPhone réel.

