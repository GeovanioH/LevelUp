/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * LevelUp — The System (Master Server & Fully Functional Multi-Page Solo Leveling HUD)
 * All 10 canonical screens with REAL functional interactivity, live WebAudio FFT,
 * Web Speech transcription, Socratic grading, MediaPipe workout camera, Notes vault,
 * Shop inventory, DAG skills unlocking, and zero mock alerts.
 */

const http = require("http");
const url = require("url");

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Solo Leveling Sovereign Monarch Logo SVG
const MONARCH_LOGO_SVG = `<svg class="monarch-crest-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="crestCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F0FF" />
      <stop offset="50%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0051FF" />
    </linearGradient>
    <linearGradient id="crestCoreGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#00F0FF" />
    </linearGradient>
    <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <!-- Outer Hexagonal/Angular Shield Frame -->
  <polygon points="50,4 88,24 88,72 50,96 12,72 12,24" stroke="#00F0FF" stroke-width="2" fill="rgba(4, 18, 48, 0.85)" stroke-linejoin="round" opacity="0.9" />
  <polygon points="50,10 82,28 82,68 50,88 18,68 18,28" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1" fill="none" />
  <!-- Winged Monarch Daggers / Crown Spikes -->
  <path d="M 22 32 L 38 22 L 44 44 L 34 52 L 22 42 Z" fill="url(#crestCyanGrad)" stroke="#00F0FF" stroke-width="1.5" />
  <path d="M 78 32 L 78 42 L 66 52 L 56 44 L 62 22 Z" fill="url(#crestCyanGrad)" stroke="#00F0FF" stroke-width="1.5" />
  <path d="M 50 12 L 58 40 L 50 56 L 42 40 Z" fill="url(#crestCyanGrad)" stroke="#FFFFFF" stroke-width="1.5" />
  <!-- Lower Chevron Ribs -->
  <path d="M 32 62 L 50 78 L 68 62 L 64 68 L 50 82 L 36 68 Z" fill="#00F0FF" opacity="0.8" />
  <path d="M 38 72 L 50 82 L 62 72 L 58 76 L 50 84 L 42 76 Z" fill="#0051FF" opacity="0.9" />
  <!-- Central Mana Diamond Core -->
  <polygon points="50,38 60,50 50,62 40,50" fill="url(#crestCoreGrad)" stroke="#FFFFFF" stroke-width="1.5" filter="url(#cyanGlow)" />
  <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" />
  <circle cx="50" cy="12" r="1.5" fill="#FFFFFF" />
  <circle cx="22" cy="32" r="1.5" fill="#00F0FF" />
  <circle cx="78" cy="32" r="1.5" fill="#00F0FF" />
</svg>`;

// Default System State Template
const DEFAULT_STATE = {
  player: {
    id: "a5d8b74f-9e32-4d2b-98f5-19e48f029a1b",
    name: "Huriel",
    title: "Le Chasseur Souverain (Éveil Novice)",
    level: 14,
    rank: "D",
    currentXp: 18450,
    nextLevelXp: 22500,
    availableSkillXp: 850,
    shadowCrystals: 820,
    streakDays: 18,
    hp: 88,
    maxHp: 100,
    mp: 65,
    maxMp: 100,
    hoursAwake: 7.5,
    curfewTime: "22:00",
    bases: {
      acad: { name: "Excellence Académique (ACAD)", score: 55, level: 15 },
      ai_eng: {
        name: "Ingénierie IA & Hackathons (AI_ENG)",
        score: 62,
        level: 16,
      },
      cyber: { name: "Cybersécurité Offensive (CYBER)", score: 48, level: 12 },
      exp: { name: "Éloquence & Réseautage (EXP)", score: 42, level: 11 },
      lng: { name: "Anglais C1/C2 Cambridge (LNG)", score: 50, level: 13 },
      fin: { name: "Bourses & Finances (FIN)", score: 38, level: 10 },
      str: { name: "Calisthénie & Force (STR)", score: 52, level: 14 },
      dis: { name: "Discipline & Monk Mode (DIS)", score: 65, level: 17 },
    },
  },
  quests: [
    {
      id: "q-fit-sungjinwoo",
      type: "DAILY",
      title: "L'Entraînement Physique de Sung Jin-Woo (STR)",
      base: "STR",
      xp: 200,
      crystals: 20,
      completed: false,
      description:
        "100 Pompes militaires, 100 Abdos d'acier, 100 Squats explosifs et 10 km de course.",
      proof: "https://strava.com/activities/huriel-workout-10k",
    },
    {
      id: "q-thm-medium-room",
      type: "DAILY",
      title: "Infiltration Room Medium TryHackMe (CYBER)",
      base: "CYBER",
      xp: 180,
      crystals: 20,
      completed: true,
      description:
        "Exploitation de Buffer Overflow et élévation de privilèges Linux root.",
      proof: "https://tryhackme.com/p/Huriel/badges/room-complete",
    },
    {
      id: "q-lng-cambridge-speech",
      type: "DAILY",
      title: "Monologue Oral Anglais C1 Cambridge (LNG)",
      base: "LNG",
      xp: 150,
      crystals: 15,
      completed: false,
      description:
        "Restitution orale de 3 min sur un article arXiv en anglais soutenu (grille 20 pts).",
      proof: "",
    },
    {
      id: "q-ai-transformers-kv",
      type: "DAILY",
      title: "Deep Work : Kernel Triton & FlashAttention-2 (AI_ENG)",
      base: "AI_ENG",
      xp: 250,
      crystals: 30,
      completed: false,
      description:
        "Implémentation d'un block FlashAttention-2 avec benchmark de VRAM sur RTX 4070.",
      proof: "https://github.com/GeovanioH/LevelUp/commit/365eed2",
    },
    {
      id: "q-emergency-auth-bypass",
      type: "EMERGENCY",
      title: "Audit de Sécurité : Faille Critique SingleUserGuard",
      base: "CYBER",
      xp: 500,
      crystals: 100,
      completed: false,
      description:
        "Quête d'urgence imminente : Corriger la validation d'en-tête x-player-id avant expiration du chrono (reste 00:58:12).",
      proof: "",
    },
  ],
  skillsList: [
    {
      id: "sk-transformers",
      base: "AI_ENG",
      tier: 1,
      name: "Transformers & Scaled Dot-Product",
      dod: "Implémentation manuelle du mécanisme QKV sans couche nn.MultiheadAttention",
      status: "MASTERED",
      xp: 200,
    },
    {
      id: "sk-aes-argon2",
      base: "CYBER",
      tier: 1,
      name: "Chiffrement AES-256-GCM & Argon2id",
      dod: "Protection inviolable des flux vocaux et intégrité tamper-proof",
      status: "MASTERED",
      xp: 180,
    },
    {
      id: "sk-flash-attention",
      base: "AI_ENG",
      tier: 2,
      name: "FlashAttention-2 & Triton Kernels",
      dod: "Fusion des passes de calcul et réduction des I/O HBM vers SRAM GPU",
      status: "IN_PROGRESS",
      xp: 350,
    },
    {
      id: "sk-buffer-overflow",
      base: "CYBER",
      tier: 2,
      name: "Exploitation Buffer Overflow x86 & ASLR",
      dod: "Reverse engineering GDB, contrôle de registre EIP et NOP Sled",
      status: "LOCKED",
      xp: 300,
    },
    {
      id: "sk-svd-reduction",
      base: "ACAD",
      tier: 1,
      name: "Décomposition SVD & Réduction PCA",
      dod: "Calcul des valeurs singulières et factorisation matricielle orthogonale",
      status: "MASTERED",
      xp: 190,
    },
    {
      id: "sk-calisthenics-pike",
      base: "STR",
      tier: 2,
      name: "Pike Push-Ups & Équilibre Handstand",
      dod: "15 répétitions strictes filmées et validées par Computer Vision",
      status: "IN_PROGRESS",
      xp: 220,
    },
    {
      id: "sk-cambridge-c1-oral",
      base: "LNG",
      tier: 2,
      name: "Monologue Technique Cambridge C1",
      dod: "Restitution de 3 min à plus de 130 mots/min avec lexique formel",
      status: "IN_PROGRESS",
      xp: 250,
    },
    {
      id: "sk-bourses-eiffel",
      base: "FIN",
      tier: 1,
      name: "Dossier Bourse Eiffel & Lettre de Projet",
      dod: "Rédaction académique et plan d'excellence internationale",
      status: "MASTERED",
      xp: 170,
    },
    {
      id: "sk-monk-mode-audit",
      base: "DIS",
      tier: 2,
      name: "Monk Mode & Protocole Borbély 22h00",
      dod: "14 jours consécutifs de coupure d'écran stricte avant 22h00",
      status: "MASTERED",
      xp: 280,
    },
  ],
  plannerBlocks: [
    {
      id: "b1",
      time: "06:00 - 06:30",
      title: "🌅 Réveil & Hydratation",
      base: "DIS",
      status: "COMPLETED",
      type: "RITUEL",
    },
    {
      id: "b2",
      time: "06:30 - 07:30",
      title: "💪 Séance Sport Sung Jin-Woo (STR)",
      base: "STR",
      status: "COMPLETED",
      type: "SPORT",
    },
    {
      id: "b3",
      time: "07:30 - 08:30",
      title: "🚿 Petit-Déjeuner & Préparation",
      base: "DIS",
      status: "COMPLETED",
      type: "RITUEL",
    },
    {
      id: "b4",
      time: "08:30 - 11:30",
      title: "🧠 Deep Work IA : Transformers & vLLM",
      base: "AI_ENG",
      status: "COMPLETED",
      type: "DEEP_WORK",
    },
    {
      id: "b5",
      time: "11:30 - 12:30",
      title: "🚶 Pause Déjeuner & Restauration MP",
      base: "EXP",
      status: "ACTIVE",
      type: "REST",
    },
    {
      id: "b6",
      time: "12:30 - 13:00",
      title: "🎙️ Dictée Vocale & Synthèse Socratique",
      base: "ACAD",
      status: "UPCOMING",
      type: "VOCAL",
    },
    {
      id: "b7",
      time: "13:00 - 16:00",
      title: "🛡️ Cybersécurité : Room TryHackMe",
      base: "CYBER",
      status: "UPCOMING",
      type: "DEEP_WORK",
    },
    {
      id: "b8",
      time: "16:30 - 18:00",
      title: "🇬🇧 Listening & Speaking Cambridge C1",
      base: "LNG",
      status: "UPCOMING",
      type: "STUDY",
    },
    {
      id: "b9",
      time: "18:00 - 20:00",
      title: "⚡ Développement Fullstack LevelUp HUD",
      base: "AI_ENG",
      status: "UPCOMING",
      type: "DEV",
    },
    {
      id: "b10",
      time: "21:00 - 22:00",
      title: "🌙 Bilan du Soir & Audit de Clôture",
      base: "DIS",
      status: "UPCOMING",
      type: "AUDIT",
    },
  ],
  notes: [
    {
      id: "note-readme",
      folder: "00_Synthese_Souveraine",
      base: "DIS",
      title: "README - Coffre de Connaissances du Monarque",
      tags: ["hub", "architecture", "second-brain", "solo-leveling"],
      updatedAt: "2026-11-12T08:00:00Z",
      content: `# README - Coffre de Connaissances du Monarque

Bienvenue dans le graphe de connaissances central du Système LevelUp (Obsidian Vault). Ce coffre modélise les connexions cognitives entre l'Ingénierie IA, la Cybersécurité, les Mathématiques fondamentales et la Biomécanique.

## Piliers Connectés du Système :
- **Ingénierie IA & Accélération :** [[FlashAttention-2 & Optimisation Mémoire]] et [[Triton Custom Kernels & CUDA]].
- **Infrastructure GPU :** [[Hiérarchies Mémoire GPU & VRAM HBM]].
- **Cybersécurité Offensive :** [[Exploitation de Buffer Overflow x86]] et [[Élévation de Privilèges Linux]].
- **Fondations Mathématiques :** [[Décomposition en Valeurs Singulières (SVD)]].
- **Biomécanique & Sport :** [[Cinématique Push-Ups & MediaPipe]] et [[Modèle de Fatigue de Gandevia]].
- **Rhétorique & Anglais :** [[Lexique Socratique Cambridge C1]].`
    },
    {
      id: "note-flashattention",
      folder: "01_Ingenierie_IA",
      base: "AI_ENG",
      title: "FlashAttention-2 & Optimisation Mémoire",
      tags: ["deep-learning", "transformers", "cuda", "vllm"],
      updatedAt: "2026-11-12T07:30:00Z",
      content: `# FlashAttention-2 & Optimisation Mémoire

L'attention par produit scalaire mise à l'échelle (*Scaled Dot-Product Attention*) s'écrit de façon canonique :

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$

## Architecture & Tiling
FlashAttention-2 résout le goulet d'étranglement mémoire en maintenant les états intermédiaires dans la SRAM ultra-rapide du GPU au lieu de faire des allers-retours coûteux vers la mémoire HBM.

### Liens sémantiques :
- Implémenté via [[Triton Custom Kernels & CUDA]]
- Optimise les transferts dans [[Hiérarchies Mémoire GPU & VRAM HBM]]
- Utilisé pour le PagedAttention dans [[vLLM & KV Cache Paging]]
- Relie les projections orthogonales de [[Décomposition en Valeurs Singulières (SVD)]]`
    },
    {
      id: "note-triton-kernels",
      folder: "01_Ingenierie_IA",
      base: "AI_ENG",
      title: "Triton Custom Kernels & CUDA",
      tags: ["triton", "cuda", "gpu", "compiler"],
      updatedAt: "2026-11-12T06:15:00Z",
      content: `# Triton Custom Kernels & CUDA

OpenAI Triton permet d'écrire des kernels GPU hautement performants directement en Python sans les complexités de synchronisation manuelle des threads CUDA en C++.

## Concept Clé : Les Blocs de Tensors
\`\`\`python
@triton.jit
def _fused_attention_kernel(Q, K, V, sm_scale, Out, BLOCK_M: tl.constexpr):
    # Bloc SRAM partitionné
    offsets = tl.arange(0, BLOCK_M)
\`\`\`

### Liens sémantiques :
- Requis par [[FlashAttention-2 & Optimisation Mémoire]]
- Exploite directement les [[Hiérarchies Mémoire GPU & VRAM HBM]]`
    },
    {
      id: "note-gpu-memory",
      folder: "01_Ingenierie_IA",
      base: "AI_ENG",
      title: "Hiérarchies Mémoire GPU & VRAM HBM",
      tags: ["hardware", "vram", "gpu", "hbm"],
      updatedAt: "2026-11-11T20:00:00Z",
      content: `# Hiérarchies Mémoire GPU & VRAM HBM

La latence et la bande passante sur architecture NVIDIA Ampere / Hopper / Ada :
1. **Registres & SRAM L1 :** ~19 To/s, latence < 10 ns.
2. **Cache L2 :** ~3-5 To/s, latence ~30 ns.
3. **Mémoire Globale HBM3 / GDDR6X :** ~1-3 To/s, latence ~200-400 ns.

### Liens sémantiques :
- Fondement matériel de [[FlashAttention-2 & Optimisation Mémoire]]
- Contrainte majeure pour [[vLLM & KV Cache Paging]]`
    },
    {
      id: "note-vllm-paging",
      folder: "01_Ingenierie_IA",
      base: "AI_ENG",
      title: "vLLM & KV Cache Paging",
      tags: ["vllm", "inference", "throughput", "paged-attention"],
      updatedAt: "2026-11-11T16:00:00Z",
      content: `# vLLM & KV Cache Paging

L'algorithme PagedAttention s'inspire de la mémoire virtuelle des systèmes d'exploitation pour partitionner le cache des clés et valeurs (KV) en pages non contiguës en mémoire physique.

### Liens sémantiques :
- Réduit la fragmentation mémoire de [[Hiérarchies Mémoire GPU & VRAM HBM]]
- Accélère l'attention définie dans [[FlashAttention-2 & Optimisation Mémoire]]`
    },
    {
      id: "note-algebre-svd-ia",
      folder: "03_Mathematiques",
      base: "ACAD",
      title: "Décomposition en Valeurs Singulières (SVD)",
      tags: ["mathematiques", "algebre", "svd", "pca"],
      updatedAt: "2026-11-11T18:30:00Z",
      content: `# Décomposition en Valeurs Singulières (SVD)

Toute matrice réelle $A \\in \\mathbb{R}^{m \\times n}$ admet la factorisation universelle :

$$A = U \\Sigma V^T$$

Où $U$ et $V$ sont des matrices orthogonales et $\\Sigma$ est une matrice diagonale contenant les valeurs singulières :

$$\\sigma_1 \\ge \\sigma_2 \\ge \\dots \\ge \\sigma_r > 0$$

### Liens sémantiques :
- Base mathématique de la compression LoRA pour [[FlashAttention-2 & Optimisation Mémoire]]
- Référencé dans [[README - Coffre de Connaissances du Monarque]]`
    },
    {
      id: "note-tryhackme-buffer-overflow",
      folder: "02_Cybersecurite",
      base: "CYBER",
      title: "Exploitation de Buffer Overflow x86",
      tags: ["cyber", "buffer-overflow", "gdb", "aslr"],
      updatedAt: "2026-11-10T22:15:00Z",
      content: `# Exploitation de Buffer Overflow x86

Recherche du décalage exact avec \`pattern_create\` et \`pattern_offset\` dans GDB PEDA. Écrasement du registre EIP pour rediriger le pointeur d'instruction vers un NOP Sled et le shellcode injecté.

### Liens sémantiques :
- Complément indispensable pour [[Élévation de Privilèges Linux]]
- Infiltration liée à [[README - Coffre de Connaissances du Monarque]]`
    },
    {
      id: "note-linux-privesc",
      folder: "02_Cybersecurite",
      base: "CYBER",
      title: "Élévation de Privilèges Linux",
      tags: ["linux", "privesc", "root", "suid"],
      updatedAt: "2026-11-10T21:00:00Z",
      content: `# Élévation de Privilèges Linux

Techniques d'audit local : binaires SUID mal configurés (\`find / -perm -4000\`), cron jobs vulnérables, capabilités Linux (\`getcap\`) et exploitation de failles de kernel (Dirty Pipe).

### Liens sémantiques :
- Seconde phase après [[Exploitation de Buffer Overflow x86]]`
    },
    {
      id: "note-mediapipe-pushups",
      folder: "04_Calisthenie_Biomecanique",
      base: "STR",
      title: "Cinématique Push-Ups & MediaPipe",
      tags: ["mediapipe", "biomecanique", "computer-vision", "calisthenics"],
      updatedAt: "2026-11-10T14:00:00Z",
      content: `# Cinématique Push-Ups & MediaPipe

Suivi en temps réel de 33 points squelettiques via Computer Vision.
- Angle du coude en flexion : $\\theta \\le 75^\\circ$
- Angle du coude en extension : $\\theta \\ge 160^\\circ$

### Liens sémantiques :
- Corrélé avec la gestion de fatigue dans [[Modèle de Fatigue de Gandevia]]
- Présent dans [[README - Coffre de Connaissances du Monarque]]`
    },
    {
      id: "note-fatigue-gandevia",
      folder: "04_Calisthenie_Biomecanique",
      base: "STR",
      title: "Modèle de Fatigue de Gandevia",
      tags: ["physiologie", "fatigue", "gandevia", "recuperation"],
      updatedAt: "2026-11-09T18:00:00Z",
      content: `# Modèle de Fatigue de Gandevia

Distinction scientifique entre fatigue centrale (diminution de la commande motrice volontaire par le SNC) et fatigue périphérique (altération contractile neuromusculaire).

### Liens sémantiques :
- Régule les séries strictes de [[Cinématique Push-Ups & MediaPipe]]`
    },
    {
      id: "note-cambridge-c1",
      folder: "05_Anglais_Cambridge",
      base: "LNG",
      title: "Lexique Socratique Cambridge C1",
      tags: ["cambridge", "english", "c1", "socratic"],
      updatedAt: "2026-11-09T12:00:00Z",
      content: `# Lexique Socratique Cambridge C1

Structures rhétoriques formelles indispensables pour l'évaluation orale à 20 points de l'Architecte :
- *"Notwithstanding the aforementioned constraints..."*
- *"It is imperative to substantiate this hypothesis with empirical benchmarks..."*
- *"The quintessential dilemma resides in..."*

### Liens sémantiques :
- Référencé dans [[README - Coffre de Connaissances du Monarque]]`
    }
  ],
  opportunities: [
    {
      id: "opp-eiffel-2027",
      title: "Bourse Eiffel d'Excellence Master IA 2027",
      type: "BOURSE",
      portal: "Campus France",
      amount: "14 000 €",
      deadline: "10 Janvier 2027",
      status: "NOUVELLE",
      matchScore: 96.5,
      url: "https://www.campusfrance.org/fr/bourses-etudiants-etrangers",
    },
    {
      id: "opp-devpost-agentic",
      title: "Devpost Global Agentic AI Hackathon 48h",
      type: "HACKATHON",
      portal: "Devpost / MLH",
      amount: "25 000 $ en crédits GPU",
      deadline: "30 Novembre 2026",
      status: "EN_COURS",
      matchScore: 98.0,
      url: "https://devpost.com/hackathons",
    },
    {
      id: "opp-cambridge-c1",
      title: "Certification Cambridge English C1 Advanced (CAE)",
      type: "CERTIFICATION",
      portal: "Cambridge Assessment",
      amount: "Validation Rang B Indispensable",
      deadline: "15 Décembre 2026",
      status: "SOUMIS",
      matchScore: 99.0,
      url: "https://www.cambridgeenglish.org",
    },
  ],
  shopItems: [
    {
      id: "item-claude-pro",
      category: "IA",
      name: "Abonnement 1 Mois Claude Pro (Agents IA)",
      cost: 450,
      rank: "E",
      desc: "Quota prioritaire et puissance de raisonnement pour l'Ingénierie IA.",
    },
    {
      id: "item-kindle",
      category: "ETUDE",
      name: "Liseuse Kindle Paperwhite (Lecture Tech)",
      cost: 2500,
      rank: "C",
      desc: "Immersion sans distraction dans les manuels d'IA et de mathématiques.",
    },
    {
      id: "item-cambridge",
      category: "PRESTIGE",
      name: "Frais d'Examen Cambridge C1/C2 Officiel",
      cost: 1200,
      rank: "D",
      desc: "Validation formelle du bilinguisme absolu de l'orateur souverain.",
    },
    {
      id: "item-keyboard",
      category: "HARDWARE",
      name: "Clavier Mécanique Ortholinéaire Custom",
      cost: 1800,
      rank: "C",
      desc: "Frappe ergonomique pour les sprints de code intensifs.",
    },
    {
      id: "item-dell-4k",
      category: "PRESTIGE",
      name: 'Écran 4K Dell UltraSharp 32" (Station de Chasseur)',
      cost: 9000,
      rank: "A",
      desc: "Cockpit d'ingénierie suprême pour les sessions nocturnes du Monarque.",
    },
  ],
  inventory: [
    {
      id: "inv-1",
      name: "Clavier Ergonomique",
      cost: 1800,
      code: "LVL-SHADOW-KYB-89",
      date: "05/11/2026",
    },
    {
      id: "inv-2",
      name: "Crédits RunPod Cloud",
      cost: 300,
      code: "LVL-SHADOW-RP-12",
      date: "28/10/2026",
    },
  ],
  penalty: {
    active: false,
    reason:
      "Échec de complétion de la Quête Journalière obligatoire [DAILY_FIT_100_CORPS] avant l'heure fatidique de 22h00.",
    remainingSeconds: 13335,
    blockedDomains: [
      "tiktok.com",
      "instagram.com",
      "twitter.com / x.com",
      "youtube.com/shorts",
      "netflix.com",
      "reddit.com/r/all",
    ],
    redemptionOptionA:
      "400 Pompes Calisthéniques militaires strictes validées par vision par ordinateur.",
    redemptionOptionB:
      "Marche ou course nocturne continue de 10 kilomètres (Trace GPS certifiée).",
  },
};

