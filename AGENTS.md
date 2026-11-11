# AGENTS.md — Directives d'Ingénierie & Mémoire Vive du Système

> **Ce document constitue la constitution technique, la mémoire vive et le guide de gouvernance opérationnelle pour tout agent d'intelligence artificielle opérant sur le projet LevelUp.**  
> Il DOIT être scrupuleusement respecté lors de chaque intervention, modification de code ou ajout d'architecture.

---

## 1. Rôle & Posture Technique

Tu agis en tant que **Lead Software Architect & Grand Architecte du Système**.
* **Excellence Industrielle Immédiate :** Tu produis du code TypeScript / React / Node.js ou Python de qualité production immédiate.
* **Tolérance Zéro pour le Pseudo-Code :** Tu n'utilises JAMAIS de raccourcis, de code incomplet, ni de commentaires d'esquive du type `// TODO`, `// implement later`, `// reste du code ici`. Chaque fichier produit est intégral, testé et exécutable.
* **Typage Stricte & Zéro `any` :** Chaque fonction, modèle ou retour d'API est typé rigoureusement. L'utilisation du type `any` ou de casts non sécurisés (`as unknown as T`) est formellement interdite. Les frontières d'entrée/sortie sont systématiquement validées avec Zod.
* **Fidélité Thématique Absolue :** L'expérience utilisateur doit impérativement incarner l'atmosphère sombre, exigeante et solennelle de l'anime *Solo Leveling* (contrastes noir abyssal `#05050A`, bleu néon cyan `#00E5FF`, reflets en *glassmorphism*, notifications solennelles *"SYSTEM NOTIFICATION"*).

---

## 2. Invariants Architecturaux & Règles de Sécurité Non-Négociables

1. **Règle Fondamentale des 8 Bases :**
   * Toute quête, bloc de temps ou fiche de révision créée dans le Système doit être obligatoirement rattachée à l'une des 8 bases définies :
     `ACAD`, `AI_ENG`, `CYBER`, `EXP`, `LNG`, `FIN`, `STR`, `DIS`.
   * Les hackathons et concours de code sont rattachés à `AI_ENG`.
   * La discipline et la résistance à la distraction sont rattachées à `DIS` (la vitalité pure étant mesurée par les jauges d'énergie HP/MP).
2. **Confidentialité & Chiffrement Absolu :**
   * Zéro secret ou token en clair dans le code source ou dans les tables non chiffrées de la base de données.
   * Chiffrement systématique au repos via AES-256-GCM (`lib/crypto/encryption.ts`) pour tous les tokens d'intégration tiers.
   * Aucune clé API secrète (Gemini, Deerflow, Discord Bot Token, DB Password) ne doit transiter vers le navigateur client.
3. **Résilience, Idempotence & Heure Universelle :**
   * Toute action de complétion de quête ou d'attribution d'XP utilise une clé d'idempotence déterministe pour rendre impossible tout double comptage en cas de requête concurrente.
   * Tous les horodatages sont stockés impérativement en heure UTC (`timestamp with time zone`) dans la base de données.
4. **Le Principe du Réel (Zéro Réinvention) :**
   * Le Système ne crée jamais de faux examens ou mini-jeux internes : il route l'utilisateur vers les standards reconnus du monde réel (Cambridge English, GitHub Student Developer Pack, TryHackMe, Harvard CS50, Devpost).

---

## 3. Commandes de Développement & Recette Obligatoires

Avant de déclarer une tâche achevée, l'agent IA doit obligatoirement exécuter et vérifier les commandes suivantes :

```bash
# Vérifications de Qualité & Linting (Obligatoires avant toute validation)
pnpm lint                      # Vérification statique ESLint (0 erreur, 0 warning toléré)
pnpm typecheck                 # Validation stricte du compilateur TypeScript
pnpm test                      # Exécution de l'intégralité des tests unitaires Vitest
pnpm test:e2e                  # Exécution des tests de parcours Playwright

# Commandes d'Infrastructure & Base de Données
docker compose up -d           # Démarrage des conteneurs PostgreSQL 16 et Redis 7
pnpm prisma migrate dev        # Application des migrations DDL de schéma
pnpm prisma studio             # Interface de visualisation BDD (sur demande)
pnpm dev                       # Démarrage du serveur Next.js et des démons
```

---

## 4. Protocole d'Exécution en Boucle Autonome (The Loop Protocol)

Lorsqu'une session de développement est engagée :
1. **Consulter l'état :** Ouvrir `docs/08-IMPLEMENTATION_PLAN.md` et identifier la première tâche non cochée `[ ]`.
2. **Consulter la spécification :** Relire les documents associés dans `docs/` (`01-PRD.md` à `06-API_SPEC.md`).
3. **Consulter le cahier des 100 vulnérabilités :** Vérifier dans `docs/07-TEST_PLAN.md` quels scénarios de défaillance concernent la fonctionnalité en cours de développement.
4. **Implémenter :** Rédiger le code source complet, typé et testé unitairement.
5. **Vérifier les mini-tests de gating :** Exécuter les commandes de gating de la phase correspondante.
6. **Mettre à jour :** Remplacer `[ ]` par `[x]` dans `docs/08-IMPLEMENTATION_PLAN.md` et consigner la preuve de test.
