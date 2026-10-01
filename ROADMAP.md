# Roadmap

## Règles de pilotage

- Terminer une version utilisable avant d'élargir son périmètre.
- Prioriser la valeur quotidienne sur le nombre de fonctionnalités.
- Documenter les décisions structurantes dans `ARCHITECTURE.md`.
- Ne pas anticiper la V1 au prix de la simplicité de la V0.

## V0 — Dashboard local

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
- [ ] Assurer une expérience confortable sur iPhone.
- [x] Assurer un rendu cohérent sur ordinateur.

### Navigation multi-page

- [x] Concevoir le shell partagé, les sections principales et le comportement responsive du menu.
- [x] Implémenter une configuration de navigation unique et typée.
- [x] Ajouter la barre de navigation basse sur mobile et sa variante latérale sur ordinateur.
- [x] Ajouter les placeholders explicites Plan, Activités et Analyses.
- [ ] Vérifier l'état actif, les liens directs, la navigation clavier et les safe areas iOS.

### Validation

- [x] Vérifier le typage, le lint et le build de production.
- [x] Tester les principaux formats de séance avec des données réalistes.
- [ ] Vérifier l'installation et l'affichage PWA sur iPhone.
- [ ] Déployer la V0 sur Vercel.
- [x] Mettre à jour la documentation du dépôt.

### Hors périmètre

- OAuth et API Strava ;
- base de données serveur ;
- authentification utilisateur ;
- matching automatique prévu/réalisé ;
- analytics avancés ;
- synchronisation Garmin.

## V1 — Strava

### Objectif

Importer les activités réalisées et enrichir le dashboard avec les premières données réelles.

- [ ] Définir la stratégie de persistance et de gestion des jetons.
- [ ] Implémenter OAuth Strava côté serveur.
- [ ] Récupérer et stocker les activités pertinentes.
- [ ] Convertir les données Strava vers le modèle interne.
- [ ] Afficher les kilomètres réalisés et les dernières activités.
- [ ] Ajouter des statistiques élémentaires.
- [ ] Gérer les erreurs, expirations de jetons et synchronisations partielles.

## V2 — Plan et réalisé

### Objectif

Comparer une séance prévue à l'activité réellement effectuée.

- [ ] Associer manuellement une activité à une séance.
- [ ] Afficher prévu et réalisé dans une vue commune.
- [ ] Représenter les répétitions et récupérations réalisées.
- [ ] Afficher allure, fréquence cardiaque, distance et durée.
- [ ] Ajouter un historique des séances.
- [ ] Étudier un matching semi-automatique, puis automatique.

## V3 — Analyse avancée

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

Valider visuellement la navigation multi-page sur ordinateur et Safari iOS, y compris clavier, liens directs, précédent/suivant et safe areas. Reprendre ensuite l'installation sur l'écran d'accueil et le déploiement Vercel. Les pages Plan, Activités et Analyses restent des placeholders pendant la V0.

Validation du 1er octobre 2026 : lint, TypeScript, 10 tests (dont 3 sur la navigation) et build réussis. Les quatre sections et le détail répondent en HTTP 200 ; une séance inconnue répond en 404. Le contrôle interactif et visuel de cette nouvelle navigation reste à faire : le navigateur intégré a refusé les actions depuis sa page interne d'erreur de connexion. Les safe areas sont prises en compte dans le CSS, mais restent à vérifier sur appareil réel.

Validation locale avant l'ajout de la navigation multi-page : lint, TypeScript, 7 tests métier et build réussis. Dashboard et détail contrôlés dans le navigateur à des largeurs de 320, 390 et 1280 px, sans débordement horizontal ; navigation et réponse 404 vérifiées. Ces contrôles Chromium ne remplacent pas un test sur iPhone réel. Aucun projet Vercel n'est lié au dépôt et aucun outil Vercel connecté n'est disponible dans cette session.

