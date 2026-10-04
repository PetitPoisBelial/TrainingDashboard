# Lot 3 — Recette Vercel Authentication / Safari / PWA

## État

**Lot 3 validé par l'utilisateur le 4 octobre 2026.** L'utilisateur confirme
l'activation de la protection, la connexion dans Safari et la PWA sur iPhone,
la persistance après fermeture complète/réouverture et le blocage en navigation
privée sur la Preview. Le chat a vérifié une redirection HTTP anonyme 302 vers
vercel.com. Vercel Authentication reste retenue ; aucun besoin de repli n'est
observé. Le 4 octobre 2026, l'utilisateur accepte explicitement de suivre les
cas de session et autres observations non réalisés au fil de l'eau, sans bloquer
la clôture du lot 3. Les cases non cochées ci-dessous restent des observations
à effectuer ; elles ne sont pas présentées comme des tests réussis.
Preview testée : https://training-dashboard-qdkwymvmd-petitpoisbelial.vercel.app/fr.
Lors de cette recette du lot 3, les pages affichaient les fixtures V0 ; sa branche
n'ajoutait aucune lecture de données privées ni mutation depuis le navigateur.
Le lot 4 connecte maintenant les pages Plan à PostgreSQL ; le dashboard reste en V0.

## Ce que garantit la documentation actuelle

Au 3 octobre 2026, Vercel Authentication est disponible sur toutes les offres.
Depuis l'annonce récente, **All Deployments** peut également protéger la production
sans l'ancien supplément. **Standard Protection** couvre les Preview et les URL
de déploiement de production, mais laisse le domaine de production public :
choisir **All Deployments** pour cette application privée.

Vercel redirige vers sa connexion, puis définit un cookie si le compte a accès.
Ce cookie est propre à une URL, même lorsque plusieurs URL pointent vers le même
déploiement. Les membres autorisés, accès accordés et mécanismes de bypass doivent
être contrôlés. Hobby limite notamment l'accès externe à un utilisateur par compte.

Les documents consultés ne garantissent ni une durée universelle d'expiration ni
le partage de la session Safari/PWA iOS. La connexion Safari est le comportement
attendu du parcours web ; le lancement standalone, les redirections et la persistance
dans la PWA sont des hypothèses à vérifier sur appareil réel.

