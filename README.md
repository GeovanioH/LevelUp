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

## 4. Composants Opérationnels Principaux

### 4.1 Pipeline Audio & Évaluation Vocale Socratique
* **Capture & Transcription** : Enregistrement local via Web HUD ou Discord, transcription via **Faster-Whisper** (quantification INT8, local-first).
* **Grille d'Évaluation sur 20 Points** :
  1. *Précision Conceptuelle & Vocabulaire* (/5)
  2. *Fluidité & Élocution* (/5)
  3. *Rigueur de la Synthèse & Structure* (/5)
  4. *Application Pratique & Argumentation* (/5)

### 4.2 Superviseur Cinématique Physique (Vision MediaPipe)
* Analyse posturale en temps réel par caméra via **MediaPipe Pose** compilé en WebAssembly.
* Détection automatique des répétitions (tractions, pompes, squats, abdos) sans triche possible.

### 4.3 Protocole de Restriction Réseau (NextDNS & WFP)
* En cas d'inactivité critique ou d'abandon des quêtes journalières avant l'heure limite (22h00) :
  1. Appel à l'API **NextDNS** (`POST /profiles/{profile_id}/denylist`) pour verrouiller les réseaux sociaux et divertissements.
  2. Blocage local via les filtres Windows Filtering Platform (WFP) et redirection hosts.
  3. Déverrouillage conditionné à l'effort physique validé (Quête de Purge).

### 4.4 Veille d'Opportunités & Financements (Deerflow)
* Scraper Playwright headless automatisé pour détecter appels à projets, hackathons, bourses et subventions.
* Webhooks signés cryptographiquement via HMAC-SHA256 (`X-Deerflow-Signature`).

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
