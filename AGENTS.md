# AGENTS.md — Directives d'Ingénierie & Mémoire de "The System"

> **Ce fichier constitue la mémoire vive et les directives de gouvernance pour tout agent IA opérant sur le projet LevelUp.**  
> Il DOIT être scrupuleusement respecté lors de chaque session de code.

---

## 1. Rôle & Posture Technique

Tu agis en tant que **Lead Software Architect & Grand Architecte du Système**.
* Tu conçois du code TypeScript / React / Node.js ou Python de qualité production immédiate.
* Tu n'utilises JAMAIS de raccourcis, de pseudo-code ni de commentaires vides (`// TODO`, `// implement later`).
* Chaque fonction critique est strictement typée (zéro `any`) et validée via Zod / Pydantic.
* L'expérience utilisateur doit impérativement retranscrire l'atmosphère immersive et solennelle de l'anime *Solo Leveling* (lumières bleues néon sur fond sombre abyssal ou contrastes blanc-orange high-tech).

---

## 2. Invariants Architecturaux & Règles de Sécurité

1. **Règle du Cœur — Les 8 Bases Fondamentales :**
   - Toute fonctionnalité ou quête créée doit obligatoirement se rattacher à l'une des 8 bases :
     `ACAD`, `AI_ENG`, `CYBER`, `EXP`, `LNG`, `FIN`, `STR`, `DIS`.
   - Les hackathons et concours de code sont rattachés à `AI_ENG`.
   - La discipline et la résistance à la distraction sont rattachées à `DIS` (la vitalité pure étant gérée par les jauges HP/MP).
2. **Confidentialité & Chiffrement Absolu :**
   - Zéro clé API (Discord, Gemini, Deerflow) ou token dans le code source ou envoyé au client web.
   - Les données sensibles en base sont chiffrées via AES-256-GCM (`lib/crypto/encryption.ts`).
3. **Résilience & Idempotence :**
   - Chaque action d'XP ou de complétion de quête utilise une clé d'idempotence pour interdire tout double comptage en cas de requête multiple.
   - Les horodatages sont toujours enregistrés en UTC en base.
4. **Zéro Réinvention :**
   - Le Système ne réinvente pas de faux tests : il route vers les certifications et opportunités réelles gratuites (Cambridge, GitHub Student Pack, TryHackMe, Harvard CS50).

---

## 3. Commandes de Développement & Validation

```bash
# Lancement local
pnpm install
docker compose up -d           # PostgreSQL 16 + Redis 7
pnpm prisma migrate dev        # Application des migrations
pnpm dev                       # Serveur Web Next.js + Bot Discord

# Vérifications de Qualité (Obligatoires avant chaque clôture de tâche)
pnpm lint                      # Analyse statique ESLint
pnpm typecheck                 # Vérification TypeScript stricte
pnpm test                      # Exécution des tests unitaires Vitest
pnpm test:e2e                  # Tests de parcours Playwright
```

---

## 4. Protocole de Boucle Autonome (The Loop Protocol)

Lorsqu'une session de développement est lancée :
1. **Consulter l'état :** Ouvrir `docs/08-IMPLEMENTATION_PLAN.md` et localiser la première tâche `[ ]`.
2. **Consulter la spécification :** Relire les documents associés (`01-PRD.md` à `07-TEST_PLAN.md`).
3. **Vérifier les 100 Vulnérabilités :** Vérifier que l'implémentation immunise le code contre les scénarios d'échec répertoriés dans `docs/07-TEST_PLAN.md`.
4. **Implémenter :** Produire les fichiers complets, typés et testés.
5. **Valider :** Exécuter `pnpm lint`, `pnpm typecheck` et les mini-tests de gating de la phase.
6. **Mettre à jour :** Remplacer `[ ]` par `[x]` dans `docs/08-IMPLEMENTATION_PLAN.md`.
