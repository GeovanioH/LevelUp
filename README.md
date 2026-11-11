# LevelUp ("The System") — Documentation Fondamentale & Guide Technique Exhaustif

> **Système d'Exploitation de Vie, de Discipline et d'Excellence Personnelle inspiré de l'anime Solo Leveling.**  
> *Transforme tes études en Intelligence Artificielle, ta cybersécurité, ton développement logiciel, ta condition physique et ton avenir en un RPG d'élite déterministe.*

---

## 1. Présentation Générale & Vision du Produit

**LevelUp ("The System")** est un méta-orchestrateur personnel conçu pour accompagner un étudiant en Intelligence Artificielle et passionné de cybersécurité depuis le **Rang F (Civil)** jusqu'au sommet absolu : le **Rang de Monarque**.

Le Système repose sur 4 piliers inébranlables :
1. **Zéro réinvention artificielle (Ancrage Réel) :** Le Système ne crée pas de faux tests ni de mini-jeux artificiels. Il s'interface directement avec le monde réel et te propulse vers les meilleures opportunités gratuites existantes (Cambridge English, GitHub Student Developer Pack, TryHackMe, Harvard CS50, Devpost).
2. **Mesure intégrale de l'effort :** Tout travail accompli génère de l'XP et alimente l'un des **8 Arbres de Vie Fondamentaux** (`ACAD`, `AI_ENG`, `CYBER`, `EXP`, `LNG`, `FIN`, `STR`, `DIS`).
3. **Omniprésence & Immersion :** Accessible via un HUD Web holographique (Thème Sombre néon cyan / Thème Clair orange tactique) et pilotable à la voix et sur mobile via un Bot Discord réactif.
4. **Intelligence Active :** Un agent IA dédié (**L'Architecte**) logé dans Antigravity calibre tes journées, évalue tes synthèses de cours et prospecte les bourses et hackathons via Deerflow.

---

## 2. Les 8 Piliers Statistiques de Vie (Arbres d'Attributs)

```
[ACAD]    Excellence Académique      — Cursus IA, révisions, partiels, 1er de promotion, alternance
[AI_ENG]  Ingénierie IA & Hackathons — Projets perso, code, architectures, MVPs, compétitions Devpost
[CYBER]   Cybersécurité & Défense    — TryHackMe, HackTheBox, CTFs, audits de code, durcissement
[EXP]     Éloquence & Réseautage     — Prise de parole en public, confiance en soi, networking pro
[LNG]     Langues & Anglais          — Anglais niveau C1/C2 certifié (Cambridge, EF SET), VO 100%
[FIN]     Finances & Opportunités    — Bourses d'études (Deerflow), budget, investissements, subventions
[STR]     Puissance Physique         — Musculation ciblée (dos, bras, abdos, jambes), condition athlétique
[DIS]     Discipline & Volonté       — Deep Work ininterrompu, tenue des engagements, anti-distraction
```

*Note sur l'Énergie Biologique :* La vitalité et la fatigue ne sont pas une statistique que l'on augmente arbitrairement, mais sont représentées par deux jauges vitales dynamiques :
* **`HP` (Santé Physique) :** Alimentée par la durée et la qualité du sommeil.
* **`MP` (Focus Mental) :** Consommée par les sessions de concentration intense et rechargée par des pauses structurées.

---

## 3. Architecture Technique Globale

```mermaid
flowchart TD
    subgraph Clients ["Interfaces Utilisateur"]
        WebHUD["Web HUD Holographique (Next.js 14+ / TailwindCSS / Framer Motion)<br>Thème Sombre néon & Thème Clair orange"]
        DiscordBot["Bot Discord LevelUp (Mobile & Desktop via Discord.js v14)"]
    end

    subgraph Core ["Noyau Système & API"]
        API["API REST unifiée (Next.js App Router / TypeScript)"]
        Scheduler["Planificateur & Alertes (BullMQ v5 / Redis 7)"]
        Brain["Cerveau Numérique Natif (Markdown, Wikilinks & AST)"]
        Voice["Module Transcription Vocale (Whisper / Gemini Flash Audio)"]
    end

    subgraph Data ["Données & Persistance"]
        Postgres[(PostgreSQL 16 Engine - 7 Tables, Index GIN, UUID)]
        Redis[(Redis 7 - Files BullMQ, Cache & Redlock)]
        NotesStore[(Arborescence Locale Fichiers Markdown)]
    end

    subgraph Intelligence ["Écosystème Intelligent"]
        Antigravity["Antigravity Runtime (Agent 'L'Architecte')"]
        Deerflow["Deerflow Web Engine (Scraping Bourses & Hackathons)"]
        ExternalPlatforms["Cambridge / GitHub Pack / TryHackMe"]
    end

    WebHUD <--> API
    DiscordBot <--> API
    API <--> Postgres
    API <--> Redis
    API <--> Brain
    Brain <--> NotesStore
    API <--> Voice
    API <--> Antigravity
    Antigravity <--> Deerflow
    Antigravity <--> ExternalPlatforms
```

---

## 4. Guide de Démarrage Rapide (Installation Locale Complète)

### 4.1 Prérequis Système
* **Node.js :** $\ge 20.10.0\text{ LTS}$
* **Gestionnaire de paquets :** `pnpm` $\ge 9.0.0$ (`npm install -g pnpm`)
* **Docker & Docker Compose :** Pour l'instanciation locale de PostgreSQL 16 et Redis 7.
* **Git :** $\ge 2.40.0$
* **Clés d'API requises :** Token de Bot Discord, Clé API Google Gemini / Antigravity, Clé API Deerflow.

### 4.2 Procédure d'Installation en 5 Étapes

```bash
# 1. Se positionner dans le répertoire du projet
cd C:\Users\ADMIN\.gemini\antigravity\scratch\LevelUp

# 2. Installer l'ensemble des dépendances de production et de test
pnpm install

# 3. Démarrer les conteneurs PostgreSQL et Redis en arrière-plan
docker compose up -d

# 4. Appliquer les migrations de base de données DDL
pnpm prisma migrate dev

# 5. Démarrer l'environnement de développement complet (Web HUD + Bot Discord + Workers)
pnpm dev
```

L'application Web est immédiatement accessible sur : **`http://localhost:3000`**.

---

## 5. Matrice des Variables d'Environnement (`.env.example`)

Créer un fichier `.env` à la racine en copiant ce modèle :

```env
# ==============================================================================
# CONFIGURATION BASE DE DONNÉES & CACHE
# ==============================================================================
DATABASE_URL="postgresql://levelup:secret_password@localhost:5432/levelup_db?schema=public"
REDIS_URL="redis://localhost:6379"

# ==============================================================================
# SÉCURITÉ, CHIFFREMENT & SESSIONS
# ==============================================================================
NEXTAUTH_SECRET="f8a109b4c2e3d5a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"
APP_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# ==============================================================================
# BOT DISCORD & VERROUILLAGE SINGLE-USER
# ==============================================================================
DISCORD_BOT_TOKEN="votre_discord_bot_token_secret"
DISCORD_CLIENT_ID="votre_discord_application_client_id"
DISCORD_GUILD_ID="votre_discord_serveur_id"
DISCORD_MASTER_USER_ID="votre_discord_user_id_prive"

# ==============================================================================
# MOTEURS D'INTELLIGENCE ARTIFICIELLE & RECHERCHE
# ==============================================================================
GEMINI_API_KEY="votre_cle_gemini_api"
DEERFLOW_API_TOKEN="votre_cle_deerflow"

# ==============================================================================
# STOCKAGE DU CERVEAU NUMÉRIQUE
# ==============================================================================
STORAGE_NOTES_ROOT="C:/Users/ADMIN/.gemini/antigravity/scratch/LevelUp/notes"
```

---

## 6. Manuel des Commandes du Bot Discord

Le bot est ton compagnon mobile permanent. Il ne répond qu'à ton ID Discord :

| Commande | Rôle & Action Exécutée |
| :--- | :--- |
| **`/status`** | Affiche ta carte de statut holographique Solo Leveling (Niveau, Rang, Jauges HP/MP et les 8 sphères de statistiques). |
| **`/today`** | Récapitule les Quêtes Quotidiennes actives, le bloc horaire en cours et le compte à rebours avant 23h59. |
| **`/complete <id>`** | Ouvre une boîte de dialogue pour soumettre une preuve (URL commit GitHub, capture d'écran, texte) et valider une quête. |
| **`/recap <sujet>`** | Permet de déposer une synthèse d'étude ou de lecture pour évaluation par l'Architecte et enregistrement dans le Second Brain. |
| **`/monkmode`** | Affiche le programme et l'ordonnancement de la prochaine journée commando (jeudi commando). |

---

## 7. Structure de la Documentation Officielle (`docs/`)

Le dossier `docs/` regroupe les 9 piliers contractuels de spécification d'ingénierie :

* **[`docs/01-PRD.md`](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/LevelUp/docs/01-PRD.md)** : Product Requirements Document (vision, personas, 8 bases, échelle des 9 rangs de F à Monarque, typologie des quêtes).
* **[`docs/02-TRD.md`](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/LevelUp/docs/02-TRD.md)** : Technical Requirements Document (architecture C4, Next.js 14, PostgreSQL/Redis, Whisper, Discord.js, Deerflow).
* **[`docs/03-APP_FLOW.md`](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/LevelUp/docs/03-APP_FLOW.md)** : Parcours utilisateur, cinématique de la journée, wireframes détaillés et embeds Discord.
* **[`docs/04-BACKEND_SCHEMA.md`](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/LevelUp/docs/04-BACKEND_SCHEMA.md)** : Modèle de données exhaustif, schéma Prisma officiel complet et formules d'XP.
* **[`docs/05-SECURITY.md`](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/LevelUp/docs/05-SECURITY.md)** : Spécifications de sécurité, modèle STRIDE, chiffrement AES-256-GCM, single-user lock Discord.
* **[`docs/06-API_SPEC.md`](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/LevelUp/docs/06-API_SPEC.md)** : Spécifications des endpoints REST, schémas Zod, mocks JSON et protocole WebSocket.
* **[`docs/07-TEST_PLAN.md`](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/LevelUp/docs/07-TEST_PLAN.md)** : Cahier de recette pré-code avec protocoles Step-by-Step, livrables, critères d'acceptation et **traité des 100 vulnérabilités**.
* **[`docs/08-IMPLEMENTATION_PLAN.md`](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/LevelUp/docs/08-IMPLEMENTATION_PLAN.md)** : Plan de découpage par phases avec mini-tests de gating stricts.
* **[`docs/09-ROADMAP.md`](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/LevelUp/docs/09-ROADMAP.md)** : Roadmap stratégique intégrant les Blueprints d'architecture et de release (V1.0, V1.5, V2.0).