Sources : [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication),
[niveaux de protection](https://vercel.com/docs/deployment-protection),
[annonce production sur toutes les offres](https://vercel.com/changelog/protect-production-deployments-for-free-on-every-plan).

## Actions à réaliser dans Vercel — utilisateur

1. Ouvrir le projet Training Dashboard → Security / Deployment Protection
   (l'intitulé peut varier dans la console), activer **Vercel Authentication**,
   choisir **All Deployments**, enregistrer. Vérifier l'offre et ne pas accepter
   un changement facturable sans décision explicite.
2. Vérifier les accès : conserver uniquement votre compte autorisé pour cet usage
   personnel. Examiner les liens partageables, exceptions et bypass automatisés.
   Ne pas utiliser un lien de bypass pour la recette de blocage.
3. Vérifier séparément le domaine stable de production, les URL générées et la
   future Preview. La production V0 deviendra elle aussi protégée : c'est un réglage
   externe, pas une authentification simulée dans l'application.
4. Pousser vous-même la branche locale et attendre le déploiement Preview :

```sh
git push -u origin codex/v1-plans-private-persistence
```

5. Retenir une URL Preview précise pour toute la recette. Une URL différente
   implique une session différente. Cette Preview peut rester sans variables DB ;
   elle affiche les fixtures non sensibles et permet de tester la protection.

## Recette iPhone — utilisateur

Noter modèle, version iOS, date, URL utilisée et résultat de chaque étape, sans
cookie, jeton ou identifiant sensible dans le compte rendu.

- [ ] Depuis une session sans autorisation (navigation privée ou autre appareil),
      ouvrir Preview et domaine production : aucune page applicative ne doit
      apparaître avant autorisation. Tester aussi `/fr/plan` et un détail direct.
- [ ] Dans Safari normal, ouvrir la Preview ; suivre la connexion Vercel avec le
      compte autorisé. Vérifier le retour sur l'URL demandée, sans boucle.
- [ ] Parcourir `/fr`, `/en`, Plan, un détail et un lien direct ; vérifier que les
      changements de langue ne déclenchent pas une connexion répétée.
- [ ] Fermer Safari puis rouvrir la même URL ; noter si la session est conservée.
- [ ] Depuis Safari authentifié, ajouter **cette Preview** à l'écran d'accueil.
      Utiliser une installation distincte de la PWA V0 pour garder son contexte.
- [ ] Ouvrir l'icône. Si une connexion indépendante est demandée, l'effectuer et
      noter où elle s'ouvre (standalone/Safari), comment on revient à la PWA et si
      le retour aboutit correctement. Ne pas supposer le transfert du cookie Safari.
- [ ] Fermer complètement la PWA, la rouvrir, puis recommencer après verrouillage
      de l'iPhone et le lendemain. Noter la fréquence réelle de reconnexion.
- [ ] Vérifier FR/EN, liens directs, retour de séance et lancement depuis l'icône.
- [ ] Vérifier la durée du cookie de protection dans un navigateur autorisé sans
      copier sa valeur. Si une expiration est indiquée, refaire un lancement après
      cette échéance ; sinon conserver le cas « expiration naturelle en attente ».
- [ ] Tester la déconnexion Vercel puis le rechargement dans Safari et la PWA.
      Noter si un cookie de déploiement existant reste actif ; la déconnexion du
      compte Vercel et l'invalidation du cookie de protection ne sont pas présumées
      équivalentes. Effacer ensuite les données du site et tester la reconnexion.
      Cet effacement teste la perte de session, pas une expiration naturelle.
- [ ] Depuis un compte Vercel sans accès au projet, confirmer le blocage/refus ou
      la demande d'accès sans contenu applicatif. Ne pas approuver cette demande.
- [ ] Après cette recette Preview, répéter lancement, fermeture/réouverture et
      refus anonyme sur le domaine stable de production utilisé pour la PWA finale.

## Résultats à compléter après observation

| Point | Résultat |
| --- | --- |
| Offre et protection All Deployments | Activation confirmée par l'utilisateur ; offre non relevée |
| Preview protégée ; URL/date | URL ci-dessus, 3 octobre 2026 ; accès anonyme redirigé HTTP 302 vers vercel.com |
| Domaine production protégé | Demande de connexion Vercel confirmée par l'utilisateur le 4 octobre 2026 |
| Safari connexion et retour | Réussite confirmée par l'utilisateur sur iPhone |
| PWA connexion et retour | Réussite confirmée par l'utilisateur sur iPhone |
| Persistance après fermeture et lendemain | Fermeture complète/réouverture validée ; Preview toujours connectée le lendemain selon l'utilisateur (4 octobre 2026) |
| Expiration naturelle / perte de session / reconnexion | Connexion sur production confirmée ; expiration naturelle et reconnexion après perte de session non observées |
| Déconnexion et comportement des cookies existants | En attente |
| Compte non autorisé et session anonyme bloqués | Navigation privée bloquée confirmée ; compte distinct sans accès en attente |
| Décision Vercel Authentication / repli | Vercel Authentication conservée ; lot 3 validé le 4 octobre 2026 avec observations complémentaires différées par l'utilisateur |

Le 4 octobre 2026, l'utilisateur confirme avoir vérifié les valeurs distinctes des
connexions par environnement. La fenêtre Neon History window est de 6 heures,
maximum disponible sur son offre (nom de l'offre non communiqué). Aucun changement
d'offre n'est demandé. Les autres cas non observés seront suivis au fil de l'eau,
selon la décision explicite de l'utilisateur du 4 octobre 2026.

Rapporter ici uniquement les observations. Si la PWA boucle, perd la session
de façon inacceptable ou ne revient pas après connexion, traiter ce problème
comme un bug d'accès et documenter le résultat. Tout changement vers le repli
Supabase Auth exige une décision utilisateur distincte ; il ne rouvre pas
automatiquement le lot 3. L'accès privé et la séparation des environnements ont
été confirmés par l'utilisateur ; le lot 3 est clôturé avec le report explicite
des observations restantes. Toute régression d'accès devra être examinée avant
de poursuivre l'utilisation de données privées.
