# Stratégie de Test, Recette & Analyse des 100 Vulnérabilités — LevelUp

> **Nom du Projet :** LevelUp ("The System")  
> **Version :** 1.0.0  
> **Principe Directeur :** *Zero Code Before Test Specification* (Spécification Pré-Code Intégrale).

---

## 1. Pyramide des Tests & Objectifs de Qualité

* **Tests Unitaires (70%) :** Moteur mathématique d'XP, calcul des rangs, parsing Markdown des wikilinks, validateurs Zod.
* **Tests d'Intégrité & API (20%) :** Routes REST, persistance BDD des stats, synchronisation Discord, gestionnaire de sessions.
* **Tests E2E & Résilience (10%) :** Parcours complet Réveil $\rightarrow$ Quête Discord $\rightarrow$ Enregistrement vocal $\rightarrow$ Time-blocking $\rightarrow$ Level Up.

---

## 2. Analyse Systématique des 100 Cas de Défaillances & Vulnérabilités

Avant la première ligne de code, 100 scénarios critiques d'échec ont été anticipés et indexés :

### Domaine A : Gestion du Joueur, Niveaux & Calcul d'XP (Cas 01 à 12)
* **TC-01 :** Injection d'un montant d'XP négatif $\rightarrow$ rejet strict par Zod avec HTTP 400.
* **TC-02 :** Double clic simultané sur "Valider Quête" (*Race Condition*) $\rightarrow$ verrouillage transactionnel, l'XP n'est attribuée qu'une seule fois.
* **TC-03 :** Passage de niveau simultané sur deux requêtes concurrentes $\rightarrow$ niveau calculé correctement sans saut ni perte de palier.
* **TC-04 :** Dépassement de la valeur maximale autorisée pour un entier standard $\rightarrow$ utilisation de `BigInt` pour le total d'XP sans overflow.
* **TC-05 :** Valeur HP/MP reçue supérieure au `max_hp`/`max_mp` $\rightarrow$ plafonnement automatique à la valeur maximale.
* **TC-06 :** Valeur HP/MP négative après une pénalité $\rightarrow$ plancher bloqué à zéro, interdiction des valeurs négatives.
* **TC-07 :** Tentative de modifier directement le champ `rank_code` via l'API client $\rightarrow$ rejet 403, le rang est un calcul serveur exclusif.
* **TC-08 :** Corruption du code de stat lors d'une mise à jour (ex: `UNKNOWN_STAT`) $\rightarrow$ contrainte CHECK en base rejette l'écriture.
* **TC-09 :** Récupération du profil alors que la base de données est vide $\rightarrow$ amorçage automatique du profil niveau 1 Rang F (*Auto-seed*).
* **TC-10 :** Décalage horaire lors du calcul de la réinitialisation de minuit $\rightarrow$ calcul systématique en UTC avec conversion locale pour l'affichage.
* **TC-11 :** Déconnexion intempestive en plein calcul d'attribution d'XP $\rightarrow$ transaction BDD atomique avec rollback propre.
* **TC-12 :** Tentative d'accès au profil sans cookie de session $\rightarrow$ redirection immédiate vers `/login` sans fuite de données.

