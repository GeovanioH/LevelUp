# Product Requirements Document (PRD) — LevelUp

> **Document ID :** PRD-LVLUP-001  
> **Version :** 3.1.0 (Édition Pareto Simplifiée)  
> **Statut :** Approuvé pour Implémentation  

---

## 1. Contexte & Problématique Fonctionnelle

L'acquisition et le maintien de compétences techniques complexes, de condition physique et de discipline personnelle souffrent d'un manque de rétroaction immédiate et d'outils de mesure objectifs. Les applications classiques de productivité ne fournissent ni boucle de récompense proportionnée à l'effort réel, ni vérification automatisée de l'exécution par des oracles logiciels.

**LevelUp** résout ce problème en introduisant un moteur d'auto-quantification et de gamification universel. Le système est conçu comme un framework modulaire que chaque utilisateur peut adapter à ses propres domaines d'apprentissage, projets techniques et objectifs de condition physique.

> [!NOTE]
> Les objectifs individuels et programmes spécifiques de l'utilisateur actif sont isolés dans [`config/personal_profile.md`](../config/personal_profile.md).

---

## 2. Les 8 Bases de Vie & Modèle Mathématique

Le système structure la progression autour de **8 Bases de Vie fondamentales** :
1. **`ACAD`** (Apprentissage & Théorie) : Modèles théoriques, mathématiques appliquées, révision espacée (SM-2).
2. **`AI_ENG`** (Ingénierie Logicielle & IA) : Architectures logicielles, MVPs, modèles d'IA et code en production.
3. **`CYBER`** (Sécurité des Systèmes) : Sécurité offensive et défensive, labs, audits de vulnérabilités et CTFs.
4. **`EXP`** (Éloquence & Réseau) : Restitutions orales, synthèses techniques, leadership et prise de parole.
5. **`LNG`** (Langues & Communication) : Pratique active des langues cibles, vocabulaire et compréhension technique.
6. **`FIN`** (Gestion Financière & Opportunités) : Veille automatique (Deerflow), bourses, primes et budget.
7. **`STR`** (Force & Santé Posturale) : Calisthénie au poids du corps validée par détection de pose cinématique.
8. **`DIS`** (Discipline Opérationnelle) : Respect des blocs de travail (Time-Blocking) et zéro sanction de distraction.

### Modélisation Mathématique
* **Score de Base ($S_b \in [0, 1000]$)** : Alimenté par les compétences validées, les quêtes réussies et les preuves auditées.
* **Niveau de Base ($L_b \in [1, 100]$)** :
  $$L_b = \min \left( 100, \left\lfloor \sqrt{\frac{S_b}{1000}} \times 100 \right\rfloor \right)$$
* **Score Global Harmonique ($S_{\text{global}}$)** :
  Calculé par moyenne harmonique pondérée pour interdire tout délaissement d'un domaine vital ($\sum w_b = 1.0$) :
  $$S_{\text{global}} = \frac{1}{\sum_{b=1}^{8} \frac{w_b}{S_b + 0.01}}$$
* **Jauges Physiologiques** :
  * **HP (Vitalité)** : Évolution homéostatique liée au sommeil (Borbély).
  * **MP (Concentration)** : Consommation par le Deep Work et régénération par les pauses (Boksem).

---

## 3. Système des Rangs & Invariants Réels

La progression en rang dépend conjointement du niveau global et de preuves tangibles dans le monde réel :

| Rang | Niveaux | Statut | Critères Réels Obligatoires (DoD) |
| :--- | :--- | :--- | :--- |
| **E** | **1 à 10** | *Novice* | Environnement configuré, 7 jours de quêtes parfaits, Second Brain initialisé. |
| **D** | **11 à 25** | *Apprenti* | $S_{\text{ACAD}} \ge 250$, premiers scripts autonomes, assiduité physique régulière. |
| **C** | **26 à 45** | *Confirmé* | Projet fullstack opérationnel déployé, assiduité sur 30 jours, révisions SM-2. |
| **B** | **46 à 65** | *Expert* | Victoire/podium en défi technique majeur (hackathon/CTF), certification officielle, calisthénie complète. |
| **A** | **66 à 85** | *Référent* | Multiples réalisations majeures, solution en production avec utilisateurs réels, éloquence fluide. |
| **S** | **86 à 95** | *Sommité* | Accomplissements d'envergure internationale, autonomie opérationnelle totale. |
| **Maître** | **96 à 100** | *Maître Suprême* | Plafond du système : harmonie parfaite et niveau maximal sur l'ensemble des 8 bases. |

---

## 4. Spécifications des Fonctionnalités Clés

