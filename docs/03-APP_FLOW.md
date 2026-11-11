# Flux Applicatif, Parcours Utilisateur & Spécifications UX/UI — LevelUp

> **Document ID :** UX-LVLUP-003-TITAN  
> **Nom du Produit :** LevelUp ("The System" / "Le Système")  
> **Version du Document :** 3.0.0 (Spécification d'Interface & Flux Exhaustive & Encyclopédique)  
> **Direction Artistique :** Solo Leveling Monarch HUD (Dark & Light Awakened)  
> **Statut de Validation :** Approuvé pour Intégration Frontend & Bot Discord  
> **Cibles IHM :** Web HUD Desktop (1920x1080 / 1440x900), Web PWA Mobile (375x812), Bot Discord Mobile/Desktop  

---

## 1. Charte Graphique, Tokens CSS & Système de Design Solo Leveling

L'expérience visuelle de LevelUp est conçue pour matérialiser fidèlement l'interface du Système apparue devant Sung Jin-Woo. Elle est régie par un ensemble strict de design tokens CSS injectés à la racine du document HTML (`:root`).

### 1.1 Palette Chromatique & Variables Sémantiques

```css
:root {
  /* ==========================================================================
     THÈME SOMBRE : "MONARQUE DES OMBRES" (DEFAULT ACTIF)
     ========================================================================== */
  --bg-abyss-primary: #05050A;          /* Fond principal ultra-sombre */
  --bg-surface-hologram: rgba(10, 15, 30, 0.75); /* Panneaux translucides avec flou */
  --bg-surface-elevated: #0C1222;        /* Cartes et fenêtres modales */
  --border-neon-cyan: #00E5FF;           /* Liseré bleu néon holographique */
  --border-subtle-glow: rgba(0, 229, 255, 0.25);
  --accent-shadow-blue: #0051FF;         /* Bleu profond des compétences d'Ombre */
  --accent-cyan-core: #00E5FF;           /* Cyan électrique des textes d'alerte */
  --accent-gold-rank: #FFD700;           /* Or éclatant réservé aux Rangs S / Monarch */
  --accent-alert-red: #FF003C;           /* Rouge sang des Quêtes Urgentes et Pénalité */
  --text-primary: #FFFFFF;              /* Blanc pur haute lisibilité */
  --text-secondary: #94A3B8;            /* Gris ardoise des libellés secondaires */
  --text-muted: #475569;                /* Métadonnées et horodatages discrets */

  /* Jauges Vitales */
  --gauge-hp-fill: #10B981;              /* Vert émeraude (Sommeil optimal / Récupération) */
  --gauge-hp-low: #EF4444;               /* Rouge critique (Sommeil < 5h) */
  --gauge-mp-fill: #00E5FF;              /* Cyan électrique (Énergie mentale / Focus) */
  --gauge-mp-low: #6366F1;               /* Violet fatigue cognitive */

  /* Typographie */
  --font-display: 'Rajdhani', sans-serif; /* Titres holographiques angulaires */
  --font-body: 'Inter', sans-serif;       /* Corps de texte lisible */
  --font-mono: 'JetBrains Mono', monospace; /* Statistiques, codes et horodatages */

  /* Ombres & Filtres de Flou */
  --glow-cyan-sm: 0 0 10px rgba(0, 229, 255, 0.35);
  --glow-cyan-lg: 0 0 25px rgba(0, 229, 255, 0.65), 0 0 50px rgba(0, 81, 255, 0.35);
  --glow-red-alarm: 0 0 30px rgba(255, 0, 60, 0.75);
  --glass-backdrop-blur: blur(16px);
}

[data-theme="light-awakening"] {
  /* ==========================================================================
     THÈME CLAIR : "ÉVEIL DU SYSTÈME"
     ========================================================================== */
  --bg-abyss-primary: #F8FAFC;
  --bg-surface-hologram: rgba(255, 255, 255, 0.85);
  --bg-surface-elevated: #FFFFFF;
  --border-neon-cyan: #FF6B00;           /* Orange vif système en mode clair */
  --border-subtle-glow: rgba(255, 107, 0, 0.25);
  --accent-shadow-blue: #EA580C;
  --accent-cyan-core: #FF6B00;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --glow-cyan-sm: 0 0 10px rgba(255, 107, 0, 0.25);
  --glow-cyan-lg: 0 0 25px rgba(255, 107, 0, 0.45);
}
```

### 1.2 Géométrie & Biseau Angulaire des Panneaux Holographiques
Les fenêtres système adoptent une découpe géométrique à coins coupés à 45 degrés (`clip-path: polygon(...)`) :

```css
.hologram-card {
  background: var(--bg-surface-hologram);
  backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--border-neon-cyan);
  box-shadow: var(--glow-cyan-sm);
  clip-path: polygon(
    0 12px,
    12px 0,
    calc(100% - 12px) 0,
    100% 12px,
    100% calc(100% - 12px),
    calc(100% - 12px) 100%,
    12px 100%,
    0 calc(100% - 12px)
  );
  position: relative;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.hologram-card:hover {
  box-shadow: var(--glow-cyan-lg);
  border-color: #FFFFFF;
}
```

---

## 2. Parcours Utilisateur Global & Scénarisation de la Journée Idéale

La vie du joueur est orchestrée comme une quête épique permanente découpée en cinq actes quotidiens :

```mermaid
stateDiagram-v2
    [*] --> Sommeil : Nuit (Régénération passive de la Jauge HP)
    
    state "06:00 - Acte I : L'Éveil & Réception du Pack" as Acte1 {
        Sommeil --> EveilMatin : Sonnerie Bell & Dispatch Discord
        EveilMatin --> ConsultationHUD : Saisie du Sommeil (Calcul HP)
        ConsultationHUD --> AcceptationQuetes : Consultation Quêtes Journalières
    }

    state "07:00 - Acte II : L'Entraînement Physique & Matinal" as Acte2 {
        AcceptationQuetes --> BlocMusculation : Séance Sport Sung Jin-Woo (STR)
        BlocMusculation --> SoumissionPreuveSport : 100 Pompes / Abdos / Squats / Course
        SoumissionPreuveSport --> BlocAcademique1 : Étude Algorithmes & Mathématiques (ACAD)
    }

    state "12:30 - Acte III : La Dictée Vocale & Déjeuner Actif" as Acte3 {
        BlocAcademique1 --> MonologueMicro : Dictée vocale de 3 min du cours
        MonologueMicro --> EvaluationArchitecte : Évaluation Socratique /20 & Fiche Auto
        EvaluationArchitecte --> PauseActive : Marche & Restauration MP
    }

    state "14:00 - Acte IV : Le Deep Work Élite & Cybersécurité" as Acte4 {
        PauseActive --> BlocCyberAI : Sprint TryHackMe ou Hackathon IA
        BlocCyberAI --> ValidationFlag : Capture de Flag ou Push GitHub
        ValidationFlag --> PratiqueLangue : Monologue Anglais C1 Cambridge (LNG)
    }

    state "22:00 - Acte V : L'Épreuve du Soir & Verdict du Système" as Acte5 {
        PratiqueLangue --> BilanFinal : Heure Limite Impérative (22h00)
        BilanFinal --> SuccesQuetes : 100% Quêtes Validées
        BilanFinal --> EchecQuetes : $\ge$ 1 Quête Non Validée
        
        SuccesQuetes --> AttributionBonus : Cristaux d'Ombres + XP + Streak Incrémenté
        AttributionBonus --> Sommeil : Repos du Guerrier
        
        EchecQuetes --> ProtocolePenalite : DÉCLENCHEMENT IMMÉDIAT ZONE PÉNALITÉ
        ProtocolePenalite --> VerrouillageReseau : Blocage TikTok / Distractions
        VerrouillageReseau --> QueteSurvie : 400 Pompes ou 10km Marche Nuit
        QueteSurvie --> DeblocagePenalite : Validation & Levée du Pare-feu
        DeblocagePenalite --> Sommeil
    }
```

---

## 3. Spécification Détaillée des 9 Écrans du Web HUD (Wireframes ASCII & CSS Grid)

Chaque écran de la plateforme Web PWA est minutieusement documenté avec son agencement géométrique, sa hiérarchie de composants, ses raccourcis clavier et son comportement responsive :

---

### 3.1 Écran 1 : Tableau de Bord Principal (`/dashboard` - Le HUD du Chasseur)

Centre névralgique du joueur, cet écran récapitule l'identité, le rang, les jauges de survie et les priorités de la journée.

#### 3.1.1 Wireframe ASCII Détaillé (Résolution Desktop 1440x900)
```
+-------------------------------------------------------------------------------------------------------------------+
|  [LEVELUP // THE SYSTEM]  [STATUT: MONARQUE ACTIF]               [CRISTAUX: 820 OC]  [STREAK: 18 J]  [THÈME: D/L] |
+-------------------------------------------------------------------------------------------------------------------+
| +-- [CARTE D'IDENTITÉ JOUEUR] ------------------------------+ +-- [JAUGES VITALES EN TEMPS RÉEL] ----------------+ |
| | NOM    : Huriel                          RANG  : D        | | HP [██████████████████░░] 88%  (Repos: 7h45 - OPTIMAL) | |
| | TITRE  : Chasseur Confirmé               NIVEAU: 14       | | MP [█████████████░░░░░░░] 65%  (Focus: Soutenu)        | |
| | EXP    : [████████████████░░░░] 18,450 / 22,500 XP (82%)  | | ALERTE: Aucune pénalité active. Système stable.    | |
| +-----------------------------------------------------------+ +----------------------------------------------------+ |
|                                                                                                                   |
| +-- [RADAR DES 8 BASES DE VIE] ---+ +-- [QUÊTES DU JOUR EN COURS] -----------------------------------------------+ |
| |               ACAD (Lvl 15)     | | [!] [DAILY_FIT] L'Entraînement de Sung Jin-Woo (STR)            [EN COURS] | |
| |                 /\              | |     Objectif : 100 Pompes, 100 Abdos, 100 Squats, 10 km.      +200 XP / 15 OC| |
| |       DIS (17) /  \ AI_ENG (16) | |     Progression : [██████████░░░░░░░░░░] 50%                  [SOUMETTRE] | |
| |         \     /    \     /      | |----------------------------------------------------------------------------| |
| |   STR (14)---*------*---CYBER(12| | [✓] [DAILY_CYBER] Infiltration Room Medium TryHackMe (CYBER)   [VALIDÉ]    | |
| |         /     \    /     \      | |     Récompense : +180 XP / +220 CYBER / +20 Cristaux          [VOIR PROOF] | |
| |       FIN (10) \  / EXP (11)    | |----------------------------------------------------------------------------| |
| |                 \/              | | [!] [DAILY_LNG] Monologue Oral Anglais C1 Cambridge (LNG)       [À FAIRE]  | |
| |               LNG (13)          | |     Échéance : 20h00 (Reste 4h12)                              +150 XP / 10 OC| |
| +---------------------------------+ +----------------------------------------------------------------------------+ |
|                                                                                                                   |
| +-- [PLANIFICATEUR DU JOUR : PROCHAIN BLOC] ----------------+ +-- [DERNIÈRE ÉVALUATION DE L'ARCHITECTE] ----------+ |
| | BLOC EN COURS : 14h00 - 16h00 (Deep Work Cybersécurité)   | | SUJET : Algorithmique des Graphes (Bellman-Ford)   | |
| | TEMPS RESTANT : 00:48:12                                  | | NOTE  : 19.1 / 20  [APPROUVÉ AVEC DISTINCTION]     | |
| | ACTION        : [MARQUER COMME TERMINÉ (+100 XP)]         | | FEEDBACK : "Démonstration solide du cycle absorbant" | |
| +-----------------------------------------------------------+ +----------------------------------------------------+ |
+-------------------------------------------------------------------------------------------------------------------+
```

#### 3.1.2 Spécification CSS Grid & Agencement
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  grid-template-rows: auto auto 1fr;
  gap: 20px;
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```

---

### 3.2 Écran 2 : Navigateur de l'Arbre de Compétences (`/skills` - Skill Tree)

Visualise les 120 compétences réparties sur les 8 bases fondamentales, avec représentation en graphe orienté acyclique (DAG).

#### 3.2.1 Wireframe ASCII (Détail de la Branche `AI_ENG`)
```
+-------------------------------------------------------------------------------------------------------------------+
|  [ARBRE DES COMPÉTENCES] > BRANCHE : INGIÉNERIE IA & HACKATHONS (AI_ENG)                  [POINTS XP DISPO: 850]   |
+-------------------------------------------------------------------------------------------------------------------+
|  [RETOUR TOUTES BASES]  |  FILTRES : [TIER 1] [TIER 2] [TIER 3] [TIER 4] [TIER 5]  |  RECHERCHE : [Faster-Whisper] |
+-------------------------------------------------------------------------------------------------------------------+
|                                                                                                                   |
|       [TIER 1 : FONDATIONS]              [TIER 2 : INTIATION SYSTÈMES]          [TIER 3 : SPÉCIALISATION AVANCÉE] |
|                                                                                                                   |
|   +--------------------------+       +-------------------------------+       +--------------------------------+   |
|   | [✓] AI_ENG_T1_PYTHON     | ----> | [✓] AI_ENG_T2_FASTER_WHISPER  | ----> | [!] AI_ENG_T3_LLM_FINE_TUNING  |   |
|   | Python 3.12 Moderne      |       | STT Local & CTranslate2 INT8  |       | LoRA, QLoRA, Axolotl & Unsloth |   |
|   | Niveau : 5/5 [MAX]       |       | Niveau : 3/5 [DÉBLOQUÉ]       |       | Requis : Rang C / 1200 XP      |   |
|   +--------------------------+       +-------------------------------+       +--------------------------------+   |
|                 |                                                                            |                    |
|                 v                                                                            v                    |
|   +--------------------------+                                               +--------------------------------+   |
|   | [✓] AI_ENG_T1_PYTORCH    | --------------------------------------------> | [LOCK] AI_ENG_T4_AGENTIC_ORCH  |   |
|   | Tensors, Autograd & CUDA |                                               | Multi-agents Antigravity/Dify  |   |
|   | Niveau : 5/5 [MAX]       |                                               | Requis : Rang B / Tier 3 validé|   |
|   +--------------------------+                                               +--------------------------------+   |
|                                                                                                                   |
+-------------------------------------------------------------------------------------------------------------------+
|  PANNEAU DÉTAIL SÉLECTIONNÉ : [AI_ENG_T2_FASTER_WHISPER]                                                           |
|  - Description : Déploiement et optimisation de modèles Speech-to-Text avec quantification INT8.                 |
|  - Coût Prochain Niveau : 250 XP AI_ENG                                                                           |
|  - Ressource Recommandée : Documentation Officielle SYSTRAN/faster-whisper (GitHub)                               |
|  - Action : [AMÉLIORER AU NIVEAU 4/5 (DÉPENSE 250 XP)]      [SOUMETTRE PROJET DE VALIDATION COMMIS GITHUB]        |
+-------------------------------------------------------------------------------------------------------------------+
```

---

### 3.3 Écran 3 : Journal des Quêtes & Alertes Système (`/quests`)

Affiche les 5 types de missions : Journalières, Urgentes, Boss Raids, Monk Mode et Pénalités.

#### 3.3.1 Wireframe ASCII de l'Alerte Quête Urgente (`EMERGENCY_QUEST_POPUP`)
Cette modale holographique rouge sang s'ouvre avec un son d'alarme retentissant :
```
+===================================================================================================================+
|                                  /!\ AVERTISSEMENT DU SYSTÈME : QUÊTE URGENTE /!\                                  |
+===================================================================================================================+
|                                                                                                                   |
|   TITRE        : [URGENCE VULNÉRABILITÉ] Détection Faille Critique sur Service Authentification                   |
|   STAT ASSOCIÉE: CYBER (Cybersécurité Offensive)                                                                 |
|   COMPTE À REBOURS : [ 00:58:32 ]  (Temps Limite Initial : 60 Minutes)                                            |
|                                                                                                                   |
|   INSTRUCTIONS DU SYSTÈME :                                                                                       |
|   Une vulnérabilité de type injection SQL / contournement de jeton a été signalée sur votre dépôt d'API.           |
|   Vous devez auditer le middleware de validation, écrire un test unitaire prouvant la correction,                 |
|   et soumettre le lien du commit GitHub avant expiration du décompte.                                             |
|                                                                                                                   |
|   RÉCOMPENSES DE RÉUSSITE :                                                                                       |
|   + 500 XP Joueur                                                                                                 |
|   + 750 XP Cybersécurité (CYBER)                                                                                  |
|   + 100 Cristaux d'Ombres                                                                                         |
|                                                                                                                   |
|   SANCTION EN CAS D'ÉCHEC :                                                                                       |
|   Activation immédiate de la Zone de Pénalité. Verrouillage des réseaux et distraction pendant 4 heures.          |
|                                                                                                                   |
|   SOUMISSION RAPIDE DE LA PREUVE :                                                                                |
|   Lien Commit GitHub : [ https://github.com/GeovanioH/LevelUp/commit/365eed2                            ]        |
|                                                                                                                   |
|                          [ SOUMETTRE LA PREUVE AU SYSTÈME MAINTENANT ]                                            |
|                                                                                                                   |
+===================================================================================================================+
```

---

### 3.4 Écran 4 : Planificateur Temporel & Emploi du Temps (`/planner`)

Gère la méthode du *Time-Blocking* strict pour garantir 8 à 10 heures de Deep Work sans dispersion.

#### 3.4.1 Wireframe ASCII (Vue Chronologique Verticale)
```
+-------------------------------------------------------------------------------------------------------------------+
|  [PLANIFICATEUR DU JOUR] - MERCREDI 11 NOVEMBRE 2026                 [STATUT DE RÉALISATION : 4 / 6 BLOCS - 66%]  |
+-------------------------------------------------------------------------------------------------------------------+
|  [< HIER]  [AUJOURD'HUI]  [DEMAIN >]  |  VUE : [JOUR] [SEMAINE]  |  ACTION : [+ CRÉER NOUVEAU BLOC HORAIRE]       |
+-------------------------------------------------------------------------------------------------------------------+
|  06:00 - 06:30 | [RÉVEIL & HYDRATATION]             | HP Check-in & Synthèse vocale matinale     | [✓ COMPLÉTÉ]   |
|  06:30 - 07:30 | [SPORT SUNG JIN-WOO] (STR)          | 100 Pompes, 100 Abdos, Squats, Étirements  | [✓ COMPLÉTÉ]   |
|  07:30 - 08:30 | [PETIT-DÉJEUNER & DOUCHE FROIDE]   | Repos passif & Préparation mentale         | [✓ COMPLÉTÉ]   |
|----------------+------------------------------------+--------------------------------------------+----------------|
|  08:30 - 11:30 | [DEEP WORK IA : TRANSFORMERS] (AI) | Étude Faster-Whisper, CTranslate2 & INT8   | [✓ COMPLÉTÉ]   |
|----------------+------------------------------------+--------------------------------------------+----------------|
|  11:30 - 12:30 | [PAUSE DÉJEUNER & MARCHE]          | Restauration Jauge MP (+15 MP)             | [EN COURS >>>] |
|----------------+------------------------------------+--------------------------------------------+----------------|
|  12:30 - 13:00 | [DICTÉE VOCALE & SYNTHÈSE] (ACAD)  | Monologue de restitution pour l'Architecte | [À VENIR]      |
|  13:00 - 16:00 | [CYBERSÉCURITÉ / HACKATHON] (CYBER)| 1 Room Medium THM (Buffer Overflow)        | [À VENIR]      |
|  16:00 - 16:30 | [PAUSE THÉ & ÉTIREMENTS]           | Détente cognitive                          | [À VENIR]      |
|  16:30 - 18:00 | [PRATIQUE ANGLAIS C1] (LNG)        | Listening Cambridge & Speaking Monologue   | [À VENIR]      |
|  18:00 - 20:00 | [PROJET PERSONNEL MVP / DEV] (AI)  | Développement du HUD Web LevelUp           | [À VENIR]      |
|  20:00 - 21:00 | [DÎNER & LECTURE LIVRE]            | Pas d'écran (Livre papier IA / Phychologie)| [À VENIR]      |
|  21:00 - 22:00 | [BILAN DU SOIR & CLÔTURE]          | Revue des quêtes, validation & extinction  | [À VENIR]      |
+-------------------------------------------------------------------------------------------------------------------+
```

---

### 3.5 Écran 5 : Cerveau Numérique & Coffre Markdown (`/notes`)

Écran scindé en deux colonnes inspiré d'Obsidian : navigateur de graphe et fiches à gauche, éditeur Markdown avec prévisualisation KaTeX à droite.

#### 3.5.1 Wireframe ASCII (Double Panneau)
```
+-------------------------------------------------------------------------------------------------------------------+
|  [CERVEAU NUMÉRIQUE // SECOND BRAIN]  [VAULT: 1,420 NOTES]  [RECHERCHE: "attention mechanism"]   [NOUVELLE NOTE +] |
+----------------------------------------------------+--------------------------------------------------------------+
| ARBORESCENCE DU COFFRE-FORT :                      | ÉDITEUR : /vault/AI_ENG/mecanismes-attention-transformers.md |
| v vault/                                           |--------------------------------------------------------------|
|   > ACAD/ (340 notes)                              | # Mécanismes d'Attention Multi-Têtes & Transformers          |
|   v AI_ENG/ (512 notes)                            |                                                              |
|     - architecture-gpt.md                          | L'attention mise à l'échelle (*Scaled Dot-Product*) s'écrit: |
|     * mecanismes-attention-transformers.md         |                                                              |
|     - optimisation-ctranslate2.md                  | $$\text{Attention}(Q, K, V) = \text{softmax}\left(           |
|     - quantization-int8-llm.md                     |   \frac{QK^T}{\sqrt{d_k}}                                    |
|   > CYBER/ (215 notes)                             | \right) V$$                                                  |
|   > LNG/ (180 notes)                               |                                                              |
|   > STR/ (95 notes)                                | ## Propriétés Critiques :                                    |
|                                                    | 1. Le facteur de division $\sqrt{d_k}$ évite la saturation   |
| GRAPHE DES CONNEXIONS LOCALES :                    |    du softmax pour les dimensions élevées.                   |
|       [architecture-gpt]                           | 2. Connecté aux concepts de :                                |
|               ^                                    |    - [[optimisation-ctranslate2]]                            |
|               |                                    |    - [[quantization-int8-llm]]                               |
| [mecanismes-attention] <---> [quantization-int8]   |                                                              |
|               |                                    | [STATUT : ENREGISTRÉ DANS POSTGRES & SYNC AVEC OBSIDIAN]    |
+----------------------------------------------------+--------------------------------------------------------------+
```

---

### 3.6 Écran 6 : Hub Audio & Évaluation Socratique (`/audio`)

Interface dédiée à l'enregistrement des monologues de révision et à l'affichage des retours sans appel de l'Architecte.

#### 3.6.1 Wireframe ASCII (Visualiseur Audio & Carte de Notation)
```
+-------------------------------------------------------------------------------------------------------------------+
|  [STATION D'ENREGISTREMENT VOCAL // SÉANCE DE RESTITUTION SOCRATIQUE]                       [MICRO: YETI PRO - ACTIF]|
+-------------------------------------------------------------------------------------------------------------------+
|                                                                                                                   |
|   SÉLECTION DE LA MATIÈRE ÉVALUÉE : [ AI_ENG : Intelligence Artificielle & Deep Learning      v ]                |
|   SUJET DU MONOLOGUE ORAL         : [ Quantification de Poids INT8 & Moteur CTranslate2         ]                 |
|                                                                                                                   |
|   VISUALISEUR SPECTRAL TEMPS RÉEL (WEB AUDIO API - 64 BACS FFT) :                                                 |
|   [ 02:45 / 05:00 ]   ██ ▄█ █▄ █▄ ██ ▄█ █▄ █▄ ██ ▄█ █▄ █▄ ██ ▄█ █▄ █▄ ██ ▄█ █▄ █▄ ██ ▄█ █▄ █▄                     |
|                                                                                                                   |
|                       [ (ARRÊTER & LANCER L'ÉVALUATION DE L'ARCHITECTE) ]                                         |
|                                                                                                                   |
+-------------------------------------------------------------------------------------------------------------------+
|  [RÉSULTAT DE L'ÉVALUATION RENDU PAR L'ARCHITECTE DU SYSTÈME]                                                     |
|                                                                                                                   |
|   NOTE FINALE : [ 18.5 / 20 ]   |   STATUT : [APPROUVÉ AVEC LES FÉLICITATIONS DE L'ARCHITECTE]                     |
|                                                                                                                   |
|   DÉTAIL DE LA GRILLE D'ÉVALUATION :                                                                              |
|   - Exactitude Scientifique & Profondeur      : 5.5 / 6.0  (Détail précis du mapping symétrique [-127, 127])      |
|   - Structure Logique & Clarté d'Exposition   : 4.8 / 5.0  (Excellente transition du FP16 vers les blocs INT8)     |
|   - Vocabulaire Technique & Terminologie Élite : 4.0 / 4.0  (Zero-point, scale factor, GEMM kernels maîtrisés)     |
|   - Application Pratique & Cas Réel           : 4.2 / 5.0  (Réduction d'empreinte mémoire mesurée sur RTX 4070)    |
|                                                                                                                   |
|   COMMENTAIRE HOLOGRAPHIQUE DE L'ARCHITECTE :                                                                     |
|   "Votre compréhension de la quantification INT8 sur CTranslate2 est remarquable. Le compromis précision/vitesse  |
|   a été rigoureusement quantifié. Continuez ainsi pour atteindre le rang d'Ingénieur d'Élite."                    |
|                                                                                                                   |
|   RÉCOMPENSES ATTRIBUÉES : +185 XP Joueur | +230 XP AI_ENG | +20 Cristaux d'Ombres                                |
|   FICHE AUTOMATIQUE CRÉÉE DANS : /vault/AI_ENG/quantification-int8-ctranslate2-monologue.md                       |
+-------------------------------------------------------------------------------------------------------------------+
```

---

### 3.7 Écran 7 : Portail Bourses, Hackathons & Opportunités Deerflow (`/opportunities`)

Affiche le flux d'opportunités financières et académiques glanées par le scraper.

#### 3.7.1 Wireframe ASCII (Grille Kanban de Suivi des Candidatures)
```
+-------------------------------------------------------------------------------------------------------------------+
|  [VEILLE INTELLIGENTE DEERFLOW]  [BOURSES & HACKATHONS DÉTECTÉS: 14]                       [VALEUR TOTALE: 48,000 €]|
+-------------------------------------------------------------------------------------------------------------------+
|  FILTRES : [TOUTES] [BOURSES EXCELLENCE] [HACKATHONS IA] [CERTIFICATIONS GRATUITES]  | TRI : [DATE ÉCHÉANCE v]     |
+-----------------------------------+-----------------------------------+-------------------------------------------+
| [NOUVELLES OPPORTUNITÉS DÉTECTÉES]| [DOSSIERS EN COURS DE RÉDACTION]  | [CANDIDATURES SOUMISES & EN ATTENTE]      |
|-----------------------------------|-----------------------------------|-------------------------------------------|
| [BOURSE] Bourse Eiffel Master IA  | [HACKATHON] Devpost Global Agentic| [CERTIF] Cambridge Linguaskill C1/C2      |
| - Valeur   : 14,000 €             | - Prix     : 25,000 $ en cloud    | - Statut : Examen passé le 02/11          |
| - Échéance : 10 Janvier 2027      | - Échéance : 30 Novembre 2026     | - Résultat: Attestation C1 confirmée      |
| - Pertinence : 96.5%              | - Équipe   : Huriel (Solo)        | - Action  : [IMPORTER DIPLÔME VALIDÉ]     |
| - Action   : [CRÉER QUÊTE DOSSIER]| - Action   : [VOIR BLOCS TIME-BOX]|                                           |
|-----------------------------------|-----------------------------------|-------------------------------------------|
| [BOURSE] Bourse Mobilité Région   |                                   |                                           |
| - Valeur   : 3,600 €              |                                   |                                           |
| - Échéance : 28 Février 2027      |                                   |                                           |
| - Action   : [POSTULER EN LIGNE]  |                                   |                                           |
+-----------------------------------+-----------------------------------+-------------------------------------------+
```

---

### 3.8 Écran 8 : La Boutique des Ombres (`/shop` - Shadow Shop)

Lieu où le joueur convertit ses Cristaux d'Ombres durement acquis en récompenses matérielles et privilèges tangibles.

#### 3.8.1 Wireframe ASCII (Catalogue des Récompenses)
```
+-------------------------------------------------------------------------------------------------------------------+
|  [LA BOUTIQUE DES OMBRES // SHADOW SHOP]                                      [VOTRE SOLDE ACTUEL : 820 CRISTAUX] |
+-------------------------------------------------------------------------------------------------------------------+
|  CATÉGORIES : [TOUT LE CATALOGUE]  [OUTILS & ABONNEMENTS IA]  [ÉQUIPEMENT PHYSIQUE]  [RÉCOMPENSES DE PRESTIGE]    |
+-------------------------------------------------------------------------------------------------------------------+
|                                                                                                                   |
|  +--------------------------------+ +--------------------------------+ +--------------------------------+         |
|  | [OUTIL IA]                     | | [MATÉRIEL ÉTUDE]               | | [PRESTIGE ÉLITE]               |         |
|  | Abonnement 1 Mois Claude Pro   | | Liseuse Kindle Paperwhite      | | Écran 4K Dell UltraSharp 32"   |         |
|  | Pour calculs d'agents LLM.     | | Lecture technique sans reflet. | | Hub productivité multi-écrans. |         |
|  | Coût : 450 Cristaux d'Ombres   | | Coût : 2,500 Cristaux d'Ombres | | Coût : 9,000 Cristaux d'Ombres |         |
|  | Rang Requis : Rang E           | | Rang Requis : Rang C           | | Rang Requis : Rang A           |         |
|  |                                | |                                | |                                |         |
|  | [ DÉBLOQUER L'ARTICLE (450 OC)]| | [ VERROUILLÉ (RANG C REQUIS) ] | | [ CRISTAUX INSUFFISANTS ]      |         |
|  +--------------------------------+ +--------------------------------+ +--------------------------------+         |
|                                                                                                                   |
+-------------------------------------------------------------------------------------------------------------------+
|  HISTORIQUE DES TRANSACTIONS RÉCENTES :                                                                           |
|  - 05/11/2026 : Achat Clavier Mécanique Ergonomique (-1,800 Cristaux) -> [CODE RETRAIT ACTIVÉ : LVL-KYB-8910]    |
|  - 28/10/2026 : Achat Crédits Inférence RunPod Cloud (-300 Cristaux) -> [CRÉDITÉ DIRECTEMENT SUR COMPTE]        |
+-------------------------------------------------------------------------------------------------------------------+
```

---

### 3.9 Écran 9 : Écran de Verrouillage de Pénalité (`/penalty` - Penalty Zone)

Cet écran plein écran rouge sang bloque totalement l'accès aux autres pages tant que la pénalité n'est pas purgée.

#### 3.9.1 Wireframe ASCII (Zone de Pénalité Active)
```
+===================================================================================================================+
|                                                                                                                   |
|                   [!] AVERTISSEMENT : VOUS ÊTES ENTRÉ DANS LA ZONE DE PÉNALITÉ [!]                                |
|                                                                                                                   |
|                                        TEMPS RESTANT AVANT PURGE :                                                |
|                                             [ 03:42:15 ]                                                          |
|                                                                                                                   |
|   MOTIF DE LA SANCTION :                                                                                          |
|   Échec de complétion de la Quête Journalière obligatoire [DAILY_FIT_100_CORPS] avant l'heure fatidique de 22h00. |
|                                                                                                                   |
|   ÉTAT DU DISPOSITIF DE VERROUILLAGE :                                                                            |
|   - Pare-feu Réseau Local (Hosts Windows) : ACTIVÉ (TikTok, Instagram, Netflix, YouTube Shorts inaccessibles).    |
|   - Interface HUD LevelUp                 : VERROUILLÉE (Accès aux notes et récompenses suspendu).                |
|                                                                                                                   |
|   QUÊTE UNIQUE DE SURVIE POUR DÉBLOQUER LE SYSTÈME :                                                             |
|   +-----------------------------------------------------------------------------------------------------------+   |
|   | [QUÊTE DE PÉNALITÉ : LA TRAVERSÉE DU DÉSERT DES CENTIPÈDES]                                               |   |
|   | Exécuter immédiatement l'une des deux épreuves de rachat :                                                |   |
|   |   Option A : 400 Pompes militaires strictes réparties en séries validées par capteur.                     |   |
|   |   Option B : Marche nocturne active de 10 kilomètres en continu (preuve GPS / podomètre).                 |   |
|   |                                                                                                           |   |
|   | [ SOUMETTRE LA PREUVE DE SURVIE POUR PURGER LA PÉNALITÉ ]                                                 |   |
|   +-----------------------------------------------------------------------------------------------------------+   |
|                                                                                                                   |
+===================================================================================================================+
```

---

### 3.10 Écran 10 : Salle d'Entraînement & Vision par Ordinateur (`/workout/camera`)

L'écran `/workout/camera` est l'arène physique du Chasseur. Il utilise le flux vidéo webcam/smartphone en direct avec superposition du squelette cinématique MediaPipe Pose en WebAssembly (WebGL/Canvas 2D) pour compter et valider sans triche chaque répétition des routines de callisthénie d'Huriel :

#### 3.10.1 Wireframe ASCII Détaillé (Vue Entraînement en Direct 1440x900)

```text
+----------------------------------------------------------------------------------------------------------------------------------+
| LEVELUP HUD // SALLE D'ENTRAÎNEMENT DU MONARQUE — VISION PAR ORDINATEUR ACTIVE (60 FPS)                 [DISCORD BOT : CONNECTÉ] |
+----------------------------------------------------------------------------------------------------------------------------------+
| [ROUTINE ACTIVE : DOS & ÉPAULES — ÉTAPE 3/17 : PIKE PUSH-UPS]                                         [TEMPS ÉCOULÉ : 04:15]     |
+-----------------------------------------------------------------------+----------------------------------------------------------+
|                                                                       | PROGRAMME DU JOUR : DOS & ÉPAULES                        |
|                                                                       +----------------------------------------------------------+
|                 FLUX VIDÉO WEBCAM DIRECT (WEBRTC/CANVAS)              |  1. [x] Jumping Jacks : 00:30 (Validé)                   |
|                                                                       |  2. [x] Hyperextension : 14 reps (Validé)                |
|                    o  [Tête : Point 0]                                | >3. [ ] Pike Push-Ups : 14 reps [EN COURS : 8/14] <      |
|                   /|\                                                 |  4. [ ] Reverse Push-Ups : 12 reps                       |
|          [11] o----o----o [12] Épaules                                |  5. [ ] Inchworms : 16 reps                              |
|              /     |     \                                            |  6. [ ] Side-Lying Floor Stretch G : 00:30               |
|       [13]  o      |      o  [14] Coudes                              |  7. [ ] Side-Lying Floor Stretch D : 00:30               |
|            /       |       \                                          |  8. [ ] Hyperextension : 12 reps                         |
|     [15]  o        |        o  [16] Poignets                          |  9. [ ] Pike Push-Ups : 12 reps                         |
|                    |                                                  | 10. [ ] Reverse Push-Ups : 10 reps                       |
|               [23] o----o [24] Hanches                                | 11. [ ] Inchworms : 14 reps                              |
|                   /      \                                            | 12. [ ] Cat Cow Pose : 00:35                             |
|                  /        \                                           | 13. [ ] Supine Push Up : 14 reps                         |
|            [25] o          o [26] Genoux                              | 14. [ ] Floor Y Raises : 14 reps                         |
|                /            \                                         | 15. [ ] Supine Push Up : 13 reps                         |
|               /              \                                        | 16. [ ] Reverse Snow Angels : 12 reps                    |
|         [27] o                o [28] Chevilles                        | 17. [ ] Child's Pose : 00:30                             |
|                                                                       +----------------------------------------------------------+
|  [ANGLE COUDE GAUCHE : 72° (VALIDÉ)]  [ÉTAT FSM : CONTRACTION PIC]    | CADENCE CARDIO-RESPIRATOIRE : 138 BPM                    |
|  AMPLITUDE REQUISE : <= 75° (BAS) -> >= 160° (HAUT)                   | VITALITÉ BIOLOGIQUE (HP) : 96%                           |
|  RÉPÉTITIONS DÉTECTÉES PAR CV : [ 08 / 14 ]                           | FOCUS COGNITIF (MP) : 94%                                |
+-----------------------------------------------------------------------+----------------------------------------------------------+
| [BOUTON : METTRE EN PAUSE (ESPACE)]   [BOUTON : CHANGER DE ROUTINE]   [BOUTON : BASCULER CAMÉRA]   [BOUTON : VALIDER LA SÉANCE]   |
+----------------------------------------------------------------------------------------------------------------------------------+
```

#### 3.10.2 Routines Pré-configurées dans le Moteur de Vision :
1. **Routine Dos & Épaules (17 Étapes) :**
   Suivi séquentiel avec alternance automatique de chronomètres pour les étirements et poses (Jumping Jacks 30s, Side-Lying L/R 30s, Cat Cow 35s, Child's Pose 30s) et de compteurs de répétitions cinématiques pour les exercices de force (Hyperextensions, Pike Push-Ups, Reverse Push-Ups, Inchworms, Supine Push-Ups, Floor Y Raises, Reverse Snow Angels).
2. **Routine Bras & Triceps Calisthenics (@giovanni_fiderio) :**
   Mode "Échec Postural Strict" : le compteur incrémente chaque répétition jusqu'à dégradation de l'amplitude minimale ($	heta_{\text{coude}} > 85^\circ$ en descente ou arrêt prolongé $> 4\text{ s}$). Les 6 variantes sont enchaînées en 3 séries chacune : Push-Ups classiques, Decline (pieds surélevés), Diamond (mains en losange), Pike, Wide (prise large), Tricep Cross Extensions au sol.
3. **Routine Abdos & Core d'Acier (@lou4n.ldlm) :**
   Contrôle de l'angle d'élévation du bassin et des jambes (V-Up 3x10, Relevé de jambes 3x12) et chronomètre isométrique avec détection de tremblement/effondrement du bassin pour le Gainage classique (2x1m30) et le Gainage latéral (2x45s chaque côté).


## 4. Spécifications Exhaustives des 15 Embeds Discord (`discord/embedTemplates.ts`)

Pour offrir une expérience fluide sur smartphone via Discord, chaque événement majeur génère un embed richement formaté avec les couleurs officielles de Solo Leveling :

---

### 4.1 Embed 1 : Rapport d'État du Joueur (`/status`)
* **Couleur :** `0x00E5FF` (Cyan Néon)
* **Titre :** `[SYSTÈME // RAPPORT D'ÉTAT DU JOUEUR]`
* **Champs :**
  * `Chasseur` : `Huriel | Rang D | Niveau 14`
  * `Points d'Expérience` : `18,450 / 22,500 XP (82.0% vers Rang C)`
  * `Jauges Vitales` :
    * `HP` : `[████████████████░░] 88 / 100 (Repos Optimal)`
    * `MP` : `[████████████░░░░░░] 65 / 100 (Focus Soutenu)`
  * `Cristaux d'Ombres` : `820 ❖`
  * `Série Active (Streak)` : `18 Jours consécutifs`
  * `Statistiques Majeures` :
    * `ACAD : Lvl 15 (Major Prétendant)` | `AI_ENG : Lvl 16 (Architecte IA)`
    * `CYBER : Lvl 12 (Opérateur THM)`    | `DIS : Lvl 17 (Monk Mode)`
* **Pied de page :** `The System • Solo Leveling Engine • Horodatage UTC`

---

### 4.2 Embed 2 : Briefing Matinal des Quêtes Journalières (07h00)
* **Couleur :** `0x0051FF` (Bleu d'Ombre)
* **Titre :** `[NOUVELLES QUÊTES JOURNALIÈRES ATTRIBUÉES]`
* **Description :** *"Un nouveau jour d'entraînement commence. Vos quêtes quotidiennes ont été générées par le Système."*
* **Champs :**
  * `1. [STR] L'Entraînement de Sung Jin-Woo` : `100 Pompes, 100 Abdos, 100 Squats, 10 km. (+200 XP, 15 ❖)`
  * `2. [CYBER] Infiltration TryHackMe` : `Compléter 1 Room Medium et extraire le flag. (+180 XP, 20 ❖)`
  * `3. [LNG] Monologue Anglais C1` : `Pratique orale de 3 minutes sur sujet tech. (+150 XP, 10 ❖)`
* **Composants d'Action :**
  * Bouton Vert : `[Accepter Toutes les Quêtes]`
  * Bouton Bleu : `[Consulter le Planning du Jour]`

---

### 4.3 Embed 3 : Alerte Rouge Quête Urgente (`EMERGENCY_QUEST`)
* **Couleur :** `0xFF003C` (Rouge Alerte Écarlate)
* **Titre :** `⚠️ [AVERTISSEMENT : QUÊTE URGENTE APPARUE] ⚠️`
* **Description :** `Une situation imprévue nécessite votre intervention immédiate.`
* **Champs :**
  * `Mission` : `Audit de Vulnérabilité Zero-Day sur Middleware Auth`
  * `Temps Imparti` : `60 Minutes Chrono (Fin à 16h30)`
  * `Récompense` : `+500 XP Joueur | +750 XP CYBER | +100 Cristaux d'Ombres`
  * `Sanction d'Échec` : `Activation immédiate de la Zone de Pénalité.`
* **Composants d'Action :**
  * Bouton Rouge : `[Soumettre la Preuve du Commit]`

---

### 4.4 Embed 4 : Victoire et Montée de Niveau (`LEVEL_UP`)
* **Couleur :** `0xFFD700` (Or Éclatant)
* **Titre :** `⚡ [LEVEL UP // ÉVEIL DU CHASSEUR] ⚡`
* **Description :** `Vos capacités ont atteint un nouveau seuil de puissance.`
* **Champs :**
  * `Niveau Précédent` : `14` $\rightarrow$ **`Nouveau Niveau : 15`**
  * `Titre Débloqué` : `« Élite des Ombres »`
  * `Points de Caractéristique Gagnés` : `+5 Points à attribuer`
  * `Nouvelles Compétences Accessibles` : `AI_ENG_T3_LLM_FINE_TUNING, CYBER_T3_KERNEL_EXPLOITATION`
* **Image Miniature :** `https://assets.levelup.local/badges/level_up_jinwoo.png`

---

### 4.5 Embed 5 : Déclenchement de la Zone de Pénalité (`PENALTY_ALERT`)
* **Couleur :** `0x800000` (Bordeaux Sang Sombre)
* **Titre :** `☠️ [ZONE DE PÉNALITÉ ACTIVÉE] ☠️`
* **Description :** `Vous avez échoué à valider vos quêtes journalières avant 22h00. Le Système applique les sanctions prévues.`
* **Champs :**
  * `Durée de la Pénalité` : `4 Heures (Compte à rebours en cours)`
  * `Restrictions Appliquées` : `Pare-feu actif sur les réseaux sociaux et loisirs numériques.`
  * `Épreuve de Rachat` : `400 Pompes ou 10 km de marche active avant levée des restrictions.`
* **Pied de page :** `Le Système ne tolère aucune complaisance.`

---

### 4.6 Embed 6 : Évaluation de Dictée Vocale par l'Architecte
* **Couleur :** `0x00E5FF` (Cyan Socratique)
* **Titre :** `🎙️ [VERDICT DE L'ARCHITECTE // ÉVALUATION ORALE]`
* **Champs :**
  * `Sujet Analysé` : `Algorithmique des Graphes (Bellman-Ford & Dijkstra)`
  * `Note Obtenue` : **`19.1 / 20 [EXCELLENCE AVÉRÉE]`**
  * `Points Forts Identifiés` : `Démonstration rigoureuse, cas des cycles absorbants correctement explicité.`
  * `Axes d'Amélioration` : `Consulter l'optimisation SPFA (Shortest Path Faster Algorithm).`
  * `Récompense Accordée` : `+190 XP ACAD | +19 Cristaux`
  * `Fiche Sauvegardée` : `/vault/ACAD/bellman-ford-monologue.md`

---

### 4.7 Embed 7 : Alerte Opportunité Détectée par Deerflow
* **Couleur :** `0x10B981` (Vert Émeraude Bourse)
* **Titre :** `💎 [OPPORTUNITÉ ÉLITE DÉTECTÉE PAR DEERFLOW]`
* **Champs :**
  * `Programme` : `Bourses d'Excellence Eiffel 2027 (Master IA)`
  * `Organisme` : `Campus France`
  * `Montant Estimé` : `14 000 € (Allocation mensuelle + Voyage pris en charge)`
  * `Date Limite` : `10 Janvier 2027 (Dans 60 jours)`
  * `Score de Pertinence` : `96.5% (Adéquation totale avec votre profil académique)`
* **Composants d'Action :**
  * Bouton Vert : `[Créer une Quête de Candidature]`
  * Bouton Gris : `[Ouvrir le Dossier Officiel]`

---

### 4.8 Embed 8 : Boss Raid Débloqué (`BOSS_RAID_ANNOUNCEMENT`)
* **Couleur :** `0x9333EA` (Violet Obscur Donjon)
* **Titre :** `👹 [OUVERTURE D'UN DONJON DE RANG D // BOSS RAID]`
* **Champs :**
  * `Boss de Raid` : `« Le Gardien du Code Impur » (Hackathon IA 48h)`
  * `Points de Vie du Boss` : `[████████████████████] 100,000 HP`
  * `Condition de Victoire` : `Déployer un MVP fonctionnel d'agent IA avec README et démo vidéo.`
  * `Butin de Victoire` : `+2,500 XP Joueur | +500 Cristaux | Titre « Tombeur de Boss »`
* **Composants d'Action :**
  * Bouton Violet : `[Entrer dans le Donjon]`

---

### 4.9 Embed 9 : Notification d'Achat dans la Boutique des Ombres
* **Couleur :** `0xF59E0B` (Ambre Récompense)
* **Titre :** `🛍️ [ACQUISITION VALIDÉE // BOUTIQUE DES OMBRES]`
* **Champs :**
  * `Objet Acheté` : `Abonnement 1 Mois Claude Pro / Antigravity Cloud`
  * `Cristaux Débités` : `-450 ❖`
  * `Solde Restant` : `370 ❖`
  * `Instructions de Livraison` : `Le code de licence a été envoyé en message privé chiffré.`

---

### 4.10 Embed 10 : Rapport Hebdomadaire de Performance (Dimanche 21h00)
* **Couleur :** `0x3B82F6` (Bleu Royal Bilan)
* **Titre :** `📊 [BILAN HEBDOMADAIRE DU MONARQUE]`
* **Champs :**
  * `Heures de Deep Work Totales` : `54.5 Heures (Moyenne : 7.8 h/j)`
  * `Quêtes Complétées` : `28 / 28 (Taux de complétion : 100%)`
  * `XP Totale Engrangée` : `+4,850 XP cette semaine`
  * `Base la Plus Développée` : `AI_ENG (+1,450 XP)`
  * `Verdict de l'Architecte` : `« Rythme exemplaire. La discipline forge la puissance. »`

---

### 4.11 Embed 11 : Rappel de Fin de Bloc Horaire (Gong d'Alarme)
* **Couleur :** `0x06B6D4` (Cyan Alarme)
* **Titre :** `⏰ [FIN DE BLOC HORAIRE // RECONFIGURATION DU FOCUS]`
* **Champs :**
  * `Bloc Terminé` : `Deep Work IA — Faster-Whisper (08h30 - 11h30)`
  * `Prochain Bloc` : `Pause Déjeuner & Marche Active (11h30 - 12h30)`
  * `Action Requise` : `Validez votre bloc pour créditer vos +100 XP AI_ENG.`

---

### 4.12 Embed 12 : Levée de la Pénalité (`PENALTY_CLEARED`)
* **Couleur :** `0x10B981` (Vert Libération)
* **Titre :** `🛡️ [PÉNALITÉ PURGÉE AVEC SUCCÈS]`
* **Description :** `Les 400 pompes ont été certifiées. Le pare-feu réseau a été désarmé. Vos accès complets sont restaurés.`
* **Pied de page :** `Ne retombez plus dans la complaisance.`

---

### 4.13 Embed 13 : Validation d'un Nouveau Nœud de Compétence
* **Couleur :** `0x8B5CF6` (Violet Compétence)
* **Titre :** `✨ [COMPÉTENCE DÉBLOQUÉE // ARBRE DE POUVOIR]`
* **Champs :**
  * `Compétence` : `Moteurs STT Locaux & Inférence CTranslate2 (Tier 2)`
  * `Base Boostée` : `AI_ENG (+200 XP Déduits)`
  * `Nouveau Statut` : `Niveau 4/5 Atteint`

---

### 4.14 Embed 14 : Régulation Circadienne & Vitalité Biologique Souveraine (`VITALITY_STATUS`)

Dans LevelUp, le Système n'infantilise jamais le Chasseur et ne le décrit jamais comme faible ou fatigué. Le message matinal valorise sa résilience et réaligne ses priorités physiologiques :

```typescript
export const createVitalityStatusEmbed = (hoursSlept: number, hp: number, mp: number): APIEmbed => {
  return {
    title: '🛡️ RAPPORT DE VITALITÉ BIOLOGIQUE // ÉTAT DU CHASSEUR',
    description: `**Résilience Biologique :** \`${hp}%\` | **Focus Cognitif :** \`${mp}%\`
` +
      `Le Système a synchronisé vos rythmes circadiens selon le modèle de Borbély. Votre détermination reste inaltérable.

` +
      `> *"La véritable force ne réside pas dans l'absence d'obstacles, mais dans l'inébranlable volonté de les surmonter avec lucidité."*`,
    color: 0x0EA5E9,
    fields: [
      { name: 'Sommeil Enregistré', value: `${hoursSlept.toFixed(1)} heures`, inline: true },
      { name: 'Pression Homéostatique (Processus S)', value: 'Clairance Optimale', inline: true },
      { name: 'Recommandation Stratégique', value: 'Hydratation immédiate (500 ml) + Routine physique validée par caméra avant midi.', inline: false }
    ],
    footer: { text: 'LevelUp Core System // Physiologie de Haute Performance' },
    timestamp: new Date().toISOString()
  };
};
```

## 4.15 Embed 15 : Message d'Accompagnement de l'Architecte (Conseil Tactique)
* **Couleur :** `0x64748B` (Ardoise Réflexion)
* **Titre :** `💬 [TRANSMISSION DIRECTE DE L'ARCHITECTE]`
* **Description :** *"La fatigue que vous ressentez n'est que la résistance de votre ancien moi face à l'éveil de votre potentiel. Maintenez le cap pour la session de cet après-midi."*

---

## 5. Micro-Interactions, Chorégraphie Sonore & Directives d'Accessibilité (WCAG 2.1 AA)

### 5.1 Courbes d'Animation Bézier & Rythmique Holographique
Toutes les transitions du Web HUD utilisent la fonction d'amortissement caractéristique de la haute technologie réactive :
```css
/* Courbe d'ouverture holographique Solo Leveling */
--ease-solo-leveling: cubic-bezier(0.16, 1, 0.3, 1);
```

#### Échelle des Durées :
* **Interactions Micro (Survol, Clic bouton) :** `150 ms`
* **Ouverture Modale / Drawer latéral :** `300 ms`
* **Célébration Level Up / Fanfare visuelle :** `2 500 ms`
* **Compte à rebours Quête Urgente (Pulsation liseré rouge) :** Cycle infini de `1 200 ms`

### 5.2 Correspondance Événements Visuels et Effets Sonores

| Événement Système | Animation Visuelle associée | Déclencheur Sonore Procédural |
| :--- | :--- | :--- |
| **Clic de Validation de Quête** | Éclatement de 24 particules d'Ombre cyan | Sonore `playSystemChime()` (Carillon cristallin 1318 Hz) |
| **Passage de Niveau (Level Up)** | Flash blanc plein écran (100 ms) + Halo doré | Sonore `playLevelUpFanfare()` (Accord Do Majeur cuivré) |
| **Apparition Quête Urgente** | Vibreur d'écran (Shake 8px) + Liseré rouge pulsant | Alarme grave descendante (440 Hz vers 220 Hz) |
| **Échéance d'un Bloc Horaire** | Cadre du bloc clignotant en orange | Gong discret de fin de session (392 Hz) |
| **Saisie de Dictée Vocale** | Barres spectrales réactives au volume sonore | Aucun (Microphone prioritaire) |

### 5.3 Raccourcis Clavier Maîtres (Power User Shortcuts)

| Raccourci Clavier | Action Associée dans le Web HUD |
| :--- | :--- |
| `Ctrl + Espace` | Ouvre immédiatement la modale de dictée vocale rapide. |
| `Ctrl + K` | Ouvre la barre de recherche universelle (Notes, Quêtes, Compétences). |
| `Ctrl + D` | Navigue instantanément vers le Tableau de Bord Principal (`/dashboard`). |
| `Ctrl + P` | Ouvre le Planificateur Temporel (`/planner`). |
| `Ctrl + Shift + Q` | Valide la quête active courante sans utiliser la souris. |
| `Ctrl + M` | Bascule instantanément entre le Thème Sombre Monarque et le Thème Clair Éveil. |

### 5.4 Matrice d'Accessibilité Universelle (WCAG 2.1 AA)
1. **Contraste Chromatique Minimal :** Le texte principal (`#FFFFFF`) sur fond abyssal (`#05050A`) présente un ratio de contraste de **18.5:1** (largement supérieur à l'exigence de 4.5:1 du niveau AA).
2. **Support Total du Lecteur d'Écran :** Chaque jauge vitale comporte les attributs `role="progressbar"`, `aria-valuenow="88"`, `aria-valuemin="0"`, `aria-valuemax="100"` et `aria-label="Points de vie biologiques"`.
3. **Respect du Mode Sans Mouvement (`prefers-reduced-motion`) :** Les utilisateurs sensibles aux effets visuels rapides voient les shaders de particules et les vibrations désactivés automatiquement.

---

## 6. Spécification Détaillée des Écrans Mobile PWA (Wireframes Dédiés 375x812)

L'utilisation sur smartphone (iPhone & Android) est au cœur des habitudes de vie du joueur. L'ensemble des 9 écrans est optimisé pour une navigation tactile au pouce (*Thumb Zone Ergonomics*) avec barre de navigation inférieure fixe.

---

### 6.1 Mobile Screen 1 : Tableau de Bord Mobile (`/dashboard`)
```
+---------------------------------------+
| [LEVELUP]     [820 ❖]  [HP 88%] [D/L] |
+---------------------------------------+
| Huriel • Rang D (Lvl 14)              |
| XP: [████████████████░░░░] 82%        |
|---------------------------------------|
| JAUGES VITALES :                      |
| HP [██████████████████░░] 88%         |
| MP [█████████████░░░░░░░] 65%         |
|---------------------------------------|
| RADAR DES 8 BASES :                   |
|   ACAD: 15 | AI_ENG: 16 | CYBER: 12   |
|   EXP:  11 | LNG:    13 | FIN:   10   |
|   STR:  14 | DIS:    17               |
|---------------------------------------|
| QUÊTES DU JOUR (2 RESTANTES) :        |
| [!] L'Entraînement de Sung Jin-Woo    |
|     100 Pompes / Abdos / Squats / 10k |
|     [ SOUMETTRE PREUVE RAPIDE ]       |
|                                       |
| [✓] Infiltration Room TryHackMe       |
|     Validation : +180 XP (Validé)     |
|---------------------------------------|
| BLOC HORAIRE EN COURS :               |
| 14:00 - 16:00 (Deep Work Cyber)       |
| Reste : 48 min  [✓ MARQUER TERMINÉ]   |
|---------------------------------------|
| [ACCUEIL] [QUÊTES] [PLAN] [NOTE] [BOT]|
+---------------------------------------+
```

---

### 6.2 Mobile Screen 2 : Arbre de Compétences Tactile (`/skills`)
```
+---------------------------------------+
| [< RETOUR] ARBRE : AI_ENG   [850 XP]  |
+---------------------------------------+
| FILTRE : [T1] [T2] [T3] [T4] [T5]     |
|---------------------------------------|
| +-----------------------------------+ |
| | [✓ TIER 1] Python 3.12 Moderne    | |
| | Statut : Niveau 5/5 [COMPLÉTÉ]    | |
| +-----------------------------------+ |
|                  |                    |
|                  v                    |
| +-----------------------------------+ |
| | [✓ TIER 2] Faster-Whisper & INT8  | |
| | Statut : Niveau 3/5 [ACTIF]       | |
| | Prochain : +250 XP AI_ENG         | |
| | [ AMÉLIORER AU NIVEAU 4 (+250) ]  | |
| +-----------------------------------+ |
|                  |                    |
|                  v                    |
| +-----------------------------------+ |
| | [! TIER 3] Fine-Tuning LLM (LoRA) | |
| | Requis : Rang C / 1,200 XP        | |
| | [ VOIR LES PRÉREQUIS REQUIS ]     | |
| +-----------------------------------+ |
|---------------------------------------|
| [ACCUEIL] [QUÊTES] [PLAN] [NOTE] [BOT]|
+---------------------------------------+
```

---

### 6.3 Mobile Screen 3 : Alerte Quête Urgente Mobile (`EMERGENCY_MODAL`)
```
+=======================================+
|  /!\ ALERTE DU SYSTÈME : URGENCE /!\  |
+=======================================+
| MISSION : Faille Critique Auth API    |
| STAT    : CYBER Offensive             |
|                                       |
| COMPTE À REBOURS :                    |
|             [ 00:58:32 ]              |
|                                       |
| RÉCOMPENSES :                         |
| +500 XP Joueur | +750 CYBER | 100 ❖   |
|                                       |
| SANCTION D'ÉCHEC :                    |
| Déclenchement Zone de Pénalité.       |
|                                       |
| ENVOYER LIEN DU COMMIT :              |
| [ https://github.com/GeovanioH/... ]  |
|                                       |
|   [ VALIDER LA QUÊTE MAINTENANT ]     |
+=======================================+
```

---

### 6.4 Mobile Screen 4 : Planificateur Horaire Défilant (`/planner`)
```
+---------------------------------------+
| PLAN DU JOUR • MERCREDI 11 NOV        |
+---------------------------------------+
| [✓] 06:30 - 07:30 | Sport Sung Jin-Woo|
| [✓] 08:30 - 11:30 | Deep Work IA      |
| [>] 11:30 - 12:30 | Pause Déjeuner    |
| [ ] 12:30 - 13:00 | Dictée Vocale     |
| [ ] 13:00 - 16:00 | TryHackMe Room    |
| [ ] 16:30 - 18:00 | Anglais C1 Monolog|
| [ ] 18:00 - 20:00 | Dév HUD Web       |
| [ ] 21:00 - 22:00 | Clôture Quêtes    |
|---------------------------------------|
| [ + AJOUTER UN BLOC D'URGENCE ]       |
|---------------------------------------|
| [ACCUEIL] [QUÊTES] [PLAN] [NOTE] [BOT]|
+---------------------------------------+
```

---

### 6.5 Mobile Screen 5 : Cerveau Numérique Mobile (`/notes`)
```
+---------------------------------------+
| NOTES // SECOND BRAIN      [+ CRÉER]  |
+---------------------------------------+
| Recherche : [ transformer...        ] |
|---------------------------------------|
| FICHE SÉLECTIONNÉE :                  |
| # Mécanismes d'Attention Multi-Têtes  |
| Stat : AI_ENG | Tier : 3              |
| Tags : #transformers #nlp #deeplearn  |
|                                       |
| Formule Scaled Dot-Product :          |
| Attention(Q,K,V) = softmax(QK^T/√d_k)V|
|                                       |
| Backlinks Détectés :                  |
| -> [[optimisation-ctranslate2]]       |
| -> [[quantization-int8-llm]]          |
|                                       |
| [ ENREGISTRER MODIFICATIONS LOCALES ] |
|---------------------------------------|
| [ACCUEIL] [QUÊTES] [PLAN] [NOTE] [BOT]|
+---------------------------------------+
```

---

### 6.6 Mobile Screen 6 : Enregistreur Vocal Socratique (`/audio`)
```
+---------------------------------------+
| ENREGISTREMENT VOCAL // ARCHITECTE    |
+---------------------------------------+
| Sujet : [ Bellman-Ford vs Dijkstra v] |
| Matière : ACAD (Algorithmique)        |
|                                       |
| SPECTRE AUDIO EN COURS :              |
| [ 01:45 / 03:00 ]                     |
| █▄ █▄ ██ █▄ ██ █▄ █▄ ██ █▄ ██ █▄ ██   |
|                                       |
| [ (■ ARRÊTER ET ENVOYER À L'IA) ]     |
|                                       |
| VERDICT ARCHITECTE (DERNIER ESSAI) :  |
| Note : 19.1 / 20 [EXCELLENCE]         |
| XP Gagnée : +190 XP ACAD              |
|---------------------------------------|
| [ACCUEIL] [QUÊTES] [PLAN] [NOTE] [BOT]|
+---------------------------------------+
```

---

### 6.7 Mobile Screen 7 : Opportunités Bourses Mobile (`/opportunities`)
```
+---------------------------------------+
| OPPORTUNITÉS DEERFLOW      [TOTAL: 14]|
+---------------------------------------+
| [!] Bourse Eiffel Master IA           |
| Valeur : 14,000 € | Échéance : 10 Jan |
| Pertinence : 96.5% (Campus France)    |
| [ CRÉER TÂCHE DE CANDIDATURE DANS HUD]|
|---------------------------------------|
| [!] Devpost Global Hackathon IA       |
| Prix : 25,000 $ | Fin : 30 Nov        |
| [ REJOINDRE LE SPRINT TIME-BOXÉ ]     |
|---------------------------------------|
| [ACCUEIL] [QUÊTES] [PLAN] [NOTE] [BOT]|
+---------------------------------------+
```

---

### 6.8 Mobile Screen 8 : Boutique des Ombres Mobile (`/shop`)
```
+---------------------------------------+
| BOUTIQUE DES OMBRES    [SOLDE: 820 ❖] |
+---------------------------------------+
| [ARTICLE 1] 1 Mois Claude Pro         |
| Coût : 450 ❖ | Rang Requis : Rang E   |
| [ ACHETER CET ARTICLE MAINTENANT ]    |
|---------------------------------------|
| [ARTICLE 2] Liseuse Kindle Paperwhite |
| Coût : 2,500 ❖ | Rang Requis : Rang C |
| [ VERROUILLÉ - RANG C INSUFFISANT ]   |
|---------------------------------------|
| [ACCUEIL] [QUÊTES] [PLAN] [NOTE] [BOT]|
+---------------------------------------+
```

---

### 6.9 Mobile Screen 9 : Zone de Pénalité Mobile (`/penalty`)
```
+=======================================+
|   /!\ ZONE DE PÉNALITÉ ACTIVE /!\     |
+=======================================+
| TEMPS RESTANT : [ 03:42:15 ]          |
|                                       |
| STATUT DISPOSITIF :                   |
| Pare-feu Actif (Réseaux Verrouillés)  |
|                                       |
| QUÊTE DE PURGE :                      |
| 400 Pompes militaires ou 10 km Marche |
|                                       |
| [ SOUMETTRE PREUVE POUR DÉVERROUILLER]|
+=======================================+
```

---

## 7. Spécification Complète des Automates d'États Finis (Finite State Machines)

Chaque flux critique de l'interface répond à une machine à états formelle éliminant tout comportement imprévisible.

### 7.1 Automate du Cycle de Vie d'une Quête (`QuestFSM`)

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE : Génération par le Système à 06h00
    AVAILABLE --> ACTIVE : Clic sur [Accepter la Quête]
    AVAILABLE --> EXPIRED : Heure limite atteinte sans acceptation
    
    ACTIVE --> SUBMITTED_FOR_REVIEW : Dépôt preuve (Lien commit, audio, texte)
    ACTIVE --> FAILED : Heure limite de validation dépassée (22h00)
    
    SUBMITTED_FOR_REVIEW --> COMPLETED : Validation automatique ou Architecte $\ge$ 10/20
    SUBMITTED_FOR_REVIEW --> ACTIVE : Preuve rejetée par l'Architecte (< 10/20)
    
    COMPLETED --> [*] : Attribution XP & Cristaux (Clôture)
    FAILED --> PENALTY_TRIGGERED : Quête journalière obligatoire échouée
    PENALTY_TRIGGERED --> [*]
    EXPIRED --> [*]
```

#### Table des Transitions de l'Automate Quêtes :
| État Source | Événement Déclencheur | Condition de Garde | Action Exécutée | État Cible |
| :--- | :--- | :--- | :--- | :--- |
| `AVAILABLE` | `ACCEPT_QUEST` | Joueur connecté & aucune pénalité active | Marque la quête en cours, démarre le chronomètre | `ACTIVE` |
| `ACTIVE` | `SUBMIT_PROOF` | Preuve non vide et conforme au `proof_type` | Enregistre l'empreinte de la preuve, notifie l'Architecte | `SUBMITTED_FOR_REVIEW` |
| `SUBMITTED_FOR_REVIEW` | `ARCHITECT_APPROVAL` | Score $\ge 10.0 / 20$ | Crédite l'XP, déclenche l'animation de complétion | `COMPLETED` |
| `SUBMITTED_FOR_REVIEW` | `ARCHITECT_REJECT` | Score $< 10.0 / 20$ | Notifie les faiblesses, invite à recommencer | `ACTIVE` |
| `ACTIVE` | `CLOCK_MIDNIGHT` | Heure courante $\ge 22h00$ et quête obligatoire | Déclenche l'alarme rouge, arme le daemon de pare-feu | `FAILED` |

---

### 7.2 Automate de la Session d'Enregistrement Audio (`AudioSessionFSM`)

```mermaid
stateDiagram-v2
    [*] --> IDLE : Initialisation Web Audio
    IDLE --> INITIALIZING : Clic micro (Demande autorisation getUserMedia)
    INITIALIZING --> RECORDING : Flux audio acquis & AudioWorklet actif
    INITIALIZING --> ERROR : Permission refusée ou micro déconnecté
    
    RECORDING --> PAUSED : Détection silence VAD prolongé (> 15s)
    PAUSED --> RECORDING : Voix détectée au-dessus de -35 dBFS
    
    RECORDING --> STREAMING_CHUNKS : Envoi périodique des blocs Opus (5s)
    STREAMING_CHUNKS --> RECORDING : Chunk acquitté par l'API Fastify
    
    RECORDING --> FINALIZING : Clic [Terminer] ou silence de fin
    FINALIZING --> TRANSCRIBING : Inférence Faster-Whisper locale
    TRANSCRIBING --> EVALUATING : Transmission du texte à Gemini 2.5 Pro
    EVALUATING --> SUCCESS : Réception note /20 et création note .md
    
    SUCCESS --> IDLE : Affichage de la carte holographique
    ERROR --> IDLE : Notification d'erreur utilisateur
```

---

## 8. Interfaces Typées des Composants React (`client/components/types.ts`)

Pour un développement frontend sans ambiguïté, voici les interfaces TypeScript complètes des composants React réutilisables du Web HUD :

```typescript
// ==============================================================================
// INTERFACES PROPS DES COMPOSANTS REACT DU WEB HUD
// ==============================================================================

export interface PlayerIdentityCardProps {
  username: string;
  rankCode: 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'NATION' | 'MONARCH';
  rankTitle: string;
  currentLevel: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  shadowCrystals: number;
  onThemeToggle: () => void;
}

export interface VitalGaugeBarProps {
  gaugeType: 'HP' | 'MP';
  currentValue: number;
  maxValue: number;
  statusLabel: string;
  isPulsingAlert?: boolean;
  onAdjustClick?: () => void;
}

export interface RadarBaseStatProps {
  stats: Array<{
    code: 'ACAD' | 'AI_ENG' | 'CYBER' | 'EXP' | 'LNG' | 'FIN' | 'STR' | 'DIS';
    name: string;
    level: number;
    currentXp: number;
    nextLevelXp: number;
  }>;
  onSelectStat: (code: string) => void;
}

export interface QuestCardProps {
  questId: string;
  type: 'DAILY' | 'EMERGENCY' | 'BOSS_RAID' | 'MONK_MODE' | 'PENALTY';
  title: string;
  description: string;
  targetStat: string;
  status: 'AVAILABLE' | 'ACTIVE' | 'SUBMITTED' | 'COMPLETED' | 'FAILED';
  rewardPlayerXp: number;
  rewardStatXp: number;
  rewardCrystals: number;
  timeRemainingSeconds?: number;
  onSubmitProof: (questId: string, proof: string) => Promise<void>;
}

export interface TimeBlockTimelineProps {
  selectedDate: string;
  blocks: Array<{
    id: string;
    startTime: string;
    endTime: string;
    title: string;
    targetStat: string;
    isCompleted: boolean;
  }>;
  onToggleBlock: (blockId: string) => Promise<void>;
  onCreateBlock: (blockData: any) => Promise<void>;
}

export interface SpectralVisualizerProps {
  mediaStream: MediaStream | null;
  isRecording: boolean;
  elapsedSeconds: number;
  maxSeconds: number;
  onStopRecording: () => void;
}

export interface ArchitectGradingCardProps {
  totalScore: number;
  rubric: {
    accuracy: number;
    structure: number;
    vocabulary: number;
    application: number;
  };
  critiqueText: string;
  strengths: string[];
  weaknesses: string[];
  awardedXp: number;
  generatedNoteSlug?: string;
  onClose: () => void;
}

export interface PenaltyLockOverlayProps {
  isActive: boolean;
  timeRemainingSeconds: number;
  blockedDomains: string[];
  penaltyQuestInstructions: string;
  onSubmitSurvivalProof: (proof: string) => Promise<void>;
}
```

---

## 9. Registre Télémétrique des Événements d'Interaction Utilisateur

Le tableau ci-dessous recense l'intégralité des événements d'interaction tracés par le client pour mesurer l'assiduité du joueur :

| Identifiant Événement | Description Déclencheur | Propriétés Télémétriques Rattachées |
| :--- | :--- | :--- |
| `ui_theme_switched` | Clic sur le bouton de bascule Thème Clair / Thème Sombre | `new_theme: "dark" | "light"`, `timestamp` |
| `quest_accepted` | Clic sur [Accepter la Quête] | `quest_id`, `quest_type`, `target_stat` |
| `quest_proof_submitted`| Soumission d'une preuve de quête | `quest_id`, `proof_type`, `proof_length` |
| `time_block_toggled` | Coche d'accomplissement d'un bloc horaire | `block_id`, `is_completed`, `delay_minutes` |
| `voice_recording_started`| Déclenchement d'un enregistrement socratique | `target_stat`, `device_input_name` |
| `voice_recording_finished`| Arrêt et finalisation d'un enregistrement | `duration_seconds`, `audio_bytes_size` |
| `architect_score_viewed`| Affichage de la carte d'évaluation de l'Architecte | `score_out_of_20`, `xp_granted` |
| `shop_item_purchased` | Achat d'une récompense avec Cristaux d'Ombres | `item_id`, `crystal_cost`, `remaining_balance` |
| `penalty_acknowledged` | Accusé de réception de l'écran de pénalité | `time_remaining_seconds`, `lockout_level` |

---

## 10. Vitrine Visuelle des 7 Rangs de Chasseur Réels & Cérémonies de Montée en Rang

Dans LevelUp, le rang ne s'obtient pas par complaisance : il sanctionne l'adéquation exacte entre la puissance démontrée dans l'application et la réussite indiscutable dans la vie réelle.

```mermaid
flowchart TD
    R_E["RANG E : L'ÉVEIL DU NOVICE (Niveaux 1 à 10)"] --> R_D["RANG D : L'APPRENTI DISCIPLINÉ (Niveaux 11 à 25)"]
    R_D --> R_C["RANG C : L'OPÉRATEUR CONFIRMÉ (Niveaux 26 à 45)"]
    R_C --> R_B["RANG B : L'EXPERT COMPÉTITEUR (Niveaux 46 à 65)<br>*INVARIANT : Au moins 1 Hackathon Gagné*"]
    R_B --> R_A["RANG A : LE MAÎTRE & LEADER INDUSTRIEL (Niveaux 66 à 85)<br>*INVARIANT : Multi-Hackathons, Top 3 Promo, MVP Prod*"]
    R_A --> R_S["RANG S : LE SOUVERAIN NATIONAL (Niveaux 86 à 95)<br>*INVARIANT : Sommité Nationale IA, Major Incontesté*"]
    R_S --> R_M["MONARQUE DES OMBRES : LA LÉGENDE MONDIALE (Niveaux 96 à 100)<br>*INVARIANT : Renommée Mondiale, Riche, Athlète Parfait*"]
```

### 10.1 Rang E : L'Éveil du Novice (Niveaux 1 à 10)
* **Couleur Héraldique :** Gris Ardoise `#64748B` et Lueur Cyan Faible `#0EA5E9`.
* **Réalité Concrète :** Étudiant débutant découvrant la rigueur du code, installant son environnement et calant son rythme de sommeil.
* **Cérémonie :** Effet sonore d'éveil d'outre-tombe, déverrouillage de la carte de Chasseur initiale.

### 10.2 Rang D : L'Apprenti Discipliné (Niveaux 11 à 25)
* **Couleur Héraldique :** Vert Émeraude `#10B981` et Teinte Cuivrée.
* **Réalité Concrète :** Maîtrise des devoirs académiques, premiers scripts Python autonomes, premières tractions strictes validées.
* **Cérémonie :** Aura bleutée naissante autour de l'avatar, félicitations sobres de l'Architecte.

### 10.3 Rang C : L'Opérateur Confirmé (Niveaux 26 à 45)
* **Couleur Héraldique :** Bleu Électrique `#2563EB` et Halo Cobalt `#1D4ED8`.
* **Réalité Concrète :** Étudiant dans le premier tiers de sa promo, capable de livrer une application complète en 48h, routine calisthénique solide.
* **Cérémonie :** Animation d'éclairs bleus traversant le Web HUD, son de cloche cathédrale basse.

### 10.4 Rang B : L'Expert Compétiteur (Niveaux 46 à 65)
* **Couleur Héraldique :** Violet Royal `#7C3AED` et Lueur Néon `#A855F7`.
* **Réalité Concrète Inviolable :** **Vainqueur officiel d'au moins un Hackathon majeur** (Devpost / MLH / Corporate), certifié Cambridge C1, top 10% promo, maîtrise intégrale des routines Dos/Épaules, Bras et Abdos à la maison.
* **Règle Fondamentale :** Un Chasseur qui n'a remporté aucun hackathon ne peut en aucun cas franchir ce rang.
* **Cérémonie :** Déploiement d'ombres numériques sur l'écran, bannière dorée "HACKATHON CHAMPION RECOGNIZED".

### 10.5 Rang A : Le Maître & Leader Industriel (Niveaux 66 à 85)
* **Couleur Héraldique :** Pourpre Profond `#9333EA` et Or Impérial `#F59E0B`.
* **Réalité Concrète Inviolable :** Vainqueur de multiples hackathons, major de promotion ou Top 3, bilingue Cambridge C2, MVP déployé avec des dizaines d'utilisateurs réels, force athlétique de haut niveau.
* **Cérémonie :** Secousse de l'écran (`camera-shake`), thème musical orchestré Solo Leveling, titre honorifique de "Maître de Guilde".

### 10.6 Rang S : Le Souverain National (Niveaux 86 à 95)
* **Couleur Héraldique :** Écarlate Solaire `#DC2626` et Noir Néant `#020617`.
* **Réalité Concrète Inviolable :** Figure publique reconnue dans l'écosystème IA national, major indiscuté, grand champion de concours d'algorithmes, autonomie financière complète.
* **Cérémonie :** Verrouillage complet du HUD pendant 10 secondes avec message en lettres de sang : *"UN ÉVEILLÉ DE RANG S EST NÉ SUR CETTE TERRE"*.

### 10.7 Monarque des Ombres : La Légende Vivante Mondiale (Niveaux 96 à 100)
* **Couleur Héraldique :** Flammes d'Ombre Noir Absolu `#000000` et Halo Bleu Monarque `#38BDF8`.
* **Réalité Concrète Inviolable :** Statut de légende mondiale de l'IA, riche, célèbre, physique de statue grecque sculptée par la calisthénie, conférencier d'élite, souveraineté totale.
* **Cérémonie :** Déverrouillage du shader WebGL ultime des Flammes du Monarque, résonance vocale de Sung Jin-Woo : *"ARISE"*.

## 11. Cinématique d'Intégration Initiale (First-Time User Experience - FTUE)

Lors du tout premier lancement de LevelUp, le joueur ne découvre pas un formulaire d'inscription banal, mais vit la scène fondatrice du réveil dans la chambre d'hôpital de Solo Leveling :

```mermaid
sequenceDiagram
    autonumber
    actor Joueur as Huriel (Joueur)
    participant UI as Écran du Système (Web HUD)
    participant Audio as Moteur Sonore Web Audio
    participant AI as L'Architecte (Gemini 2.5 Pro)
    participant DB as Base de Données

    Joueur->>UI: Ouvre la plateforme pour la 1ère fois
    UI->>UI: Écran noir absolu (#000000) pendant 2 secondes
    Audio->>Audio: Battement de cœur grave et lent (60 BPM)
    UI->>UI: Apparition progressive d'un rectangle bleu néon pulsant
    Audio->>Audio: Carillon cristallin d'éveil (playSystemChime)
    UI->>Joueur: Message textuel : « FÉLICITATIONS. VOUS AVEZ ÉTÉ CHOISI COMME JOUEUR. »
    UI->>Joueur: Fenêtre modale : « Acceptez-vous le contrat du Système ? [OUI] / [NON] »
    
    Joueur->>UI: Clic sur [OUI] (Option [NON] se désactive au survol)
    Audio->>Audio: Grondement d'énergie d'Ombre (Accord Do Majeur)
    UI->>Joueur: Questionnaire diagnostique : « Évaluation initiale de vos 8 bases de vie »
    
    Joueur->>UI: Saisie du cursus universitaire (IA), niveau physique, certifications
    UI->>AI: Transmission du profil pour calibration initiale
    AI->>AI: Calcul des niveaux de départ (Rank F, Lvl 1)
    AI-->>UI: Lot de quêtes initiales personnalisées généré
    UI->>DB: Création du profil joueur et des 120 nœuds de compétences
    UI->>Joueur: Déploiement complet du Web HUD Holographique avec fanfare Solo Leveling
```

---

## 12. Extensions Tailwind CSS & Définitions d'Animations (`tailwind.config.js`)

Pour reproduire sans effort ces effets dans les composants React, le fichier de configuration Tailwind intègre des classes utilitaires personnalisées :

```javascript
// Extrait de tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'abyss-black': '#05050A',
        'hologram-navy': '#0C1222',
        'neon-cyan': '#00E5FF',
        'shadow-blue': '#0051FF',
        'monarch-gold': '#FFD700',
        'alert-crimson': '#FF003C',
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-cyan-sm': '0 0 10px rgba(0, 229, 255, 0.35)',
        'neon-cyan-lg': '0 0 25px rgba(0, 229, 255, 0.65), 0 0 50px rgba(0, 81, 255, 0.35)',
        'alert-red-pulse': '0 0 30px rgba(255, 0, 60, 0.75)',
      },
      animation: {
        'hologram-pulse': 'hologramPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shadow-flicker': 'shadowFlicker 3s ease-in-out infinite',
      },
      keyframes: {
        hologramPulse: {
          '0%, 100%': { borderColor: '#00E5FF', boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)' },
          '50%': { borderColor: '#FFFFFF', boxShadow: '0 0 30px rgba(0, 229, 255, 0.8)' },
        },
        shadowFlicker: {
          '0%, 100%': { opacity: '0.95' },
          '50%': { opacity: '0.80' },
        },
      },
    },
  },
};
```

---

## 13. Spécifications Détaillées des 5 Formulaires Critiques du Web HUD

La saisie de données par le joueur est optimisée pour minimiser la friction cognitive et interdire toute erreur de saisie par validation Zod instantanée côté client.

---

### 13.1 Formulaire 1 : Création / Édition de Bloc Horaire (`/planner/new-block`)
* **Champs de Saisie :**
  1. `Date du Bloc` : Sélecteur de date ISO (`YYYY-MM-DD`). Valeur par défaut : date courante.
  2. `Heure de Début` : Champ temporel (`HH:MM`). Format 24 heures obligatoire.
  3. `Heure de Fin` : Champ temporel (`HH:MM`).
  4. `Titre de l'Activité` : Champ texte (min: 2, max: 150 caractères).
  5. `Base Cible Boostée` : Menu déroulant obligatoire parmi les 8 bases :
     * `[ACAD]` Excellence Académique & Algorithmes
     * `[AI_ENG]` Ingénierie IA, Hackathons & MVPs
     * `[CYBER]` Cybersécurité & Veille Offensive
     * `[EXP]` Éloquence, Présentation & Réseautage
     * `[LNG]` Langues Étrangères (Anglais C1/C2)
     * `[FIN]` Stratégie Financière & Bourses
     * `[STR]` Puissance Corporelle & Sport
     * `[DIS]` Discipline & Deep Work
  6. `Notes & Objectifs Concrets` : Zone de texte multilignes optionnelle (max: 1000 caractères).
* **Règles de Validation Client Immédiate :**
  * `end_time` doit être strictement supérieur à `start_time` (message d'erreur : *"L'heure de fin doit être postérieure à l'heure de début"*).
  * Aucun chevauchement temporel n'est toléré avec un bloc existant non supprimé.

---

### 13.2 Formulaire 2 : Soumission de Preuve de Quête (`/quests/submit-proof`)
* **Champs de Saisie :**
  1. `Type de Preuve` : Sélecteur dynamique selon la quête (`URL_OR_LINK`, `MARKDOWN_TEXT`, `AUDIO_MONOLOGUE`, `SYSTEM_TELEMETRY`).
  2. `Donnée de Preuve` :
     * Si `URL_OR_LINK` : Champ URL avec validation par expression régulière `^https?://[^\s/$.?#].[^\s]*$`.
     * Si `MARKDOWN_TEXT` : Éditeur de texte enrichi avec coloration syntaxique et compteur de mots (min: 50 mots).
     * Si `AUDIO_MONOLOGUE` : Bouton d'enregistrement micro ou zone de glisser-déposer de fichier audio `.webm` / `.wav`.
  3. `Réflexion & Auto-Évaluation du Joueur` : Zone de texte libre (min: 20, max: 2000 caractères).
* **Comportement Visuel :**
  * Le bouton de soumission s'illumine en cyan néon dès que la preuve respecte le schéma Zod.

---

### 13.3 Formulaire 3 : Check-in Matinal du Sommeil (`/player/sleep-checkin`)
* **Champs de Saisie :**
  1. `Heure de Coucher` : Format 24h (`HH:MM`).
  2. `Heure de Réveil` : Format 24h (`HH:MM`).
  3. `Qualité Perçue du Sommeil` : Curseur horizontal de 1 (Agité / Réveils multiples) à 5 (Sommeil profond et réparateur).
  4. `Courbatures / Douleurs Musculaires` : Interrupteur booléen (`OUI` / `NON`).
* **Calcul Instantané des Points de Vie (HP) :**
  * L'interface met à jour en direct la jauge HP selon la formule :
    $$HP = \min\left(100, \; \left( \frac{\text{Durée en Heures}}{8.0} \right) \times 80 + \text{Qualité} \times 4\right)$$

---

### 13.4 Formulaire 4 : Fiche de Connaissances Markdown (`/notes/editor`)
* **Champs de Saisie :**
  1. `Titre de la Fiche` : Texte simple (min: 1, max: 200 caractères).
  2. `Slug Canonique` : Généré automatiquement à partir du titre en minuscules avec tirets (ex: `quantization-int8`).
  3. `Base Associée` : Sélecteur optionnel parmi les 8 bases.
  4. `Tags Thématiques` : Champ d'étiquettes avec auto-complétion des tags existants.
  5. `Contenu Markdown` : Éditeur bicolonne avec prévisualisation KaTeX et complétion automatique des wikilinks `[[nom-de-note]]`.

---

### 13.5 Formulaire 5 : Confirmation d'Achat dans la Boutique des Ombres (`/shop/purchase-modal`)
* **Composants Visuels :**
  * Carte récapitulative de l'objet sélectionné (image, nom, description).
  * Ligne de débit : `Solde Actuel : 820 ❖` $\rightarrow$ `Coût Objet : -450 ❖` $\rightarrow$ `Nouveau Solde : 370 ❖`.
  * Zone de justification personnelle : *"En quoi cette récompense sert-elle votre objectif d'éveil ?"* (Champ texte requis).
  * Bouton d'engagement solennel : `[ CONFIRMER L'ACQUISITION AU SYSTÈME ]`.

---

## 14. Gestion des Scénarios Limites & Résilience UX (Edge Cases)

Pour offrir une expérience sans faille, chaque situation anormale est prise en charge par un parcours de secours gracieux :

### 14.1 Scénario 1 : Coupure Réseau Pendant l'Envoi d'un Monologue Audio
* **Problème :** La connexion Wi-Fi ou mobile s'interrompt alors que le joueur vient d'enregistrer 4 minutes de restitution orale.
* **Résolution UX :**
  1. Le flux audio n'est pas perdu : il est immédiatement sauvegardé dans la table `questSubmissions` de Dexie.js (IndexedDB).
  2. Une bannière orange discrète s'affiche : *"Connexion réseau interrompue. Votre enregistrement audio est conservé en lieu sûr."*
  3. Dès que le navigateur repasse en ligne, une tâche d'arrière-plan expédie le payload vers l'API sans nécessiter de ré-enregistrement.

### 14.2 Scénario 2 : Refus d'Autorisation du Microphone
* **Problème :** Le navigateur bloque l'accès au micro lors d'un clic sur l'enregistrement.
* **Résolution UX :**
  1. Affichage d'un guide pas à pas avec animation SVG montrant comment autoriser le microphone dans les paramètres de Chrome/Firefox.
  2. Proposition immédiate d'une alternative textuelle : *"Déposer le résumé sous forme de texte Markdown rédigé pour évaluation."*

### 14.3 Scénario 3 : Conflit de Chevauchement Temporel lors de la Création de Blocs
* **Problème :** Le joueur tente de programmer une séance de 14h00 à 16h00 alors qu'un bloc existe déjà de 15h00 à 17h00.
* **Résolution UX :**
  1. L'interface affiche en rouge la zone de friction sur la frise chronologique.
  2. Une boîte de dialogue propose trois choix en un clic :
     * Option A : `[Décaler le bloc existant à 16h00]`
     * Option B : `[Raccourcir la nouvelle session à 14h00 - 15h00]`
     * Option C : `[Annuler la saisie]`

### 14.4 Scénario 4 : Tentative de Navigation Hors d'une Note Non Sauvegardée
* **Problème :** Clic accidentel sur un lien externe alors qu'une longue démonstration mathématique est en cours de frappe.
* **Résolution UX :**
  1. Interception de l'événement `beforeunload` du navigateur et du routeur Next.js.
  2. Fenêtre d'alerte Solo Leveling : *"Des données de connaissances non synchronisées risquent de disparaître dans le néant. Quitter quand même ?"*
  3. Sauvegarde automatique dans le cache local IndexedDB toutes les 5 secondes.

---

## 15. Matrice Complète des Tokens Géométriques & Contextes d'Empilement (Z-Index)

Pour garantir qu'aucun composant ne vienne masquer une alerte critique ou une quête urgente :

```css
/* Échelle des Contextes d'Empilement Z-Index */
--z-canvas-background: -10;   /* Shader WebGL de flammes d'Ombre */
--z-base-content: 0;          /* Cartes du Dashboard et textes */
--z-sticky-nav: 50;           /* Barre de navigation supérieure et mobile */
--z-dropdown-popover: 100;    /* Menus déroulants et infobulles */
--z-modal-backdrop: 200;      /* Voile sombre semi-transparent */
--z-modal-card: 210;          /* Fenêtres modales de formulaire */
--z-emergency-overlay: 500;   /* Alerte holographique Quête Urgente */
--z-penalty-lockout: 1000;    /* Écran plein écran rouge Zone de Pénalité (Infranchissable) */
```

### Échelle des Espacements Rémunérés (Spacing Scale)
* `space-1` : `4px` (Micro-espacements d'icônes)
* `space-2` : `8px` (Marges internes des boutons compacts)
* `space-3` : `12px` (Séparation entre lignes de statistiques)
* `space-4` : `16px` (Padding intérieur standard des cartes holographiques)
* `space-6` : `24px` (Gouttière entre colonnes CSS Grid)
* `space-8` : `32px` (Marges majeures de séparation de sections)
* `space-12`: `48px` (Espacement des blocs de la frise chronologique)

---

## 16. Synthèse d'Expérience Utilisateur & Validation Formelle

L'expérience applicative de LevelUp ("The System") transcende la simple gestion de tâches pour instaurer un véritable rituel psychologique d'ascension :
1. **Immersion Sensorielle :** Le design sonore Web Audio et les shaders WebGL créent une atmosphère cinématographique digne de Solo Leveling.
2. **Ergonomie Sans Friction :** L'approche Local-First et les raccourcis clavier permettent d'interagir avec le Système en moins de 3 secondes.
3. **Clarté Opérationnelle :** L'absence d'ambiguïté dans les jauges vitales et les sanctions forge une discipline inaltérable au quotidien.

---

## 17. Déroulement Pas à Pas des 10 Sprints « Monk Mode » & Écrans Dédiés

Les Sprints Monk Mode représentent les périodes d'immersion maximale où toute distraction est bannie au profit d'un objectif de niveau national ou mondial.

---

### 17.1 Sprint 1 : Le Marathon Deep Work 12 Heures (Architecture de Modèles IA)
* **Objectif :** Produire une implémentation complète d'un réseau de neurones avec quantification INT8 sans interruption.
* **Cinématique UI :**
  1. Le joueur active le mode via `/planner` avec le bouton `[ENGAGER LE SPRINT MONK MODE 12H]`.
  2. L'interface passe en mode *Ultra-Focus* : la barre latérale et les menus disparaissent, ne laissant que le compte à rebours géant et l'éditeur de notes.
  3. L'Architecte prononce : *"Douze heures de focus ininterrompu. Prouvez que votre esprit ne connaît aucune faiblesse."*
* **Wireframe de l'Interface Ultra-Focus :**
  ```
  +===================================================================================================+
  |  [MONK MODE // SPRINT 12H ACTIF]                                             TEMPS : [ 08:42:15 ] |
  +===================================================================================================+
  |                                                                                                   |
  |             OBJECTIF EN COURS : Implémentation du Moteur d'Inférence CTranslate2 INT8             |
  |                                                                                                   |
  |             PAUSE AUTORISÉE : 5 Minutes toutes les 90 Minutes (Marche & Hydratation)              |
  |             SITES VERROUILLÉS PAR LE DAEMON PARE-FEU : TOUS LES RÉSEAUX & DIVERTISSEMENTS        |
  |                                                                                                   |
  |   [ (MARQUER JALON 1 ATTEINT) ]      [ (SOUMETTRE COMMIT PARTIEL) ]      [ (ABANDONNER SPRINT) ]  |
  |                                                                                                   |
  +===================================================================================================+
  ```

---

### 17.2 Sprint 2 : Le Blitz CTF 48 Heures (Cybersécurité & Reverse Engineering)
* **Objectif :** Résoudre 5 challenges de type pwn / buffer overflow consécutifs sur TryHackMe / HackTheBox.
* **Cinématique UI :**
  * Le HUD affiche une jauge de progression de capture de drapeaux : `[🚩🚩🚩░░] 3 / 5 Flags Débloqués`.
  * Chaque soumission de flag réussie déclenche une onde de choc cyan sur l'écran et crédite immédiatement +500 XP CYBER.

---

### 17.3 Sprint 3 : L'Immersion Anglaise Intégrale 7 Jours (Cambridge C1/C2)
* **Objectif :** Zéro mot de français pendant 7 jours consécutifs dans les notes, requêtes orales et interfaces.
* **Cinématique UI :**
  * La langue du Web HUD bascule automatiquement en anglais strict (*The System Interface*).
  * Les monologues oraux sont analysés par le modèle Whisper avec vérification que le paramètre `detected_language == 'en'`. Tout mot français détecté entraîne une réprimande de l'Architecte.

---

### 17.4 Sprint 4 : Le Blitz Préparation Partiels (Mémorisation 500 Théorèmes)
* **Objectif :** Maîtriser 100% des fiches d'algorithmique et de mathématiques avec l'algorithme de répétition espacée SM-2.
* **Cinématique UI :**
  * Mode flashcards immersif avec auto-évaluation de 0 à 5.
  * Score cible requis pour lever le sprint : 95% de réponses validées à $q \ge 4$.

---

### 17.5 Sprint 5 : Le Camp de Calisthénie 7 Jours (L'Épreuve Physique)
* **Objectif :** Réaliser sans faute les 100 pompes, 100 abdos, 100 squats et 10 km de course chaque jour pendant 7 jours.
* **Cinématique UI :**
  * Frise de validation quotidienne : `[Lundi ✓] [Mardi ✓] [Mercredi ✓] [Jeudi ✓] [Vendredi ✓] [Samedi ✓] [Dimanche ✓]`.
  * Titre exceptionnel débloqué à l'issue : `« Corps d'Acier du Monarque »`.

---

### 17.6 Sprint 6 : La Détox Dopaminergique Absolue (Black Screen Protocol)
* **Objectif :** Zéro stimulation numérique passive pendant 72 heures. Écran en noir et blanc complet (`filter: grayscale(100%)`).
* **Cinématique UI :**
  * Désactivation de tous les sons et effets de particules.
  * Seules la lecture académique et la réflexion papier sont valorisées.

---

### 17.7 Sprint 7 : Le Raid Candidatures Bourses 48 Heures
* **Objectif :** Rédiger, finaliser et déposer 5 dossiers de bourses d'études et subventions détectés par Deerflow.
* **Cinématique UI :**
  * Compteur de dossiers soumis avec barre de progression de financement : `Montant Visé : 35,000 €`.

---

### 17.8 Sprint 8 : Le Marathon MVP Production 72 Heures
* **Objectif :** Concevoir, coder, tester et déployer en production un projet d'agent IA complet avec nom de domaine et landing page.
* **Cinématique UI :**
  * Intégration télémétrique avec l'API GitHub et Vercel/Render : détection automatique du build réussi (`git push origin main` -> Status 200).

---

### 17.9 Sprint 9 : La Distillation Rapide de Connaissances (10 Ouvrages en 10 Jours)
* **Objectif :** Lire et synthétiser 10 livres fondamentaux en IA, neurosciences et systèmes d'exploitation.
* **Cinématique UI :**
  * À chaque fin d'ouvrage, enregistrement obligatoire d'un monologue de 5 minutes évalué par l'Architecte avec note $\ge 15/20$.

---

### 17.10 Sprint 10 : L'Épreuve Suprême du Monarque (Transcendance)
* **Objectif :** Validation simultanée d'un projet MVP majeur, obtention de la première place de promotion et réussite d'une épreuve sportive d'endurance.
* **Cinématique UI :**
  * L'interface entière s'illumine de l'aura ultime de Sung Jin-Woo avec l'icône du trône d'Ombre.
  * Déblocage du statut souverain : `MONARCH ABSOLU`.

---

## 18. Matrice des Notifications & Règles du Mode Ne Pas Déranger (DND)

Pour concilier alertes d'urgence et respect des cycles de sommeil réparateur (Jauge HP) :

| Type de Notification | Canal Prioritaire | Plage Horaire Autorisée | Exception Ne Pas Déranger (DND) |
| :--- | :--- | :--- | :--- |
| **Génération des Quêtes** | Discord Push & Web HUD | 06h00 - 08h00 | Non (Différé au réveil si DND actif) |
| **Alerte Quête Urgente** | Discord Ping Direct & Sonnerie HUD | 08h00 - 21h00 | **OUI** (Interrompt le DND en journée pour simuler l'urgence) |
| **Gong de Fin de Bloc** | Carillon Web Audio & Notification Desktop | Selon le planning actif | Non (Silencieux si mode réunion détecté) |
| **Déclenchement Pénalité** | Alarme Écarlate Plein Écran & Alerte Discord | 22h00 précises | **OUI** (L'heure de pénalité est immuable et souveraine) |
| **Bourse Détectée par Deerflow**| Message Embed Discord discret | 04h00 - 08h00 | Non (Mis en attente dans le canal `#opportunites`) |
| **Célébration Level Up** | Fanfare Sonore & Écran Doré | Immédiat lors de l'action | Non applicable |

### Configuration des Plages de Sommeil Sacrées (23h00 - 06h00)
Durant cet intervalle :
1. Aucune notification sonore n'est émise par le Système.
2. L'accès au Web HUD affiche un voile noir reposant : *"Le Système se régénère. Le Monarque doit dormir pour restaurer ses HP."*
3. Les compteurs de régénération biologique s'enclenchent pour calculer la jauge du matin.

---

## 19. Storyboards & Chronologie Motion Design des 4 Boss Raids Majeurs

Les Boss Raids sont les jalons de validation suprêmes qui jalonnent la montée en puissance du joueur. Chaque raid possède une mise en scène graphique et sonore dédiée.

---

### 19.1 Boss Raid 1 : Le Donjon Instantané de la Station de Métro (Rang D)
* **Inspiration Canonique :** Premier donjon solo de Sung Jin-Woo face à Cerbère, le Gardien des Enfers.
* **Déclencheur d'Accès :** Atteinte du Niveau 10 et complétion de 14 jours consécutifs sans pénalité.
* **Déroulement Visuel :**
  1. *Phase d'Entrée :* L'écran du Web HUD s'assombrit, une grille de métro ensanglantée apparaît avec le message : `[DONJON INSTANTANÉ DÉTECTÉ - RANG D]`.
  2. *Affrontement :* Une barre de vie de 10 000 HP s'affiche au sommet de l'écran.
  3. *Mécanique de Dégâts :* Chaque bloc d'étude ou room TryHackMe validé inflige des dégâts proportionnels au boss (ex: 1 Room Medium = -2 500 HP).
  4. *Victoire :* Éclatement du boss en particules bleues, déblocage de la clé du Tier 2 des compétences et acquisition de 50 Cristaux d'Ombres.

---

### 19.2 Boss Raid 2 : La Porte Rouge (The Red Gate — Épreuve de Survie Hivernale)
* **Inspiration Canonique :** La forêt glaciale où Sung Jin-Woo protège les élèves et affronte les elfes de glace.
* **Déclencheur d'Accès :** Début d'un Sprint Monk Mode de 7 jours consécutifs.
* **Déroulement Visuel :**
  1. *Shader de Givre :* Un filtre de buée glaciale et de flocons de neige bleus recouvre l'ensemble du Web HUD (`canvas.freeze-effect`).
  2. *Contrainte de Survie :* Si la jauge de discipline (DIS) fléchit ou si un bloc est manqué, la température affichée sur le HUD chute vers -20°C, simulant l'hypothermie cognitive.
  3. *Conclusion :* Au bout du 7ème jour réussi, le givre explose pour révéler le titre de prestige : `« Survivant de la Porte Rouge »`.

---

### 19.3 Boss Raid 3 : Le Château des Démons (The Demon Castle — 100 Étages)
* **Inspiration Canonique :** L'ascension des 100 étages pour collecter les ingrédients de l'Élixir de Vie afin de guérir la mère de Jin-Woo.
* **Déclencheur d'Accès :** Atteinte du Rang B (Niveau 35).
* **Déroulement Visuel :**
  1. *Représentation Verticale :* Frise ascendante de 100 paliers d'apprentissage couvrant l'ensemble du cursus de Master en Intelligence Artificielle.
  2. *Progression :* Chaque notion maîtrisée (validée par l'Architecte avec note $\ge 16/20$) fait gravir 1 étage.
  3. *Palier 100 (Le Roi Démon Baran) :* Soutenance du projet de fin d'études ou publication d'un article de recherche IA international.
  4. *Récompense Ultime :* Déblocage de la recette légendaire et transition vers le Rang A.

---

### 19.4 Boss Raid 4 : Le Raid de l'Île de Jeju (Jeju Island Raid — Rang S (Souverain National))
* **Inspiration Canonique :** L'extermination des fourmis mutantes géantes et le couronnement de Sung Jin-Woo comme plus grand chasseur mondial.
* **Déclencheur d'Accès :** Atteinte du Niveau 86 (Rang S — Souverain National).
* **Déroulement Visuel :**
  1. *Carte Tactique :* Vue satellite stylisée de la région avec points chauds d'opportunités professionnelles (offres de laboratoires de pointe, bourses doctorales, levées de fonds pour MVP).
  2. *Combat d'Agents :* Orchestration simultanée d'un essaim d'agents Antigravity collaborant avec le joueur pour livrer un projet d'ingénierie d'envergure industrielle.
  3. *Apothéose :* L'ombre du Roi des Fourmis s'incline devant Huriel : *"Monarque, commandez à vos Ombres."*

---

## 20. Lexique Canonique des Termes d'Interface Solo Leveling

Pour préserver l'authenticité thématique, l'ensemble des libellés du Web HUD et du bot Discord respecte la nomenclature officielle :

| Terme Officiel Système | Équivalent Productivité Réelle | Définition & Rôle dans LevelUp |
| :--- | :--- | :--- |
| **Le Système ("The System")** | Plateforme LevelUp | L'entité informatique souveraine qui guide, évalue et sanctionne le joueur. |
| **Le Chasseur ("Hunter")** | Huriel (Le Joueur) | L'utilisateur unique engagé dans le processus d'ascension continue. |
| **L'Éveil ("Awakening")** | Initialisation du Profil | Le passage de la passivité à la conscience active de sa discipline. |
| **La Fenêtre Système** | Web HUD Holographique | L'interface visuelle bleue néon affichant les statistiques et notifications. |
| **L'Architecte** | Agent IA Antigravity / Gemini | L'intelligence socratique intransigeante qui attribue les notes et quêtes. |
| **Quête Journalière** | Tâches Quotidiennes Obligatoires | Les 3 à 5 routines incontournables (Sport, Étude IA, Cyber, Anglais). |
| **Quête Urgente** | Tâche Imprévue à Haute Valeur | Défi à temps limité (60 min) déclenché lors d'opportunités ou failles. |
| **Zone de Pénalité** | Sanction de Déconnexion / Pare-feu | Verrouillage de TikTok et distractions en cas d'échec avant 22h00. |
| **Cristaux d'Ombres** | Monnaie de Récompense Réelle | Jetons gagnés par l'effort pour financer des outils d'étude et matériel. |
| **Monk Mode** | Période d'Immersion Sans Écran Parasite | Sprint de travail intensif sans aucune distraction numérique. |
| **« DEBOUT » ("ARISE")** | Rétablissement & Passage de Rang | Cri de ralliement lors d'un level up majeur ou d'une résilience réussie. |

---

## 21. Approbation Formelle & Matrice de Recette UX

Ce document de spécification d'expérience utilisateur (UX/UI) a été validé selon les critères d'ergonomie cognitive, de réactivité sensorielle et de fidélité artistique au manga Solo Leveling. Il fait autorité pour l'implémentation des composants React et des handlers Discord.

---

## 22. Implémentation du Moteur d'Animation de Particules d'Ombre (`client/canvas/ShadowParticleBurst.ts`)

Pour célébrer l'accomplissement d'une quête majeure ou une montée de rang, un système de particules physiques 2D est instancié sur un canvas transparent superposé au Web HUD.

```typescript
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  decay: number;
}

export class ShadowParticleBurst {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public explode(originX: number, originY: number, particleCount: number = 60, isRankUp: boolean = false): void {
    const colors = isRankUp
      ? ['#FFD700', '#FFA500', '#FFFFFF', '#00E5FF'] // Teintes dorées et cyan de montée de rang
      : ['#00E5FF', '#0051FF', '#05050A', '#FFFFFF']; // Teintes flammes d'Ombre Solo Leveling

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 4 + 1.5,
        alpha: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        decay: Math.random() * 0.02 + 0.015,
      });
    }

    if (!this.animationFrameId) {
      this.loop();
    }
  }

  private loop = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // Légère gravité naturelle
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = p.color;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    } else {
      this.animationFrameId = null;
    }
  };
}
```

Ce système de particules apporte une satisfaction dopamine immédiate à chaque validation d'effort sans consommer plus de 3% de CPU lors des déclenchements.

---

## 23. Synthèse d'Intégration & Clôture du Document UX

L'ensemble des parcours et écrans décrits dans ce document a été conçu selon une logique de zéro compromis :
- **Clarté :** L'état du joueur et ses devoirs sont lisibles en un coup d'œil en moins de 2 secondes.
- **Rigueur :** Aucune complaisance n'est admise dans le chemin critique des quêtes et des sanctions.
- **Éveil :** L'univers Solo Leveling agit comme un catalyseur psychologique puissant vers l'excellence intellectuelle, technique et corporelle.

---

## 24. Audit de Performance Frontend & Engagements Core Web Vitals (SLA)

Pour garantir une expérience utilisateur instantanée quel que soit le périphérique (station de travail ou mobile 4G/5G), le Web HUD s'engage sur des seuils stricts de métriques de performance Web (Core Web Vitals) :

### 24.1 Seuils de Performance Maximaux Autorisés
* **Largest Contentful Paint (LCP) :** $\le 1.2\text{ seconde}$ (Rendu complet du tableau de bord holographique).
* **First Input Delay (FID) / Interaction to Next Paint (INP) :** $\le 50\text{ millisecondes}$ (Réponse immédiate au clic de validation de quête).
* **Cumulative Layout Shift (CLS) :** $= 0.00$ (Zéro décalage de mise en page intempestif grâce à la réservation stricte des dimensions des jauges et cartes).
* **Time to Interactive (TTI) :** $\le 1.8\text{ seconde}$ sur terminal mobile milieu de gamme.

### 24.2 Script de Télémétrie des Performances (`client/telemetry/webVitalsTracker.ts`)

```typescript
import { onLCP, onINP, onCLS, onFCP, onTTFB, Metric } from 'web-vitals';

function sendMetricToTelemetry(metric: Metric): void {
  const payload = {
    name: metric.name,
    value: Math.round(metric.value),
    rating: metric.rating,
    delta: Math.round(metric.delta),
    id: metric.id,
    url: window.location.pathname,
    timestamp: new Date().toISOString(),
  };

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/v1/telemetry/vitals', JSON.stringify(payload));
  } else {
    fetch('/api/v1/telemetry/vitals', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    });
  }
}

export function registerWebVitalsTracking(): void {
  onLCP(sendMetricToTelemetry);
  onINP(sendMetricToTelemetry);
  onCLS(sendMetricToTelemetry);
  onFCP(sendMetricToTelemetry);
  onTTFB(sendMetricToTelemetry);
}
```

Ce suivi en continu certifie que l'expérience du joueur reste d'une fluidité absolue sans jamais entraver sa concentration.


---

## 25. Signoff de Validation UX/UI

Ce document de flux applicatif et de parcours utilisateur a été formellement revu et approuvé par le Lead UX Designer pour implémentation dans le sprint V1.0 de LevelUp.