### Domaine B : Quêtes, Preuves & Événements (Cas 13 à 28)
* **TC-13 :** Soumission d'une quête déjà expirée (post 23h59) $\rightarrow$ rejet HTTP 410 Gone, quête marquée `EXPIRED`.
* **TC-14 :** Validation d'une quête avec une URL de preuve GitHub inexistante (404) $\rightarrow$ statut `PENDING_REVIEW` sans attribution d'XP.
* **TC-15 :** Tentative d'injection de script HTML/JS dans le champ description de la quête $\rightarrow$ sanitisation stricte, zéro XSS.
* **TC-16 :** Quête d'urgence déclenchée alors que le joueur est en mode sommeil (`HP < 20`) $\rightarrow$ inhibition de l'alerte pour protéger le repos.
* **TC-17 :** Deux quêtes quotidiennes générées pour la même date $\rightarrow$ contrainte d'unicité sur `(player_id, date, quest_slug)` empêche le doublon.
* **TC-18 :** Quête de type Boss dont les sous-tâches dépassent les PV totaux du boss $\rightarrow$ PV arrêtés à zéro, déclenchement immédiat de la victoire.
* **TC-19 :** Déconnexion du bot Discord pendant l'acceptation d'une quête $\rightarrow$ persistance locale de l'état, synchronisation au reboot.
* **TC-20 :** Re-tentative de compléter une quête déjà au statut `COMPLETED` $\rightarrow$ réponse idempotente avec code HTTP 200 sans rajout d'XP.
* **TC-21 :** Suppression accidentelle d'une quête active en base $\rightarrow$ gestion gracieuse de l'erreur dans le HUD sans écran blanc.
* **TC-22 :** Payload de complétion sans le champ obligatoire `proof_type` $\rightarrow$ retour 422 avec détail précis du champ manquant.
* **TC-23 :** Soumission d'un fichier screenshot de plus de 20 Mo en preuve $\rightarrow$ rejet par le middleware avec message "Taille maximale : 5 Mo".
* **TC-24 :** Format d'image corrompu ou fichier texte renommé en `.png` $\rightarrow$ validation du Magic Byte côté serveur.
* **TC-25 :** Quête de changement de classe programmée sur un jour déjà complet $\rightarrow$ avertissement de conflit de créneaux.
* **TC-26 :** Timeout lors de l'appel à l'API de validation externe $\rightarrow$ bascule de la quête en `VERIFICATION_QUEUED`.
* **TC-27 :** Annulation d'une quête d'urgence en cours $\rightarrow$ calcul de l'absence de pénalité (car optionnelle).
* **TC-28 :** Soumission d'une quête avec un horodatage dans le futur $\rightarrow$ rejet pour incohérence temporelle.

### Domaine C : Planificateur, Time-Blocking & Alarmes (Cas 29 à 42)
* **TC-29 :** Chevauchement de deux blocs horaires (ex: 14h-16h et 15h-17h) $\rightarrow$ détection de collision et alerte dans l'interface.
* **TC-30 :** Bloc horaire dont l'heure de fin est antérieure à l'heure de début $\rightarrow$ rejet par validation de schéma.
* **TC-31 :** Fermeture du navigateur pendant un bloc actif $\rightarrow$ réouverture avec le chronomètre resynchronisé sur l'heure serveur.
* **TC-32 :** Bloc de 6 heures continues sans pause $\rightarrow$ suggestion automatique de l'Architecte d'insérer un bloc de récupération.
* **TC-33 :** Bloc complété mais alarme sonore bloquée par les politiques autoplay du navigateur $\rightarrow$ fallback visuel clignotant immédiat.
* **TC-34 :** Changement de fuseau horaire du joueur en déplacement $\rightarrow$ calcul basé sur l'heure système client avec trace UTC en base.
* **TC-35 :** Suppression d'un bloc horaire en cours d'exécution $\rightarrow$ confirmation explicite requise.
* **TC-36 :** Bloc de révision d'examen sans matière associée $\rightarrow$ avertissement exigeant de rattacher le bloc à la base `ACAD`.
* **TC-37 :** Afflux de 50 alarmes créées en rafale $\rightarrow$ rate limiting du planificateur.
* **TC-38 :** Perte de connexion WebSocket du timer temps réel $\rightarrow$ reconnexion automatique avec backoff exponentiel.
* **TC-39 :** Mise en veille du PC pendant un bloc de 2h $\rightarrow$ reprise correcte avec indication du temps réel écoulé.
* **TC-40 :** Création d'un bloc sur une date passée $\rightarrow$ statut `RETROACTIVE` marqué explicitement.
* **TC-41 :** Alarme Discord déclenchée alors que le bot n'a pas la permission d'écrire dans le salon $\rightarrow$ log d'erreur clair et notification locale.
* **TC-42 :** Bloc programmé pendant les heures de sommeil définies $\rightarrow$ avertissement de sécurité sur la jauge HP.

