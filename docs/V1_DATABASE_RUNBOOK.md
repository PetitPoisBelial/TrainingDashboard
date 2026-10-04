# V1 — Base de données, environnements et sauvegardes

## État du lot 3

Lot validé par l'utilisateur le 4 octobre 2026. Vercel Authentication est retenue ;
les observations complémentaires de session sont reportées au fil de l'eau sur
sa décision explicite. Les migrations Preview/production restent à autoriser
séparément avant la première utilisation de ces bases.

Fondation implémentée : schéma Drizzle, migration SQL versionnée, client Node.js serveur,
mappings purs et primitives transactionnelles. Aucune page n'utilise PostgreSQL.
Les tests PostgreSQL ont été exécutés sur une base locale dédiée vide : 10 tests
réussis (9 sous-tests et leur suite parente), avec nettoyage des objets créés.
Migration, rollback, concurrence, contraintes et cascades sont vérifiés localement.
La migration initiale a ensuite été appliquée sur la connexion Neon development
configurée par l'utilisateur, après son autorisation explicite. Le contrôle en
lecture seule confirme les quatre tables, une migration enregistrée, une ligne
applicative (id 1, révision 1, plan actif nul) et aucun plan enregistré.
L'utilisateur indique avoir configuré les variables Vercel ; leur portée et
la séparation des connexions ont été confirmées par l'utilisateur le 4 octobre 2026.
La fenêtre History window relevée est de 6 heures, maximum de son offre actuelle.
Aucune ressource Neon/Vercel n'a été créée par ce chat. La recette d'accès iPhone est dans
`V1_PRIVATE_ACCESS_CHECKLIST.md`. Aucun plan personnel ne doit être enregistré avant sa validation.

## Pilote et contrat d'environnement

Runtime Node.js de Next.js 16.3 (par défaut), Drizzle ORM 0.45.3, Drizzle Kit
0.31.11, `pg` 8.23.1. `pg` accepte les transactions interactives et fonctionne
également avec PostgreSQL local. Le pool est paresseux, partagé entre rechargements
de développement, limité à quatre connexions et expire après cinq secondes
d'inactivité. `@vercel/functions` 3.9.10 attache le pool au cycle de suspension de
Fluid Compute. Vérifier que Fluid Compute est activé avant une utilisation Vercel.
`server-only` interdit l'import du client et des transactions dans le graphe client.
Le schéma ne contient aucun accès réseau ; les mappings importent seulement ses types.

| Variable | Usage | Où configurer |
| --- | --- | --- |
| `TRAINING_DATABASE_URL` | Connexion applicative poolée, TLS Neon | `.env.local` local ; secret Vercel limité à l'environnement concerné |
| `TRAINING_MIGRATION_DATABASE_URL` | Connexion directe non poolée, migration explicite | `.env.database.local` ignoré, sur le poste opérateur uniquement |
| `TRAINING_MIGRATION_ENV` | `development`, `preview` ou `production` | Poste opérateur |
| `TRAINING_CONFIRM_MIGRATION` | Valeur identique à l'environnement choisi | Poste opérateur, après contrôle de la cible |
| `TRAINING_TEST_DATABASE_URL` | Instance locale jetable, base `training_dashboard_test` | `.env.database.test.local` ignoré |

Ne préfixer aucune de ces variables par `NEXT_PUBLIC_`. Les scripts CLI lisent
uniquement le fichier dédié indiqué ci-dessus et l'environnement du processus ;
ils ne récupèrent pas implicitement les secrets applicatifs de `.env.local`.
Ne pas coller une URL dans le chat, l'historique du terminal ou un ticket.
La confirmation d'environnement est un garde-fou opérateur, pas une preuve que
l'URL désigne la bonne branche : vérifier cette association dans Neon avant l'exécution.
Les erreurs retournées par les transactions masquent les erreurs brutes du pilote.
Ne pas journaliser une requête avec ses paramètres ou un objet d'erreur PostgreSQL.