### 4.1 Web HUD Central (Les 10 Écrans Canoniques)
* Interface futuriste sombre avec visualisations radar des 8 bases, jauges de vitalité ($HP$, $MP$) et affichage des quêtes actives.
* 10 écrans spécialisés entièrement intégrés :
  1. `/dashboard` : Statut général du Chasseur, jauges vitales, quêtes en cours, score harmonique.
  2. `/quests` : Gestionnaire de quêtes quotidiennes et soumission de preuves.
  3. `/planner` : Agenda Time-Blocking circadien (06h-22h) et minuteur Pomodoro 25 min.
  4. `/workout` : Entraînement cinématique avec détection MediaPipe Pose et routines guidées.
  5. `/audio` : Enregistreur vocal de monologues avec analyse spectrale et notation socratique /20.
  6. `/skills` : Arbre orienté acyclique (DAG) des 120 compétences réparties sur les 8 piliers.
  7. `/notes` : Second Brain style Obsidian avec rendu KaTeX, tags, arborescence et backlinks.
  8. `/opportunities` : Centre de veille et scraping Deerflow (bourses, hackathons, financements).
  9. `/shop` : Shadow Shop pour échanger les Cristaux d'Ombre contre récompenses et buffs.
  10. `/penalty` : Cockpit de restriction réseau NextDNS et soumission de quêtes de purge.
* Mode hors-ligne résilient avec synchronisation automatique IndexedDB (Dexie.js).

### 4.2 Moteur de Quêtes & Anti-Double Dépense
* Quêtes journalières réparties sur les bases clés (sport, révision théorique, audio, code).
* Validation atomique protégée par verrous distribués Redlock pour interdire les doubles validations.
* Soumission de preuves irréfutables : commit GitHub, trace GPS Strava, certificat ou fichier audio.

### 4.3 Pipeline d'Évaluation Vocale & Restitution Socratique
* Enregistrement audio local ou via Discord, transcription rapide par Faster-Whisper (CUDA INT8).
* Évaluation socratique sur 20 points par l'agent IA selon la grille officielle :
  1. *Précision Conceptuelle & Vocabulaire* (/5)
  2. *Fluidité & Élocution* (/5)
  3. *Rigueur de la Synthèse & Structure* (/5)
  4. *Application Pratique & Argumentation* (/5)
* Pratique d'éloquence et de communication technique en anglais et français (Bases `LNG` & `EXP`).
* Support de la planification et du journaling quotidien par note vocale.

### 4.4 Détection Cinématique par Caméra & Routines Guidées
* Suivi des mouvements au poids du corps via MediaPipe Pose (WebAssembly).
* Comptage strict des répétitions (pompes, pike push-ups, tractions, squats, relevés de jambes) sans possibilité de falsification.
* Exécution des routines personnalisées : Dos & Épaules (17 étapes), Bras & Triceps (6 étapes), Abdos & Core (5 étapes), ou Trinité complète (28 étapes).

### 4.5 Mode Restriction & Pénalités (NextDNS & WFP)
* Déclenchement automatique du couvre-feu anti-procrastination à 22h00 si les quêtes sont incomplètes.
* Blocage réseau au niveau DNS (API NextDNS) et local (filtrage WFP / hosts).
* Levée de la restriction conditionnée à l'accomplissement d'une épreuve physique de compensation (Quête de Purge : 200 pompes validées par vision ou 10 km de course).

### 4.6 Bot Discord Opérationnel 24/7 (`apps/bot`)
* 8 Commandes Slash natives : `/status`, `/valider`, `/stats`, `/programme`, `/cours`, `/monologue`, `/boutique`, `/penalite`.
* Streaming audio temps réel via UDP/Opus pour connecter le bot dans les salons vocaux et évaluer les monologues oraux à la volée.

### 4.7 Second Brain & Répétition Espacée SM-2
* Coffre de notes Markdown compatible Obsidian avec rendu mathématique $\LaTeX$ (KaTeX).
* Moteur de répétition espacée SM-2 planifiant les révisions conceptuelles pour garantir la rétention à long terme.

### 4.8 Gestion Circadienne & Time-Blocking
* Découpage déterministe de la journée de 06h00 à 22h00 en blocs de Deep Work et plages de récupération.
* Minuteur Pomodoro 25 minutes avec intégration du calcul d'épuisement cognitif ($MP$).

### 4.9 Veille Stratégique d'Opportunités Deerflow (Base `FIN`)
* Scraper Playwright headless surveillant en continu les bourses d'études ($\\ge 5\\,000$ €), bourses Campus France et hackathons internationaux.
* Normalisation des opportunités et déclenchement de veilles thématiques ciblées.

### 4.10 Interopérabilité Agents IA (Serveur MCP LevelUp Natif)
* Serveur Model Context Protocol (MCP) fournissant des outils JSON-RPC aux agents (Antigravity, Claude, Cursor) pour inspecter l'état du joueur, récupérer les quêtes, auditer les preuves et noter les soutenances orales.
