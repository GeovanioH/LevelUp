# LevelUp ("The System") — Documentation Fondamentale

> **Système d'Exploitation de Vie, de Discipline et d'Excellence Personnelle inspiré de Solo Leveling.**  
> *Transforme tes études en IA, ta cybersécurité, ton développement, ta condition physique et ton avenir en un RPG d'élite impitoyable.*

---

## 1. Présentation & Vision du Produit

**LevelUp ("The System")** est un méta-orchestrateur personnel conçu pour amener un étudiant en Intelligence Artificielle et passionné de cybersécurité du **Rang F** jusqu'au prestigieux rang de **Monarque**.

Le Système repose sur 4 convictions inébranlables :
1. **Zéro réinvention artificielle :** Le Système s'appuie sur le monde réel et te propulse vers les meilleures opportunités gratuites existantes (Cambridge English, GitHub Student Developer Pack, TryHackMe, Harvard CS50).
2. **Mesure intégrale de l'effort :** Tout travail accompli génère de l'XP et alimente l'un des **8 Arbres de Vie Fondamentaux**.
3. **Omniprésence & Immersion :** Accessible via un HUD Web holographique (Thème Sombre néon / Thème Clair orange) et pilotable à la voix et sur mobile via un Bot Discord réactif.
4. **Intelligence Active :** Un agent IA dédié (**L'Architecte**) logé dans Antigravity calibre tes journées, évalue tes synthèses et prospecte les bourses et hackathons via Deerflow.

---

## 2. Les 8 Piliers Statistiques de Vie

```
[ACAD]    Excellence Académique      — Cursus IA, révisions, partiels, 1er de promotion
[AI_ENG]  Ingénierie IA & Hackathons — Projets perso, code, MVPs, recherche, hackathons
[CYBER]   Cybersécurité & Défense    — TryHackMe, HackTheBox, CTFs, audits de code
[EXP]     Éloquence & Réseautage     — Prise de parole, confiance en soi, networking pro
[LNG]     Langues & Anglais          — Anglais niveau C1/C2 (Cambridge, EF SET), VO
[FIN]     Finances & Opportunités    — Bourses d'études (Deerflow), budget, investissements
[STR]     Puissance Physique         — Musculation (dos, bras, abdos, jambes), condition
[DIS]     Discipline & Volonté       — Tenue des engagements, Deep Work, anti-distraction
```

---

## 3. Architecture Technique

```mermaid
flowchart TD
    subgraph Clients ["Interfaces Utilisateur"]
        WebHUD["Web HUD (Next.js 14+ / Tailwind / Lucide / Framer Motion)"]
        Discord["Bot Discord (Mobile & PC via Discord.js)"]
    end

    subgraph Core ["Noyau Système & API"]
        API["API REST unifiée (Next.js App Router / FastAPI)"]
        Scheduler["Planificateur & Alertes (BullMQ / Cron)"]
        Brain["Cerveau Numérique Natif (Markdown & Wikilinks)"]
        Voice["Module Transcription Vocale (Whisper / Gemini)"]
    end

    subgraph Data ["Données & Persistance"]
        Postgres[(PostgreSQL 16 - Profil, Quêtes, Stats)]
        Redis[(Redis 7 - Files d'attente & Cache)]
        Notes[(Dossier Notes Markdown Local)]
    end

    subgraph External ["Écosystème Intelligent"]
        Antigravity["Antigravity (Agent L'Architecte)"]
        Deerflow["Deerflow (Recherche Bourses & Hackathons)"]
        Platforms["Cambridge / GitHub Pack / TryHackMe"]
    end

    WebHUD <--> API
    Discord <--> API
    API <--> Postgres
    API <--> Redis
    API <--> Brain
    Brain <--> Notes
    API <--> Voice
    API <--> Antigravity
    Antigravity <--> Deerflow
    Antigravity <--> Platforms
```

---

## 4. Démarrage Rapide (Installation Locale)

### 4.1 Prérequis
* Node.js $\ge 20.x$ ou Python $\ge 3.11$
* pnpm (`npm install -g pnpm`)
* Docker & Docker Compose
* Un compte Discord Developer (pour le Bot Token)
* Une clé d'API Google Gemini / Antigravity

### 4.2 Installation en 4 Étapes

```bash
# 1. Cloner et se positionner dans le projet
cd C:\Users\ADMIN\.gemini\antigravity\scratch\LevelUp

# 2. Installer les dépendances
pnpm install

# 3. Lancer les conteneurs PostgreSQL et Redis
docker compose up -d

# 4. Appliquer les migrations de base de données
pnpm prisma migrate dev

# 5. Démarrer le serveur Web et le Bot Discord
pnpm dev
```

---

## 5. Variables d'Environnement (`.env.example`)

```env
# Base de Données & Cache
DATABASE_URL="postgresql://levelup:secret_password@localhost:5432/levelup_db?schema=public"
REDIS_URL="redis://localhost:6379"

# Sécurité & Chiffrement
NEXTAUTH_SECRET="votre_secret_jwt_genere_aleatoirement"
APP_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Bot Discord
DISCORD_BOT_TOKEN="votre_discord_bot_token"
DISCORD_CLIENT_ID="votre_discord_app_client_id"
DISCORD_MASTER_USER_ID="votre_discord_user_id_prive"

# Intégrations IA & Recherche
GEMINI_API_KEY="votre_cle_gemini_api"
DEERFLOW_API_TOKEN="votre_cle_deerflow"
```

---

## 6. Commandes du Bot Discord

* `/status` : Affiche ta carte de statut Solo Leveling avec niveau, rang et les 8 jauges.
* `/today` : Récapitule les quêtes quotidiennes actives et les blocs horaires restants.
* `/complete <quest_id>` : Déclare une quête achevée avec transmission de preuve.
* `/recap <sujet>` : Enregistre une synthèse d'étude dans le Second Brain et l'envoie à l'Architecte.
* `/monkmode` : Affiche l'ordonnancement de la prochaine journée commando.

---

## 7. Structure de la Documentation Officielle (`docs/`)

* **`01-PRD.md`** : Product Requirements Document complet.
* **`02-TRD.md`** : Spécifications techniques et choix d'architecture logicielle.
* **`03-APP_FLOW.md`** : Parcours utilisateur, cinématique des écrans et diagrammes de flux.
* **`04-BACKEND_SCHEMA.md`** : Modèle relationnel, tables, contraintes et formules d'XP.
* **`05-SECURITY.md`** : Invariants de sécurité, chiffrement AES-256-GCM et protection des tokens.
* **`06-API_SPEC.md`** : Spécification des endpoints REST et formats d'échange JSON.
* **`07-TEST_PLAN.md`** : Stratégie de test, recette et indexation des 100 cas de défaillances.
* **`08-IMPLEMENTATION_PLAN.md`** : Plan de développement étape par étape avec mini-tests de gating.
* **`09-ROADMAP.md`** : Roadmap stratégique intégrant le Blueprint d'architecture et de release.
