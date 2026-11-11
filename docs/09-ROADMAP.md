# Roadmap Stratégique, Trajectoire & Blueprints d'Ingénierie — LevelUp

> **Document ID :** RDM-LVLUP-009  
> **Nom du Produit :** LevelUp ("The System")  
> **Version du Document :** 2.0.0 (Schéma Directeur Stratégique Exhaustif)  
> **Horizon Temporel :** 2026 — 2028  
> **Vision Ultime :** Forger un système d'auto-dépassement souverain, élever un étudiant en intelligence artificielle du Rang F jusqu'au Rang de Monarque, et automatiser l'acquisition de la discipline, du savoir et de l'influence internationale.

---

## 1. La Trajectoire Triennale (Mermaid Timeline)

```mermaid
timeline
    title Trajectoire Stratégique & Évolutions Majeures de LevelUp
    section 2026 Q1-Q2 : V1.0 - Le Système Éveillé (Fondation Opérationnelle)
      Cadrage & Spécifications : PRD, Architecture C4, Modèle 8 Bases, 100 Tests
      Socle & Données : PostgreSQL 16, Redis 7, Chiffrement AES-256, Prisma
      HUD Solo Leveling : Thème Sombre néon & Thème Clair orange, Jauges HP/MP
      Productivité & Connaissances : Cerveau Numérique Markdown, Transcription Audio Whisper
      Canaux & Automatisation : Bot Discord temps réel, Quêtes 06h00, Time-blocking
      Orchestration IA : Agent Antigravity "L'Architecte" & Radar Bourses Deerflow
    section 2026 Q3-Q4 : V1.5 - Le Sanctuaire de Discipline
      Visualisation des Connaissances : Graph View interactif 3D des notes (Force-Directed Graph)
      Pare-feu de Pénalité : Script local de blocage DNS/IP des distractions (TikTok, YouTube)
      Oracles d'Automatisation : Synchronisation automatique des commits GitHub et badges TryHackMe
      Algorithme Prédictif : Ajustement de la charge journalière selon le sommeil réel
    section 2027-2028 : V2.0 - Le Monarque Absolu
      Voice Assistant Vocal : Interaction orale bidirectionnelle continue via Gemini Live API
      Mode Donjon Hackathon : HUD d'urgence et cockpit de monitoring pour les sprints de code 48h
      Multi-Device Local Mesh : Synchronisation P2P chiffrée entre PC, laptop et smartphone
```

---

## 2. Blueprints d'Ingénierie Détaillés par Jalon

---

### BLUEPRINT V1.0 : Le Système Éveillé (Socle Opérationnel Initial)

#### A. Blueprint Architectural & Infrastructure
* **Topologie de Déploiement :**
  * Architecture hybride conteneurisée : environnement d'exécution local Docker pour la base de données PostgreSQL 16 et l'instance Redis 7.
  * Serveur applicatif Next.js 14+ tournant sur le poste de travail ou hébergé sur une instance cloud privée à faible coût (ex: Hetzner Cloud / Supabase).
  * Passerelle réseau sécurisée via tunnel chiffré Cloudflare Tunnels (Zero Trust) pour exposer les webhooks Discord sans ouvrir de ports sur la box Internet.
* **Dimensionnement & Métriques Cibles :**
  * Consommation mémoire vive du processus principal $< 250\text{ Mo}$.
  * Temps de réponse de l'API REST $P_{95} < 120\text{ ms}$.
  * Latence de notification Discord $< 1.5\text{ s}$ après déclenchement de l'événement.

#### B. Blueprint des Données & Flux
* **Schéma Actif :** 7 tables relationnelles maîtresses (`players`, `player_stats`, `skill_nodes`, `quests`, `time_blocks`, `second_brain_notes`, `voice_transcriptions`, `opportunities`, `audit_logs`).
* **Gestion des Fichiers :** Stockage des fiches Markdown dans une arborescence locale sous forme de fichiers texte brut versionnés avec Git.
* **Connecteurs Actifs :** API Discord Gateway, API OpenAI Whisper / Gemini Flash, Connecteur de scraping Deerflow.

