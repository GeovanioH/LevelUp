# ⚡ LevelUp — Moteur d'Auto-Quantification & Gamification

[![Status](https://img.shields.io/badge/STATUS-OPERATIONAL%20V1.0-00E5FF?style=for-the-badge&logo=shield)](https://github.com/GeovanioH/LevelUp)
[![Architecture](https://img.shields.io/badge/ARCHITECTURE-FASTIFY%20%7C%20NEXT.JS%20%7C%20POSTGRES-0051FF?style=for-the-badge)](https://github.com/GeovanioH/LevelUp)
[![AI Engine](https://img.shields.io/badge/AI%20CORE-GEMINI%202.5%20PRO%20%26%20FASTER--WHISPER-FF6B00?style=for-the-badge&logo=google)](https://github.com/GeovanioH/LevelUp)
[![Tests](https://img.shields.io/badge/TESTS-188%2F188%20PASSING-00FF66?style=for-the-badge)](https://github.com/GeovanioH/LevelUp)

**LevelUp** est un système modulaire d'auto-quantification, de productivité et de montée en compétences. Conçu comme un moteur de productivité universel et extensible, il permet à tout utilisateur de structurer ses objectifs, ses projets techniques, ses entraînements physiques et sa discipline quotidienne au sein d'un environnement gamifié déterministe et mesurable.

> [!NOTE]
> **Profil & Personnalisation Individuelle** : Les objectifs individuels, programmes d'entraînement spécifiques et paramètres de carrière d'un utilisateur sont configurés dans le fichier dédié [config/personal_profile.md](config/personal_profile.md).

---

## 1. Architecture Globale & Stack Technique

Le système s'articule autour d'un monorepo Turborepo / pnpm :
* **Web HUD (`apps/web`)** : Interface futuriste PWA construite avec Next.js 14 (App Router), Tailwind CSS, Framer Motion, shaders WebGL et support audio synthétique.
* **Serveur API (`apps/api`)** : Backend haute performance Fastify en TypeScript strict, communication temps réel via WebSockets et validation de schémas Zod.
* **Bot Discord (`apps/bot`)** : Agent d'interaction vocale et textuelle Discord.js v14 avec streaming audio temps réel via UDP/Opus.
* **Base de Données & Cache (`packages/database`)** : PostgreSQL piloté par Prisma ORM avec SQLite en fallback local et Redis/Redlock pour le verrouillage distribué.
* **Moteur Mathématique & Contrats (`packages/contracts`)** : Définition partagée des types, schémas de validation et formules de progression ($S_{\text{global}}$, $L_b$).
* **Sécurité & Cryptographie (`packages/crypto`)** : Chiffrement d'enveloppe AES-256-GCM, hachage Argon2id, signatures HMAC-SHA256 pour les oracles externes.

---

## 2. Modèle Mathématique de Progression (Les 8 Bases de Vie)

L'évolution de l'utilisateur repose sur 8 piliers évalués en continu ($S_b \in [0, 1000]$) :
1. **`ACAD` (Apprentissage & Théorie)** : Connaissances théoriques, mathématiques, fiches KaTeX et répétition espacée (SM-2).
2. **`AI_ENG` (Ingénierie Logicielle & IA)** : Développement de projets, architectures applicatives, MVPs et modèles d'IA.
3. **`CYBER` (Sécurité des Systèmes)** : Pratique offensive et défensive, audits de vulnérabilités, CTF et durcissement.
4. **`EXP` (Éloquence & Réseau)** : Restitutions orales, synthèses techniques, networking et leadership de projets.
5. **`LNG` (Langues & Communication)** : Immersion en langues étrangères, monologues audio et pratique technique.
6. **`FIN` (Finance & Opportunités)** : Veille automatisée (Deerflow), bourses, subventions, primes de hackathons et budget.
7. **`STR` (Force & Santé Physique)** : Calisthénie au poids du corps, validation cinématique par vision (MediaPipe Pose).
8. **`DIS` (Discipline Opérationnelle)** : Respect des plages de Deep Work (Time-Blocking) et zéro sanction de distraction.

### Formules Clés
* **Niveau d'une Base ($L_b \in [1, 100]$)** :
  $$L_b = \min \left( 100, \left\lfloor \sqrt{\frac{S_b}{1000}} \times 100 \right\rfloor \right)$$
* **Score Global Harmonique ($S_{\text{global}}$)** :
  Moyenne harmonique interdisant le délaissement d'un domaine vital ($\sum w_b = 1.0$) :
  $$S_{\text{global}} = \frac{1}{\sum_{b=1}^{8} \frac{w_b}{S_b + 0.01}}$$
* **Jauges Physiologiques** :
  * **HP (Vitalité)** : Décroissance amortie basée sur le modèle homéostatique de sommeil (Borbély).
  * **MP (Concentration)** : Modèle d'épuisement cognitif et récupération par tâches terminées (Boksem).

---

## 3. Rangs & Invariants de Qualification

Le rang officiel est garanti par des invariants réels et non par du temps passé :

| Rang | Niveaux | Titre | Invariants Réels Indiscutables (DoD) |
| :--- | :--- | :--- | :--- |
| **E** | **1 à 10** | *Novice* | Environnement configuré, 7 jours de quêtes validés, Second Brain initialisé. |
| **D** | **11 à 25** | *Apprenti* | $S_{\text{ACAD}} \ge 250$, premiers livrables techniques autonomes, assiduité physique. |
| **C** | **26 à 45** | *Confirmé* | Projet fullstack opérationnel déployé, assiduité sur 30 jours, révisions SM-2 régulières. |
| **B** | **46 à 65** | *Expert* | Victoire/podium en défi technique majeur (hackathon/CTF), certification officielle, calisthénie avancée. |
| **A** | **66 à 85** | *Référent* | Multiples accomplissements majeurs, produit actif en production, aisance linguistique fluide. |
| **S** | **86 à 95** | *Sommité* | Accomplissements d'envergure internationale, reconnaissance du domaine, autonomie totale. |
| **Maître** | **96 à 100** | *Maître Suprême* | Plafond du système : harmonie parfaite et niveau maximal sur les 8 bases de vie. |

---

## 4. Ce que vous pouvez faire avec LevelUp (Guide des Capacités & Cas d'Usage)

Le système régit l'ensemble de votre quotidien à travers 9 modes opératoires interconnectés :

### 🎙️ 4.1 Audio, Restitution Orale & Assistant Vocal
* **Évaluation Socratique Vocale (/20)** :
  * Enregistrez votre discours directement dans le Web HUD ou en salon vocal Discord (`/monologue`).
  * Transcription locale ultra-rapide par **Faster-Whisper (CUDA INT8)** sans latence cloud.
  * Notation socratique automatisée sur 20 points : précision terminologique (/5), fluidité (/5), rigueur de synthèse (/5) et argumentation pratique (/5).
* **Pratique d'Éloquence & Anglais Technique (Bases `LNG` & `EXP`)** :
  * Restitutions orales de 3 à 5 minutes sur des concepts pointus (*PagedAttention*, *Kernel Triton*, *CTF write-ups*) pour valider vos quêtes d'expression orale sans taper une ligne.
* **Planification & Journaling par Note Audio** :
  * Dictez vos bilans quotidiens ou vos notes vocales pour que le système planifie automatiquement vos blocs temporels du lendemain ou alimente votre Second Brain.

### 🏋️ 4.2 Entraînement Physique par Caméra (Vision par Ordinateur)
* **Comptage Cinématique Strict (MediaPipe Pose)** :
  * Activez la caméra dans l'onglet **Workout** : le modèle analyse en temps réel les angles biomécaniques et incrémente automatiquement vos répétitions (pompes, pike push-ups, tractions, squats, relevés de jambes).
* **Routines Calisthéniques Personnalisées** :
  * Déroulé guidé pas à pas : **Dos & Épaules** (17 étapes), **Bras & Triceps** (6 étapes), **Abdos & Core** (5 étapes), ou la **Trinité** complète (28 étapes).
* **Chronomètre & Triche Impossible** :
  * Enchaînement automatique des temps de repos, bips sonores procéduraux WebAudio et validation inviolable.

### 🧠 4.3 Second Brain & Révision Théorique (Base `ACAD`)
* **Coffre de Connaissances Markdown (Style Obsidian)** :
  * Éditeur complet avec rendu $\LaTeX$ via KaTeX, gestion des tags, arborescence hiérarchique et rétroliens (*backlinks*).
* **Algorithme de Répétition Espacée SM-2** :
  * Calcul automatique des intervalles optimaux de révision pour ancrer définitivement les théorèmes et architectures en mémoire longue durée.
* **Recherche Plein Texte Ultra-Rapide** :
  * Indexation instantanée de toutes vos fiches techniques.

### ⚡ 4.4 Gestion Circadienne & Discipline (Base `DIS`)
* **Time-Blocking Circadien (06h00 – 22h00)** :
  * Organisation visuelle des blocs de Deep Work, des plages d'entraînement et des pauses régénératrices.
* **Sessions de Deep Work & Pomodoro** :
  * Lancez un minuteur Pomodoro de 25 minutes ou une session chronométrée anti-distraction (sur le Web ou via `/cours sujet:<...> duree:<...>`).
* **Jauges Physiologiques $HP$ et $MP$** :
  * **HP (Vitalité)** : Décroissance homéostatique et régénération par le sommeil (modèle Borbély).
  * **MP (Concentration)** : Consommation par le Deep Work et recharge lors des pauses (modèle Boksem).

### 🤖 4.5 Bot Discord Opérationnel 24/7 (`apps/bot`)
Pilotez l'intégralité du Système depuis votre smartphone ou PC en toute mobilité :
* `/status` : Affiche votre carte holographique (Niveau, Rang, HP/MP, Cristaux, Série active).
* `/valider id:<ID> preuve:<URL>` : Valide une quête avec preuve irréfutable (commit GitHub, Strava, certificat).
* `/stats` : Affiche l'octogone des 8 bases et votre score harmonique $S_{\text{global}}$.
* `/programme [jour]` : Consulte votre planning Time-Blocking de la journée ou du lendemain.
* `/cours sujet:<...> duree:<...>` : Déclenche une session de travail focalisé sans distraction.
* `/monologue [salon]` : Connecte le bot en vocal (streaming UDP/Opus) pour enregistrer et noter votre monologue.
* `/boutique` : Consultez le catalogue d'objets et échangez vos Cristaux d'Ombre.
* `/penalite` : Inspecte le statut des restrictions réseau et les conditions de rachat.

### 🛡️ 4.6 Pare-Feu & Mode Restriction (NextDNS & Filtrage Local)
* **Coupe-Feu Anti-Procrastination Automatique** :
  * Si vos quêtes ne sont pas achevées avant **22h00**, le système enclenche le mode restriction : verrouillage des plateformes récréatives au niveau DNS (NextDNS) et local (hosts/WFP).
* **Quête de Purge (Rachat Physique)** :
  * L'unique moyen de lever la sanction est d'accomplir une épreuve physique certifiée (ex: 200 pompes validées par vision ou 10 km de course).

### 🌐 4.7 Veille Stratégique d'Opportunités Deerflow (Base `FIN`)
* **Scraper IA d'Opportunités à Fort Impact** :
  * Détection continue des bourses d'études ($\\ge 5\\,000$ €/\$), bourses d'excellence (Campus France), grands hackathons mondiaux (Devpost, MLH) et financements.
* **Lancement de Recherches depuis le Bot & l'UI** :
  * Déclenchez une veille ou un scraping d'opportunités ciblées sur vos critères d'un simple clic ou par commande.

### 🎮 4.8 Gamification & Progression Globale (Solo Leveling IRL)
* **Score Harmonique Global ($S_{\text{global}}$)** :
  * Interdiction mathématique du déséquilibre : si une base est ignorée, le score global s'effondre.
* **Arbre des 120 Compétences (DAG)** :
  * Arbre orienté acyclique couvrant l'IA, la cybersécurité, les mathématiques, la calisthénie, l'anglais et la finance.
* **Shadow Shop (Boutique de l'Ombre)** :
  * Dépensez vos Cristaux d'Ombre gagnés pour débloquer des récompenses physiques, des buffs ou des pauses autorisées.

### 🔌 4.9 Contrôle par Agents IA (Serveur MCP LevelUp Natif)
Grâce au serveur Model Context Protocol (MCP) intégré, tout agent IA externe (Antigravity, Claude, Cursor) peut interagir avec votre système :
* `get_player_status` : Consulter votre état complet en direct.
* `get_daily_quests` : Récupérer vos quêtes actives.
* `submit_quest_proof` : Auditer et valider vos preuves de quête.
* `grade_oral_monologue` : Évaluer vos soutenances orales.
* `get_timeblocking_schedule` : Lire et synchroniser votre agenda quotidien.

---

## 5. Guide d'Installation & Démarrage Rapide

### Prérequis
* Node.js $\ge 20.0.0$, pnpm $\ge 9.0.0$, Docker Desktop, Python 3.11+.

### 1. Clonage & Installation
```bash
git clone https://github.com/GeovanioH/LevelUp.git
cd LevelUp
pnpm install
```

### 2. Configuration d'Environnement
Copier le fichier d'exemple et renseigner les clés nécessaires :
```bash
cp .env.example .env
```
Variables clés :
* `DATABASE_URL` : Chaîne de connexion PostgreSQL.
* `REDIS_URL` : Chaîne de connexion Redis.
* `GEMINI_API_KEY` : Clé API Google Gemini (évaluation socratique).
* `NEXTDNS_PROFILE_ID` / `NEXTDNS_API_KEY` : Identifiants NextDNS pour le contrôle réseau.
* `DISCORD_BOT_TOKEN` : Jeton du bot Discord.

### 3. Base de Données & Démarrage
```bash
# Génération et migration Prisma
pnpm exec prisma db push
pnpm exec prisma db seed

# Lancement de la suite complète en développement
pnpm dev
```

### 4. Exécution des Tests
```bash
pnpm exec vitest run
```
*Couverture actuelle : 39 suites de tests, 188 tests validés (100%).*
