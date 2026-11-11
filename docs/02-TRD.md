# Technical Requirements Document (TRD) — LevelUp ("The System")

> **Document ID :** TRD-LVLUP-002  
> **Nom du Produit :** LevelUp  
> **Version du Document :** 2.0.0 (Spécification d'Ingénierie Exhaustive)  
> **Statut :** Validé pour Implémentation  
> **Auteur :** Lead Software Architect AI  
> **Architecture Globale :** Hybride Local-First & Micro-Services Connectés

---

## 1. Cartographie de l'Architecture Système (Modèle C4)

### 1.1 Niveau 1 : Diagramme de Contexte Système

```mermaid
flowchart TD
    User["Utilisateur / Joueur (Huriel)"]

    subgraph Boundaries ["Écosystème LevelUp"]
        SystemCore["The System Core (LevelUp)<br>- Web HUD Holographique<br>- API REST & WebSocket<br>- Moteur de Quêtes & XP<br>- Cerveau Numérique Markdown"]
    end

    subgraph Interfaces ["Canaux d'Interaction"]
        DiscordBot["Bot Discord LevelUp<br>(Mobile & Desktop)"]
        VoiceEngine["Moteur de Transcription Vocale<br>(Whisper / Gemini Audio)"]
    end

    subgraph Intelligence ["Orchestration Agentique"]
        Antigravity["Antigravity Runtime<br>(Agent 'L'Architecte')"]
        Deerflow["Deerflow Web Engine<br>(Recherche Bourses & Hackathons)"]
    end

    subgraph ExternalServices ["Plateformes du Monde Réel"]
        GitHub["GitHub API (Student Pack & Commits)"]
        TryHackMe["TryHackMe Profil & Badges"]
        Cambridge["Cambridge English & EF SET"]
    end

    User <-->|Navigation Web & Mobile| SystemCore
    User <-->|Commandes Vocales & Mémos| VoiceEngine
    User <-->|Slash Commands & Alertes| DiscordBot

    DiscordBot <-->|REST & WebSocket| SystemCore
    VoiceEngine <-->|Audio Buffers| SystemCore
    SystemCore <-->|Context & Recommandations| Antigravity
    Antigravity <-->|Web Scraping & Queries| Deerflow
    SystemCore -.->|Vérification de Preuves| ExternalServices
```

### 1.2 Niveau 2 : Diagramme de Conteneurs Applicatifs

```mermaid
flowchart TD
    subgraph ClientTier ["Couche Présentation & Clients"]
        WebPWA["Next.js 14+ PWA Client<br>(React 18 / TailwindCSS / Framer Motion)<br>Thème Sombre néon & Thème Clair orange"]
        DiscordApp["Discord Client Mobile / Desktop<br>(Discord.js v14 Gateway Daemon)"]
    end

    subgraph BackendTier ["Couche Backend & Services Métier"]
        APIServer["Serveur API REST / WebSocket<br>(Next.js Route Handlers & Node.js Engine)"]
        SchedulerWorker["Worker Asynchrone de Planification<br>(BullMQ v5 / Redis)"]
        MarkdownEngine["Moteur AST Cerveau Numérique<br>(Unified / Remark / Rehype / DOMPurify)"]
        CryptoService["Service Cryptographique<br>(AES-256-GCM / Argon2id)"]
    end

    subgraph PersistenceTier ["Couche Persistance & Données"]
        Postgres[(PostgreSQL 16 Engine<br>7 Tables Relationnelles / Index GIN)]
        RedisStore[(Redis 7 Cluster / Standalone<br>Files BullMQ, Cache & Pub/Sub)]
        FileSystem[(Stockage Fichiers Markdown<br>Dossier Local chiffré & Cloud Object Storage)]
    end

    WebPWA <-->|HTTPS / WSS| APIServer
    DiscordApp <-->|WebSocket / REST| APIServer
    APIServer <--> CryptoService
    APIServer <--> MarkdownEngine
    MarkdownEngine <--> FileSystem
    APIServer <--> Postgres
    APIServer <--> RedisStore
    SchedulerWorker <--> RedisStore
    SchedulerWorker <--> Postgres
```

---

## 2. Choix Technologiques Détaillés & Rationale d'Ingénierie

### 2.1 Frontend HUD : Next.js 14+ (App Router), TailwindCSS & Framer Motion
* **Rationale :**
  * *Rendu Hybride (SSR / RSC / Client Components) :* Chargement initial instantané du profil joueur via Server Components, avec composants réactifs interactifs pour le chronomètre de Time-Blocking et les animations d'XP.
  * *Esthétique Solo Leveling :* Utilisation de classes utilitaires Tailwind avec variables CSS dynamiques :
    * Thème Sombre (*The Monarch*) : Couleurs primaires `#05050A` (noir abyssal), `#00E5FF` (cyan néon), `#0051FF` (bleu électrique royal), reflets en *glassmorphism* avec `backdrop-blur-md` et ombres portées `box-shadow: 0 0 25px rgba(0, 229, 255, 0.3)`.
    * Thème Clair (*Awakening*) : Couleurs primaires `#FFFFFF` (blanc titane), `#F8FAFC` (albâtre givré), `#FF6B00` (orange système tactique).
  * *Framer Motion :* Animation fluide des barres de progression d'expérience, décompte numérique des points d'XP (effet compteur roulant), animations des popups d'alerte *"SYSTEM NOTIFICATION"*.

### 2.2 Backend & API : Node.js / TypeScript Stricte
* **Rationale :**
  * Typage end-to-end de bout en bout partagé entre l'API, le HUD et le Bot Discord via des schémas de validation Zod unifiés (`@levelup/contracts`).
  * Architecture modulaire structurée en couches :
    * `controllers/` : Gestion des requêtes HTTP et formats de sortie.
    * `services/` : Logique métier pure (moteur de calcul d'XP, machine à états des rangs).
    * `repositories/` : Abstraction d'accès aux données via Prisma ORM.
    * `workers/` : Tâches de fond et alarmes déportées.

### 2.3 Persistance & Base de Données : PostgreSQL 16 & Redis 7
* **PostgreSQL 16 :**
  * Support natif des identifiants UUID v4 pour l'ensemble des clés primaires.
  * Utilisation du type `BIGINT` pour les compteurs d'XP cumulative afin d'éviter tout dépassement d'entier 32-bit.
  * Index GiST / GIN pour la recherche plein texte ultrarapide sur l'intégralité du Cerveau Numérique Markdown.
  * Contraintes d'intégrité CHECK garantissant qu'aucune valeur de stat ou de niveau ne dévie des règles métier.
* **Redis 7 :**
  * Moteur de file d'attente pour **BullMQ** (gestion des alarmes, rappels de transition, jobs de synchronisation).
  * Cache mémoire ultra-rapide pour l'état de session et le statut actif du joueur.
  * Mécanisme de Verrouillage Distribué (*Distributed Locks via Redlock*) pour interdire formellement toute double validation concurrente de quête.

---

## 3. Architecture du Pipeline de Transcription Vocale

```mermaid
sequenceDiagram
    autonumber
    actor Joueur as Joueur (Mobile / PC)
    participant Client as Client Web / Discord
    participant API as API Transcription Service
    participant Whisper as Modèle Whisper / Gemini Audio
    participant Architect as L'Architecte (IA Antigravity)
    participant Storage as Second Brain Markdown

    Joueur->>Client: Déclenche l'enregistrement vocal (Dictée de résumé)
    Client->>Client: Capture MediaRecorder (Opus / WebM 48kHz, mono)
    Client->>API: POST /api/v1/audio/transcribe (Payload multipart/form-data)
    
    API->>API: Validation du flux audio (Durée 1s - 300s, taille max 25MB)
    API->>Whisper: Inférence audio vers texte
    Whisper-->>API: Transcription brute (UTF-8 avec horodatages)
    
    API->>Architect: Analyse du texte brut + Demande de structuration Markdown
    Architect-->>API: JSON : { points_cles, resume_executif, tags, qualite_score, note_stat }
    
    API->>Storage: Écriture du fichier Markdown [[synthese-sujet-date.md]]
    API->>API: Attribution de l'XP méritée selon qualite_score
    API-->>Client: Réponse 201 Created : Note créée + XP créditée
    Client-->>Joueur: Affichage popup Solo Leveling : "NOTE ENREGISTRÉE (+XP)"
```

### 3.1 Spécifications Techniques Audio
* **Format d'Enregistrement :** WebM avec codec Opus à un débit de 64 kbps (mono), taux d'échantillonnage de 48 000 Hz, assurant une clarté optimale pour la reconnaissance vocale tout en limitant la taille réseau ($< 500\text{ Ko}$ par minute d'audio).
* **Détection d'Activité Vocale (VAD) :** Analyse préalable de l'énergie acoustique (RMS). Si l'énergie moyenne est sous le seuil de bruit de fond pendant l'intégralité du fichier, rejet propre avec code HTTP `422 Unprocessable Entity` ("Flux audio silencieux").
* **Fallback & Haute Disponibilité :** En cas d'indisponibilité de l'API Whisper locale, bascule automatique transparente vers l'endpoint audio multimodal de Gemini 1.5 Flash.

---

## 4. Architecture du Bot Discord (Passerelle Temps Réel)

```mermaid
flowchart LR
    DiscordGateway["Discord Gateway (WSS)"] <--> DiscordDaemon["Discord.js v14 Daemon"]
    DiscordDaemon --> AuthGuard{"Vérification ID Utilisateur<br>(Single-User Guard)"}
    
    AuthGuard -->|ID != Master| Reject["Refus Immédiat 403 (Message Éphémère)"]
    AuthGuard -->|ID == Master| Router["Routeur de Commandes"]

    Router --> CmdStatus["/status (Embed Holographique)"]
    Router --> CmdToday["/today (Quêtes & Blocs)"]
    Router --> CmdComplete["Bouton interactif [Valider]"]
    Router --> CmdRecap["/recap (Dépôt mémo)"]

    CmdStatus --> CoreAPI["LevelUp Backend API"]
    CmdToday --> CoreAPI
    CmdComplete --> CoreAPI
    CmdRecap --> CoreAPI
```

### 4.1 Caractéristiques Techniques du Bot
* **Bibliothèque :** `discord.js` v14 avec support complet des composants d'interaction (Boutons `ButtonBuilder`, Menus déroulants `StringSelectMenuBuilder`, Modales de saisie `ModalBuilder`).
* **Intents Minimum Nécessaires :** `GatewayIntentBits.Guilds`, `GatewayIntentBits.GuildMessages`, `GatewayIntentBits.DirectMessages`. Zéro intent privilégié inutile pour maximiser la sécurité.
* **Sécurité & Contrôle d'Accès Stricte :** Le bot compare chaque `interaction.user.id` avec la constante système `DISCORD_MASTER_USER_ID`. Si un utilisateur externe tente d'interagir avec le bot, l'interaction est immédiatement avortée sans aucune fuite d'information.

---

## 5. Moteur de Planification Temporelle (Time-Blocking & Queue BullMQ)

Le respect du planning impose un moteur de tâches d'arrière-plan d'une fiabilité absolue :
* **File d'Attente Dédiée :** File BullMQ `schedule-alarms` alimentée par Redis.
* **Typologie des Jobs :**
  1. `DAILY_QUEST_GENERATOR` : Exécution programmée à 06h00 UTC chaque matin.
  2. `BLOCK_TRANSITION_ALARM` : Job retardé (*delayed job*) programmé pour chaque début et fin de bloc de travail.
  3. `MIDNIGHT_RESOLVER` : Exécution à 23h59 UTC pour clôturer les quêtes, vérifier les taux de complétion et déclencher la zone de pénalité en cas d'abandon.
* **Stratégie de Reprise sur Incident (*Retry Policy*) :**
  * 3 tentatives automatiques en cas d'échec réseau.
  * Backoff exponentiel : $1\text{ s} \rightarrow 5\text{ s} \rightarrow 25\text{ s}$.
  * Dead Letter Queue (DLQ) pour tout job corrompu afin de ne jamais bloquer la file d'attente.

---

## 6. L'Agent "L'Architecte" (Antigravity & Deerflow)

### 6.1 Rôle de l'Agent dans Antigravity
L'Architecte n'est pas un simple chatbot conversationnel : c'est un agent d'ingénierie autonome avec des responsabilités précises :
1. **Évaluation Sévère & Juste :** Lors de la soumission d'une synthèse d'étude ou de lecture, l'Architecte analyse :
   * L'originalité et la profondeur de la réflexion.
   * L'exactitude technique des concepts abordés.
   * La concision et la structure des points clés.
   * Il attribue une note sur 20 et module le gain d'XP en conséquence (0 XP pour une note $< 10/20$, XP nominale pour une note $\ge 15/20$).
2. **Génération de Programme Personnalisé :** L'Architecte prend en compte les échéances universitaires réelles, le niveau de fatigue physique (jauge HP) et les priorités de la semaine pour produire le découpage optimal des blocs de temps.

### 6.2 Connecteur Deerflow (Chasseur de Bourses & Opportunités)
* **Mécanisme :** Exécution de requêtes de veille ciblées toutes les 72 heures :
  * Mots-clés : `"Bourse d'études intelligence artificielle"`, `"AI master scholarship Europe"`, `"Hackathon Devpost AI ML"`, `"Subvention mobilité étudiante tech"`.
* **Traitement & Filtrage :** Déduplication des opportunités par URL canonique, vérification que la date limite de candidature est supérieure à $J+7$, et insertion automatique dans la table `opportunities` avec notification sur le HUD.