## Provisionnement — intervention utilisateur obligatoire

1. Dans Vercel Marketplace, sélectionner Neon. Examiner l'offre, la région et
   les coûts ; s'arrêter avant toute souscription non souhaitée. Désactiver toute
   intégration d'authentification Neon : le contrôle d'accès retenu reste Vercel.
2. Créer une base/branche vide de développement. Préparer une branche Preview
   distincte et une branche production distincte, également sans données réelles.
   Ne pas cloner ultérieurement des données personnelles vers les Preview.
3. Pour chaque environnement, utiliser la connexion de sa propre branche.
   Configurer `TRAINING_DATABASE_URL` dans Vercel avec une portée stricte :
   Production pour production, Preview pour Preview, Development pour développement.
   Si l'intégration ajoute des variables génériques, vérifier leurs portées et
   retirer tout secret de production de Preview. L'application ne lit que le nom
   explicite ci-dessus. Ne pas installer le secret de migration dans Vercel.
4. Dans Neon Connect, choisir une connexion poolée pour l'application, directe
   pour les migrations et les dumps. Conserver les paramètres TLS recommandés.
5. Configurer localement la connexion directe de développement dans le fichier
   ignoré `.env.database.local`. Demander/retenir l'autorisation explicite de
   migration distante avant d'exécuter `pnpm db:migrate`. Noter l'environnement,
   la date, la migration appliquée et son résultat, jamais la chaîne de connexion.
6. Confirmer la séparation des trois cibles et la durée réelle de restauration.
   La première Preview de recette peut utiliser exclusivement les fixtures V0,
   sans connexion à PostgreSQL, avant le jalon Safari/PWA.

La création d'une ressource, la configuration des secrets, une migration distante,
une Preview et l'activation de la protection nécessitent l'action de l'utilisateur.

## Migrations explicites

```sh
pnpm db:generate
pnpm db:check
pnpm db:migrate
```

Les deux premières commandes ne se connectent à aucune base. La dernière exige
les quatre variables opérateur pertinentes et refuse de fonctionner dans Vercel.
Lire le SQL généré avant application. Aucune migration ne s'exécute au build,
au démarrage, à l'import d'un module ou dans une fonction. Le journal Drizzle
est conservé dans le schéma `drizzle` de la base ; les métadonnées locales sont
versionnées dans `src/server/db/migrations/meta/`.
La commande initialise explicitement la ligne `application_state` si elle manque,
de manière idempotente. Une lecture ne crée jamais cette ligne.
Ne pas réécrire une migration déjà appliquée. Avant une future migration destructive,
faire le dump décrit ci-dessous et préparer la restauration sur une cible séparée.

## Schéma et garanties

Les identifiants métier sont `text`, opaques comme au lot 2, sans imposer UUID.
Les futurs générateurs peuvent employer des UUID. Seuls les blocs ont un UUID
technique, absent du domaine. Les dates PostgreSQL `date` restent des chaînes ISO ;
les timestamps techniques ont un fuseau. Les nombres réels utilisent `double precision`
pour conserver les valeurs décimales permises par le domaine, avec rejet de zéro,
négatifs, NaN et infinis. Aucun total ni statut temporel n'est persisté.

| Garantie | Domaine | PostgreSQL |
| --- | --- | --- |
| Période inclusive cohérente, volumes positifs, cibles exclusives, allures ordonnées, répétitions positives | Oui | Oui |
| Nom normalisé, longueur Unicode 120, identifiants sans espaces périphériques | Oui | Contrôle minimal de longueur/espaces ASCII ; normalisation Unicode au domaine |
| Séances dans la période du plan, normalisation du footing simple | Oui | Non : invariant transversal |
| Sports, catégories et rôles fermés | Types TypeScript ; adaptateur à la lecture | Enums |
| Séances sans ID dupliqué dans un plan | Oui | PK globale des séances |
| Ordre déterministe des séances et des blocs | Tableaux normalisés | Positions entières ≥ 0, uniques par plan/jour et par séance |
| Au plus un état actif | État séparé | PK avec `id = 1`, FK nullable |
| Révisions positives et mises à jour conditionnelles | Primitives serveur | CHECK et UPDATE conditionnel atomique |
| Absence d'écriture partielle | Validation avant écriture | Transaction complète |