#### C. Sprint Blueprint & Découpage Opérationnel (4 Sprints de 2 Semaines)
* **Sprint 0 (Setup & Socle) :** Tooling, lint, types stricts, configuration Docker, schéma Prisma, migrations DDL inaugurale.
* **Sprint 1 (Moteur & HUD) :** Formules mathématiques logarithmiques d'XP, logique des 9 rangs, interface responsive Solo Leveling avec palettes sombre/clair.
* **Sprint 2 (Productivité & Audio) :** Cerveau Numérique avec wikilinks, sanitisation DOMPurify, pipeline de transcription audio Whisper.
* **Sprint 3 (Automatisations & IA) :** Bot Discord, queue BullMQ pour alarmes et quêtes matinales, agent Antigravity et scraping Deerflow.

#### D. Release Gate V1.0 (Critères Non-Négociables de Mise en Service)
- [ ] 100 % des mini-tests de gating des phases 0 à 5 validés avec preuve d'exécution.
- [ ] 0 vulnérabilité non traitée parmi les 100 cas d'échec de `docs/07-TEST_PLAN.md`.
- [ ] Boucle quotidienne complète (réveil $\rightarrow$ quêtes Discord $\rightarrow$ time-blocking $\rightarrow$ audio $\rightarrow$ clôture) testée sans faille sur 7 jours consécutifs.

---

### BLUEPRINT V1.5 : Le Sanctuaire de Discipline (Durcissement & Visualisation)

#### A. Blueprint Architectural & Nouvelles Fonctionnalités
1. **Graph View 3D du Cerveau Numérique :**
   * Moteur de visualisation de graphe interactif basé sur Three.js / Force-Directed Graph 3D.
   * Rendu visuel des constellations de connaissances reliant les cours d'IA, les rooms TryHackMe, les fiches de révision et les projets GitHub.
2. **Pare-feu de Pénalité (Penalty Firewall Daemon) :**
   * Démon système local fonctionnant en arrière-plan avec privilèges élevés.
   * En cas de non-validation des quêtes à minuit, le pare-feu modifie temporairement la table de routage / fichier hosts pour bloquer l'accès aux réseaux sociaux récréatifs (`tiktok.com`, `instagram.com`, `youtube.com`) pendant 12 heures.
   * Verrou de sécurité avec sauvegarde préalable et déblocage automatique garanti en cas de redémarrage.
3. **Oracles de Preuve Automatisés :**
   * Cron interrogeant directement l'API GitHub GraphQL pour compter les commits du jour et l'API publique TryHackMe pour extraire les badges obtenus, validant les quêtes sans aucune saisie manuelle.

#### B. Évolution du Schéma de Données
* Ajout d'une table `oracle_connections` pour gérer les tokens d'accès GitHub et TryHackMe.
* Ajout d'une table `penalty_sessions` consignant les déclenchements de pénalité, les motifs et les heures de déblocage.

#### C. Release Gate V1.5
- [ ] Le script de blocage réseau local s'exécute et se rétablit sans aucune corruption de la pile réseau de la machine.
- [ ] Le Graph View affiche plus de 1 000 nœuds interconnectés avec une fluidité constante de 60 FPS.

---

### BLUEPRINT V2.0 : Le Monarque Absolu (Omniprésence & Voice AI Temps Réel)

#### A. Blueprint Architectural & Vision Technologique
1. **Compagnon Vocal Bidirectionnel (Gemini Live API) :**
   * Communication orale en direct avec l'Architecte sans appuyer sur un bouton (dialogue fluide en streaming audio WebSocket bidirectionnel).
   * L'Architecte interagit pendant les séances de sport pour donner le rythme, ou pendant les sessions de code pour servir de binôme de relecture (*Pair Programming Vocal*).
2. **Mode Cockpit Donjon Hackathon :**
   * Interface plein écran haute tension spécialement conçue pour les compétitions de 48 heures.
   * Suivi minute par minute des livrables de hackathon, monitoring de l'état de fatigue du développeur, alertes d'hydratation et compte à rebours de soumission Devpost.
3. **Synchronisation P2P Locale Décentralisée :**
   * Remplacement de la dépendance cloud par un maillage local décentralisé (*Local Mesh Sync via CRDTs / Automerge*) synchronisant instantanément les notes du Second Brain entre le PC fixe, le PC portable d'université et le smartphone sans passer par un serveur tiers.

#### B. Release Gate V2.0
- [ ] Latence vocale aller-retour avec l'Architecte inférieure à 600 ms.
- [ ] Synchronisation locale P2P fonctionnelle même en cas de coupure Internet complète.
- [ ] Atteinte du Rang de Monarque certifiée par l'accomplissement des 8 arbres d'excellence.
