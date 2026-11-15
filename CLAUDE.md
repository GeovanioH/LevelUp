# Directives Générales de Développement — LevelUp

> Ce document définit les normes d'architecture, de code et de tests pour tout développeur ou agent d'IA intervenant sur le codebase **LevelUp**.

---

## 1. Vue d'Ensemble du Projet

LevelUp est un système modulaire d'auto-quantification et de gamification de vie régissant 8 bases de compétences (`ACAD`, `AI_ENG`, `CYBER`, `EXP`, `LNG`, `FIN`, `STR`, `DIS`).
Le calcul de progression repose sur une moyenne harmonique pondérée ($S_{\text{global}}$) et des jauges physiologiques ($HP$, $MP$) scientifiquement modélisées.

> [!IMPORTANT]
> Les données personnelles de l'utilisateur actif (objectifs académiques, programmes sportifs, comptes externes) sont isolées dans [`config/personal_profile.md`](config/personal_profile.md). La base de code et sa documentation générale doivent demeurer 100% génériques et modulaires.

---

## 2. Structure du Monorepo

```
LevelUp/
├── apps/
│   ├── web/         # PWA Next.js 14 (App Router), Tailwind CSS, Framer Motion, Shaders WebGL
│   ├── api/         # Backend Fastify, TypeScript strict, WebSockets, Zod
│   └── bot/         # Bot Discord.js v14, streaming audio vocal UDP/Opus
├── packages/
│   ├── contracts/   # Types partagés, schémas Zod, formules mathématiques (XP, rangs)
│   ├── crypto/      # Chiffrement AES-256-GCM, hachage Argon2id, signatures HMAC
│   ├── database/    # Schéma Prisma, migrations, scripts de seed PostgreSQL / SQLite
│   └── engine/      # Moteur de règles, calculs harmoniques, algorithme SM-2
├── config/
│   └── personal_profile.md  # Profil et objectifs personnels de l'utilisateur
├── docs/            # Spécifications fonctionnelles et techniques
└── tests/           # Suites de tests d'intégration, E2E et sécurité
```

---

## 3. Normes Techniques & Invariants de Code

### TypeScript Strict
* `strict: true` activé sur l'ensemble des packages et applications.
* Aucun `any` toléré : utiliser des types explicites ou des génériques typés avec Zod.
* Tous les types de domaine partagés doivent être déclarés dans `packages/contracts`.

### Backend Fastify (`apps/api`)
* Validation systématique des requêtes et réponses via des schémas Zod ou JSON Schema Fastify.
* Gestion des transactions via Prisma `$transaction`.
* Concurrence et anti-double dépense protégées par verrous distribués Redis / Redlock (`QuestService`).
* Codes d'état HTTP stricts : `200` (Succès), `201` (Créé), `400` (Validation), `401` (Non authentifié), `403` (Refusé), `409` (Conflit / Double dépense), `429` (Rate limit).

### Frontend Next.js (`apps/web`)
* Architecture Next.js 14 App Router (`app/`).
* Composants clients marqués explicitement par `'use client'`.
* Styling modulaire avec Tailwind CSS, classes conditionnelles via `clsx` / `tailwind-merge`.
* Optimisation performance : suppression des animations lourdes pendant les flux vidéo ou visuels critiques.

### Sécurité & Cryptographie (`packages/crypto`)
* Mots de passe et secrets hachés avec **Argon2id**.
* Données sensibles chiffrées avec **AES-256-GCM** (clé de 256 bits, IV de 96 bits, tag d'authentification de 128 bits).
* Webhooks externes (Deerflow) vérifiés par signature **HMAC-SHA256**.
* Appels API NextDNS sécurisés par jeton d'authentification et gestion d'erreurs résiliente.

---

## 4. Stratégie de Tests

Toutes les modifications doivent maintenir la suite de tests au vert :
```bash
# Lancer tous les tests unitaires et d'intégration
pnpm exec vitest run

# Lancer un test spécifique
pnpm exec vitest run tests/unit/engine/harmonic_rank.spec.ts
```

### Règles de Test Invariants
1. **Anti-Double Dépense** : Toute validation de quête déjà validée doit lever une erreur HTTP 409 (`tests/services/questAtomicAward.test.ts`).
2. **Concurrence Redlock** : Deux requêtes simultanées de validation de quête ne doivent attribuer les points qu'une seule fois.
3. **Moyenne Harmonique** : Une base à zéro doit faire s'effondrer le score global ($S_{\text{global}} \to 0$).
4. **Calcul du Sommeil & Mana** : Les modèles Borbély ($HP$) et Boksem ($MP$) doivent respecter les bornes $[0, 100]$.

---

## 5. Commandes Fréquentes

| Commande | Action |
| :--- | :--- |
| `pnpm install` | Installer toutes les dépendances du monorepo |
| `pnpm dev` | Démarrer l'ensemble des services en mode développement |
| `pnpm build` | Compiler tous les packages et applications |
| `pnpm exec vitest run` | Exécuter la suite complète de tests (39 suites, 188 tests) |
| `pnpm exec prisma db push` | Appliquer les modifications du schéma Prisma sans migration |
| `pnpm exec prisma db seed` | Peupler la base avec les 120 compétences et données initiales |