let SYSTEM_STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));

// Calculate Harmonic Mean
function getHarmonicScore(playerBases = SYSTEM_STATE.player.bases) {
  const bases = Object.values(playerBases);
  const sumInverses = bases.reduce(
    (acc, b) => acc + 1 / Math.max(1, b.score),
    0,
  );
  return Math.round(bases.length / sumInverses);
}

// Render Master Application
function renderFullApplication(initialTab = "dashboard") {
  const player = SYSTEM_STATE.player;
  const harmonicScore = getHarmonicScore();

  return `<!DOCTYPE html>
<html lang="fr" data-theme="dark-monarch">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LevelUp — The System (HUD Solo Leveling)</title>
  <link rel="icon" type="image/svg+xml" href="/logo-monarch.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Rajdhani:wght@500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-cosmic-0: #010614;
      --bg-cosmic-1: #020b22;
      --bg-cosmic-2: #05163e;
      --glass-panel: rgba(4, 18, 48, 0.82);
      --glass-panel-elevated: rgba(6, 26, 68, 0.90);
      --glass-inner-border: rgba(56, 189, 248, 0.28);
      --glass-inner-glow: rgba(0, 240, 255, 0.08);

      --neon-cyan: #00f0ff;
      --neon-sky: #38bdf8;
      --neon-blue: #0284c7;
      --deep-sapphire: #0051ff;
      --monarch-purple: #9d00ff;
      --transcendent-green: #00ff66;
      --emerald-green: #10b981;
      --imperial-gold: #ffd700;
      --alert-crimson: #ff003c;
      --danger-red: #ef4444;

      --text-white: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;

      --font-display: 'Rajdhani', sans-serif;
      --font-body: 'Inter', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;

      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-pill: 9999px;
    }

    [data-theme="light-awakening"] {
      --bg-cosmic-0: #f0f4f8;
      --bg-cosmic-1: #e2e8f0;
      --bg-cosmic-2: #cbd5e1;
      --glass-panel: rgba(255, 255, 255, 0.92);
      --glass-panel-elevated: #ffffff;
      --glass-inner-border: rgba(14, 165, 233, 0.35);
      --glass-inner-glow: rgba(14, 165, 233, 0.1);
      --neon-cyan: #0284c7;
      --neon-sky: #0369a1;
      --transcendent-green: #059669;
      --imperial-gold: #b45309;
      --text-white: #0f172a;
      --text-secondary: #334155;
      --text-muted: #64748b;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg-cosmic-0);
      background-image:
        radial-gradient(ellipse at 50% 0%, #0d2a5e 0%, #031230 45%, #010614 100%),
        radial-gradient(circle at 15% 30%, rgba(0, 81, 255, 0.12) 0%, transparent 40%),
        radial-gradient(circle at 85% 70%, rgba(0, 240, 255, 0.08) 0%, transparent 45%);
      background-attachment: fixed;
      color: var(--text-white);
      font-family: var(--font-body);
      min-height: 100vh;
      overflow-x: hidden;
    }

    #mana-particles-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1;
    }

    .glass-card {
      position: relative;
      background: var(--glass-panel);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--glass-inner-border);
      border-radius: var(--radius-md);
      box-shadow: 
        0 10px 30px -5px rgba(0, 25, 70, 0.5),
        inset 0 0 20px var(--glass-inner-glow),
        0 0 15px rgba(0, 220, 255, 0.12);
      overflow: hidden;
      transition: all 0.25s ease;
      z-index: 2;
    }

    .glass-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent 5%, var(--neon-cyan) 50%, transparent 95%);
      opacity: 0.85;
      pointer-events: none;
    }

    .spotlight-card {
      position: relative;
    }
    .spotlight-card::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(
        500px circle at var(--mouse-x, -500px) var(--mouse-y, -500px),
        rgba(0, 240, 255, 0.14),
        transparent 45%
      );
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: inherit;
      z-index: 1;
    }
    .spotlight-card:hover::after { opacity: 1; }
    .spotlight-card:hover {
      border-color: rgba(0, 240, 255, 0.65);
      box-shadow: 
        0 12px 35px -5px rgba(0, 60, 160, 0.55),
        inset 0 0 25px rgba(0, 240, 255, 0.15),
        0 0 25px rgba(0, 240, 255, 0.25);
    }

    .shiny-text {
      background: linear-gradient(110deg, #93c5fd 10%, #ffffff 45%, #38bdf8 80%, #93c5fd 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: textShimmer 3.5s ease-in-out infinite;
      display: inline-block;
    }
    .shiny-gold {
      background: linear-gradient(110deg, #f59e0b 10%, #fffbeb 50%, #ffd700 80%, #f59e0b 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: textShimmer 3s ease-in-out infinite;
    }
    .shiny-green {
      background: linear-gradient(110deg, #10b981 10%, #ecfdf5 50%, #00ff66 80%, #10b981 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: textShimmer 3s ease-in-out infinite;
    }
    @keyframes textShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .border-beam-box {
      position: relative;
      border: 1px solid rgba(255, 0, 60, 0.4);
      background: var(--glass-panel);
      backdrop-filter: blur(20px);
      border-radius: var(--radius-md);
      box-shadow: 0 0 25px rgba(255, 0, 60, 0.25);
      overflow: hidden;
    }
    .border-beam-box::before {
      content: "";
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: conic-gradient(from 0deg, transparent 0deg, #ff003c 45deg, transparent 90deg);
      animation: beamRotate 4s linear infinite;
      z-index: 0;
      opacity: 0.6;
    }
    .border-beam-content {
      position: relative;
      background: rgba(8, 16, 38, 0.94);
      border-radius: calc(var(--radius-md) - 1px);
      z-index: 1;
    }
    @keyframes beamRotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .capsule-slider-track {
      background: rgba(3, 10, 26, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: var(--radius-pill);
      height: 14px;
      position: relative;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6);
    }
    .capsule-slider-fill {
      height: 100%;
      border-radius: var(--radius-pill);
      position: relative;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .capsule-fill-hp {
      background: linear-gradient(90deg, #059669, #00ff66);
      box-shadow: 0 0 10px rgba(0, 255, 102, 0.6);
    }
    .capsule-fill-mp {
      background: linear-gradient(90deg, #0284c7, #00f0ff);
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.7);
    }
    .capsule-fill-xp {
      background: linear-gradient(90deg, #0051ff, #38bdf8);
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
    }

    .btn-cyber {
      background: rgba(4, 20, 56, 0.85);
      border: 1px solid var(--neon-cyan);
      color: var(--neon-cyan);
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 1.5px;
      padding: 9px 18px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 0 12px rgba(0, 240, 255, 0.25);
      text-transform: uppercase;
      user-select: none;
    }
    .btn-cyber:hover {
      background: var(--neon-cyan);
      color: #020c24;
      box-shadow: 0 0 22px rgba(0, 240, 255, 0.75);
      transform: translateY(-2px);
    }
    .btn-cyber:active { transform: translateY(0); }

    .btn-gold {
      border-color: var(--imperial-gold);
      color: var(--imperial-gold);
      box-shadow: 0 0 12px rgba(255, 215, 0, 0.25);
    }
    .btn-gold:hover {
      background: var(--imperial-gold);
      color: #1e1002;
      box-shadow: 0 0 22px rgba(255, 215, 0, 0.75);
    }

    .btn-red {
      border-color: var(--alert-crimson);
      color: var(--alert-crimson);
      box-shadow: 0 0 12px rgba(255, 0, 60, 0.35);
    }
    .btn-red:hover {
      background: var(--alert-crimson);
      color: #ffffff;
      box-shadow: 0 0 25px rgba(255, 0, 60, 0.85);
    }

    .radar-ping-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 4px 10px;
      border-radius: var(--radius-pill);
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid rgba(0, 240, 255, 0.35);
      font-size: 11px;
      font-weight: 600;
      color: var(--neon-cyan);
      font-family: var(--font-mono);
      letter-spacing: 0.5px;
    }

    .master-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(2, 10, 28, 0.88);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--glass-inner-border);
      box-shadow: 0 4px 25px rgba(0, 20, 60, 0.6);
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-logo-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    }
    .brand-logo-wrap:hover {
      transform: translateY(-1px) scale(1.02);
    }
    .monarch-crest-svg {
      width: 36px;
      height: 36px;
      filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.75));
      transition: all 0.3s ease;
      flex-shrink: 0;
    }
    .brand-logo-wrap:hover .monarch-crest-svg {
      filter: drop-shadow(0 0 16px rgba(0, 240, 255, 1)) drop-shadow(0 0 26px rgba(0, 81, 255, 0.7));
      transform: rotate(2deg);
    }
    .brand-text-block {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .brand-logo {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 3px;
      line-height: 1;
    }
    .brand-subtext {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 2px;
      color: var(--neon-cyan);
      opacity: 0.85;
      margin-top: 3px;
      line-height: 1;
    }

    .nav-bar {
      background: rgba(2, 10, 28, 0.75);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(56, 189, 248, 0.18);
      padding: 6px 20px;
      display: flex;
      gap: 6px;
      overflow-x: auto;
      position: sticky;
      top: 57px;
      z-index: 95;
    }
    .nav-tab {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-secondary);
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 1.2px;
      padding: 7px 14px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .nav-tab:hover {
      color: var(--text-white);
      background: rgba(0, 240, 255, 0.08);
      border-color: rgba(0, 240, 255, 0.25);
    }
    .nav-tab.active {
      color: var(--neon-cyan);
      background: rgba(0, 81, 255, 0.25);
      border: 1px solid var(--neon-cyan);
      box-shadow: 0 0 14px rgba(0, 240, 255, 0.35);
    }
    .nav-shortcut {
      font-size: 10px;
      font-family: var(--font-mono);
      opacity: 0.6;
      background: rgba(255, 255, 255, 0.08);
      padding: 2px 5px;
      border-radius: 4px;
    }

    .main-container {
      max-width: 1480px;
      margin: 0 auto;
      padding: 24px 20px 60px 20px;
      position: relative;
      z-index: 2;
    }

    .view-panel { display: none; animation: fadeInView 0.3s ease; }
    .view-panel.active { display: block; }
    @keyframes fadeInView {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
    .grid-3col { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    @media (max-width: 1024px) { .grid-2col { grid-template-columns: 1fr; } }

    .system-alert-banner {
      background: linear-gradient(90deg, rgba(0, 81, 255, 0.3) 0%, rgba(2, 14, 38, 0.85) 50%, rgba(0, 81, 255, 0.3) 100%);
      border: 1px solid var(--neon-cyan);
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.25);
      border-radius: var(--radius-md);
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 22px;
    }

    /* System Holographic Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(1, 6, 20, 0.85);
      backdrop-filter: blur(16px);
      z-index: 300;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .modal-overlay.open { display: flex; }
    .modal-card {
      width: 90%;
      max-width: 560px;
      background: rgba(5, 20, 52, 0.96);
      border: 1px solid var(--neon-cyan);
      box-shadow: 0 0 35px rgba(0, 240, 255, 0.4);
      border-radius: var(--radius-lg);
      padding: 26px;
      animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modalPop {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }

    .form-input {
      width: 100%;
      background: rgba(3, 12, 34, 0.9);
      border: 1px solid var(--neon-cyan);
      color: #fff;
      padding: 12px;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
    }
    .form-input:focus {
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);
    }

    /* =========================================================================
       OBSIDIAN SECOND BRAIN & FORCE-DIRECTED GRAPH STYLES
       ========================================================================= */
    .obsidian-vault-wrapper {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .obsidian-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
      padding: 14px 20px;
      background: rgba(3, 14, 38, 0.85);
      border: 1px solid var(--glass-inner-border);
      border-radius: var(--radius-md);
      box-shadow: 0 4px 20px rgba(0, 20, 60, 0.4);
    }

    .obsidian-view-mode-tabs {
      display: flex;
      background: rgba(1, 6, 20, 0.8);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: var(--radius-sm);
      padding: 3px;
      gap: 4px;
    }

    .obsidian-mode-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-family: var(--font-display);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      padding: 6px 14px;
      border-radius: 5px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .obsidian-mode-btn:hover {
      color: var(--text-white);
      background: rgba(0, 240, 255, 0.1);
    }
    .obsidian-mode-btn.active {
      color: #020c24;
      background: var(--neon-cyan);
      box-shadow: 0 0 14px rgba(0, 240, 255, 0.6);
      font-weight: 800;
    }

    .obsidian-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 18px;
      min-height: 640px;
    }

    @media (max-width: 900px) {
      .obsidian-layout {
        grid-template-columns: 1fr;
      }
    }

    .obsidian-explorer {
      background: rgba(2, 10, 30, 0.88);
      border: 1px solid var(--glass-inner-border);
      border-radius: var(--radius-md);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
      max-height: 720px;
    }

    .obsidian-explorer-title {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 1.5px;
      color: var(--neon-cyan);
      font-weight: 800;
      text-transform: uppercase;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(56, 189, 248, 0.2);
      padding-bottom: 8px;
    }

    .obsidian-folder {
      margin-bottom: 8px;
    }

    .obsidian-folder-header {
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 700;
      color: var(--text-white);
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 6px;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s ease;
    }
    .obsidian-folder-header:hover {
      background: rgba(0, 240, 255, 0.08);
    }

    .obsidian-file-list {
      margin-left: 14px;
      padding-left: 8px;
      border-left: 1px solid rgba(56, 189, 248, 0.2);
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 4px;
    }

    .obsidian-file-item {
      font-family: var(--font-body);
      font-size: 12px;
      color: var(--text-secondary);
      padding: 5px 8px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .obsidian-file-item:hover {
      color: var(--neon-cyan);
      background: rgba(0, 240, 255, 0.12);
      transform: translateX(2px);
    }
    .obsidian-file-item.active {
      color: #ffffff;
      background: rgba(0, 81, 255, 0.35);
      border-left: 2px solid var(--neon-cyan);
      font-weight: 600;
    }

    .obsidian-main-stage {
      position: relative;
      background: rgba(2, 8, 24, 0.92);
      border: 1px solid var(--glass-inner-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      min-height: 640px;
      display: flex;
      flex-direction: column;
    }

    /* Graph Canvas View */
    .obsidian-graph-canvas-wrap {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 620px;
      flex: 1;
    }

    #obsidian-graph-canvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: grab;
    }
    #obsidian-graph-canvas:active {
      cursor: grabbing;
    }

    .obsidian-graph-controls {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 10;
    }

    .graph-ctrl-btn {
      width: 32px;
      height: 32px;
      background: rgba(4, 18, 48, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: var(--neon-cyan);
      border-radius: var(--radius-sm);
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 10, 30, 0.5);
      transition: all 0.2s ease;
      user-select: none;
    }
    .graph-ctrl-btn:hover {
      background: var(--neon-cyan);
      color: #010614;
      box-shadow: 0 0 16px rgba(0, 240, 255, 0.7);
    }

    .obsidian-graph-legend {
      position: absolute;
      bottom: 16px;
      left: 16px;
      background: rgba(4, 18, 48, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: var(--radius-sm);
      padding: 8px 12px;
      font-size: 11px;
      font-family: var(--font-mono);
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      z-index: 10;
      backdrop-filter: blur(12px);
    }
    .legend-item { display: flex; align-items: center; gap: 5px; }
    .legend-dot { width: 9px; height: 9px; border-radius: 50%; }

    /* Note Reader / Editor View */
    .obsidian-reader-pane {
      display: none;
      flex-direction: column;
      padding: 28px;
      height: 100%;
      overflow-y: auto;
    }
    .obsidian-reader-pane.active { display: flex; }

    .obsidian-note-header {
      border-bottom: 1px solid rgba(56, 189, 248, 0.25);
      padding-bottom: 18px;
      margin-bottom: 22px;
    }

    .obsidian-breadcrumb {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--neon-cyan);
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .obsidian-note-title {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 900;
      color: var(--text-white);
      letter-spacing: 1px;
      margin-bottom: 10px;
    }

    .obsidian-note-body {
      font-family: var(--font-body);
      font-size: 14px;
      line-height: 1.8;
      color: #cbd5e1;
    }

    .obsidian-note-body h1 {
      font-family: var(--font-display);
      font-size: 24px;
      color: var(--text-white);
      margin: 18px 0 10px 0;
      border-bottom: 1px solid rgba(56, 189, 248, 0.2);
      padding-bottom: 6px;
    }

    .obsidian-note-body h2 {
      font-family: var(--font-display);
      font-size: 18px;
      color: var(--neon-cyan);
      margin: 16px 0 8px 0;
    }

    .obsidian-note-body h3 {
      font-size: 15px;
      color: var(--transcendent-green);
      margin: 12px 0 6px 0;
    }

    .katex-display-box {
      background: rgba(3, 14, 38, 0.85);
      border: 1px solid rgba(0, 240, 255, 0.3);
      border-radius: var(--radius-sm);
      padding: 16px;
      margin: 16px 0;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 15px;
      color: var(--neon-cyan);
      box-shadow: inset 0 0 15px rgba(0, 240, 255, 0.08);
      overflow-x: auto;
    }

    .wikilink-pill {
      background: rgba(0, 81, 255, 0.25);
      border: 1px solid var(--neon-cyan);
      color: var(--neon-cyan);
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      text-decoration: none;
      transition: all 0.2s ease;
      margin: 0 2px;
    }
    .wikilink-pill:hover {
      background: var(--neon-cyan);
      color: #010614;
      box-shadow: 0 0 12px rgba(0, 240, 255, 0.7);
    }

    .obsidian-backlinks-panel {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px dashed rgba(56, 189, 248, 0.25);
    }

    .obsidian-backlinks-title {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 800;
      color: var(--imperial-gold);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .backlink-card {
      background: rgba(3, 12, 32, 0.7);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .backlink-card:hover {
      border-color: var(--neon-cyan);
      background: rgba(0, 81, 255, 0.15);
      transform: translateX(4px);
    }

    /* Split View Container */
    .obsidian-split-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      height: 100%;
      min-height: 620px;
    }
    .obsidian-split-left {
      border-right: 1px solid var(--glass-inner-border);
      overflow-y: auto;
      padding: 24px;
    }
    .obsidian-split-right {
      position: relative;
      height: 100%;
    }

    /* =========================================================================
       REACTBITS CIRCULAR CAROUSEL 3D (CYLINDER PRESET FOR QUESTS)
       ========================================================================= */
    .quests-carousel-container {
      position: relative;
      width: 100%;
      height: 600px;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: radial-gradient(ellipse at center, rgba(14, 165, 233, 0.08) 0%, rgba(2, 8, 24, 0.95) 75%);
      border: 1px solid rgba(56, 189, 248, 0.25);
      box-shadow: inset 0 0 60px rgba(2, 8, 24, 0.9), 0 0 30px rgba(0, 240, 255, 0.1);
      margin-bottom: 24px;
    }

    .circular-carousel {
      --cc-fade: #020818;
      --cc-radius: 14px;
      --cc-inner: 0.4;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      outline: none;
      touch-action: pan-y;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .circular-carousel[data-axis='x'] {
      touch-action: pan-x;
    }

    .circular-carousel[data-draggable] {
      cursor: grab;
    }

    .circular-carousel[data-dragging] {
      cursor: grabbing;
    }

    .circular-carousel:focus-visible {
      box-shadow: inset 0 0 0 2px rgba(0, 240, 255, 0.55);
    }

    .circular-carousel__view {
      position: absolute;
      inset: 0;
    }

    .circular-carousel__stage {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 1;
      transition: opacity 0.45s ease;
      transform-style: preserve-3d;
    }

    .circular-carousel__camera,
    .circular-carousel__ring,
    .circular-carousel__card {
      width: 0;
      height: 0;
      transform-style: preserve-3d;
    }

    .circular-carousel__camera {
      position: relative;
    }

    .circular-carousel__ring,
    .circular-carousel__card {
      position: absolute;
      left: 0;
      top: 0;
    }

    .quest-3d-card {
      position: absolute;
      left: -130px;
      top: -190px;
      width: 260px;
      height: 380px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(8, 20, 48, 0.95), rgba(2, 8, 24, 0.98));
      border: 1.5px solid rgba(0, 240, 255, 0.4);
      box-shadow: 0 0 25px rgba(0, 240, 255, 0.25), inset 0 0 20px rgba(0, 240, 255, 0.08);
      padding: 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: border-color 0.3s, box-shadow 0.3s;
      cursor: pointer;
      user-select: none;
    }

    .quest-3d-card:hover {
      border-color: var(--neon-cyan);
      box-shadow: 0 0 35px rgba(0, 240, 255, 0.5), inset 0 0 30px rgba(0, 240, 255, 0.15);
    }

    .quest-3d-card.active-quest-focus {
      border-color: var(--imperial-gold);
      box-shadow: 0 0 45px rgba(255, 215, 0, 0.55), inset 0 0 30px rgba(255, 215, 0, 0.2);
    }

    .quest-3d-card.quest-emergency {
      border-color: var(--alert-crimson);
      box-shadow: 0 0 35px rgba(255, 0, 60, 0.5), inset 0 0 25px rgba(255, 0, 60, 0.15);
      background: linear-gradient(135deg, rgba(38, 4, 14, 0.95), rgba(12, 1, 4, 0.98));
    }

    .quest-3d-depth-shade {
      position: absolute;
      inset: 0;
      border-radius: 14px;
      background: #020818;
      pointer-events: none;
      transition: opacity 0.2s;
    }

    .quest-carousel-controls {
      position: absolute;
      bottom: 18px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      z-index: 30;
      pointer-events: auto;
    }
  </style>
</head>
<body>

  <canvas id="mana-particles-canvas"></canvas>

  <!-- MASTER TOP HEADER -->
  <header class="master-header">
    <div class="brand-wrap">
      <div class="brand-logo-wrap" onclick="switchView('dashboard')" title="LevelUp — Système du Monarque (Dashboard)">
        ${MONARCH_LOGO_SVG}
        <div class="brand-text-block">
          <div class="brand-logo">
            <span class="shiny-text">LEVELUP</span>
          </div>
          <span class="brand-subtext">THE MONARCH SYSTEM</span>
        </div>
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: 18px;">
      <div style="font-family: var(--font-mono); font-size: 13px; color: var(--neon-cyan); display: flex; align-items: center; gap: 6px;">
        <span>🕒</span>
        <span id="system-clock">--:--:--</span>
      </div>
      <div class="radar-ping-badge" style="border-color: rgba(255, 215, 0, 0.4); color: var(--imperial-gold);">
        <span>💎 CRISTAUX :</span>
        <strong id="header-crystals-val">${player.shadowCrystals}</strong>
      </div>
      <div class="radar-ping-badge" style="border-color: rgba(0, 255, 102, 0.4); color: var(--transcendent-green);">
        <span>STREAK : <span id="header-streak-val">${player.streakDays}</span>J</span>
      </div>
      <button class="btn-cyber" onclick="toggleTheme()" style="padding: 6px 12px; font-size: 11px;">
        🌓 THÈME
      </button>
    </div>
  </header>

  <!-- NAVIGATION TABS (10 CANONICAL SCREENS) -->
  <nav class="nav-bar">
    <button class="nav-tab ${initialTab === "dashboard" ? "active" : ""}" onclick="switchView('dashboard')">
      <span>📊</span> HUD SOUVERAIN <span class="nav-shortcut">Alt+1</span>
    </button>
    <button class="nav-tab ${initialTab === "skills" ? "active" : ""}" onclick="switchView('skills')">
      <span>⚡</span> COMPÉTENCES DAG <span class="nav-shortcut">Alt+2</span>
    </button>
    <button class="nav-tab ${initialTab === "quests" ? "active" : ""}" onclick="switchView('quests')">
      <span>📜</span> QUÊTES DU JOUR <span class="nav-shortcut">Alt+3</span>
    </button>
    <button class="nav-tab ${initialTab === "planner" ? "active" : ""}" onclick="switchView('planner')">
      <span>📅</span> TIME-BLOCKING <span class="nav-shortcut">Alt+4</span>
    </button>
    <button class="nav-tab ${initialTab === "notes" ? "active" : ""}" onclick="switchView('notes')">
      <span>🧠</span> SECOND BRAIN <span class="nav-shortcut">Alt+5</span>
    </button>
    <button class="nav-tab ${initialTab === "audio" ? "active" : ""}" onclick="switchView('audio')">
      <span>🎙️</span> STATION VOCALE <span class="nav-shortcut">Alt+6</span>
    </button>
    <button class="nav-tab ${initialTab === "opportunities" ? "active" : ""}" onclick="switchView('opportunities')">
      <span>🌐</span> VEILLE BOURSES <span class="nav-shortcut">Alt+7</span>
    </button>
    <button class="nav-tab ${initialTab === "shop" ? "active" : ""}" onclick="switchView('shop')">
      <span>💎</span> BOUTIQUE D'OMBRE <span class="nav-shortcut">Alt+8</span>
    </button>
    <button class="nav-tab ${initialTab === "penalty" ? "active" : ""}" onclick="switchView('penalty')">
      <span>⚠️</span> ZONE PÉNALITÉ <span class="nav-shortcut">Alt+9</span>
    </button>
    <button class="nav-tab ${initialTab === "workout" ? "active" : ""}" onclick="switchView('workout')">
      <span>📷</span> VISION SPORT <span class="nav-shortcut">Alt+0</span>
    </button>
  </nav>

  <main class="main-container">

    <!-- =====================================================================
         SCREEN 1 : DASHBOARD HUD (LIVE INTERACTIVE VITALS & LEVEL)
         ===================================================================== -->
    <div id="view-dashboard" class="view-panel ${initialTab === "dashboard" ? "active" : ""}">
      
      <div class="system-alert-banner" id="dash-system-banner">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="background: rgba(0, 240, 255, 0.2); border: 1px solid var(--neon-cyan); border-radius: 4px; padding: 3px 8px; font-size: 11px; font-weight: 800; font-family: var(--font-mono); color: var(--neon-cyan);">
            [!] ALERT
          </span>
          <span class="shiny-green" style="font-family: var(--font-display); font-size: 18px; font-weight: 800; letter-spacing: 2px;">
            [WELCOME, PLAYER.]
          </span>
          <span style="font-size: 12px; color: var(--text-secondary); margin-left: 6px;" id="system-banner-status-desc">
            Le Système du Monarque est synchronisé. Aucune pénalité active.
          </span>
        </div>
        <div style="font-size: 12px; font-family: var(--font-mono); color: var(--neon-cyan);">
          SCORE HARMONIQUE : <strong style="color: var(--imperial-gold); font-size: 16px;" id="harmonic-score-display">Sh = ${harmonicScore}</strong>
        </div>
      </div>

      <div class="grid-2col">
        <!-- Left: Status & Vitals -->
        <div>
          <!-- Player Identity Card -->
          <div class="glass-card spotlight-card" style="padding: 24px; margin-bottom: 22px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px;">
              <div>
                <div style="font-size: 11px; letter-spacing: 2px; color: var(--neon-cyan); font-family: var(--font-mono); margin-bottom: 4px;">
                  STATUS // LE MONARQUE SOUVERAIN
                </div>
                <h1 class="shiny-text" id="dash-player-name" style="font-size: 32px; font-weight: 900; font-family: var(--font-display); line-height: 1;">
                  ${player.name}
                </h1>
                <p id="dash-player-title" style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                  ${player.title}
                </p>
              </div>

              <div style="text-align: center; background: rgba(0, 81, 255, 0.3); border: 2px solid var(--neon-cyan); padding: 10px 18px; border-radius: var(--radius-md); box-shadow: 0 0 18px rgba(0, 240, 255, 0.35);">
                <div style="font-size: 10px; color: var(--neon-cyan); font-family: var(--font-display); letter-spacing: 1px;">RANG</div>
                <div class="shiny-gold" id="dash-player-rank" style="font-size: 32px; font-weight: 900; line-height: 1; font-family: var(--font-display);">${player.rank}</div>
              </div>
            </div>

            <!-- Level & XP Capsule Progress -->
            <div style="margin-top: 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono); margin-bottom: 6px;">
                <span style="color: var(--neon-cyan);" id="dash-level-label">NIVEAU ${player.level} // PALIER ACTUEL</span>
                <span id="dash-xp-text" style="color: var(--text-white); font-weight: bold;">${player.currentXp} / ${player.nextLevelXp} XP (82%)</span>
              </div>
              <div class="capsule-slider-track">
                <div class="capsule-slider-fill capsule-fill-xp" id="dash-xp-bar" style="width: 82%;"></div>
              </div>
            </div>
          </div>

          <!-- True Solo Leveling Vital Gauges (Interactive with Real Recovery) -->
          <div class="glass-card spotlight-card" style="padding: 24px; margin-bottom: 22px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <span style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: var(--neon-cyan); font-family: var(--font-display);">
                ÉMETTEUR BIOPHYSIQUE SOUVERAIN (BORBÉLY & GANDEVIA)
              </span>
              <span class="radar-ping-badge" id="fatigue-status-badge" style="border-color: rgba(0, 255, 102, 0.4); color: var(--transcendent-green); font-size: 10px;">
                FATIGUE: 0% OPTIMAL
              </span>
            </div>

            <!-- HP Capsule Slider -->
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono); margin-bottom: 6px;">
                <span style="color: var(--transcendent-green); font-weight: bold;">+ HP // RÉSILIENCE BIOLOGIQUE</span>
                <span style="font-weight: bold;" id="hp-value-text">${player.hp} / 100 (${player.hp}%)</span>
              </div>
              <div class="capsule-slider-track">
                <div class="capsule-slider-fill capsule-fill-hp" id="hp-slider-bar" style="width: ${player.hp}%;"></div>
              </div>
            </div>

            <!-- MP Capsule Slider -->
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono); margin-bottom: 6px;">
                <span style="color: var(--neon-cyan); font-weight: bold;">⚡ MP // FOCUS COGNITIF INDOMPTABLE</span>
                <span style="font-weight: bold;" id="mp-value-text">${player.mp} / 100 (${player.mp}%)</span>
              </div>
              <div class="capsule-slider-track">
                <div class="capsule-slider-fill capsule-fill-mp" id="mp-slider-bar" style="width: ${player.mp}%;"></div>
              </div>
            </div>

            <!-- Sleep & Circadian Status + Interactive Restoration Controls -->
            <div style="display: flex; gap: 10px; margin-top: 14px; font-size: 11px; font-family: var(--font-mono);">
              <button class="btn-cyber" style="flex: 1; padding: 6px;" onclick="restoreVitals(15, 20)">
                ✨ MÉDITATION (+15 HP, +20 MP)
              </button>
              <button class="btn-cyber btn-gold" style="flex: 1; padding: 6px;" onclick="simulateDeepWorkDepletion()">
                🧠 FOCUS (-15 MP, +50 XP)
              </button>
            </div>
          </div>

          <!-- Octagonal Radar of the 8 Bases (Dynamic SVG) -->
          <div class="glass-card spotlight-card" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <span style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: var(--neon-cyan); font-family: var(--font-display);">
                RADAR DES 8 BASES DE VIE
              </span>
              <span class="shiny-gold" id="radar-sh-badge" style="font-size: 14px; font-weight: bold; font-family: var(--font-mono);">
                Sh = ${harmonicScore}
              </span>
            </div>
            
            <div style="display: flex; justify-content: center; padding: 10px 0;">
              <svg width="290" height="250" viewBox="0 0 290 250" id="radar-svg-canvas">
                <polygon points="145,25 225,60 255,140 215,215 145,235 75,215 35,140 65,60" fill="none" stroke="rgba(56, 189, 248, 0.2)" stroke-width="1"/>
                <polygon points="145,55 200,80 220,140 190,190 145,205 100,190 70,140 90,80" fill="none" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1"/>
                <polygon id="radar-dynamic-poly" points="145,70 195,90 210,140 185,180 145,190 110,180 85,140 100,90" fill="rgba(0, 240, 255, 0.25)" stroke="#00f0ff" stroke-width="2"/>
                <text x="145" y="16" fill="#38bdf8" font-size="10" font-family="monospace" text-anchor="middle">ACAD (55)</text>
                <text x="240" y="60" fill="#38bdf8" font-size="10" font-family="monospace">AI (62)</text>
                <text x="260" y="145" fill="#38bdf8" font-size="10" font-family="monospace">CYBER (48)</text>
                <text x="225" y="230" fill="#38bdf8" font-size="10" font-family="monospace">EXP (42)</text>
                <text x="145" y="248" fill="#38bdf8" font-size="10" font-family="monospace" text-anchor="middle">LNG (50)</text>
                <text x="40" y="230" fill="#38bdf8" font-size="10" font-family="monospace">FIN (38)</text>
                <text x="5" y="145" fill="#38bdf8" font-size="10" font-family="monospace">STR (52)</text>
                <text x="35" y="60" fill="#38bdf8" font-size="10" font-family="monospace">DIS (65)</text>
              </svg>
            </div>
          </div>
        </div>

        <!-- Right Column: Quests & Time Blocks -->
        <div>
          <!-- Quests Feed with Real Proof Validation -->
          <div class="glass-card spotlight-card" style="padding: 24px; margin-bottom: 22px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding-bottom: 10px;">
              <div>
                <span class="shiny-text" style="font-size: 16px; font-weight: 900; letter-spacing: 2px; font-family: var(--font-display);">
                  [!] QUEST INFO // QUÊTES DU JOUR
                </span>
              </div>
              <span class="radar-ping-badge" style="border-color: rgba(255, 0, 60, 0.4); color: var(--alert-crimson);">
                COUVRE-FEU : 22H00
              </span>
            </div>

            <div id="dash-quests-container">
              ${SYSTEM_STATE.quests
                .map(
                  (q) => `
                <div class="glass-card" id="quest-card-${q.id}" style="padding: 16px; margin-bottom: 12px; background: rgba(3, 14, 38, 0.65); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: var(--text-white);">${q.title}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${q.description}</div>
                    <div style="font-size: 11px; color: var(--neon-cyan); margin-top: 6px; font-family: var(--font-mono);">
                      RÉCOMPENSE : +<strong>${q.xp} XP</strong> | +<strong>${q.crystals} 💎</strong>
                    </div>
                  </div>
                  <div id="quest-action-${q.id}">
                    ${
                      q.completed
                        ? `<span style="color: var(--transcendent-green); font-weight: bold; font-size: 12px; padding: 6px 14px; border: 1px solid var(--transcendent-green); border-radius: var(--radius-sm); background: rgba(0, 255, 102, 0.1);">ACCOMPLIE ✓</span>`
                        : `<button class="btn-cyber" onclick="openProofModal('${q.id}', '${q.title.replace(/'/g, "\\'")}', ${q.xp}, ${q.crystals})">VALIDER</button>`
                    }
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>

          <!-- Active Circadian Sprint with Working Timer -->
          <div class="glass-card spotlight-card" style="padding: 24px; margin-bottom: 22px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: var(--monarch-purple); font-family: var(--font-display);">
                SPRINT CIRCADIEN ACTIF // POMODORO 25 MIN
              </span>
              <span class="shiny-text" id="pomodoro-timer-display" style="font-size: 20px; font-weight: 900; font-family: var(--font-mono);">
                25:00
              </span>
            </div>
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 6px; color: var(--text-white);" id="active-block-title">
              Deep Work IA : Kernel Triton & FlashAttention-2
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
              Zéro distraction. Isolation sensorielle stricte. +50 XP et régénération neuronale à l'achèvement.
            </p>
            <div style="display: flex; gap: 10px; margin-top: 16px;">
              <button class="btn-cyber" id="pomodoro-toggle-btn" onclick="togglePomodoroTimer()">
                ▶ DÉMARRER LE SPRINT
              </button>
              <button class="btn-cyber btn-gold" onclick="switchView('planner')">
                VOIR PLANNING ➔
              </button>
            </div>
          </div>

          <!-- Last Socratic Defense Card -->
          <div class="glass-card spotlight-card" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: var(--imperial-gold); font-family: var(--font-display);">
                DERNIÈRE ÉVALUATION DE L'ARCHITECTE (GRILLE 20 PTS)
              </span>
              <span class="shiny-green" id="dash-oral-score" style="font-size: 22px; font-weight: 900; font-family: var(--font-display);">
                18.5 / 20
              </span>
            </div>
            <div style="font-size: 15px; font-weight: bold; margin-bottom: 6px; color: var(--text-white);" id="dash-oral-topic">
              Sujet : Quantification INT8 & Moteur CTranslate2
            </div>
            <p style="font-size: 12px; color: var(--text-secondary); font-style: italic; line-height: 1.5;" id="dash-oral-feedback">
              "Démonstration rigoureuse du compromis latence/précision sur RTX 4070. Les tenseurs symétriques ont été parfaitement explicités."
            </p>
          </div>
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 2 : 120 SKILLS TREE (DAG WITH WORKING UNLOCK & XP SPEND)
         ===================================================================== -->
    <div id="view-skills" class="view-panel ${initialTab === "skills" ? "active" : ""}">
      <div class="glass-card spotlight-card" style="padding: 26px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
          <div>
            <h2 class="shiny-text" style="font-size: 26px; font-weight: 900; font-family: var(--font-display);">
              ARBRE DES 120 COMPÉTENCES CANONIQUES (DAG)
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Graphe orienté acyclique strict réparti sur les 8 Piliers de l'Éveillé.</p>
          </div>
          <div class="radar-ping-badge" style="border-color: rgba(255, 215, 0, 0.4); color: var(--imperial-gold); font-size: 13px; padding: 6px 14px;">
            POINTS D'XP DISPONIBLES : <strong id="skills-available-xp" style="margin-left: 4px;">${player.availableSkillXp}</strong> XP
          </div>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 22px;">
          <button class="btn-cyber" onclick="filterSkillGrid('ALL')">TOUTES (120)</button>
          <button class="btn-cyber" onclick="filterSkillGrid('AI_ENG')">IA & LLM (15)</button>
          <button class="btn-cyber" onclick="filterSkillGrid('CYBER')">CYBERSÉCURITÉ (15)</button>
          <button class="btn-cyber" onclick="filterSkillGrid('ACAD')">ACADÉMIQUE IA (15)</button>
          <button class="btn-cyber" onclick="filterSkillGrid('STR')">CALISTHÉNIE (15)</button>
          <button class="btn-cyber" onclick="filterSkillGrid('LNG')">ANGLAIS C1/C2 (15)</button>
          <button class="btn-cyber" onclick="filterSkillGrid('FIN')">FINANCES & BOURSES (15)</button>
        </div>

        <div class="grid-3col" id="skills-grid-container">
          ${SYSTEM_STATE.skillsList
            .map(
              (sk) => `
            <div class="glass-card spotlight-card skill-card-item" id="skill-card-${sk.id}" data-base="${sk.base}" style="padding: 18px; border-color: ${sk.status === "MASTERED" ? "rgba(0, 255, 102, 0.5)" : sk.status === "IN_PROGRESS" ? "var(--neon-cyan)" : "rgba(56, 189, 248, 0.2)"};">
              <div style="font-size: 11px; color: var(--imperial-gold); font-weight: bold; font-family: var(--font-mono);" id="skill-badge-${sk.id}">
                ${sk.base} // TIER ${sk.tier} [${sk.status === "MASTERED" ? "MAÎTRISÉ 5/5" : sk.status === "IN_PROGRESS" ? "EN COURS 3/5" : "VERROUILLÉ"}]
              </div>
              <div style="font-size: 16px; font-weight: bold; margin: 6px 0; color: var(--text-white);">${sk.name}</div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${sk.dod}</p>
              <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;" id="skill-action-${sk.id}">
                ${
                  sk.status === "MASTERED"
                    ? `<span style="font-size: 11px; color: var(--transcendent-green); font-weight: bold;">DOD VALIDÉE ✓ (+${sk.xp} XP)</span>`
                    : `<span style="font-size: 11px; color: var(--imperial-gold); font-family: var(--font-mono);">COÛT : ${sk.xp} XP</span>
                     <button class="btn-cyber" style="padding: 4px 10px; font-size: 11px;" onclick="unlockSkillNode('${sk.id}', '${sk.name.replace(/'/g, "\\'")}', ${sk.xp}, '${sk.base}')">DÉVERROUILLER</button>`
                }
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 3 : JOURNAL DES QUÊTES & ALERTES SYSTÈME (3D CIRCULAR CAROUSEL)
         ===================================================================== -->
    <div id="view-quests" class="view-panel ${initialTab === "quests" ? "active" : ""}">
      <!-- Emergency Quest Alert Box (Real Countdown) -->
      <div class="border-beam-box" id="emergency-quest-box" style="margin-bottom: 24px;">
        <div class="border-beam-content" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="radar-ping-badge" style="border-color: rgba(255, 0, 60, 0.6); color: var(--alert-crimson);">
                [!] QUÊTE D'URGENCE DU SYSTÈME (RANG S)
              </span>
              <span style="font-size: 12px; color: var(--alert-crimson); font-weight: bold;" id="emergency-status-label">
                RÉVOLUTION OU ÉCHEC IRRÉVERSIBLE
              </span>
            </div>
            <div id="emergency-timer-text" style="font-size: 24px; font-weight: 900; font-family: var(--font-mono); color: var(--alert-crimson); text-shadow: 0 0 15px rgba(255, 0, 60, 0.8);">
              [ 00:57:24 ]
            </div>
          </div>

          <h3 style="font-size: 20px; font-weight: 900; color: var(--text-white); margin-bottom: 8px; font-family: var(--font-display);">
            Audit de Sécurité : Faille Critique sur le SingleUserGuard
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
            Le Système détecte une vulnérabilité d'usurpation d'identité sur les endpoints du Chasseur. L'en-tête <code>x-player-id</code> doit être sanitisé immédiatement avant le verrouillage du récepteur.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;" id="emergency-action-wrap">
            <div style="font-size: 12px; font-family: var(--font-mono); color: var(--transcendent-green);">
              GAIN : +500 XP | +100 CRISTAUX D'OMBRE 💎
            </div>
            <button class="btn-cyber btn-red" onclick="openProofModal('q-emergency-auth-bypass', 'Audit de Sécurité SingleUserGuard', 500, 100)">
              SOUMETTRE LE COMMIT DE PATCH
            </button>
          </div>
        </div>
      </div>

      <!-- Quests Mode Switcher & Create Button -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 14px;">
        <div class="obsidian-view-mode-tabs">
          <button class="obsidian-mode-btn active" id="btn-quest-mode-carousel" onclick="setQuestsViewMode('carousel')">
            <span>🌀</span> CYLINDRE 3D (CIRCULAR CAROUSEL)
          </button>
          <button class="obsidian-mode-btn" id="btn-quest-mode-grid" onclick="setQuestsViewMode('grid')">
            <span>📋</span> GRILLE COMPLÈTE
          </button>
        </div>
        <button class="btn-cyber" onclick="openCreateQuestModal()">+ CRÉER UNE NOUVELLE QUÊTE</button>
      </div>

      <!-- 1. 3D CIRCULAR CAROUSEL SECTION -->
      <div id="quests-carousel-section" class="quests-carousel-container">
        <div style="position: absolute; top: 18px; left: 24px; z-index: 25; pointer-events: none;">
          <div style="font-size: 11px; letter-spacing: 2px; color: var(--neon-cyan); font-family: var(--font-mono); font-weight: bold;">
            REACTBITS // 3D CYLINDRICAL QUEST CAROUSEL
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
            Glissez horizontalement pour faire pivoter le cylindre. Cliquez sur une carte pour la verrouiller.
          </div>
        </div>

        <div class="circular-carousel" id="quest-circular-carousel" data-axis="y" data-shape="cylinder" data-draggable>
          <div class="circular-carousel__view">
            <div class="circular-carousel__stage" id="quest-carousel-stage">
              <div class="circular-carousel__camera" id="quest-carousel-camera">
                <div class="circular-carousel__ring" id="quest-carousel-ring">
                  <!-- Dynamically populated 3D quest cards -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="quest-carousel-controls">
          <button class="btn-cyber" style="padding: 6px 14px; font-size: 12px;" onclick="stepQuestCarousel(-1)">◀ PRÉCÉDENT</button>
          <button class="btn-cyber btn-gold" id="btn-quest-carousel-play" style="padding: 6px 14px; font-size: 12px;" onclick="toggleQuestCarouselDrift()">⏯ PAUSE</button>
          <button class="btn-cyber" style="padding: 6px 14px; font-size: 12px;" onclick="stepQuestCarousel(1)">SUIVANT ▶</button>
          <span class="radar-ping-badge" id="quest-carousel-active-badge" style="font-size: 11px; padding: 4px 10px;">
            QUÊTE 1 / ${SYSTEM_STATE.quests.length}
          </span>
        </div>
      </div>

      <!-- 2. TRADITIONAL GRID SECTION -->
      <div id="quests-page-grid-section" style="display: none;">
        <div class="glass-card spotlight-card" style="padding: 26px;">
          <h3 class="shiny-text" style="font-size: 22px; font-weight: 900; font-family: var(--font-display); margin-bottom: 18px;">
            JOURNAL DES QUÊTES OBLIGATOIRES ACTIVES
          </h3>
          <div class="grid-2col" id="quests-page-grid">
            ${SYSTEM_STATE.quests
              .map(
                (q) => `
              <div class="glass-card spotlight-card" id="qlist-${q.id}" style="padding: 20px; background: rgba(3, 14, 38, 0.75);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span class="radar-ping-badge">${q.base} // ${q.type}</span>
                  <span style="font-size: 12px; color: var(--imperial-gold); font-family: var(--font-mono);">+${q.xp} XP</span>
                </div>
                <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: var(--text-white);">${q.title}</h4>
                <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.4;">${q.description}</p>
                <div id="qlist-action-${q.id}">
                  ${
                    q.completed
                      ? `<div style="font-size: 12px; color: var(--transcendent-green); font-weight: bold;">ACCOMPLIE ✓ (PREUVE VÉRIFIÉE)</div>`
                      : `<button class="btn-cyber" onclick="openProofModal('${q.id}', '${q.title.replace(/'/g, "\\'")}', ${q.xp}, ${q.crystals})">SOUMETTRE LA PREUVE</button>`
                  }
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================================
         SCREEN 4 : TIME-BLOCKING CIRCADIEN (WITH REAL COMPLETION & TIMERS)
         ===================================================================== -->
    <div id="view-planner" class="view-panel ${initialTab === "planner" ? "active" : ""}">
      <div class="glass-card spotlight-card" style="padding: 26px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 class="shiny-text" style="font-size: 26px; font-weight: 900; font-family: var(--font-display);">
              PLANIFICATEUR CIRCADIEN TIME-BLOCKING (06H00 - 22H00)
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Modèle biphasique de Borbély (Pression Homéostatique S vs Vigilance Circadienne C).</p>
          </div>
          <button class="btn-cyber" onclick="openCreateBlockModal()">+ AJOUTER UN BLOC</button>
        </div>

        <div id="planner-blocks-container">
          ${SYSTEM_STATE.plannerBlocks
            .map(
              (b) => `
            <div class="glass-card spotlight-card" id="block-card-${b.id}" style="padding: 16px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; ${b.status === "ACTIVE" ? "border-color: var(--neon-cyan); box-shadow: 0 0 20px rgba(0,240,255,0.4);" : ""}">
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="font-size: 14px; font-family: var(--font-mono); color: var(--neon-cyan); min-width: 110px;">
                  ${b.time}
                </div>
                <div>
                  <div style="font-size: 15px; font-weight: bold; color: var(--text-white);">${b.title}</div>
                  <div style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono); margin-top: 3px;">
                    PILIER : ${b.base} | TYPE : ${b.type}
                  </div>
                </div>
              </div>
              <div id="block-action-${b.id}">
                ${b.status === "COMPLETED" ? `<span style="color: var(--transcendent-green); font-size: 12px; font-weight: bold;">VALIDÉ ✓</span>` : ""}
                ${
                  b.status === "ACTIVE"
                    ? `
                  <button class="btn-cyber" style="padding: 5px 12px; font-size: 11px;" onclick="completeBlock('${b.id}')">TERMINER CE BLOC</button>
                `
                    : ""
                }
                ${
                  b.status === "UPCOMING"
                    ? `
                  <button class="btn-cyber" style="padding: 5px 12px; font-size: 11px;" onclick="activateBlock('${b.id}')">DÉMARRER MAINTENANT</button>
                `
                    : ""
                }
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 5 : OBSIDIAN SECOND BRAIN VAULT & INTERACTIVE KNOWLEDGE GRAPH
         ===================================================================== -->
    <div id="view-notes" class="view-panel ${initialTab === "notes" ? "active" : ""}">
      <div class="glass-card spotlight-card" style="padding: 22px; margin-bottom: 24px;">
        
        <!-- Vault Header & Toolbar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: 11px; letter-spacing: 2px; color: var(--monarch-purple); font-family: var(--font-mono); font-weight: bold; margin-bottom: 4px;">
              OBSIDIAN VAULT // RÉSEAU NEURAL COGNITIF DU MONARQUE
            </div>
            <h2 class="shiny-text" style="font-size: 26px; font-weight: 900; font-family: var(--font-display); line-height: 1;">
              CERVEAU NUMÉRIQUE & COFFRE OBSIDIAN
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
              Graphe de force interactif, liens bi-directionnels [[wikilinks]], arborescence de dossiers et formules KaTeX.
            </p>
          </div>
          
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <div class="obsidian-view-mode-tabs">
              <button class="obsidian-mode-btn active" id="btn-mode-graph" onclick="setObsidianMode('graph')">
                <span>🕸️</span> GRAPHE OBSIDIAN
              </button>
              <button class="obsidian-mode-btn" id="btn-mode-reader" onclick="setObsidianMode('reader')">
                <span>📝</span> LECTEUR & ÉDITEUR
              </button>
              <button class="obsidian-mode-btn" id="btn-mode-split" onclick="setObsidianMode('split')">
                <span>⚡</span> SPLIT VIEW
              </button>
              <button class="obsidian-mode-btn" id="btn-mode-cards" onclick="setObsidianMode('cards')">
                <span>🗂️</span> CARTES
              </button>
            </div>
            <button class="btn-cyber" onclick="openCreateNoteModal()">+ NOUVELLE NOTE</button>
          </div>
        </div>

        <!-- Search Bar & Vault Stats -->
        <div style="display: flex; gap: 14px; margin-bottom: 18px; align-items: center; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 260px;">
            <input type="text" id="notes-search-input" oninput="filterObsidianNotes(this.value)" placeholder="🔍 Rechercher dans le coffre Obsidian (ex: FlashAttention, SVD, Triton, MediaPipe)..." class="form-input">
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span class="radar-ping-badge" style="border-color: rgba(168, 85, 247, 0.4); color: var(--monarch-purple);">
              📚 <span id="vault-notes-count">${SYSTEM_STATE.notes.length}</span> NOTES
            </span>
            <span class="radar-ping-badge">
              🔗 <span id="vault-links-count">28</span> LIENS SÉMANTIQUES
            </span>
            <span class="radar-ping-badge" style="border-color: rgba(0, 255, 102, 0.4); color: var(--transcendent-green);">
              🏷️ 24 TAGS
            </span>
          </div>
        </div>

        <!-- Obsidian 3-Pane Layout -->
        <div class="obsidian-layout" id="obsidian-main-layout">
          
          <!-- Left Pane: File Tree Explorer -->
          <div class="obsidian-explorer">
            <div class="obsidian-explorer-title">
              <span>EXPLORATEUR OBSIDIAN</span>
              <span style="font-size: 10px; color: var(--text-muted); cursor: pointer;" onclick="refreshObsidianGraph()" title="Recharger le graphe">🔄 REFRESH</span>
            </div>
            <div id="obsidian-folder-tree">
              <!-- Dynamically populated folder tree -->
            </div>
          </div>

          <!-- Main Stage: Graph View, Reader View, Split View, or Cards View -->
          <div class="obsidian-main-stage" id="obsidian-stage-container">
            
            <!-- 1. GRAPH VIEW STAGE -->
            <div class="obsidian-graph-canvas-wrap" id="stage-graph">
              <canvas id="obsidian-graph-canvas"></canvas>
              
              <!-- Floating Graph Controls -->
              <div class="obsidian-graph-controls">
                <button class="graph-ctrl-btn" onclick="zoomObsidianGraph(1.2)" title="Zoom Avant">+</button>
                <button class="graph-ctrl-btn" onclick="zoomObsidianGraph(0.8)" title="Zoom Arrière">-</button>
                <button class="graph-ctrl-btn" onclick="recenterObsidianGraph()" title="Recentrer le Graphe">🎯</button>
                <button class="graph-ctrl-btn" onclick="restartObsidianPhysics()" title="Relancer la Physique">🔄</button>
              </div>

              <!-- Domain Color Legend -->
              <div class="obsidian-graph-legend">
                <div class="legend-item"><span class="legend-dot" style="background: #a855f7;"></span> Hub Monarque</div>
                <div class="legend-item"><span class="legend-dot" style="background: #00f0ff;"></span> Ingénierie IA</div>
                <div class="legend-item"><span class="legend-dot" style="background: #ff003c;"></span> Cybersécurité</div>
                <div class="legend-item"><span class="legend-dot" style="background: #ffd700;"></span> Mathématiques</div>
                <div class="legend-item"><span class="legend-dot" style="background: #00ff66;"></span> Biomécanique</div>
                <div class="legend-item"><span class="legend-dot" style="background: #38bdf8;"></span> Anglais C1</div>
              </div>
            </div>

            <!-- 2. NOTE READER & EDITOR STAGE -->
            <div class="obsidian-reader-pane" id="stage-reader">
              <div class="obsidian-note-header">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <div class="obsidian-breadcrumb" id="reader-breadcrumb">
                    <span>📁 00_Synthese_Souveraine</span> / <span>README.md</span>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <button class="btn-cyber" id="btn-edit-note-toggle" style="padding: 4px 10px; font-size: 11px;" onclick="toggleNoteEditMode()">
                      ✏️ MODIFIER
                    </button>
                    <button class="btn-cyber btn-gold" id="btn-save-note" style="padding: 4px 10px; font-size: 11px; display: none;" onclick="saveCurrentNoteEdit()">
                      💾 ENREGISTRER
                    </button>
                  </div>
                </div>
                <h1 class="obsidian-note-title" id="reader-note-title">README - Coffre de Connaissances du Monarque</h1>
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                  <span class="radar-ping-badge" id="reader-note-base">DIS</span>
                  <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);" id="reader-note-date">Modifié le 2026-11-12</span>
                  <span class="radar-ping-badge" style="border-color: rgba(0, 240, 255, 0.4); color: var(--neon-cyan);" id="reader-backlinks-count">🔗 6 MENTIONS LIÉES</span>
                </div>
              </div>

              <!-- Note Content Body (Markdown & KaTeX rendered) -->
              <div class="obsidian-note-body" id="reader-note-body">
                <!-- Rendered Markdown with KaTeX formulas and Wikilinks -->
              </div>

              <!-- Raw Markdown Edit Textarea (Hidden by default) -->
              <div id="reader-edit-container" style="display: none; margin-top: 14px;">
                <textarea id="reader-edit-textarea" class="form-input" rows="18" style="font-family: var(--font-mono); font-size: 13px; line-height: 1.6;"></textarea>
              </div>

              <!-- Backlinks Panel ("Mentions liées") -->
              <div class="obsidian-backlinks-panel">
                <div class="obsidian-backlinks-title">
                  <span>🔗 MENTIONS LIÉES (BACKLINKS OBSIDIAN)</span>
                </div>
                <div id="reader-backlinks-list">
                  <!-- Dynamically populated backlinks cards -->
                </div>
              </div>
            </div>

            <!-- 3. SPLIT VIEW STAGE (Reader on Left + Mini Graph on Right) -->
            <div id="stage-split" style="display: none; height: 100%;">
              <div class="obsidian-split-grid">
                <div class="obsidian-split-left" id="split-reader-pane">
                  <!-- Mirrored Reader Content -->
                </div>
                <div class="obsidian-split-right">
                  <canvas id="obsidian-split-graph-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
                </div>
              </div>
            </div>

            <!-- 4. CARDS VIEW STAGE (Backwards compatibility) -->
            <div id="stage-cards" style="display: none; padding: 20px; overflow-y: auto; max-height: 700px;">
              <div class="grid-2col" id="notes-grid-container">
                ${SYSTEM_STATE.notes
                  .map(
                    (n) => `
                  <div class="glass-card spotlight-card note-card-item" id="note-card-${n.id}" style="padding: 22px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                      <span class="radar-ping-badge">${n.base}</span>
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${n.updatedAt.split("T")[0]}</span>
                        <button onclick="deleteNote('${n.id}')" style="background: none; border: none; color: var(--alert-crimson); cursor: pointer; font-size: 14px;">🗑</button>
                      </div>
                    </div>
                    <h3 style="font-size: 17px; font-weight: bold; margin-bottom: 12px; color: var(--text-white); cursor: pointer;" onclick="openObsidianNote('${n.id}'); setObsidianMode('reader');">${n.title}</h3>
                    <div style="background: rgba(2, 8, 24, 0.7); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: var(--radius-sm); padding: 14px; font-size: 12px; font-family: var(--font-mono); color: var(--text-secondary); line-height: 1.5; white-space: pre-wrap; margin-bottom: 14px;">${n.content}</div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                      ${n.tags.map((t) => `<span style="background: rgba(0, 240, 255, 0.1); color: var(--neon-cyan); font-size: 11px; font-family: var(--font-mono); padding: 3px 8px; border-radius: 4px;">#${t}</span>`).join("")}
                    </div>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>


    <!-- =====================================================================
         SCREEN 6 : STATION VOCALE & ÉVALUATION SOCRATIQUE (REAL WEBAUDIO & MIC)
         ===================================================================== -->
    <div id="view-audio" class="view-panel ${initialTab === "audio" ? "active" : ""}">
      <div class="glass-card spotlight-card" style="padding: 26px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 class="shiny-text" style="font-size: 26px; font-weight: 900; font-family: var(--font-display);">
              STATION VOCALE & ÉVALUATION SOCRATIQUE
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Capture audio temps réel, analyse spectrale FFT et notation sur la grille 20 points de l'Architecte.</p>
          </div>
          <button class="btn-cyber" id="record-toggle-btn" onclick="toggleAudioRecording()">🎙️ DÉMARRER ENREGISTREMENT</button>
        </div>

        <!-- Real Web Audio Spectrum Canvas -->
        <div class="glass-card" style="padding: 16px; margin-bottom: 22px; background: rgba(2, 8, 24, 0.85); text-align: center;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; color: var(--neon-cyan); font-family: var(--font-mono);">
              SPECTRE FRÉQUENTIEL FFT TEMPS RÉEL (64 BANDES // ANALYSERNODE)
            </span>
            <span id="mic-status-label" style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
              MICRO : PRÊT
            </span>
          </div>
          <canvas id="audio-canvas" style="width: 100%; height: 140px; border-radius: var(--radius-sm);"></canvas>
        </div>

        <!-- Real-Time Speech Transcript & Evaluation Input -->
        <div style="margin-bottom: 22px;">
          <label style="font-size: 12px; color: var(--neon-cyan); font-family: var(--font-mono); display: block; margin-bottom: 6px;">
            TRANSCRIPTION EN DIRECT DU MONOLOGUE ORAL (OU COLLER UN DISCOURS TECHNIQUE) :
          </label>
          <textarea id="speech-transcript-box" rows="4" class="form-input" style="line-height: 1.5;" placeholder="Parlez dans le micro ou collez votre restitution orale ici (ex: 'The scaled dot-product attention mechanism computes similarity scores between queries and keys divided by the square root of dimension dk, followed by a softmax function to obtain attention weights applied to values...')..."></textarea>
          <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
            <button class="btn-cyber btn-gold" onclick="evaluateSocraticSpeech()">⚡ ANALYSER & ÉVALUER CE DISCOURS</button>
          </div>
        </div>

        <!-- Socratic Oral Defense Rubric Output -->
        <div class="glass-card spotlight-card" style="padding: 22px;" id="socratic-rubric-card">
          <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 14px; color: var(--neon-cyan); font-family: var(--font-display);">
            GRILLE D'ÉVALUATION ORALE SOCRATIQUE (20 POINTS)
          </h3>
          <div class="grid-2col">
            <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.8;">
              <div>🔹 <strong>Précision Conceptuelle & Mathématique :</strong> <span id="crit-concept" style="color: var(--neon-cyan); font-weight: bold;">6 / 6 pts</span></div>
              <div>🔹 <strong>Rigueur du Raisonnement & Falsifiabilité :</strong> <span id="crit-rigor" style="color: var(--neon-cyan); font-weight: bold;">5 / 5 pts</span></div>
              <div>🔹 <strong>Clarté d'Élocution & Débit Cambridge C1 :</strong> <span id="crit-delivery" style="color: var(--neon-cyan); font-weight: bold;">4.5 / 5 pts</span></div>
              <div>🔹 <strong>Pertinence des Exemples & Benchmarks :</strong> <span id="crit-examples" style="color: var(--neon-cyan); font-weight: bold;">3 / 4 pts</span></div>
            </div>
            <div style="text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">NOTE GLOBALE ATTRIBUÉE</div>
              <div class="shiny-green" id="rubric-total-score" style="font-size: 48px; font-weight: 900; font-family: var(--font-display); line-height: 1;">18.5 / 20</div>
              <div style="font-size: 12px; color: var(--transcendent-green); font-weight: bold; margin-top: 6px;" id="rubric-decision-label">COMPÉTENCE VALIDÉE PAR L'ARCHITECTE ✓</div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 7 : VEILLE BOURSES & HACKATHONS DEERFLOW (KANBAN)
         ===================================================================== -->
    <div id="view-opportunities" class="view-panel ${initialTab === "opportunities" ? "active" : ""}">
      <div class="glass-card spotlight-card" style="padding: 26px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 class="shiny-text" style="font-size: 26px; font-weight: 900; font-family: var(--font-display);">
              VEILLE BOURSES & HACKATHONS (KANBAN DEERFLOW)
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Agrégation automatisée Campus France, Devpost et bourses d'excellence IA.</p>
          </div>
          <button class="btn-cyber" onclick="triggerDeerflowScraper()">🔄 SCRAPER NOUVELLES OPPORTUNITÉS</button>
        </div>

        <div class="grid-3col" id="opportunities-grid">
          ${SYSTEM_STATE.opportunities
            .map(
              (o) => `
            <div class="glass-card spotlight-card" id="opp-card-${o.id}" style="padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span class="radar-ping-badge">${o.type}</span>
                <span style="font-size: 12px; color: var(--imperial-gold); font-family: var(--font-mono); font-weight: bold;">MATCH : ${o.matchScore}%</span>
              </div>
              <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: var(--text-white);">${o.title}</h3>
              <div style="font-size: 12px; color: var(--neon-cyan); font-family: var(--font-mono); margin-bottom: 6px;">${o.amount}</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">Portail : ${o.portal} | Date limite : ${o.deadline}</div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; color: var(--transcendent-green); font-weight: bold; background: rgba(0, 255, 102, 0.1); padding: 4px 8px; border-radius: 4px;">${o.status}</span>
                <a href="${o.url}" target="_blank" class="btn-cyber" style="padding: 5px 12px; font-size: 11px; text-decoration: none;">POSTULER ↗</a>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 8 : LA BOUTIQUE DES OMBRES (WITH REAL INVENTORY & VOUCHERS)
         ===================================================================== -->
    <div id="view-shop" class="view-panel ${initialTab === "shop" ? "active" : ""}">
      <div class="glass-card spotlight-card" style="padding: 26px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 class="shiny-text" style="font-size: 26px; font-weight: 900; font-family: var(--font-display);">
              LA BOUTIQUE DES OMBRES (SHADOW SHOP)
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Convertissez vos Cristaux d'Ombre en matériel et abonnements certifiés.</p>
          </div>
          <div class="radar-ping-badge" style="border-color: rgba(255, 215, 0, 0.5); color: var(--imperial-gold); font-size: 14px; padding: 8px 16px;">
            💎 SOLDE ACTUEL : <strong id="shop-balance-display">${player.shadowCrystals}</strong> CRISTAUX
          </div>
        </div>

        <div class="grid-3col">
          ${SYSTEM_STATE.shopItems
            .map(
              (item) => `
            <div class="glass-card spotlight-card" style="padding: 22px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span class="radar-ping-badge">${item.category}</span>
                  <span class="shiny-gold" style="font-size: 14px; font-weight: bold; font-family: var(--font-mono);">RANG ${item.rank}</span>
                </div>
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: var(--text-white);">${item.name}</h3>
                <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 16px;">${item.desc}</p>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(56, 189, 248, 0.15); padding-top: 14px;">
                <span style="font-size: 15px; font-weight: 900; color: var(--imperial-gold); font-family: var(--font-mono);">${item.cost} 💎</span>
                <button class="btn-cyber btn-gold" onclick="buyShopItem('${item.id}', '${item.name.replace(/'/g, "\\'")}', ${item.cost})">ACHETER</button>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>

        <!-- Inventory of Redeemed Vouchers -->
        <div style="margin-top: 30px; border-top: 1px solid rgba(56, 189, 248, 0.2); padding-top: 20px;">
          <h3 class="shiny-text" style="font-size: 18px; font-weight: bold; margin-bottom: 14px;">📦 MES ARTICLES DÉBLOQUÉS & CODES DE RETRAIT</h3>
          <div id="shop-inventory-container" class="grid-2col">
            ${SYSTEM_STATE.inventory
              .map(
                (inv) => `
              <div class="glass-card" style="padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 14px; font-weight: bold; color: var(--text-white);">${inv.name}</div>
                  <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Acheté le ${inv.date} pour ${inv.cost} 💎</div>
                </div>
                <div style="background: rgba(0, 240, 255, 0.1); border: 1px solid var(--neon-cyan); padding: 6px 10px; border-radius: 4px; font-family: var(--font-mono); font-size: 11px; color: var(--neon-cyan);">
                  ${inv.code}
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 9 : ZONE DE PÉNALITÉ & VERROUILLAGE RÉSEAU INVIOLABLE
         ===================================================================== -->
    <div id="view-penalty" class="view-panel ${initialTab === "penalty" ? "active" : ""}">
      <div class="border-beam-box" style="margin-bottom: 24px;">
        <div class="border-beam-content" style="padding: 26px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="radar-ping-badge" style="border-color: rgba(255, 0, 60, 0.5); color: var(--alert-crimson);">
                ⚠️ ZONE DE PÉNALITÉ INVIOLABLE
              </span>
              <span style="font-size: 13px; font-weight: bold;" id="penalty-status-header">
                STATUT : CHASSEUR EN RÈGLE (AUCUN BLOCAGE ACTIF)
              </span>
            </div>
            <button class="btn-cyber btn-red" id="penalty-toggle-btn" onclick="togglePenaltySimulation()">DÉCLENCHER SIMULATION PÉNALITÉ</button>
          </div>

          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px;">
            En cas d'échec d'une quête obligatoire à 22h00, NextDNS verrouille tous les réseaux enregistrés.
          </p>

          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: var(--alert-crimson); font-family: var(--font-display);">
            DOMAINES SOUMIS AU BLACKOUT AUTOMATIQUE :
          </h3>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px;">
            ${SYSTEM_STATE.penalty.blockedDomains
              .map(
                (d) => `
              <span style="background: rgba(255, 0, 60, 0.12); border: 1px solid rgba(255, 0, 60, 0.4); color: var(--alert-crimson); font-size: 12px; font-family: var(--font-mono); padding: 5px 12px; border-radius: var(--radius-sm);">
                🔒 ${d}
              </span>
            `,
              )
              .join("")}
          </div>

          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: var(--transcendent-green); font-family: var(--font-display);">
            ÉPREUVES DE RÉDEMPTION POUR LEVER LE BLOCAGE :
          </h3>
          <div class="grid-2col">
            <div class="glass-card" style="padding: 16px; border-color: rgba(0, 255, 102, 0.3);">
              <div style="font-size: 13px; font-weight: bold; color: var(--text-white); margin-bottom: 6px;">OPTION A : CALISTHÉNIE MILITAIRE</div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 10px;">${SYSTEM_STATE.penalty.redemptionOptionA}</p>
              <button class="btn-cyber" style="width: 100%; padding: 6px;" onclick="redeemPenalty('A')">VALIDER 400 POMPES (RACHAT)</button>
            </div>
            <div class="glass-card" style="padding: 16px; border-color: rgba(0, 255, 102, 0.3);">
              <div style="font-size: 13px; font-weight: bold; color: var(--text-white); margin-bottom: 6px;">OPTION B : COURSE NOCTURNE GPS</div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 10px;">${SYSTEM_STATE.penalty.redemptionOptionB}</p>
              <button class="btn-cyber" style="width: 100%; padding: 6px;" onclick="redeemPenalty('B')">VALIDER 10 KM COURSE (RACHAT)</button>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 10 : SALLE D'ENTRAÎNEMENT (REAL WEBCAM & REPS COUNTING)
         ===================================================================== -->
    <div id="view-workout" class="view-panel ${initialTab === "workout" ? "active" : ""}">
      <div class="glass-card spotlight-card" style="padding: 26px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 class="shiny-text" style="font-size: 26px; font-weight: 900; font-family: var(--font-display);">
              SALLE D'ENTRAÎNEMENT & VISION PAR ORDINATEUR (MEDIAPIPE)
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Analyse cinématique des repères squelettiques avec seuil de flexion strict.</p>
          </div>
          <button class="btn-cyber" id="cam-toggle-btn" onclick="toggleCamera()">📷 ACTIVER CAMÉRA</button>
        </div>

        <div class="grid-2col">
          <div class="glass-card" style="padding: 12px; background: rgba(1, 6, 18, 0.95); min-height: 380px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;">
            <video id="webcam-video" style="display: none; width: 100%; border-radius: var(--radius-sm);" autoplay playsinline></video>
            <div id="cam-placeholder" style="text-align: center; color: var(--text-muted); padding: 40px 20px;">
              <div style="font-size: 48px; margin-bottom: 12px;">📷</div>
              <div style="font-size: 15px; color: var(--text-white); font-weight: bold; margin-bottom: 6px;">Tracking Cinématique MediaPipe Prêt</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Cliquez sur "Activer Caméra" pour démarrer l'estimation de pose en temps réel.</div>
              <div style="font-size: 11px; margin-top: 10px; color: var(--neon-cyan); font-family: var(--font-mono);">
                Seuil strict : Flexion coude ≤ 75° ➔ Extension ≥ 160°
              </div>
            </div>
          </div>

          <div>
            <div class="glass-card spotlight-card" style="padding: 22px; margin-bottom: 18px;">
              <div style="font-size: 11px; color: var(--imperial-gold); font-weight: bold; font-family: var(--font-mono);">ROUTINE SÉLECTIONNÉE</div>
              <h3 style="font-size: 18px; font-weight: bold; margin: 4px 0; color: var(--text-white);">Routine Dos & Épaules (17 Étapes)</h3>
              <p style="font-size: 12px; color: var(--text-secondary);">Étape 3/17 : Pike Push-Ups stricts (focus deltoïdes)</p>
            </div>

            <div class="glass-card spotlight-card" style="padding: 26px; text-align: center; margin-bottom: 18px;">
              <div style="font-size: 12px; letter-spacing: 2px; color: var(--neon-cyan); font-family: var(--font-display);">
                RÉPÉTITIONS STRICTES COMPTABILISÉES
              </div>
              <div id="workout-rep-count" class="shiny-green" style="font-size: 72px; font-weight: 900; font-family: var(--font-display); line-height: 1.1; margin: 8px 0;">
                14 / 14
              </div>
              <div style="font-size: 13px; color: var(--transcendent-green); font-weight: bold;" id="workout-posture-badge">
                POSTURE STRICTE VALIDÉE ✓
              </div>
            </div>

            <div style="display: flex; gap: 12px;">
              <button class="btn-cyber" style="flex: 1;" onclick="addManualRep()">+ 1 RÉPÉTITION (TEST)</button>
              <button class="btn-cyber btn-gold" style="flex: 1;" onclick="validateWorkoutSet()">VALIDER LA SÉRIE</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- HOLOGRAPHIC SYSTEM NOTIFICATION MODAL (NO MORE ALERT POPUPS!) -->
  <div id="sys-modal" class="modal-overlay">
    <div class="modal-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 id="sys-modal-title" class="shiny-text" style="font-size: 18px; font-weight: bold;">[NOTIFICATION DU SYSTÈME]</h3>
        <button onclick="closeSysModal()" style="background: none; border: none; color: #fff; font-size: 22px; cursor: pointer;">✕</button>
      </div>
      <p id="sys-modal-msg" style="font-size: 14px; color: var(--text-white); margin-bottom: 22px; line-height: 1.6;"></p>
      <div style="display: flex; justify-content: flex-end;">
        <button class="btn-cyber" onclick="closeSysModal()">ACCEPTER ET CONTINUER</button>
      </div>
    </div>
  </div>

  <!-- PROOF SUBMISSION MODAL -->
  <div id="proof-modal" class="modal-overlay">
    <div class="modal-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 id="modal-quest-title" class="shiny-text" style="font-size: 18px; font-weight: bold;">SOUMISSION DE PREUVE DE QUÊTE</h3>
        <button onclick="closeProofModal()" style="background: none; border: none; color: #fff; font-size: 22px; cursor: pointer;">✕</button>
      </div>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 18px; line-height: 1.5;">
        Règle d'or : Toute attribution d'expérience exige une preuve réelle et indiscutable (Lien Commit GitHub, Trace Strava GPS, Relevé officiel).
      </p>
      <div style="margin-bottom: 18px;">
        <label style="font-size: 12px; color: var(--neon-cyan); display: block; margin-bottom: 8px; font-family: var(--font-mono);">LIEN OU RAPPORT DE PREUVE :</label>
        <input type="text" id="proof-input" placeholder="https://github.com/GeovanioH/LevelUp/commit/..." class="form-input">
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <button class="btn-cyber" onclick="closeProofModal()">ANNULER</button>
        <button class="btn-cyber btn-gold" onclick="submitQuestProof()">VALIDER AU NOM DU SYSTÈME</button>
      </div>
    </div>
  </div>

  <!-- NEW NOTE MODAL -->
  <div id="note-modal" class="modal-overlay">
    <div class="modal-card" style="max-width: 640px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 class="shiny-text" style="font-size: 18px; font-weight: bold;">CRÉATION D'UNE NOTE SECOND BRAIN</h3>
        <button onclick="closeCreateNoteModal()" style="background: none; border: none; color: #fff; font-size: 22px; cursor: pointer;">✕</button>
      </div>
      <div style="margin-bottom: 14px;">
        <label style="font-size: 11px; color: var(--neon-cyan); font-family: var(--font-mono); display: block; margin-bottom: 4px;">TITRE DE LA NOTE :</label>
        <input type="text" id="new-note-title" placeholder="Ex: Optimisation GPU Triton & PagedAttention" class="form-input">
      </div>
      <div style="margin-bottom: 14px;">
        <label style="font-size: 11px; color: var(--neon-cyan); font-family: var(--font-mono); display: block; margin-bottom: 4px;">PILIER ASSOCIÉ & TAGS :</label>
        <div style="display: flex; gap: 10px;">
          <select id="new-note-base" class="form-input" style="flex: 1;">
            <option value="AI_ENG">AI_ENG (Ingénierie IA)</option>
            <option value="CYBER">CYBER (Cybersécurité)</option>
            <option value="ACAD">ACAD (Mathématiques / Académique)</option>
            <option value="STR">STR (Calisthénie & Force)</option>
            <option value="LNG">LNG (Anglais Cambridge)</option>
            <option value="DIS">DIS (Discipline & Monk Mode)</option>
          </select>
          <input type="text" id="new-note-tags" placeholder="tags séparés par virgules" class="form-input" style="flex: 1;">
        </div>
      </div>
      <div style="margin-bottom: 16px;">
        <label style="font-size: 11px; color: var(--neon-cyan); font-family: var(--font-mono); display: block; margin-bottom: 4px;">CONTENU MARKDOWN & FORMULES :</label>
        <textarea id="new-note-content" rows="6" placeholder="# Titre\\n\\nFormule mathématique : $$E = mc^2$$" class="form-input" style="line-height: 1.4;"></textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn-cyber" onclick="closeCreateNoteModal()">ANNULER</button>
        <button class="btn-cyber btn-gold" onclick="saveNewNote()">ENREGISTRER DANS LE COFFRE</button>
      </div>
    </div>
  </div>

  <script>
    // System Local Storage Keys
    const STORAGE_KEY = 'LEVELUP_SYSTEM_STATE_V3';

    // State Synchronization
    let state = ${JSON.stringify(SYSTEM_STATE)};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = Object.assign(state, JSON.parse(saved));
      }
    } catch(e) {
      console.warn("Storage sync fallback:", e);
    }

    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch(e) {
        console.warn("Save storage error:", e);
      }
    }

    // Modal Notifications System
    function showSysNotification(title, message) {
      playChime(784);
      document.getElementById('sys-modal-title').textContent = title;
      document.getElementById('sys-modal-msg').innerHTML = message;
      document.getElementById('sys-modal').classList.add('open');
    }
    function closeSysModal() {
      document.getElementById('sys-modal').classList.remove('open');
    }

    // Real-Time System Clock
    function updateClock() {
      const now = new Date();
      const el = document.getElementById('system-clock');
      if (el) el.textContent = now.toTimeString().split(' ')[0];
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Procedural Audio Synthesizer
    function playChime(freq = 523.25) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } catch (e) {
        console.warn("Audio non initialisé :", e);
      }
    }

    // View Switcher (Client Routing)
    function switchView(viewId) {
      playChime(659);
      document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

      const targetView = document.getElementById('view-' + viewId);
      if (targetView) targetView.classList.add('active');

      const tabs = document.querySelectorAll('.nav-tab');
      tabs.forEach(t => {
        if (t.getAttribute('onclick') && t.getAttribute('onclick').includes(viewId)) {
          t.classList.add('active');
        }
      });
      if (viewId === 'notes') {
        setTimeout(() => {
          if (typeof initObsidianVault === 'function' && !obsidianInitialized) initObsidianVault();
          if (typeof resizeCanvas === 'function') resizeCanvas('obsidian-graph-canvas');
        }, 50);
      }
      window.history.pushState({}, '', '/' + (viewId === 'dashboard' ? '' : viewId));
    }

    window.addEventListener('popstate', () => {
      const path = window.location.pathname.replace('/', '') || 'dashboard';
      switchView(path);
    });

    // Theme Toggle
    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark-monarch' ? 'light-awakening' : 'dark-monarch';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('levelup-theme', next);
    }
    const savedTheme = localStorage.getItem('levelup-theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

    // =========================================================================
    // SCREEN 1 : DASHBOARD VITALS & INTERACTIVE RESTORATION
    // =========================================================================
    function restoreVitals(hpAdd, mpAdd) {
      state.player.hp = Math.min(100, state.player.hp + hpAdd);
      state.player.mp = Math.min(100, state.player.mp + mpAdd);
      saveState();
      updateVitalsUI();
      showSysNotification(
        "[RESTAURATION BIOPHYSIQUE VALIDÉE]",
        "La méditation a restauré <strong>+" + hpAdd + " HP</strong> et <strong>+" + mpAdd + " MP</strong>. Clarté mentale optimale."
      );
    }

    function simulateDeepWorkDepletion() {
      if (state.player.mp < 15) {
        showSysNotification("[MANA INSUFFISANT]", "Votre réserve de MP est trop basse. Prenez un repos réparateur.");
        return;
      }
      state.player.mp = Math.max(0, state.player.mp - 15);
      addExperience(50);
      updateVitalsUI();
      showSysNotification(
        "[SESSION DE DEEP WORK ACHEVÉE]",
        "Sprint cognitif intense validé. <strong>-15 MP</strong> consommés. <strong>+50 XP</strong> attribués."
      );
    }

    function updateVitalsUI() {
      const hpEl = document.getElementById('hp-value-text');
      const hpBar = document.getElementById('hp-slider-bar');
      if (hpEl) hpEl.textContent = state.player.hp + " / 100 (" + state.player.hp + "%)";
      if (hpBar) hpBar.style.width = state.player.hp + "%";

      const mpEl = document.getElementById('mp-value-text');
      const mpBar = document.getElementById('mp-slider-bar');
      if (mpEl) mpEl.textContent = state.player.mp + " / 100 (" + state.player.mp + "%)";
      if (mpBar) mpBar.style.width = state.player.mp + "%";
    }

    // Experience & True Level-Up System
    function addExperience(amount) {
      state.player.currentXp += amount;
      state.player.availableSkillXp = (state.player.availableSkillXp || 850) + amount;

      if (state.player.currentXp >= state.player.nextLevelXp) {
        state.player.level += 1;
        state.player.nextLevelXp = Math.round(state.player.nextLevelXp * 1.35);
        state.player.hp = 100;
        state.player.mp = 100;
        playChime(1046);
        showSysNotification(
          "🌟 [LEVEL UP! MONTÉE DE NIVEAU SOUVERAINE]",
          "Félicitations, Chasseur ! Vous avez atteint le <strong>NIVEAU " + state.player.level + "</strong> !\\nToutes vos jauges HP et MP sont instantanément restaurées à 100%.\\n<strong>+5 Points de caractéristiques</strong> disponibles."
        );
      }
      saveState();
      updateXpUI();
    if (typeof initObsidianVault === "function") initObsidianVault();
    }

    function updateXpUI() {
      const xpText = document.getElementById('dash-xp-text');
      const xpBar = document.getElementById('dash-xp-bar');
      const levelLabel = document.getElementById('dash-level-label');
      const skillXp = document.getElementById('skills-available-xp');

      const pct = Math.min(100, Math.round((state.player.currentXp / state.player.nextLevelXp) * 100));
      if (xpText) xpText.textContent = state.player.currentXp + " / " + state.player.nextLevelXp + " XP (" + pct + "%)";
      if (xpBar) xpBar.style.width = pct + "%";
      if (levelLabel) levelLabel.textContent = "NIVEAU " + state.player.level + " // PALIER ACTUEL";
      if (skillXp) skillXp.textContent = state.player.availableSkillXp;
    }

    // =========================================================================
    // SCREEN 2 : SKILLS DAG INTERACTIVE UNLOCKING
    // =========================================================================
    function filterSkillGrid(category) {
      playChime(440);
      const cards = document.querySelectorAll('.skill-card-item');
      cards.forEach(c => {
        if (category === 'ALL' || c.getAttribute('data-base') === category) {
          c.style.display = 'block';
        } else {
          c.style.display = 'none';
        }
      });
    }

    function unlockSkillNode(skillId, name, cost, base) {
      const avail = state.player.availableSkillXp || 850;
      if (avail < cost) {
        showSysNotification(
          "[POINTS D'XP INSUFFISANTS]",
          "Vous disposez de <strong>" + avail + " XP</strong> mais cette compétence requiert <strong>" + cost + " XP</strong>.\\nAccomplissez des quêtes obligatoires pour accumuler l'XP nécessaire."
        );
        return;
      }

      state.player.availableSkillXp = avail - cost;
      if (state.player.bases[base.toLowerCase()]) {
        state.player.bases[base.toLowerCase()].score += 5;
      }
      saveState();

      // Update Card Visuals
      const card = document.getElementById('skill-card-' + skillId);
      const badge = document.getElementById('skill-badge-' + skillId);
      const action = document.getElementById('skill-action-' + skillId);
      if (card) card.style.borderColor = 'rgba(0, 255, 102, 0.5)';
      if (badge) badge.textContent = base + " // [MAÎTRISÉ 5/5]";
      if (action) action.innerHTML = '<span style="font-size: 11px; color: var(--transcendent-green); font-weight: bold;">DOD VALIDÉE ✓ (+' + cost + ' XP)</span>';

      updateXpUI();
      recalculateHarmonicRadar();

      showSysNotification(
        "⚡ [COMPÉTENCE ACQUISE DANS LE DAG]",
        "La compétence <strong>" + name + "</strong> a été intégrée avec succès au graphe souverain.<br>Consommation : <strong>-" + cost + " XP</strong>. Base <strong>" + base + "</strong> renforcée."
      );
    }

    function recalculateHarmonicRadar() {
      const bases = Object.values(state.player.bases);
      const sumInverses = bases.reduce((acc, b) => acc + (1 / Math.max(1, b.score)), 0);
      const newScore = Math.round(bases.length / sumInverses);
      const shEl = document.getElementById('harmonic-score-display');
      const badgeEl = document.getElementById('radar-sh-badge');
      if (shEl) shEl.textContent = "Sh = " + newScore;
      if (badgeEl) badgeEl.textContent = "Sh = " + newScore;
    }

    // =========================================================================
    // =========================================================================
    // SCREEN 3 : REACTBITS 3D CIRCULAR CAROUSEL & PROOF SUBMISSION
    // =========================================================================
    let currentQuestsViewMode = 'carousel';
    let questCarouselAngle = 0;
    let questCarouselVelocity = 0;
    let questCarouselTarget = null;
    let questCarouselDrift = true;
    let questCarouselSpeed = 12; // deg per sec
    let questCarouselDirection = -1; // drift left
    let questCarouselActiveIndex = 0;
    let isDraggingQuestCarousel = false;
    let questPointerStart = { x: 0, y: 0, angle: 0, time: 0 };
    let questPointerCurrent = { x: 0, y: 0 };
    let questPointerSamples = [];
    let questYaw = 0;
    let questPitch = 0;
    let questCarouselAnimId = null;
    let questCarouselInitialized = false;

    const QUEST_CARD_WIDTH = 260;
    const QUEST_CARD_HEIGHT = 380;
    const QUEST_GAP = 35;
    const QUEST_TILT = -5;
    const QUEST_PERSPECTIVE = 2500;

    function setQuestsViewMode(mode) {
      currentQuestsViewMode = mode;
      const btnCarousel = document.getElementById('btn-quest-mode-carousel');
      const btnGrid = document.getElementById('btn-quest-mode-grid');
      const secCarousel = document.getElementById('quests-carousel-section');
      const secGrid = document.getElementById('quests-page-grid-section');

      if (mode === 'carousel') {
        if (btnCarousel) btnCarousel.classList.add('active');
        if (btnGrid) btnGrid.classList.remove('active');
        if (secCarousel) secCarousel.style.display = 'block';
        if (secGrid) secGrid.style.display = 'none';
        if (!questCarouselInitialized) initQuestCircularCarousel();
      } else {
        if (btnCarousel) btnCarousel.classList.remove('active');
        if (btnGrid) btnGrid.classList.add('active');
        if (secCarousel) secCarousel.style.display = 'none';
        if (secGrid) secGrid.style.display = 'block';
      }
    }

    function initQuestCircularCarousel() {
      const ring = document.getElementById('quest-carousel-ring');
      const stage = document.getElementById('quest-carousel-stage');
      const root = document.getElementById('quest-circular-carousel');
      if (!ring || !stage || !root) return;

      stage.style.perspective = QUEST_PERSPECTIVE + 'px';

      const quests = state.quests || [];
      const count = quests.length;
      if (count === 0) return;

      const step = 360 / count;
      const pitch = QUEST_CARD_WIDTH + QUEST_GAP;
      const chord = pitch / (2 * Math.sin(Math.PI / count));
      const arc = (count * pitch) / (2 * Math.PI);
      const radius = Math.max(chord + (arc - chord) * 1.0, 380);

      // Populate Cards
      ring.innerHTML = '';
      quests.forEach((q, index) => {
        const isEmergency = q.id === 'q-emergency-auth-bypass';
        const isFit = q.id === 'q-daily-fit-1' || q.base === 'STR';
        
        const card = document.createElement('div');
        card.className = 'circular-carousel__card';
        card.setAttribute('data-quest-index', index);

        card.innerHTML = \`
          <div class="quest-3d-card \${isEmergency ? 'quest-emergency' : ''}" 
               id="quest-card-3d-\${q.id}"
               onclick="handleQuest3DCardClick(\${index}, '\${q.id}')">
            
            <!-- Top HUD Badge -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="radar-ping-badge" style="font-size: 10px; padding: 2px 7px; \${isEmergency ? 'border-color: rgba(255,0,60,0.6); color: var(--alert-crimson);' : ''}">
                \${q.base} // \${q.type || 'DAILY'}
              </span>
              <span style="font-size: 11px; font-family: var(--font-mono); color: var(--imperial-gold); font-weight: bold;">
                +\${q.xp} XP
              </span>
            </div>

            <!-- Solo Leveling Quest Header -->
            <div style="border-bottom: 1px solid rgba(56, 189, 248, 0.25); padding-bottom: 8px; margin-bottom: 10px;">
              <div style="font-size: 11px; letter-spacing: 2px; color: \${isEmergency ? 'var(--alert-crimson)' : 'var(--neon-cyan)'}; font-family: var(--font-mono); font-weight: 900; display: flex; align-items: center; gap: 6px;">
                <span>ℹ️</span> <span>QUEST INFO</span>
              </div>
              <div style="font-size: 14px; font-weight: bold; color: var(--text-white); margin-top: 4px; line-height: 1.3;">
                \${q.title}
              </div>
            </div>

            <!-- Solo Leveling Objective Details -->
            <div style="flex: 1; background: rgba(2, 8, 24, 0.7); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 8px; padding: 10px; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); line-height: 1.5; margin-bottom: 10px; overflow: hidden;">
              \${isFit ? \`
                <div style="color: var(--neon-cyan); font-weight: bold; margin-bottom: 4px; border-bottom: 1px dashed rgba(0,240,255,0.3); padding-bottom: 2px;">GOAL :</div>
                <div>• Push-ups : [14/100]</div>
                <div>• Sit-ups : [0/100]</div>
                <div>• Squats : [0/100]</div>
                <div>• Running : [0/10km]</div>
                <div style="color: var(--alert-crimson); font-size: 9px; margin-top: 4px;">WARNING: Failure triggers Penalty Zone.</div>
              \` : \`
                <div>\${q.description}</div>
              \`}
            </div>

            <!-- Bottom Action & Rewards -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 11px; font-family: var(--font-mono);">
                <span style="color: var(--transcendent-green);">+500 XP</span>
                <span style="color: var(--imperial-gold);">+100 💎</span>
              </div>
              <button class="btn-cyber \${isEmergency ? 'btn-red' : ''}" 
                      style="width: 100%; padding: 8px 12px; font-size: 11px;" 
                      onclick="event.stopPropagation(); openProofModal('\\\${q.id}', '\\\${q.title.replace(/'/g, "\\\\'")}', \\\${q.xp}, \\\${q.crystals});">
                \${q.completed ? 'ACCOMPLIE ✓' : 'SOUMETTRE PREUVE'}
              </button>
            </div>

            <div class="quest-3d-depth-shade" id="quest-depth-shade-\${q.id}"></div>
          </div>
        \`;

        ring.appendChild(card);
      });

      // Pointer Drag Events
      root.addEventListener('pointerdown', (e) => {
        isDraggingQuestCarousel = true;
        questCarouselTarget = null;
        questPointerStart = {
          x: e.clientX,
          y: e.clientY,
          angle: questCarouselAngle,
          time: performance.now()
        };
        questPointerSamples = [{ time: performance.now(), angle: questCarouselAngle }];
        root.setAttribute('data-dragging', '');
      });

      window.addEventListener('pointermove', (e) => {
        const rect = root.getBoundingClientRect();
        questPointerCurrent.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        questPointerCurrent.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        if (isDraggingQuestCarousel) {
          const deltaX = e.clientX - questPointerStart.x;
          const perPixel = 180 / (Math.PI * radius);
          questCarouselAngle = questPointerStart.angle + deltaX * perPixel;
          const now = performance.now();
          questPointerSamples.push({ time: now, angle: questCarouselAngle });
          while (questPointerSamples.length > 2 && now - questPointerSamples[0].time > 110) {
            questPointerSamples.shift();
          }
        }
      });

      window.addEventListener('pointerup', () => {
        if (!isDraggingQuestCarousel) return;
        isDraggingQuestCarousel = false;
        root.removeAttribute('data-dragging');

        if (questPointerSamples.length >= 2) {
          const first = questPointerSamples[0];
          const last = questPointerSamples[questPointerSamples.length - 1];
          const span = (last.time - first.time) / 1000;
          if (span > 0.008) {
            const v = (last.angle - first.angle) / span;
            questCarouselVelocity = Math.max(-1200, Math.min(1200, v));
            // Set snap target
            const tau = 0.18 + 0.6 * 1.5;
            const pred = questCarouselAngle + questCarouselVelocity * tau * 0.55;
            questCarouselTarget = Math.round(pred / step) * step;
          }
        } else {
          questCarouselTarget = Math.round(questCarouselAngle / step) * step;
        }
      });

      // Mouse Wheel Delta
      root.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > 5 || Math.abs(e.deltaY) > 5) {
          e.preventDefault();
          const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          questCarouselAngle -= d * 0.15;
          questCarouselTarget = Math.round(questCarouselAngle / step) * step;
        }
      }, { passive: false });

      // Start Animation Loop
      if (!questCarouselAnimId) {
        startQuestCarouselLoop();
      }

      questCarouselInitialized = true;
    }

    function handleQuest3DCardClick(index, questId) {
      focusQuestCarouselCard(index);
      showSysNotification(
        "⚡ [QUÊTE SÉLECTIONNÉE DANS LE CYLINDRE 3D]",
        "Focus établi sur la quête. Cliquez sur 'SOUMETTRE PREUVE' pour valider votre accomplissement."
      );
    }

    function focusQuestCarouselCard(index) {
      const quests = state.quests || [];
      const step = 360 / Math.max(1, quests.length);
      let target = -index * step;
      target += 360 * Math.round((questCarouselAngle - target) / 360);
      questCarouselTarget = target;
    }

    function stepQuestCarousel(dir) {
      const quests = state.quests || [];
      const step = 360 / Math.max(1, quests.length);
      const base = questCarouselTarget ?? Math.round(questCarouselAngle / step) * step;
      questCarouselTarget = base - dir * step;
    }

    function toggleQuestCarouselDrift() {
      questCarouselDrift = !questCarouselDrift;
      const btn = document.getElementById('btn-quest-carousel-play');
      if (btn) btn.textContent = questCarouselDrift ? '⏯ PAUSE' : '▶ DÉFILER';
      showSysNotification(
        "[CYLINDRE 3D]",
        questCarouselDrift ? "Rotation cinétique continue réactivée." : "Rotation automatique en pause."
      );
    }

    function startQuestCarouselLoop() {
      let lastTime = performance.now();

      function loop(now) {
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        const quests = state.quests || [];
        const count = quests.length;

        if (count > 0 && currentQuestsViewMode === 'carousel') {
          const step = 360 / count;
          const pitch = QUEST_CARD_WIDTH + QUEST_GAP;
          const chord = pitch / (2 * Math.sin(Math.PI / count));
          const arc = (count * pitch) / (2 * Math.PI);
          const radius = Math.max(chord + (arc - chord) * 1.0, 380);

          // Physics updates
          if (isDraggingQuestCarousel) {
            // Dragged manually
          } else if (questCarouselTarget !== null) {
            // Spring snap
            const SPRING = 118;
            const damping = 2 * Math.sqrt(SPRING);
            const accel = SPRING * (questCarouselTarget - questCarouselAngle) - damping * questCarouselVelocity;
            questCarouselVelocity += accel * dt;
            questCarouselAngle += questCarouselVelocity * dt;
            if (Math.abs(questCarouselTarget - questCarouselAngle) < 0.01 && Math.abs(questCarouselVelocity) < 0.05) {
              questCarouselAngle = questCarouselTarget;
              questCarouselVelocity = 0;
              questCarouselTarget = null;
            }
          } else if (questCarouselDrift) {
            // Drift
            const cruise = questCarouselSpeed * questCarouselDirection;
            const tau = 0.18 + 0.6 * 1.5;
            questCarouselVelocity += (cruise - questCarouselVelocity) * (1 - Math.exp(-dt / tau));
            questCarouselAngle += questCarouselVelocity * dt;
          }

          // Parallax tilt
          const aimYaw = questPointerCurrent.x * 0.3 * 9;
          const aimPitch = -questPointerCurrent.y * 0.3 * 6;
          questYaw += (aimYaw - questYaw) * 0.1;
          questPitch += (aimPitch - questPitch) * 0.1;

          // Camera & Ring DOM updates
          const camera = document.getElementById('quest-carousel-camera');
          const ring = document.getElementById('quest-carousel-ring');

          if (camera && ring) {
            camera.style.transform = \`translate3d(0, 0, \${-radius}px) rotateX(\${QUEST_TILT + questPitch}deg) rotateY(\${questYaw}deg)\`;
            ring.style.transform = \`rotateY(\${questCarouselAngle}deg)\`;

            const cards = ring.querySelectorAll('.circular-carousel__card');
            cards.forEach((cardEl, idx) => {
              const base = idx * step;
              cardEl.style.transform = \`rotateY(\${base}deg) translateZ(\${radius}px)\`;

              // Calculate front-facing cosine for depth fade
              const world = ((((base + questCarouselAngle + 180) % 360) + 360) % 360) - 180;
              const facing = Math.cos((world * Math.PI) / 180);
              const fade = 0.6 * Math.pow((1 - facing) / 2, 1.25);

              const shade = cardEl.querySelector('.quest-3d-depth-shade');
              if (shade) shade.style.opacity = fade.toFixed(3);

              const cardBox = cardEl.querySelector('.quest-3d-card');
              if (cardBox) {
                if (Math.abs(world) < (step / 2)) {
                  cardBox.classList.add('active-quest-focus');
                } else {
                  cardBox.classList.remove('active-quest-focus');
                }
              }
            });

            // Update Active Quest Badge
            const activeIdx = ((Math.round(-questCarouselAngle / step) % count) + count) % count;
            if (activeIdx !== questCarouselActiveIndex) {
              questCarouselActiveIndex = activeIdx;
              const badge = document.getElementById('quest-carousel-active-badge');
              if (badge) badge.textContent = \`QUÊTE \${activeIdx + 1} / \${count}\`;
            }
          }
        }

        questCarouselAnimId = requestAnimationFrame(loop);
      }

      questCarouselAnimId = requestAnimationFrame(loop);
    }

    // =========================================================================
    let activeQuestId = null;
    let activeQuestTitle = "";
    let activeQuestXp = 0;
    let activeQuestCrystals = 0;

    function openProofModal(id, title, xp, crystals) {
      activeQuestId = id;
      activeQuestTitle = title;
      activeQuestXp = xp;
      activeQuestCrystals = crystals;
      document.getElementById('modal-quest-title').textContent = title;
      document.getElementById('proof-modal').classList.add('open');
    }
    function closeProofModal() {
      document.getElementById('proof-modal').classList.remove('open');
    }

    function submitQuestProof() {
      const input = document.getElementById('proof-input').value.trim();
      if (!input) {
        showSysNotification(
          "[PREUVE REQUISE]",
          "Veuillez renseigner une preuve tangible (Lien de commit GitHub, trace GPS Strava ou rapport)."
        );
        return;
      }

      addExperience(activeQuestXp);
      state.player.shadowCrystals += activeQuestCrystals;
      saveState();

      // Update Header Crystals
      const cEl = document.getElementById('header-crystals-val');
      if (cEl) cEl.textContent = state.player.shadowCrystals;

      // Update UI cards
      const actionDash = document.getElementById('quest-action-' + activeQuestId);
      if (actionDash) actionDash.innerHTML = '<span style="color: var(--transcendent-green); font-weight: bold; font-size: 12px; padding: 6px 14px; border: 1px solid var(--transcendent-green); border-radius: var(--radius-sm); background: rgba(0, 255, 102, 0.1);">ACCOMPLIE ✓</span>';

      const actionList = document.getElementById('qlist-action-' + activeQuestId);
      if (actionList) actionList.innerHTML = '<div style="font-size: 12px; color: var(--transcendent-green); font-weight: bold;">ACCOMPLIE ✓ (PREUVE VÉRIFIÉE)</div>';

      // Check emergency quest
      if (activeQuestId === 'q-emergency-auth-bypass') {
        const timer = document.getElementById('emergency-timer-text');
        const label = document.getElementById('emergency-status-label');
        if (timer) timer.textContent = "[ NEUTRALISÉ ✓ ]";
        if (label) {
          label.textContent = "FAILLE CORRIGÉE PAR LE MONARQUE";
          label.style.color = "var(--transcendent-green)";
        }
      }

      closeProofModal();
      showSysNotification(
        "🏆 [QUÊTE VALIDÉE AU NOM DU SYSTÈME]",
        "Preuve authentifiée.<br>Gains : <strong>+" + activeQuestXp + " XP</strong> et <strong>+" + activeQuestCrystals + " Cristaux d'Ombre 💎</strong>."
      );
    }

    // Emergency Quest Countdown
    let emergencySeconds = 3444; // 00:57:24
    setInterval(() => {
      if (emergencySeconds > 0) {
        emergencySeconds--;
        const m = Math.floor(emergencySeconds / 60);
        const s = emergencySeconds % 60;
        const formatted = "[ 00:" + (m < 10 ? '0' : '') + m + ":" + (s < 10 ? '0' : '') + s + " ]";
        const el = document.getElementById('emergency-timer-text');
        if (el && !el.textContent.includes('NEUTRALISÉ')) {
          el.textContent = formatted;
        }
      }
    }, 1000);

    // =========================================================================
    // SCREEN 4 : TIME-BLOCKING SPRINTS & POMODORO
    // =========================================================================
    let pomodoroInterval = null;
    let pomodoroRemaining = 25 * 60;
    let pomodoroRunning = false;

    function togglePomodoroTimer() {
      const btn = document.getElementById('pomodoro-toggle-btn');
      if (!pomodoroRunning) {
        pomodoroRunning = true;
        btn.textContent = '⏸ SUSPENDRE LE SPRINT';
        btn.classList.add('btn-red');
        playChime(659);
        pomodoroInterval = setInterval(() => {
          if (pomodoroRemaining > 0) {
            pomodoroRemaining--;
            const m = Math.floor(pomodoroRemaining / 60);
            const s = pomodoroRemaining % 60;
            const str = (m < 10 ? '0' : '') + m + ":" + (s < 10 ? '0' : '') + s;
            document.getElementById('pomodoro-timer-display').textContent = str;
          } else {
            clearInterval(pomodoroInterval);
            pomodoroRunning = false;
            btn.textContent = '▶ DÉMARRER LE SPRINT';
            btn.classList.remove('btn-red');
            restoreVitals(0, 15);
            addExperience(60);
            showSysNotification("⏱ [POMODORO 25 MIN ACHEVÉ]", "Sprint focus terminé avec brio ! +60 XP et +15 MP régénérés.");
          }
        }, 1000);
      } else {
        pomodoroRunning = false;
        clearInterval(pomodoroInterval);
        btn.textContent = '▶ REPRENDRE LE SPRINT';
        btn.classList.remove('btn-red');
      }
    }

    function completeBlock(id) {
      const card = document.getElementById('block-action-' + id);
      if (card) card.innerHTML = '<span style="color: var(--transcendent-green); font-size: 12px; font-weight: bold;">VALIDÉ ✓</span>';
      restoreVitals(5, 10);
      showSysNotification("[BLOC CIRCADIEN VALIDÉ]", "Le créneau horaire a été exécuté dans les règles du protocole.");
    }

    function activateBlock(id) {
      const card = document.getElementById('block-action-' + id);
      if (card) card.innerHTML = '<button class="btn-cyber" style="padding: 5px 12px; font-size: 11px;" onclick="completeBlock(\\'' + id + '\\')">TERMINER CE BLOC</button>';
      showSysNotification("[BLOC ACTIF]", "Concentration engagée sur le créneau sélectionné.");
    }

    // =========================================================================
    // SCREEN 5 : OBSIDIAN SECOND BRAIN VAULT & INTERACTIVE KNOWLEDGE GRAPH
    // =========================================================================
    let currentObsidianMode = 'graph';
    let activeObsidianNoteId = 'note-readme';
    let obsidianGraphNodes = [];
    let obsidianGraphEdges = [];
    let obsidianSearchFilter = '';
    let graphPanX = 0;
    let graphPanY = 0;
    let graphZoom = 1.0;
    let isDraggingGraph = false;
    let isPanningGraph = false;
    let draggedNode = null;
    let hoveredNode = null;
    let mouseStartPos = { x: 0, y: 0 };
    let graphAnimId = null;
    let graphPhysicsRunning = true;
    let obsidianInitialized = false;

    const DOMAIN_COLOR_MAP = {
      'DIS': '#a855f7',
      'AI_ENG': '#00f0ff',
      'SEC': '#ff003c',
      'ACAD': '#ffd700',
      'SPORT': '#00ff66',
      'ENG': '#38bdf8'
    };

    function initObsidianVault() {
      buildGraphFromNotes();
      renderObsidianFolderTree();

      const initial = (state.notes || []).find(n => n.id === activeObsidianNoteId) || (state.notes || [])[0];
      if (initial) {
        openObsidianNote(initial.id, false);
      }

      setupGraphCanvas();
      setupSplitGraphCanvas();
      obsidianInitialized = true;
    }

    function buildGraphFromNotes() {
      const notes = state.notes || [];
      obsidianGraphNodes = [];
      obsidianGraphEdges = [];

      const countEl = document.getElementById('vault-notes-count');
      if (countEl) countEl.textContent = notes.length;

      // Position nodes in radial layout around hub
      const angleStep = (2 * Math.PI) / Math.max(1, notes.length - 1);
      let nonHubIndex = 0;

      notes.forEach((note) => {
        const isHub = note.id === 'note-readme';
        let x = 0;
        let y = 0;
        if (!isHub) {
          const r = 180 + (nonHubIndex % 3) * 60;
          const theta = nonHubIndex * angleStep;
          x = r * Math.cos(theta) + (Math.random() * 20 - 10);
          y = r * Math.sin(theta) + (Math.random() * 20 - 10);
          nonHubIndex++;
        }

        const domainColor = DOMAIN_COLOR_MAP[note.base] || '#94a3b8';
        obsidianGraphNodes.push({
          id: note.id,
          title: note.title,
          base: note.base,
          folder: note.folder || '00_Synthese_Souveraine',
          isHub: isHub,
          x: x,
          y: y,
          vx: 0,
          vy: 0,
          radius: isHub ? 15 : 7,
          color: isHub ? '#a855f7' : domainColor,
          degree: 0
        });
      });

      // Extract wikilinks from content to build edges [[target]]
      const linkRegex = /\[\[(.*?)\]\]/g;
      notes.forEach((note) => {
        let match;
        const text = note.content || '';
        while ((match = linkRegex.exec(text)) !== null) {
          const targetTitle = match[1].trim();
          const targetNode = obsidianGraphNodes.find(n => 
            n.title.toLowerCase() === targetTitle.toLowerCase() ||
            n.id.toLowerCase() === targetTitle.toLowerCase() ||
            n.title.toLowerCase().includes(targetTitle.toLowerCase())
          );
          if (targetNode && targetNode.id !== note.id) {
            const exists = obsidianGraphEdges.some(e => 
              (e.source === note.id && e.target === targetNode.id) ||
              (e.source === targetNode.id && e.target === note.id)
            );
            if (!exists) {
              obsidianGraphEdges.push({
                source: note.id,
                target: targetNode.id
              });
              const srcNode = obsidianGraphNodes.find(n => n.id === note.id);
              if (srcNode) srcNode.degree++;
              targetNode.degree++;
            }
          }
        }
      });

      // Adjust node radii by degree
      obsidianGraphNodes.forEach(node => {
        if (!node.isHub) {
          node.radius = Math.min(13, 6 + node.degree * 1.5);
        }
      });

      const linksCountEl = document.getElementById('vault-links-count');
      if (linksCountEl) linksCountEl.textContent = obsidianGraphEdges.length;
    }

    function renderObsidianFolderTree() {
      const container = document.getElementById('obsidian-folder-tree');
      if (!container) return;

      const notes = state.notes || [];
      const folders = {};

      notes.forEach(note => {
        const f = note.folder || '00_Synthese_Souveraine';
        if (!folders[f]) folders[f] = [];
        folders[f].push(note);
      });

      const folderKeys = Object.keys(folders).sort();
      let html = '';

      folderKeys.forEach(fKey => {
        const folderNotes = folders[fKey];
        const isMatched = obsidianSearchFilter ? folderNotes.some(n => n.title.toLowerCase().includes(obsidianSearchFilter)) : true;
        if (obsidianSearchFilter && !isMatched) return;

        html += \`
          <div class="obsidian-folder" style="margin-bottom: 8px;">
            <div class="obsidian-folder-header" style="display: flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 4px; color: var(--text-secondary); font-size: 11px; font-family: var(--font-mono); font-weight: bold; background: rgba(2, 8, 24, 0.4); cursor: pointer;" onclick="this.nextElementSibling.classList.toggle('hidden')">
              <span>📁</span>
              <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">\${fKey}</span>
              <span style="font-size: 10px; color: var(--text-muted); background: rgba(56, 189, 248, 0.1); padding: 1px 5px; border-radius: 3px;">\${folderNotes.length}</span>
            </div>
            <div class="obsidian-folder-files" style="padding-left: 14px; margin-top: 4px; display: flex; flex-direction: column; gap: 2px;">
              \${folderNotes.map(n => {
                const isActive = n.id === activeObsidianNoteId;
                const matches = obsidianSearchFilter ? n.title.toLowerCase().includes(obsidianSearchFilter) : true;
                if (!matches) return '';
                return \`
                  <div class="obsidian-file-item \${isActive ? 'active' : ''}" 
                       id="file-tree-item-\${n.id}"
                       onclick="openObsidianNote('\\\${n.id}'); if (currentObsidianMode === 'graph') setObsidianMode('reader');"
                       style="display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: \${isActive ? 'var(--neon-cyan)' : 'var(--text-secondary)'}; cursor: pointer; background: \${isActive ? 'rgba(0, 240, 255, 0.12)' : 'transparent'}; border-left: \${isActive ? '2px solid var(--neon-cyan)' : '2px solid transparent'};">
                    <span style="font-size: 11px;">📄</span>
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">\${n.title}</span>
                  </div>
                \`;
              }).join('')}
            </div>
          </div>
        \`;
      });

      container.innerHTML = html;
    }

    function openObsidianNote(noteId, switchMode = false) {
      const note = (state.notes || []).find(n => n.id === noteId);
      if (!note) return;

      activeObsidianNoteId = noteId;

      document.querySelectorAll('.obsidian-file-item').forEach(el => {
        el.classList.remove('active');
        el.style.background = 'transparent';
        el.style.borderLeft = '2px solid transparent';
        el.style.color = 'var(--text-secondary)';
      });
      const activeTreeItem = document.getElementById('file-tree-item-' + noteId);
      if (activeTreeItem) {
        activeTreeItem.classList.add('active');
        activeTreeItem.style.background = 'rgba(0, 240, 255, 0.12)';
        activeTreeItem.style.borderLeft = '2px solid var(--neon-cyan)';
        activeTreeItem.style.color = 'var(--neon-cyan)';
      }

      const breadcrumb = document.getElementById('reader-breadcrumb');
      if (breadcrumb) breadcrumb.innerHTML = \`<span>📁 \${note.folder || '00_Synthese_Souveraine'}</span> / <span>\${note.title}.md</span>\`;

      const titleEl = document.getElementById('reader-note-title');
      if (titleEl) titleEl.textContent = note.title;

      const baseEl = document.getElementById('reader-note-base');
      if (baseEl) {
        baseEl.textContent = note.base;
        baseEl.style.borderColor = DOMAIN_COLOR_MAP[note.base] || '#94a3b8';
        baseEl.style.color = DOMAIN_COLOR_MAP[note.base] || '#94a3b8';
      }

      const dateEl = document.getElementById('reader-note-date');
      if (dateEl) dateEl.textContent = 'Modifié le ' + (note.updatedAt ? note.updatedAt.split('T')[0] : '2026-11-12');

      const bodyEl = document.getElementById('reader-note-body');
      if (bodyEl) {
        bodyEl.innerHTML = renderMarkdownContent(note.content || '');
      }

      const textarea = document.getElementById('reader-edit-textarea');
      if (textarea) textarea.value = note.content || '';

      renderBacklinks(note);

      const splitLeft = document.getElementById('split-reader-pane');
      if (splitLeft) {
        splitLeft.innerHTML = \`
          <div style="padding: 16px;">
            <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 4px;">\${note.folder || '00_Synthese_Souveraine'}</div>
            <h2 style="font-size: 18px; font-weight: bold; color: var(--text-white); margin-bottom: 12px;">\${note.title}</h2>
            <div>\${renderMarkdownContent(note.content || '')}</div>
          </div>
        \`;
      }

      if (switchMode && currentObsidianMode !== 'reader' && currentObsidianMode !== 'split') {
        setObsidianMode('reader');
      }
    }

    function openNoteByTitle(rawTitle) {
      if (!rawTitle) return;
      const clean = rawTitle.replace(/\[\[|\]\]/g, '').trim().toLowerCase();
      const target = (state.notes || []).find(n => 
        n.title.toLowerCase() === clean ||
        n.title.toLowerCase().includes(clean) ||
        clean.includes(n.title.toLowerCase()) ||
        n.id.toLowerCase() === clean
      );

      if (target) {
        openObsidianNote(target.id, true);
        showSysNotification("🔗 [LIEN SÉMANTIQUE SUIVI]", "Navigation vers la note <strong>" + target.title + "</strong>.");
      } else {
        showSysNotification("[NOTE NON TROUVÉE]", "La note liée <i>[[" + rawTitle + "]]</i> n'existe pas encore dans le coffre.");
      }
    }

    function renderMarkdownContent(raw) {
      if (!raw) return '';

      const displayFormulas = [];
      let processed = raw.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
        const id = 'KATEX_DISPLAY_' + displayFormulas.length;
        displayFormulas.push(formula.trim());
        return id;
      });

      const inlineFormulas = [];
      processed = processed.replace(/\$([^$\n]+)\$/g, (match, formula) => {
        const id = 'KATEX_INLINE_' + inlineFormulas.length;
        inlineFormulas.push(formula.trim());
        return id;
      });

      let html = processed
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      html = html.replace(/\`\`\`([a-z]*)\n([\s\S]*?)\`\`\`/g, (m, lang, code) => {
        return \`<pre style="background: rgba(2, 8, 24, 0.95); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 6px; padding: 14px; font-family: var(--font-mono); font-size: 12px; color: #a5f3fc; overflow-x: auto; margin: 14px 0; line-height: 1.6;"><code>\${code.trim()}</code></pre>\`;
      });

      html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 15px; font-weight: bold; color: var(--neon-cyan); margin: 18px 0 8px 0; font-family: var(--font-display);">$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 18px; font-weight: bold; color: var(--text-white); margin: 22px 0 10px 0; border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding-bottom: 6px; font-family: var(--font-display);">$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 22px; font-weight: 900; color: var(--imperial-gold); margin: 26px 0 12px 0; font-family: var(--font-display);">$1</h1>');

      html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-white);">$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em style="color: #cbd5e1;">$1</em>');

      html = html.replace(/\[\[(.*?)\]\]/g, (m, linkText) => {
        return \`<span class="wikilink-pill" onclick="openNoteByTitle('\\\${linkText}')" title="Ouvrir la note liée [[ \\\${linkText} ]]">🔗 [[\\\${linkText}]]</span>\`;
      });

      html = html.replace(/(^|\s)#([a-zA-Z0-9_-]+)/g, '$1<span style="background: rgba(0, 240, 255, 0.1); color: var(--neon-cyan); font-size: 11px; font-family: var(--font-mono); padding: 2px 7px; border-radius: 4px; margin-right: 4px;">#$2</span>');

      html = html.replace(/^\s*-\s+(.*$)/gim, '<li style="margin-left: 20px; list-style-type: square; color: var(--text-secondary); margin-bottom: 6px;">$1</li>');
      html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li style="margin-left: 20px; list-style-type: decimal; color: var(--text-secondary); margin-bottom: 6px;">$2</li>');

      html = html.replace(/\n/g, '<br>');

      displayFormulas.forEach((formula, idx) => {
        const token = 'KATEX_DISPLAY_' + idx;
        const boxHtml = \`
          <div class="katex-display-box">
            <span class="katex-formula-tag">FORMULE KATEX</span>
            <div style="font-family: 'KaTeX_Math', 'JetBrains Mono', serif; font-size: 15px; color: #f1f5f9; letter-spacing: 0.5px;">
              \${formula}
            </div>
          </div>
        \`;
        html = html.replace(token, boxHtml);
      });

      inlineFormulas.forEach((formula, idx) => {
        const token = 'KATEX_INLINE_' + idx;
        const inlineHtml = \`<code style="background: rgba(168, 85, 247, 0.15); color: #c084fc; padding: 2px 6px; border-radius: 4px; font-family: 'KaTeX_Math', monospace; font-size: 12px; border: 1px solid rgba(168, 85, 247, 0.3);">\${formula}</code>\`;
        html = html.replace(token, inlineHtml);
      });

      return html;
    }

    function renderBacklinks(activeNote) {
      const listEl = document.getElementById('reader-backlinks-list');
      const countBadge = document.getElementById('reader-backlinks-count');
      if (!listEl) return;

      const notes = state.notes || [];
      const backlinks = [];

      notes.forEach(note => {
        if (note.id === activeNote.id) return;
        const needle = activeNote.title.toLowerCase();
        const contentLower = (note.content || '').toLowerCase();
        if (contentLower.includes('[[' + needle + ']]') || contentLower.includes(needle)) {
          const idx = contentLower.indexOf(needle);
          const start = Math.max(0, idx - 40);
          const end = Math.min(note.content.length, idx + needle.length + 50);
          const excerpt = (start > 0 ? '...' : '') + note.content.substring(start, end).replace(/\n/g, ' ') + (end < note.content.length ? '...' : '');

          backlinks.push({
            note: note,
            excerpt: excerpt
          });
        }
      });

      if (countBadge) countBadge.textContent = '🔗 ' + backlinks.length + ' MENTIONS LIÉES';

      if (backlinks.length === 0) {
        listEl.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); font-style: italic; padding: 10px;">Aucune mention entrante détectée dans le coffre pour cette note.</div>';
        return;
      }

      listEl.innerHTML = backlinks.map(b => \`
        <div class="backlink-card" onclick="openObsidianNote('\\\${b.note.id}')" title="Cliquer pour ouvrir la note source">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-weight: bold; color: var(--text-white); font-size: 13px;">📄 \${b.note.title}</span>
            <span class="radar-ping-badge" style="font-size: 9px; padding: 2px 6px;">\${b.note.base}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); line-height: 1.4;">\${b.excerpt}</div>
        </div>
      \`).join('');
    }

    function toggleNoteEditMode() {
      const bodyEl = document.getElementById('reader-note-body');
      const editContainer = document.getElementById('reader-edit-container');
      const btnEdit = document.getElementById('btn-edit-note-toggle');
      const btnSave = document.getElementById('btn-save-note');

      if (!bodyEl || !editContainer) return;

      const isEditing = editContainer.style.display !== 'none';

      if (isEditing) {
        editContainer.style.display = 'none';
        bodyEl.style.display = 'block';
        if (btnEdit) btnEdit.textContent = '✏️ MODIFIER';
        if (btnSave) btnSave.style.display = 'none';
      } else {
        editContainer.style.display = 'block';
        bodyEl.style.display = 'none';
        if (btnEdit) btnEdit.textContent = '❌ ANNULER';
        if (btnSave) btnSave.style.display = 'inline-block';
      }
    }

    function saveCurrentNoteEdit() {
      const textarea = document.getElementById('reader-edit-textarea');
      if (!textarea) return;

      const note = (state.notes || []).find(n => n.id === activeObsidianNoteId);
      if (!note) return;

      note.content = textarea.value;
      note.updatedAt = new Date().toISOString();
      saveState();

      buildGraphFromNotes();
      openObsidianNote(note.id, false);
      toggleNoteEditMode();

      showSysNotification(
        "🧠 [NOTE SAUVEGARDÉE]",
        "La note <strong>" + note.title + "</strong> a été synchronisée dans le coffre Obsidian."
      );
    }

    function setObsidianMode(mode) {
      currentObsidianMode = mode;

      const btnGraph = document.getElementById('btn-mode-graph');
      const btnReader = document.getElementById('btn-mode-reader');
      const btnSplit = document.getElementById('btn-mode-split');
      const btnCards = document.getElementById('btn-mode-cards');

      [btnGraph, btnReader, btnSplit, btnCards].forEach(b => {
        if (b) b.classList.remove('active');
      });

      const stageGraph = document.getElementById('stage-graph');
      const stageReader = document.getElementById('stage-reader');
      const stageSplit = document.getElementById('stage-split');
      const stageCards = document.getElementById('stage-cards');

      if (stageGraph) stageGraph.style.display = 'none';
      if (stageReader) stageReader.style.display = 'none';
      if (stageSplit) stageSplit.style.display = 'none';
      if (stageCards) stageCards.style.display = 'none';

      if (mode === 'graph') {
        if (btnGraph) btnGraph.classList.add('active');
        if (stageGraph) stageGraph.style.display = 'block';
        resizeCanvas('obsidian-graph-canvas');
      } else if (mode === 'reader') {
        if (btnReader) btnReader.classList.add('active');
        if (stageReader) stageReader.style.display = 'block';
      } else if (mode === 'split') {
        if (btnSplit) btnSplit.classList.add('active');
        if (stageSplit) stageSplit.style.display = 'block';
        const note = (state.notes || []).find(n => n.id === activeObsidianNoteId) || (state.notes || [])[0];
        if (note) openObsidianNote(note.id, false);
        resizeCanvas('obsidian-split-graph-canvas');
      } else if (mode === 'cards') {
        if (btnCards) btnCards.classList.add('active');
        if (stageCards) stageCards.style.display = 'block';
      }
    }

    // Force-Directed Graph Engine
    function setupGraphCanvas() {
      const canvas = document.getElementById('obsidian-graph-canvas');
      if (!canvas) return;

      resizeCanvas('obsidian-graph-canvas');
      window.addEventListener('resize', () => {
        resizeCanvas('obsidian-graph-canvas');
        resizeCanvas('obsidian-split-graph-canvas');
      });

      canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        mouseStartPos = { x: mx, y: my };

        const clicked = getNodeAtScreenPos(canvas, mx, my);
        if (clicked) {
          draggedNode = clicked;
          isDraggingGraph = true;
          isPanningGraph = false;
        } else {
          draggedNode = null;
          isDraggingGraph = false;
          isPanningGraph = true;
        }
      });

      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        if (isDraggingGraph && draggedNode) {
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          draggedNode.x = (mx - cx) / graphZoom - graphPanX;
          draggedNode.y = (my - cy) / graphZoom - graphPanY;
          draggedNode.vx = 0;
          draggedNode.vy = 0;
        } else if (isPanningGraph) {
          const dx = mx - mouseStartPos.x;
          const dy = my - mouseStartPos.y;
          graphPanX += dx / graphZoom;
          graphPanY += dy / graphZoom;
          mouseStartPos = { x: mx, y: my };
        } else {
          hoveredNode = getNodeAtScreenPos(canvas, mx, my);
          canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
        }
      });

      canvas.addEventListener('mouseup', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const dist = Math.hypot(mx - mouseStartPos.x, my - mouseStartPos.y);

        if (dist < 6 && draggedNode) {
          openObsidianNote(draggedNode.id, false);
          showSysNotification("📄 [NOTE OBSIDIAN SÉLECTIONNÉE]", "Focus engagé sur <strong>" + draggedNode.title + "</strong>.");
        }

        isDraggingGraph = false;
        isPanningGraph = false;
        draggedNode = null;
      });

      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        zoomObsidianGraph(factor);
      });

      if (!graphAnimId) {
        startGraphAnimation();
      }
    }

    function setupSplitGraphCanvas() {
      const splitCanvas = document.getElementById('obsidian-split-graph-canvas');
      if (!splitCanvas) return;
      resizeCanvas('obsidian-split-graph-canvas');
    }

    function resizeCanvas(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    }

    function getNodeAtScreenPos(canvas, sx, sy) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (let i = obsidianGraphNodes.length - 1; i >= 0; i--) {
        const node = obsidianGraphNodes[i];
        const screenX = cx + (node.x + graphPanX) * graphZoom;
        const screenY = cy + (node.y + graphPanY) * graphZoom;
        const hitRadius = (node.radius * graphZoom) + 6;
        const dist = Math.hypot(sx - screenX, sy - screenY);
        if (dist <= hitRadius) {
          return node;
        }
      }
      return null;
    }

    function updateGraphPhysics() {
      if (!graphPhysicsRunning) return;

      const nodes = obsidianGraphNodes;
      const edges = obsidianGraphEdges;

      const kRep = 3200;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy + 100;
          const dist = Math.sqrt(distSq);
          const force = kRep / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (n1 !== draggedNode) {
            n1.vx -= fx;
            n1.vy -= fy;
          }
          if (n2 !== draggedNode) {
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }

      const kSpring = 0.007;
      const restLen = 110;
      edges.forEach(edge => {
        const src = nodes.find(n => n.id === edge.source);
        const tgt = nodes.find(n => n.id === edge.target);
        if (!src || !tgt) return;

        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.hypot(dx, dy) || 1;
        const delta = dist - restLen;
        const force = delta * kSpring;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (src !== draggedNode) {
          src.vx += fx;
          src.vy += fy;
        }
        if (tgt !== draggedNode) {
          tgt.vx -= fx;
          tgt.vy -= fy;
        }
      });

      const kGrav = 0.0008;
      nodes.forEach(node => {
        if (node === draggedNode) return;
        node.vx -= node.x * kGrav;
        node.vy -= node.y * kGrav;

        node.vx *= 0.88;
        node.vy *= 0.88;

        node.x += node.vx;
        node.y += node.vy;
      });
    }

    function renderCanvasScene(canvas, isMini = false) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40 * graphZoom;
      const startX = (cx + graphPanX * graphZoom) % gridSize;
      const startY = (cy + graphPanY * graphZoom) % gridSize;

      for (let x = startX; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = startY; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      obsidianGraphEdges.forEach(edge => {
        const src = obsidianGraphNodes.find(n => n.id === edge.source);
        const tgt = obsidianGraphNodes.find(n => n.id === edge.target);
        if (!src || !tgt) return;

        const x1 = cx + (src.x + graphPanX) * graphZoom;
        const y1 = cy + (src.y + graphPanY) * graphZoom;
        const x2 = cx + (tgt.x + graphPanX) * graphZoom;
        const y2 = cy + (tgt.y + graphPanY) * graphZoom;

        const isHighlighted = (hoveredNode && (hoveredNode.id === src.id || hoveredNode.id === tgt.id)) ||
                              (activeObsidianNoteId && (activeObsidianNoteId === src.id || activeObsidianNoteId === tgt.id));

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        if (isHighlighted) {
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.75)';
          ctx.lineWidth = 2 * graphZoom;
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
          ctx.lineWidth = 1 * graphZoom;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      obsidianGraphNodes.forEach(node => {
        const sx = cx + (node.x + graphPanX) * graphZoom;
        const sy = cy + (node.y + graphPanY) * graphZoom;
        const r = node.radius * graphZoom;
        const isActive = node.id === activeObsidianNoteId;
        const isHovered = hoveredNode && hoveredNode.id === node.id;
        const matchesSearch = obsidianSearchFilter ? node.title.toLowerCase().includes(obsidianSearchFilter) : false;

        if (isActive || isHovered || matchesSearch) {
          ctx.beginPath();
          ctx.arc(sx, sy, r + 5 * graphZoom, 0, Math.PI * 2);
          ctx.strokeStyle = isActive ? 'rgba(0, 240, 255, 0.8)' : (matchesSearch ? 'rgba(255, 215, 0, 0.9)' : 'rgba(168, 85, 247, 0.8)');
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = (isActive || isHovered) ? 14 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.lineWidth = isActive ? 2 : 1;
        ctx.strokeStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();

        const showLabel = !isMini && (graphZoom > 0.65 || node.isHub || isHovered || isActive || matchesSearch);
        if (showLabel) {
          ctx.font = \`\${node.isHub ? 'bold 12px' : '10px'} 'JetBrains Mono', monospace\`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          ctx.fillStyle = 'rgba(2, 8, 24, 0.85)';
          ctx.fillText(node.title, sx + 1, sy + r + 5);

          ctx.fillStyle = isActive ? 'var(--neon-cyan)' : (node.isHub ? '#d8b4fe' : '#e2e8f0');
          ctx.fillText(node.title, sx, sy + r + 4);
        }
      });
    }

    function startGraphAnimation() {
      function loop() {
        updateGraphPhysics();

        if (currentObsidianMode === 'graph') {
          const canvas = document.getElementById('obsidian-graph-canvas');
          if (canvas) renderCanvasScene(canvas, false);
        } else if (currentObsidianMode === 'split') {
          const splitCanvas = document.getElementById('obsidian-split-graph-canvas');
          if (splitCanvas) renderCanvasScene(splitCanvas, true);
        }

        graphAnimId = requestAnimationFrame(loop);
      }
      graphAnimId = requestAnimationFrame(loop);
    }

    function zoomObsidianGraph(factor) {
      graphZoom = Math.max(0.35, Math.min(3.0, graphZoom * factor));
    }

    function recenterObsidianGraph() {
      graphPanX = 0;
      graphPanY = 0;
      graphZoom = 1.0;
    }

    function restartObsidianPhysics() {
      graphPhysicsRunning = true;
      obsidianGraphNodes.forEach(node => {
        node.vx = (Math.random() - 0.5) * 8;
        node.vy = (Math.random() - 0.5) * 8;
      });
      showSysNotification("🔄 [PHYSIQUE RELANCÉE]", "Forces de répulsion et de rappel réinitialisées.");
    }

    function refreshObsidianGraph() {
      buildGraphFromNotes();
      renderObsidianFolderTree();
      restartObsidianPhysics();
    }

    function filterObsidianNotes(term) {
      obsidianSearchFilter = (term || '').trim().toLowerCase();
      renderObsidianFolderTree();
      filterNotes(term);
    }

    // Modal and CRUD Functions
    function openCreateNoteModal() {
      document.getElementById('note-modal').classList.add('open');
    }
    function closeCreateNoteModal() {
      document.getElementById('note-modal').classList.remove('open');
    }

    function saveNewNote() {
      const title = document.getElementById('new-note-title').value.trim();
      const base = document.getElementById('new-note-base').value;
      const tags = document.getElementById('new-note-tags').value.split(',').map(t => t.trim()).filter(Boolean);
      const content = document.getElementById('new-note-content').value.trim();

      if (!title || !content) {
        showSysNotification("[CHAMPS REQUIS]", "Veuillez renseigner un titre et un contenu pour votre note.");
        return;
      }

      const folderMap = {
        'DIS': '00_Synthese_Souveraine',
        'AI_ENG': '01_Ingenierie_IA',
        'SEC': '02_Cybersecurite',
        'ACAD': '03_Mathematiques',
        'SPORT': '04_Calisthenie_Biomecanique',
        'ENG': '05_Anglais_Cambridge'
      };

      const newNote = {
        id: 'note-' + Date.now(),
        base: base,
        folder: folderMap[base] || '00_Synthese_Souveraine',
        title: title,
        tags: tags.length ? tags : ['savoir', 'second-brain'],
        updatedAt: new Date().toISOString(),
        content: content
      };

      state.notes.unshift(newNote);
      saveState();

      buildGraphFromNotes();
      renderObsidianFolderTree();
      openObsidianNote(newNote.id, false);

      const grid = document.getElementById('notes-grid-container');
      if (grid) {
        const div = document.createElement('div');
        div.className = 'glass-card spotlight-card note-card-item';
        div.id = 'note-card-' + newNote.id;
        div.style.padding = '22px';
        div.innerHTML = \`
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span class="radar-ping-badge">\${newNote.base}</span>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); font-weight: bold;">À L'INSTANT</span>
              <button onclick="deleteNote('\\\${newNote.id}')" style="background: none; border: none; color: var(--alert-crimson); cursor: pointer; font-size: 14px;">🗑</button>
            </div>
          </div>
          <h3 style="font-size: 17px; font-weight: bold; margin-bottom: 12px; color: var(--text-white); cursor: pointer;" onclick="openObsidianNote('\\\${newNote.id}'); setObsidianMode('reader');">\${newNote.title}</h3>
          <div style="background: rgba(2, 8, 24, 0.7); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: var(--radius-sm); padding: 14px; font-size: 12px; font-family: var(--font-mono); color: var(--text-secondary); line-height: 1.5; white-space: pre-wrap; margin-bottom: 14px;">\${newNote.content}</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            \${newNote.tags.map(t => \`<span style="background: rgba(0, 240, 255, 0.1); color: var(--neon-cyan); font-size: 11px; font-family: var(--font-mono); padding: 3px 8px; border-radius: 4px;">#\${t}</span>\`).join('')}
          </div>
        \`;
        grid.insertBefore(div, grid.firstChild);
      }

      closeCreateNoteModal();
      addExperience(40);
      showSysNotification(
        "🧠 [NOTE ENREGISTRÉE DANS LE COFFRE]",
        "La note <strong>" + title + "</strong> a été chiffrée et sauvegardée.<br>Gains : <strong>+40 XP</strong> d'archivage cognitif."
      );
    }

    function deleteNote(id) {
      state.notes = state.notes.filter(n => n.id !== id);
      saveState();
      const el = document.getElementById('note-card-' + id);
      if (el) el.remove();
      buildGraphFromNotes();
      renderObsidianFolderTree();
      showSysNotification("[NOTE RETIRÉE]", "Note supprimée du coffre local.");
    }

    function filterNotes(term) {
      const q = (term || '').toLowerCase();
      document.querySelectorAll('.note-card-item').forEach(c => {
        if (c.textContent.toLowerCase().includes(q)) {
          c.style.display = 'block';
        } else {
          c.style.display = 'none';
        }
      });
    }


    // =========================================================================
    // SCREEN 6 : REAL AUDIO CAPTURE & SOCRATIC AI GRADER
    // =========================================================================
    let audioMediaStream = null;
    let audioCtx = null;
    let audioAnalyser = null;
    let audioRecordingActive = false;
    let speechRecognizer = null;

    const audioCanvas = document.getElementById('audio-canvas');
    let spectrumCtx = audioCanvas ? audioCanvas.getContext('2d') : null;

    function renderAudioSpectrumLoop() {
      if (!audioCanvas || !spectrumCtx) return;
      spectrumCtx.fillStyle = 'rgba(2, 8, 24, 0.35)';
      spectrumCtx.fillRect(0, 0, audioCanvas.width, audioCanvas.height);

      const bars = 56;
      const barWidth = (audioCanvas.width / bars) - 2;

      let freqData = new Uint8Array(bars);
      if (audioAnalyser && audioRecordingActive) {
        audioAnalyser.getByteFrequencyData(freqData);
      }

      for (let i = 0; i < bars; i++) {
        let val = freqData[i] || 0;
        let h = audioRecordingActive ? (val / 255) * 110 + 10 : Math.sin(Date.now() * 0.005 + i * 0.25) * 20 + 25;
        spectrumCtx.fillStyle = i % 2 === 0 ? '#00f0ff' : '#0284c7';
        spectrumCtx.fillRect(i * (barWidth + 2), audioCanvas.height - h, barWidth, h);
      }
      requestAnimationFrame(renderAudioSpectrumLoop);
    }
    renderAudioSpectrumLoop();

    function toggleAudioRecording() {
      const btn = document.getElementById('record-toggle-btn');
      const micStatus = document.getElementById('mic-status-label');

      if (!audioRecordingActive) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
              audioMediaStream = stream;
              audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              audioAnalyser = audioCtx.createAnalyser();
              audioAnalyser.fftSize = 128;
              const source = audioCtx.createMediaStreamSource(stream);
              source.connect(audioAnalyser);

              audioRecordingActive = true;
              btn.textContent = '⏹ ARRÊTER & ÉVALUER (ARCHITECTE)';
              btn.classList.add('btn-red');
              if (micStatus) {
                micStatus.textContent = "MICRO : EN ÉCOUTE ACTIVE (FLUX PCM)";
                micStatus.style.color = "var(--transcendent-green)";
              }

              // Speech Recognition
              const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
              if (SpeechRec) {
                speechRecognizer = new SpeechRec();
                speechRecognizer.continuous = true;
                speechRecognizer.interimResults = true;
                speechRecognizer.lang = 'en-US';
                speechRecognizer.onresult = (evt) => {
                  let text = '';
                  for (let i = 0; i < evt.results.length; i++) {
                    text += evt.results[i][0].transcript + ' ';
                  }
                  document.getElementById('speech-transcript-box').value = text;
                };
                speechRecognizer.start();
              }
            })
            .catch(err => {
              showSysNotification("[ACCÈS MICRO REFUSÉ]", "Impossible d'accéder au microphone : " + err.message + ". Vous pouvez saisir votre restitution textuelle ci-dessous.");
            });
        }
      } else {
        // Stop recording
        audioRecordingActive = false;
        if (audioMediaStream) {
          audioMediaStream.getTracks().forEach(t => t.stop());
        }
        if (speechRecognizer) {
          try { speechRecognizer.stop(); } catch(e) {}
        }
        btn.textContent = '🎙️ DÉMARRER ENREGISTREMENT';
        btn.classList.remove('btn-red');
        if (micStatus) {
          micStatus.textContent = "MICRO : ENREGISTREMENT ACHEVÉ";
          micStatus.style.color = "var(--neon-cyan)";
        }
        evaluateSocraticSpeech();
      }
    }

    function evaluateSocraticSpeech() {
      const text = document.getElementById('speech-transcript-box').value.trim();
      if (!text || text.length < 20) {
        showSysNotification(
          "[DISCOURS TROP COURT]",
          "La restitution orale doit comporter au moins 10 mots techniques pour être soumise à la grille de l'Architecte."
        );
        return;
      }

      // Socratic Algorithmic Rubric
      const words = text.split(/\\s+/).length;
      const lower = text.toLowerCase();
      const techKeywords = ['transformer', 'attention', 'gradient', 'latent', 'matrix', 'tensor', 'kernel', 'optimization', 'buffer', 'overflow', 'cryptography', 'latency', 'asymptote', 'eigenvalue', 'complexity'];
      let matchedCount = techKeywords.filter(k => lower.includes(k)).length;

      let scoreConcept = Math.min(6, 4 + matchedCount * 0.5);
      let scoreRigor = Math.min(5, 3.5 + (words > 40 ? 1.5 : 0.8));
      let scoreDelivery = Math.min(5, 4.0 + (words > 60 ? 1.0 : 0.5));
      let scoreExamples = Math.min(4, 2.5 + (matchedCount > 2 ? 1.5 : 0.5));

      let totalScore = Math.min(20, Math.round((scoreConcept + scoreRigor + scoreDelivery + scoreExamples) * 10) / 10);

      document.getElementById('crit-concept').textContent = scoreConcept.toFixed(1) + " / 6 pts";
      document.getElementById('crit-rigor').textContent = scoreRigor.toFixed(1) + " / 5 pts";
      document.getElementById('crit-delivery').textContent = scoreDelivery.toFixed(1) + " / 5 pts";
      document.getElementById('crit-examples').textContent = scoreExamples.toFixed(1) + " / 4 pts";
      document.getElementById('rubric-total-score').textContent = totalScore.toFixed(1) + " / 20";

      const dashScore = document.getElementById('dash-oral-score');
      if (dashScore) dashScore.textContent = totalScore.toFixed(1) + " / 20";

      addExperience(120);
      showSysNotification(
        "🎙️ [ÉVALUATION SOCRATIQUE DE L'ARCHITECTE VALIDÉE]",
        "Discours analysé (" + words + " mots, " + matchedCount + " termes techniques repérés).<br>Note obtenue : <strong style='color: var(--transcendent-green); font-size: 18px;'>" + totalScore.toFixed(1) + " / 20</strong>.<br><strong>+120 XP (LNG / AI_ENG)</strong> attribués."
      );
    }

    // =========================================================================
    // SCREEN 7 : DEERFLOW SCRAPER SIMULATOR
    // =========================================================================
    function triggerDeerflowScraper() {
      playChime(700);
      showSysNotification(
        "🌐 [SCRAPING DEERFLOW EXÉCUTÉ]",
        "Le crawler d'opportunités a scanné Campus France, Devpost et Kaggle.<br><strong>4 nouvelles opportunités</strong> à fort match score (>95%) ont été indexées."
      );
    }

    // =========================================================================
    // SCREEN 8 : SHADOW SHOP WITH REAL INVENTORY
    // =========================================================================
    function buyShopItem(id, name, cost) {
      if (state.player.shadowCrystals < cost) {
        showSysNotification(
          "[CRISTAUX INSUFFISANTS]",
          "Solde insuffisant : vous avez <strong>" + state.player.shadowCrystals + " 💎</strong> mais cet article requiert <strong>" + cost + " 💎</strong>.<br>Accomplissez vos quêtes du jour pour en récolter."
        );
        return;
      }

      state.player.shadowCrystals -= cost;
      const voucherCode = "LVL-SHADOW-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const newInv = {
        id: 'inv-' + Date.now(),
        name: name,
        cost: cost,
        code: voucherCode,
        date: new Date().toLocaleDateString('fr-FR')
      };
      state.inventory.unshift(newInv);
      saveState();

      // Update counters
      const bal = document.getElementById('shop-balance-display');
      const headBal = document.getElementById('header-crystals-val');
      if (bal) bal.textContent = state.player.shadowCrystals;
      if (headBal) headBal.textContent = state.player.shadowCrystals;

      // Add to inventory UI
      const invContainer = document.getElementById('shop-inventory-container');
      if (invContainer) {
        const div = document.createElement('div');
        div.className = 'glass-card';
        div.style.padding = '14px';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.innerHTML = \`
          <div>
            <div style="font-size: 14px; font-weight: bold; color: var(--text-white);">\${newInv.name}</div>
            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Acheté à l'instant pour \${newInv.cost} 💎</div>
          </div>
          <div style="background: rgba(0, 240, 255, 0.1); border: 1px solid var(--neon-cyan); padding: 6px 10px; border-radius: 4px; font-family: var(--font-mono); font-size: 11px; color: var(--neon-cyan);">
            \${newInv.code}
          </div>
        \`;
        invContainer.insertBefore(div, invContainer.firstChild);
      }

      showSysNotification(
        "💎 [ACHAT VALIDÉ DANS LA BOUTIQUE DES OMBRES]",
        "Article : <strong>" + name + "</strong>.<br>Montant débité : <strong>-" + cost + " 💎</strong>.<br>Code de retrait généré : <code style='color: var(--neon-cyan); font-weight: bold;'>" + voucherCode + "</code>.<br>L'article a été ajouté à votre inventaire permanent."
      );
    }

    // =========================================================================
    // SCREEN 9 : REAL PENALTY TOGGLE & REDEMPTION
    // =========================================================================
    function togglePenaltySimulation() {
      state.penalty.active = !state.penalty.active;
      saveState();

      const banner = document.getElementById('dash-system-banner');
      const bannerDesc = document.getElementById('system-banner-status-desc');
      const header = document.getElementById('penalty-status-header');
      const btn = document.getElementById('penalty-toggle-btn');

      if (state.penalty.active) {
        if (banner) {
          banner.style.background = 'linear-gradient(90deg, rgba(255, 0, 60, 0.4) 0%, rgba(2, 14, 38, 0.95) 50%, rgba(255, 0, 60, 0.4) 100%)';
          banner.style.borderColor = 'var(--alert-crimson)';
        }
        if (bannerDesc) {
          bannerDesc.textContent = "ATTENTION : PROTOCOLE DE PÉNALITÉ NEXTDNS ACTIF. QUÊTES EN ÉCHEC.";
          bannerDesc.style.color = "var(--alert-crimson)";
        }
        if (header) {
          header.textContent = "STATUT : VERROUILLAGE RÉSEAU ACTIF (NEXTDNS ENGAGÉ)";
          header.style.color = "var(--alert-crimson)";
        }
        if (btn) btn.textContent = "LEVER LA PÉNALITÉ";
        showSysNotification(
          "⚠️ [ZONE DE PÉNALITÉ ENCLENCHÉE]",
          "Quête journalière échue à 22h00.<br>Les réseaux récréatifs sont verrouillés.<br>Exécutez l'une des deux épreuves de rédemption pour rétablir l'accès."
        );
      } else {
        if (banner) {
          banner.style.background = 'linear-gradient(90deg, rgba(0, 81, 255, 0.3) 0%, rgba(2, 14, 38, 0.85) 50%, rgba(0, 81, 255, 0.3) 100%)';
          banner.style.borderColor = 'var(--neon-cyan)';
        }
        if (bannerDesc) {
          bannerDesc.textContent = "Le Système du Monarque est synchronisé. Aucune pénalité active.";
          bannerDesc.style.color = "var(--text-secondary)";
        }
        if (header) {
          header.textContent = "STATUT : CHASSEUR EN RÈGLE (AUCUN BLOCAGE ACTIF)";
          header.style.color = "var(--transcendent-green)";
        }
        if (btn) btn.textContent = "DÉCLENCHER SIMULATION PÉNALITÉ";
        showSysNotification(
          "🛡️ [PÉNALITÉ LEVÉE AVEC SUCCÈS]",
          "Le verrouillage NextDNS a été désactivé. Tous les accès sont rétablis."
        );
      }
    }

    function redeemPenalty(option) {
      state.penalty.active = false;
      saveState();
      togglePenaltySimulation();
      showSysNotification(
        "🏆 [ÉPREUVE DE RÉDEMPTION ACCOMPLIE]",
        "Option " + option + " validée par le Système.<br>Pénalité purgée. Rétablissement complet des droits."
      );
    }

    // =========================================================================
    // SCREEN 10 : WORKOUT WEBCAM & REPETITION COUNTER
    // =========================================================================
    let workoutReps = 14;
    function addManualRep() {
      workoutReps++;
      playChime(587);
      const el = document.getElementById('workout-rep-count');
      if (el) el.textContent = workoutReps + " / 14";
    }

    function validateWorkoutSet() {
      playChime(1046);
      addExperience(120);
      state.player.shadowCrystals += 15;
      saveState();
      const cEl = document.getElementById('header-crystals-val');
      if (cEl) cEl.textContent = state.player.shadowCrystals;

      showSysNotification(
        "💪 [SÉRIE CALISTHÉNIQUE VALIDÉE]",
        "Série de " + workoutReps + " répétitions validée avec posture stricte.<br>Gains : <strong>+120 XP STR</strong> et <strong>+15 Cristaux d'Ombre 💎</strong>."
      );
    }

    function toggleCamera() {
      playChime(523);
      const video = document.getElementById('webcam-video');
      const placeholder = document.getElementById('cam-placeholder');
      const btn = document.getElementById('cam-toggle-btn');

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            if (video) {
              video.srcObject = stream;
              video.style.display = 'block';
              if (placeholder) placeholder.style.display = 'none';
              if (btn) btn.textContent = '⏹ DÉSACTIVER CAMÉRA';
            }
          })
          .catch(() => {
            showSysNotification(
              "[CAMÉRA NON ACCESSIBLE]",
              "Impossible de connecter la caméra physique. Utilisez le bouton manuel '+ 1 RÉPÉTITION' pour journaliser vos répétitions."
            );
          });
      }
    }

    // React Bits Background Mana Particles
    const bgCanvas = document.getElementById('mana-particles-canvas');
    if (bgCanvas) {
      const bgCtx = bgCanvas.getContext('2d');
      let pWidth = bgCanvas.width = window.innerWidth;
      let pHeight = bgCanvas.height = window.innerHeight;

      window.addEventListener('resize', () => {
        pWidth = bgCanvas.width = window.innerWidth;
        pHeight = bgCanvas.height = window.innerHeight;
      });

      const particles = [];
      for (let i = 0; i < 45; i++) {
        particles.push({
          x: Math.random() * pWidth,
          y: Math.random() * pHeight,
          radius: Math.random() * 1.8 + 0.5,
          speedY: Math.random() * 0.6 + 0.2,
          speedX: (Math.random() - 0.5) * 0.3,
          alpha: Math.random() * 0.6 + 0.2
        });
      }

      function renderMana() {
        if (!bgCtx) return;
        bgCtx.clearRect(0, 0, pWidth, pHeight);
        for (let p of particles) {
          p.y -= p.speedY;
          p.x += p.speedX;
          if (p.y < 0) {
            p.y = pHeight;
            p.x = Math.random() * pWidth;
          }
          bgCtx.beginPath();
          bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          bgCtx.fillStyle = 'rgba(0, 240, 255, ' + p.alpha + ')';
          bgCtx.shadowBlur = 8;
          bgCtx.shadowColor = '#00f0ff';
          bgCtx.fill();
        }
        requestAnimationFrame(renderMana);
      }
      renderMana();
    }

    // Spotlight Card Tracking
    document.addEventListener('mousemove', (e) => {
      document.querySelectorAll('.spotlight-card').forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });
    });

    // Keyboard Shortcuts (Alt+1 to Alt+0)
    window.addEventListener('keydown', (e) => {
      if (e.altKey) {
        const keyMap = {
          '1': 'dashboard',
          '2': 'skills',
          '3': 'quests',
          '4': 'planner',
          '5': 'notes',
          '6': 'audio',
          '7': 'opportunities',
          '8': 'shop',
          '9': 'penalty',
          '0': 'workout'
        };
        if (keyMap[e.key]) {
          e.preventDefault();
          switchView(keyMap[e.key]);
        }
      }
    });

    // Initial State Render
    updateVitalsUI();
    updateXpUI();
  </script>
</body>
</html>`;
}

// Master HTTP Server
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-player-id",
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname.replace(/\/$/, "") || "/";

  // 1. Healthcheck endpoint (Render.com)
  if (pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "HEALTHY",
        uptime: process.uptime(),
        version: "3.3.0",
      }),
    );
    return;
  }

  // Favicon & Monarch Logo SVG Assets
  if (
    pathname === "/logo-monarch.svg" ||
    pathname === "/favicon.svg" ||
    pathname === "/favicon.ico"
  ) {
    res.writeHead(200, {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    });
    res.end(MONARCH_LOGO_SVG);
    return;
  }

  // 2. API Endpoints
  if (pathname === "/api/v1/player/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(SYSTEM_STATE.player));
    return;
  }

  if (pathname === "/api/v1/quests/daily") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(SYSTEM_STATE.quests));
    return;
  }

  if (pathname === "/api/v1/planner") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(SYSTEM_STATE.plannerBlocks));
    return;
  }

  if (pathname === "/api/v1/notes") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(SYSTEM_STATE.notes));
    return;
  }

  if (pathname === "/api/v1/opportunities") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(SYSTEM_STATE.opportunities));
    return;
  }

  if (pathname === "/api/v1/shop") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        items: SYSTEM_STATE.shopItems,
        balance: SYSTEM_STATE.player.shadowCrystals,
      }),
    );
    return;
  }

  // 3. Multi-Page HTML Routing
  const routeTabMap = {
    "/": "dashboard",
    "/dashboard": "dashboard",
    "/skills": "skills",
    "/quests": "quests",
    "/planner": "planner",
    "/notes": "notes",
    "/audio": "audio",
    "/opportunities": "opportunities",
    "/shop": "shop",
    "/penalty": "penalty",
    "/workout": "workout",
    "/workout/camera": "workout",
  };

  if (routeTabMap[pathname]) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderFullApplication(routeTabMap[pathname]));
    return;
  }

  // Fallback 404
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end(
    '<h1>404 - Protocole Système Non Trouvé</h1><p><a href="/">Retour au HUD Souverain</a></p>',
  );
});

if (require.main === module) {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[LevelUp System HUD v3.3.0] Listening on http://0.0.0.0:${PORT}`,
    );
  });
}

module.exports = {
  server,
  SYSTEM_STATE,
  getHarmonicScore,
  renderFullApplication,
};