### Domaine D : Cerveau Numérique & Transcription Vocale (Cas 43 à 58)
* **TC-43 :** Fichier audio uploadé sans voix (silence complet) $\rightarrow$ détection de flux vide, message "Aucune parole détectée".
* **TC-44 :** Enregistrement audio au format non supporté (ex: `.aac` exotique) $\rightarrow$ transcodage FFmpeg automatique ou rejet propre.
* **TC-45 :** Timeout de l'API de transcription (Whisper/Gemini) $\rightarrow$ enregistrement du fichier audio brut et reprise asynchrone.
* **TC-46 :** Note Markdown contenant un lien brisé `[[Note-Inexistante]]` $\rightarrow$ affichage du lien en rouge sans crash de l'éditeur.
* **TC-47 :** Deux notes créées avec le même titre exact $\rightarrow$ génération automatique d'un slug unique avec suffixe numérique.
* **TC-48 :** Tentative de Path Traversal dans le nom de fichier (`../../etc/passwd`) $\rightarrow$ rejet strict, nom assaini en chaîne alphanumérique.
* **TC-49 :** Note Markdown de plus de 5 millions de caractères $\rightarrow$ troncature contrôlée et avertissement de performance.
* **TC-50 :** Conflit d'édition sur une même note entre mobile et PC $\rightarrow$ stratégie du dernier écrit conservé (*Last-Write-Wins*) avec sauvegarde d'une copie de conflit.
* **TC-51 :** Balise `<script>` injectée dans une fiche de révision $\rightarrow$ neutralisation complète par le moteur de rendu Markdown.
* **TC-52 :** Formule mathématique LaTeX complexe avec syntaxe invalide $\rightarrow$ affichage d'un encadré d'erreur LaTeX local sans casser la page.
* **TC-53 :** Coupure d'alimentation pendant la saisie d'une note $\rightarrow$ sauvegarde automatique en cache local toutes les 3 secondes.
* **TC-54 :** Détection de mots sensibles ou mots de passe dictés en vocal $\rightarrow$ masquage dans le résumé généré par l'IA.
* **TC-55 :** Rejet par l'Architecte d'un résumé jugé plagié ou trop court $\rightarrow$ feedback constructif indiquant pourquoi l'XP est refusée.
* **TC-56 :** Caractères accentués et emojis dans les tags Markdown $\rightarrow$ encodage UTF-8 complet garanti.
* **TC-57 :** Recherche plein texte contenant des caractères réservés SQL (`%`, `_`, `'`) $\rightarrow$ échappement strict dans les requêtes de recherche.
* **TC-58 :** Export de l'ensemble des notes vers un dossier local $\rightarrow$ génération d'une archive `.zip` saine.

### Domaine E : Bot Discord & Canaux Distants (Cas 59 à 72)
* **TC-59 :** Commande `/status` exécutée par un utilisateur Discord tiers inconnu $\rightarrow$ réponse privée "Accès Refusé : Vous n'êtes pas le Monarque de ce Système".
* **TC-60 :** Clic répété frénétique sur le bouton `[Accepter]` de l'embed Discord $\rightarrow$ désactivation du bouton après le 1er clic (*disableComponents*).
* **TC-61 :** Perte de connexion WebSocket avec l'API Discord Gateway $\rightarrow$ reconnexion transparente sans redémarrer le serveur backend.
* **TC-62 :** Payload de message Discord dépassant les 2000 caractères $\rightarrow$ découpage automatique en plusieurs messages ou envoi sous forme de fichier.
* **TC-63 :** Envoi d'un fichier audio via Discord pour transcription $\rightarrow$ téléchargement sécurisé du buffer et envoi au pipeline de transcription.
* **TC-64 :** Changement du token Discord dans les variables d'environnement $\rightarrow$ rechargement propre sans crash en boucle.
* **TC-65 :** Discord API Rate Limit (`429 Too Many Requests`) $\rightarrow$ file d'attente interne avec respect du `Retry-After`.
* **TC-66 :** Utilisation d'un caractère de contrôle Discord dans un titre de quête $\rightarrow$ échappement des markdowns Discord.
* **TC-67 :** Tentative de déclencher une commande alors que la base de données est en maintenance $\rightarrow$ message Discord informatif "Système en calibrage".
* **TC-68 :** Bouton d'action Discord expiré (plus de 15 minutes) $\rightarrow$ message éphémère "Interaction expirée, utilisez le HUD Web".
* **TC-69 :** Envoi de commandes par message privé (DM) au lieu d'un salon dédié $\rightarrow$ prise en charge identique et sécurisée en DM.
* **TC-70 :** Erreur interne dans le handler d'une slash command $\rightarrow$ réponse `interaction.reply({ ephemeral: true, content: "Erreur Système" })`.
* **TC-71 :** Double instance du bot Discord lancée en local $\rightarrow$ détection de conflit de session.
* **TC-72 :** Alerte Discord envoyée pendant une plage de silence configurée $\rightarrow$ mise en file d'attente jusqu'à la fin de la plage.

