# Plan de Test & Stratégie d'Assurance Qualité — LevelUp

> **Document ID :** TST-LVLUP-007  
> **Version :** 3.1.0 (Édition Pareto Simplifiée)  
> **Statut :** Approuvé pour Implémentation  

---

## 1. Pyramide des Tests & Outillage

La fiabilité du moteur LevelUp repose sur une suite de tests automatisée exécutée avec **Vitest** :

```
         /   \
        / E2E \       -> Scénarios journées complètes, Playwright (tests/e2e)
       /-------\
      / Intégr. \     -> Concurrence Redlock, Transactions Prisma, Routes HTTP
     /-----------\
    /   Unitaires \   -> Formules mathématiques (SM-2, Moyenne harmonique, XP, Pose)
   /---------------\
```

* **Runner de Test** : Vitest v3 (`pnpm exec vitest run`).
* **Couverture Validée** : **39 suites de tests, 188 tests passants (100% de succès)**.
* **Environnement** : Node.js avec mocks légers en mémoire pour Redis et PostgreSQL (fallback SQLite / mocks vi).

---

## 2. Référentiel des Tests Critiques (Invariants Système)

| Suite de Test | Cible Métier | Assertion Inviolable |
| :--- | :--- | :--- |
| `tests/services/questAtomicAward.test.ts` | Anti-Double Dépense & Concurrence | Deux requêtes concurrentes sur la même quête ne créditent l'XP qu'une seule fois. Une 2ème tentative lève un conflit HTTP 409. |
| `packages/crypto/src/encryption.test.ts` | Hachage & Chiffrement d'Enveloppe | Validation du hachage Argon2id et du chiffrement AES-256-GCM avec vérification du tag d'intégrité. |
| `tests/unit/engine/harmonic_rank.spec.ts` | Score Harmonique ($S_{\text{global}}$) | Si une seule base de vie est négligée ($S_b \to 0$), le score global s'effondre obligatoirement. |
| `tests/services/sm2Algorithm.test.ts` | Répétition Espacée SM-2 | Le facteur de facilité ne peut descendre en dessous de $1.3$, et les intervalles $I_n$ augmentent selon $q$. |
| `tests/unit/security/nextdns.spec.ts` | Résilience API NextDNS | Gestion sans crash des timeouts réseau et validation des requêtes d'ajout en liste noire. |
| `tests/unit/cv/mediapipe_counter.spec.ts` | Détection Cinématique de Répétitions | Les répétitions ne sont incrémentées que si l'angle articulaire franchit le seuil postural valide. |
| `tests/guards/singleUserGuard.test.ts` | Sécurité Compte Unique | Rejet de toute interaction tentée par un identifiant différent de `SYSTEM_PLAYER_ID`. |

---

## 3. Commandes d'Exécution

```bash
# Exécution complète de tous les tests
pnpm exec vitest run

# Mode surveillance pendant le développement
pnpm exec vitest

# Exécution ciblée d'une suite
pnpm exec vitest run tests/services/questAtomicAward.test.ts
```
