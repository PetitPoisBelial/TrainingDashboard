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

- [ ] Définir les critères d'acceptation de la V0.
- [ ] Valider le modèle de `TrainingWeek`, `Workout` et `WorkoutBlock`.
- [ ] Définir les premières données d'exemple réalistes.
- [ ] Définir la navigation et les écrans essentiels.

### Socle technique

- [ ] Initialiser Next.js avec TypeScript.
- [ ] Configurer le lint et les scripts de vérification.
- [ ] Mettre en place les styles globaux et les conventions UI.
- [ ] Configurer le manifeste PWA, les icônes et les métadonnées.

### Produit

- [ ] Afficher la semaine actuelle.
- [ ] Afficher le kilométrage prévu et sa répartition.
- [ ] Afficher les séances prévues par jour.
- [ ] Mettre en évidence la séance du jour et la prochaine séance importante.
- [ ] Créer l'écran de détail d'une séance structurée.
- [ ] Assurer une expérience confortable sur iPhone.
- [ ] Assurer un rendu cohérent sur ordinateur.

### Validation

- [ ] Vérifier le typage, le lint et le build de production.
- [ ] Tester les principaux formats de séance avec des données réalistes.
- [ ] Vérifier l'installation et l'affichage PWA sur iPhone.
- [ ] Déployer la V0 sur Vercel.
- [ ] Mettre à jour la documentation du dépôt.

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

Définir le modèle métier minimal de la V0 et les critères précis permettant de considérer le dashboard local comme terminé.