### Domaine F : Intégrations Antigravity, Deerflow & IA (Cas 73 à 85)
* **TC-73 :** Clé API Gemini épuisée ou quota dépassé $\rightarrow$ bascule vers un mode dégradé avec message d'alerte explicite.
* **TC-74 :** Réponse de l'Architecte IA malformée (non conforme au JSON attendu) $\rightarrow$ validation Zod stricte, fallback sur un template prédéfini.
* **TC-75 :** Requête de bourses Deerflow renvoyant 0 résultat $\rightarrow$ message informatif sans erreur 500, reprogrammation de la veille à J+3.
* **TC-76 :** Scraping d'une bourse d'études dont la date limite est déjà passée $\rightarrow$ filtrage automatique avant enregistrement en base.
* **TC-77 :** Suggestion d'une certification par le Système qui s'avère devenue payante $\rightarrow$ possibilité pour le joueur de la signaler d'un clic.
* **TC-78 :** Hallucination de l'IA sur l'attribution d'XP (+10 000 XP au lieu de +100) $\rightarrow$ garde-fou serveur plafonnant l'XP max par action à 500.
* **TC-79 :** Lenteur extrême du modèle IA ($> 30\text{ s}$) $\rightarrow$ exécution en tâche de fond asynchrone avec notification de fin.
* **TC-80 :** Tentative de prompt injection dans le résumé de lecture pour forcer une bonne note $\rightarrow$ prompt système hermétique isolant le texte utilisateur.
* **TC-81 :** Requête vers Deerflow échouant pour cause de coupure réseau $\rightarrow$ réessai automatique via BullMQ avec 3 tentatives.
* **TC-82 :** Détection d'un hackathon dont la langue n'est ni le français ni l'anglais $\rightarrow$ étiquetage de la langue avant affichage.
* **TC-83 :** Demande de génération de programme pour une journée commando irréaliste (24h de travail sans pause) $\rightarrow$ refus par l'Architecte.
* **TC-84 :** Désynchronisation entre le prompt de l'Architecte et les versions d'API $\rightarrow$ tests de régression automatiques sur les fixtures de test.
* **TC-85 :** Données personnelles de santé ou de finances envoyées à un service tiers non autorisé $\rightarrow$ filtrage strict avant envoi externe.

### Domaine G : Résilience Système, Sécurité & Données Globales (Cas 86 à 100)
* **TC-86 :** Coupure d'Internet pendant toute une journée $\rightarrow$ le HUD Web local continue de fonctionner, enregistre les quêtes en local et synchronise au retour.
* **TC-87 :** Redémarrage brutal du serveur en plein milieu d'une mise à jour de stat $\rightarrow$ atomicité ACID garantie par PostgreSQL.
* **TC-88 :** Tentative d'injection SQL sur l'ensemble des paramètres de recherche $\rightarrow$ requêtes entièrement paramétrées via ORM.
* **TC-89 :** Attaque par force brute sur l'écran de connexion web $\rightarrow$ blocage automatique après 5 tentatives infructueuses (Rate Limiting).
* **TC-90 :** Fuite de stack trace technique dans les réponses d'erreur HTTP $\rightarrow$ intercepteur global d'erreurs masquant les détails d'implémentation.
* **TC-91 :** Corruption de l'index de recherche du Second Brain $\rightarrow$ commande CLI `pnpm brain:reindex` pour reconstruire l'index en 5 secondes.
* **TC-92 :** Tentative de falsification du token JWT dans le cookie de session $\rightarrow$ rejet 401 avec invalidation immédiate du cookie.
* **TC-93 :** Attaque Cross-Site Request Forgery (CSRF) $\rightarrow$ protection SameSite=Strict sur les cookies de session.
* **TC-94 :** Disque plein lors de la sauvegarde d'un fichier audio $\rightarrow$ capture de l'exception avec libération d'espace temporaire.
* **TC-95 :** Migration de schéma de base de données avec ajout d'une colonne non nulle $\rightarrow$ valeur par défaut garantie pour éviter l'échec de migration.
* **TC-96 :** Rollback d'une migration en cas d'erreur de déploiement $\rightarrow$ script de migration descendante testé et vérifié.
* **TC-97 :** Fuite mémoire dans le processus Node.js / Python sur 72 heures continues $\rightarrow$ profilage mémoire avec consommation stabilisée $< 250\text{ Mo}$.
* **TC-98 :** Dégradation des performances sur la table des quêtes avec 100 000 enregistrements $\rightarrow$ indexation optimale sur `(player_id, status, created_at)`.
* **TC-99 :** Panne complète de la base PostgreSQL $\rightarrow$ affichage d'une page de maintenance stylisée Solo Leveling ("Système Déconnecté - Reconnexion en cours").
* **TC-100 :** Restauration complète depuis le backup quotidien $\rightarrow$ procédure de restauration testée et opérationnelle en moins de 3 minutes.