Les index d'unicité couvrent les lectures par plan/date/position et par séance/position,
ainsi que les cascades ; aucun index redondant n'est ajouté.
La FK de l'état actif est `RESTRICT` : supprimer un plan actif exige de vider sa
référence et d'incrémenter la révision dans la même transaction (règle produit lot 12).
Les séances puis les blocs sont supprimés en cascade.
Les mappings reconstruisent et valident le domaine avant retour. Une lecture
complète utilise `REPEATABLE READ READ ONLY`, sans cache applicatif ajouté.
Les remplacements d'agrégat sont des mécanismes internes, sans route ou Server Action.
Le refus de révision est `RevisionConflictError`, code `revision.conflict`.

## Tests PostgreSQL réels

`pnpm test` n'importe aucun client et ne lit aucune URL ; il couvre les mappings
et les garde-fous, en plus des tests du lot 2. Les tests d'intégration sont séparés.

Sur une instance PostgreSQL locale (version compatible avec Neon), créer une base
**vide, jetable et exclusivement dédiée** nommée `training_dashboard_test`, avec
un rôle local disposant de CREATE dans cette base. Configurer son URL dans
`.env.database.test.local`, sans la partager. Puis lancer :

Avec les outils PostgreSQL installés et le serveur local démarré, un exemple de
création avec votre rôle administrateur local est (mot de passe saisi au prompt) :

```sh
createdb --host=127.0.0.1 --username=postgres --password training_dashboard_test
```

Remplacer `postgres` par votre rôle local si nécessaire. Ne pas réutiliser un rôle
de production. Le fichier ignoré contient uniquement `TRAINING_TEST_DATABASE_URL`
avec la connexion locale correspondante ; ne pas en afficher le contenu.

```sh
pnpm test:integration
```

Le garde-fou accepte seulement localhost/127.0.0.1/::1 et ce nom de base, sans
paramètre de requête. Il refuse Vercel, `NODE_ENV=production`, toute URL externe
et tout repli sur `TRAINING_DATABASE_URL`. Aucun tunnel vers une base distante
ne doit être installé sur le port local choisi. La suite exige une base vide,
applique le véritable SQL versionné puis nettoie uniquement les objets créés
par l'exécution. Ne pas lancer simultanément une autre application sur cette base.
Elle prouve création, chargement ordonné, rollback par collision d'enfant,
révisions concurrentes, état actif, contraintes et cascades. Elle ne prouve pas
la connectivité Neon ni la configuration Vercel.
Sans instance/configuration, la commande échoue explicitement ; elle ne déclare
aucun test réussi par un mock ou par un skip. Après un arrêt forcé, recréer
manuellement la base locale jetable avant de relancer.

## Sauvegarde minimale V1

Neon permet une restauration à un instant dans sa fenêtre d'historique. La fenêtre
disponible dépend de l'offre et de la configuration effective : relever dans
Neon Project Settings la fenêtre configurée, la borne réellement restaurable,
l'offre et les coûts éventuels. Ne pas supposer une durée universelle.
Pour récupérer, choisir une branche à l'instant souhaité, l'inspecter avec
Time Travel Assist lorsque disponible et vérifier les données avant toute bascule.
Ne pas réinitialiser la branche courante sans accord explicite. Cette protection
native complète les dumps, elle ne remplace pas une copie hors fournisseur.

Faire un dump **avant chaque migration destructive et au minimum chaque mois**.
Installer les outils PostgreSQL d'une version majeure au moins égale au serveur
source et compatible avec la cible de restauration. Utiliser une connexion Neon
directe, sans pooler. Configurer hors dépôt un service libpq dans
`%APPDATA%\postgresql\.pg_service.conf` et un fichier de mot de passe protégé
`%APPDATA%\postgresql\pgpass.conf` (ou `PGPASSFILE`). Le service de sauvegarde
contient hôte, port, base, utilisateur et TLS ; aucun mot de passe dans la commande.
Restreindre les permissions de ces fichiers au compte opérateur.

Exemples PowerShell, avec services et chemin factices à remplacer localement :

```powershell
pg_dump --version
pg_restore --version
pg_dump --dbname="service=training_backup_source" --format=custom --no-owner --no-acl --file="D:\PrivateBackups\training-YYYY-MM-DD.dump"
if ($LASTEXITCODE -ne 0) { throw 'Sauvegarde échouée' }
pg_restore --list "D:\PrivateBackups\training-YYYY-MM-DD.dump"
if ($LASTEXITCODE -ne 0) { throw 'Archive illisible' }
Get-FileHash -Algorithm SHA256 -LiteralPath 'D:\PrivateBackups\training-YYYY-MM-DD.dump'
```

Le dump complet inclut les tables, enums et le journal de migration Drizzle.
Il contient les données privées : le conserver chiffré hors du dépôt et hors Neon,
sur un support privé contrôlé par l'utilisateur. Vérifier existence, taille,
code de retour et lisibilité de l'archive ; inscrire date, environnement, version
PostgreSQL et empreinte dans un registre privé. Garder au moins les trois derniers
dumps mensuels et le dump précédant chaque migration destructive tant que sa
validation n'est pas terminée. Aucun transfert vers un stockage externe n'est automatisé.

## Restauration avec pg_restore — cible neuve

1. Obtenir l'accord de création de la cible ; vérifier sa version (même majeure
   ou plus récente), la disponibilité des extensions et son isolement.
2. Configurer un service `training_restore_target` dans le fichier libpq privé
   et ses credentials hors dépôt. Vérifier que ce service ne désigne jamais la source.
3. Sur la base **vide**, exécuter :

```powershell
pg_restore --dbname="service=training_restore_target" --no-owner --no-acl --single-transaction --exit-on-error "D:\PrivateBackups\training-YYYY-MM-DD.dump"
if ($LASTEXITCODE -ne 0) { throw 'Restauration échouée' }
```

4. Comparer les nombres de plans/séances/blocs avec le registre de sauvegarde ;
   vérifier les quatre tables, FK, enums, contraintes, ordre, unités, révisions,
   dates et journal Drizzle. Vérifier une seule ligne applicative et que sa
   référence active est valide ou nulle. Charger un agrégat via les mappings.
5. Faire une lecture depuis un environnement de validation protégé. Les tests
   d'intégration destructifs ne doivent pas viser cette copie privée.
6. Documenter le résultat ; obtenir un accord avant toute bascule de production.
   Ne pas relancer les anciennes migrations déjà consignées dans le dump.

Commandes vérifiées contre les documentations, mais outils PostgreSQL absents
sur le poste de ce chat : aucun dump ni exercice de restauration n'a été réalisé.
L'exercice complet reste au lot 12.

## Sources officielles consultées le 3 octobre 2026

- [Drizzle / Neon et node-postgres](https://orm.drizzle.team/docs/connect-neon)
- [Transactions node-postgres](https://node-postgres.com/features/transactions)
- [Pools dans les fonctions Vercel](https://vercel.com/kb/guide/connection-pooling-with-functions)
- [Neon : restauration de branche](https://neon.com/docs/introduction/branch-restore)
- [Neon : paramètres du projet](https://neon.com/docs/manage/projects)
- [Neon : export PostgreSQL compatible](https://neon.com/docs/guides/export-neon-postgres-compatible)
- [pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html), [pg_restore](https://www.postgresql.org/docs/current/app-pgrestore.html)
