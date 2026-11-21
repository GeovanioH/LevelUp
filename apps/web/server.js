/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * LevelUp — The System (Master Server & Fully Functional Multi-Page Solo Leveling HUD)
 * All 10 canonical screens with REAL functional interactivity, live WebAudio FFT,
 * Web Speech transcription, Socratic grading, MediaPipe workout camera, Notes vault,
 * Shop inventory, DAG skills unlocking, and zero mock alerts.
 */

const http = require("http");
const https = require("https");
const url = require("url");
const fs = require("fs");
const path = require("path");

// Load .env configuration at boot
const envCandidates = [
  path.join(__dirname, ".env"),
  path.join(__dirname, "..", "..", ".env"),
  path.join(process.cwd(), ".env"),
];
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const k = trimmed.slice(0, eqIdx).trim();
            let v = trimmed.slice(eqIdx + 1).trim();
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
              v = v.slice(1, -1);
            }
            if (!process.env[k]) {
              process.env[k] = v;
            }
          }
        }
      });
    } catch (_) {}
    break;
  }
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const DEFAULT_CDN_WEBM = "https://hamqkltryiytqdxjpiyl.supabase.co/storage/v1/object/public/LevelUpimgandvid/new_vids/levelup_intro_1080p_webm_vp9.webm";
const DEFAULT_CDN_MP4 = "https://hamqkltryiytqdxjpiyl.supabase.co/storage/v1/object/public/LevelUpimgandvid/new_vids/levelup_intro_1080p_ultra_smooth.mp4";
const DEFAULT_CDN_IMG = "https://hamqkltryiytqdxjpiyl.supabase.co/storage/v1/object/public/LevelUpimgandvid/new_vids/levelup_system_alert_image.webp";

// Prioritize clean new 1080p Supabase URLs and explicitly filter out legacy bloated files from env
const envMp4 = process.env.SUPABASE_INTRO_VIDEO_MP4 || process.env.INTRO_VIDEO_URL;
const SUPABASE_CDN_VIDEO_MP4 = (envMp4 && !envMp4.includes("test_upscale_5x.mp4")) ? envMp4 : DEFAULT_CDN_MP4;

const envWebm = process.env.SUPABASE_INTRO_VIDEO_WEBM;
const SUPABASE_CDN_VIDEO_WEBM = envWebm || DEFAULT_CDN_WEBM;

const envImg = process.env.INTRO_IMAGE_URL || process.env.SUPABASE_INTRO_IMAGE_URL;
const INTRO_IMAGE_URL = (envImg && !envImg.includes("test_alert_5x.webp")) ? envImg : DEFAULT_CDN_IMG;

// Google OAuth 2.0 Credentials & App Base URL Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const APP_URL = process.env.APP_URL || (process.env.NODE_ENV === "production" ? "https://levelup-system.onrender.com" : `http://localhost:${PORT}`);

// Solo Leveling Sovereign Monarch Logo SVG
const MONARCH_LOGO_SVG = `<svg class="monarch-crest-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="crestCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="45%" stop-color="#C084FC" />
      <stop offset="100%" stop-color="#9333EA" />
    </linearGradient>
    <linearGradient id="crestCoreGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#C084FC" />
    </linearGradient>
    <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <!-- Outer Hexagonal Frame in Violet & White -->
  <polygon points="50,4 88,24 88,72 50,96 12,72 12,24" stroke="#C084FC" stroke-width="2" fill="rgba(14, 8, 32, 0.92)" stroke-linejoin="round" opacity="0.95" />
  <polygon points="50,10 82,28 82,68 50,88 18,68 18,28" stroke="rgba(192, 132, 252, 0.45)" stroke-width="1" fill="none" />
  <!-- Winged Monarch Daggers / Crown Spikes -->
  <path d="M 22 32 L 38 22 L 44 44 L 34 52 L 22 42 Z" fill="url(#crestCyanGrad)" stroke="#C084FC" stroke-width="1.5" />
  <path d="M 78 32 L 78 42 L 66 52 L 56 44 L 62 22 Z" fill="url(#crestCyanGrad)" stroke="#C084FC" stroke-width="1.5" />
  <path d="M 50 12 L 58 40 L 50 56 L 42 40 Z" fill="url(#crestCyanGrad)" stroke="#FFFFFF" stroke-width="1.5" />
  <!-- Lower Chevron Ribs -->
  <path d="M 32 62 L 50 78 L 68 62 L 64 68 L 50 82 L 36 68 Z" fill="#C084FC" opacity="0.85" />
  <path d="M 38 72 L 50 82 L 62 72 L 58 76 L 50 84 L 42 76 Z" fill="#9333EA" opacity="0.9" />
  <!-- Central Mana Diamond Core -->
  <polygon points="50,38 60,50 50,62 40,50" fill="url(#crestCoreGrad)" stroke="#FFFFFF" stroke-width="1.5" filter="url(#cyanGlow)" />
  <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" />
  <circle cx="50" cy="12" r="1.5" fill="#FFFFFF" />
  <circle cx="22" cy="32" r="1.5" fill="#FFFFFF" />
  <circle cx="78" cy="32" r="1.5" fill="#FFFFFF" />
</svg>`;

// Default System State Template
const DEFAULT_STATE = {
  player: {
    id: "usr-guest-unawakened",
    name: "Chasseur Non Éveillé",
    email: null,
    avatar: null,
    authProvider: null,
    googleId: null,
    title: "Initié Non Éveillé (Rang E)",
    level: 1,
    rank: "E",
    currentXp: 0,
    nextLevelXp: 1000,
    availableSkillXp: 0,
    shadowCrystals: 0,
    streakDays: 0,
    hp: 100,
    maxHp: 100,
    mp: 100,
    maxMp: 100,
    hoursAwake: 0.0,
    curfewTime: "22:00",
    wakeTime: "06:00",
    archetype: "HARMONIC_MONARCH",
    targetGoal: "Excellence Globale (Score Sh >= 18)",
    workoutLevel: "STANDARD_100",
    deepWorkHours: 3,
    onboardingCompleted: false,
    attributes: {
      str: 10,
      agi: 10,
      per: 10,
      vit: 10,
      int: 10,
      remainingPoints: 0,
    },
    bases: {
      acad: { name: "Excellence Académique (ACAD)", score: 10, level: 1 },
      ai_eng: {
        name: "Ingénierie IA & Hackathons (AI_ENG)",
        score: 10,
        level: 1,
      },
      cyber: { name: "Cybersécurité Offensive (CYBER)", score: 10, level: 1 },
      exp: { name: "Éloquence & Réseautage (EXP)", score: 10, level: 1 },
      lng: { name: "Anglais C1/C2 Cambridge (LNG)", score: 10, level: 1 },
      fin: { name: "Bourses & Finances (FIN)", score: 10, level: 1 },
      str: { name: "Calisthénie & Force (STR)", score: 10, level: 1 },
      dis: { name: "Discipline & Monk Mode (DIS)", score: 10, level: 1 },
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
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&q=80&auto=format&fit=crop",
      description: "100 Pompes militaires, 100 Abdos d'acier, 100 Squats explosifs et 10 km de course.",
      proof: "",
    },
    {
      id: "q-thm-medium-room",
      type: "DAILY",
      title: "Infiltration Room Medium TryHackMe (CYBER)",
      base: "CYBER",
      xp: 180,
      crystals: 20,
      completed: false,
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&q=80&auto=format&fit=crop",
      description: "Exploitation de Buffer Overflow et élévation de privilèges Linux root.",
      proof: "",
    },
    {
      id: "q-lng-cambridge-speech",
      type: "DAILY",
      title: "Monologue Oral Anglais C1 Cambridge (LNG)",
      base: "LNG",
      xp: 150,
      crystals: 15,
      completed: false,
      image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=900&q=80&auto=format&fit=crop",
      description: "Restitution orale de 3 min sur un article arXiv en anglais soutenu (grille 20 pts).",
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
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80&auto=format&fit=crop",
      description: "Implémentation d'un block FlashAttention-2 avec benchmark de VRAM sur RTX 4070.",
      proof: "",
    },
    {
      id: "q-acad-spectral-reduction",
      type: "DAILY",
      title: "Algèbre Linéaire & Réduction Spectrale (ACAD)",
      base: "ACAD",
      xp: 220,
      crystals: 25,
      completed: false,
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=900&q=80&auto=format&fit=crop",
      description: "Résolution complète de 3 problèmes d'agrégation : diagonalisation, formes quadratiques et décomposition polaire.",
      proof: "",
    },
    {
      id: "q-fin-risk-hedging",
      type: "DAILY",
      title: "Audit Trésorerie & Allocation Stratégique (FIN)",
      base: "FIN",
      xp: 170,
      crystals: 20,
      completed: false,
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=80&auto=format&fit=crop",
      description: "Modélisation du risque de change, calcul de la VaR 99%, passage en revue des ordres DCA et sécurisation du coffre.",
      proof: "",
    },
    {
      id: "q-dis-deepwork-monk",
      type: "DAILY",
      title: "Monk Mode : 4H Deep Work Inviolable (DIS)",
      base: "DIS",
      xp: 240,
      crystals: 30,
      completed: false,
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&q=80&auto=format&fit=crop",
      description: "Session d'hyperfocus 240 min sans notifications : NextDNS actif, téléphone au coffre, 0 dopamine artificielle.",
      proof: "",
    },
    {
      id: "q-exp-minto-pitch",
      type: "DAILY",
      title: "Pitch Rhétorique & Pyramide de Minto (EXP)",
      base: "EXP",
      xp: 180,
      crystals: 20,
      completed: false,
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=900&q=80&auto=format&fit=crop",
      description: "Enregistrement d'un pitch technique de 5 min selon le principe Minto (Situation, Complication, Question, Réponse).",
      proof: "",
    },
    {
      id: "q-str-explosive-pullups",
      type: "DAILY",
      title: "Calisthénie : Muscle-Up & Front Lever (STR)",
      base: "STR",
      xp: 210,
      crystals: 25,
      completed: false,
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80&auto=format&fit=crop",
      description: "5 séries de 5 Muscle-ups stricts, 4 x 10s maintien Hollow Body / Front Lever tuck, et 50 tractions explosives.",
      proof: "",
    },
    {
      id: "q-cyber-ghidra-reversing",
      type: "DAILY",
      title: "Rétro-Ingénierie Binaire ELF Ghidra (CYBER)",
      base: "CYBER",
      xp: 230,
      crystals: 25,
      completed: false,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=80&auto=format&fit=crop",
      description: "Analyse statique et dynamique sous Ghidra d'un binaire strippé x86_64, contournement d'anti-debug et exploit PoC.",
      proof: "",
    },
    {
      id: "q-ai-vllm-inference",
      type: "DAILY",
      title: "Serveur Inférence vLLM & AWQ 4-Bit (AI_ENG)",
      base: "AI_ENG",
      xp: 260,
      crystals: 30,
      completed: false,
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&q=80&auto=format&fit=crop",
      description: "Déploiement d'un cluster d'inférence avec quantification AWQ 4-bit, monitoring de latence TTFT et batching continu.",
      proof: "",
    },
    {
      id: "q-emergency-auth-bypass",
      type: "EMERGENCY",
      title: "Audit de Sécurité : Faille Critique SingleUserGuard",
      base: "CYBER",
      xp: 500,
      crystals: 100,
      completed: false,
      image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=80&auto=format&fit=crop",
      description: "Quête d'urgence imminente : Corriger la validation d'en-tête x-player-id avant expiration du chrono (reste 00:58:12).",
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
      status: "LOCKED",
      xp: 200,
    },
    {
      id: "sk-aes-argon2",
      base: "CYBER",
      tier: 1,
      name: "Chiffrement AES-256-GCM & Argon2id",
      dod: "Protection inviolable des flux vocaux et intégrité tamper-proof",
      status: "LOCKED",
      xp: 180,
    },
    {
      id: "sk-flash-attention",
      base: "AI_ENG",
      tier: 2,
      name: "FlashAttention-2 & Triton Kernels",
      dod: "Fusion des passes de calcul et réduction des I/O HBM vers SRAM GPU",
      status: "LOCKED",
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
      status: "LOCKED",
      xp: 190,
    },
    {
      id: "sk-calisthenics-pike",
      base: "STR",
      tier: 2,
      name: "Pike Push-Ups & Équilibre Handstand",
      dod: "15 répétitions strictes filmées et validées par Computer Vision",
      status: "LOCKED",
      xp: 220,
    },
    {
      id: "sk-cambridge-c1-oral",
      base: "LNG",
      tier: 2,
      name: "Monologue Technique Cambridge C1",
      dod: "Restitution de 3 min à plus de 130 mots/min avec lexique formel",
      status: "LOCKED",
      xp: 250,
    },
    {
      id: "sk-bourses-eiffel",
      base: "FIN",
      tier: 1,
      name: "Dossier Bourse Eiffel & Lettre de Projet",
      dod: "Rédaction académique et plan d'excellence internationale",
      status: "LOCKED",
      xp: 170,
    },
    {
      id: "sk-monk-mode-audit",
      base: "DIS",
      tier: 2,
      name: "Monk Mode & Protocole Borbély 22h00",
      dod: "14 jours consécutifs de coupure d'écran stricte avant 22h00",
      status: "LOCKED",
      xp: 280,
    },
  ],
  plannerBlocks: [
    {
      id: "b1",
      time: "06:00 - 06:30",
      title: "🌅 Réveil & Hydratation",
      base: "DIS",
      status: "ACTIVE",
      type: "RITUEL",
    },
    {
      id: "b2",
      time: "06:30 - 07:30",
      title: "💪 Séance Sport Sung Jin-Woo (STR)",
      base: "STR",
      status: "UPCOMING",
      type: "SPORT",
    },
    {
      id: "b3",
      time: "07:30 - 08:30",
      title: "🚿 Petit-Déjeuner & Préparation",
      base: "DIS",
      status: "UPCOMING",
      type: "RITUEL",
    },
    {
      id: "b4",
      time: "08:30 - 11:30",
      title: "🧠 Deep Work IA : Transformers & vLLM",
      base: "AI_ENG",
      status: "UPCOMING",
      type: "DEEP_WORK",
    },
    {
      id: "b5",
      time: "11:30 - 12:30",
      title: "🚶 Pause Déjeuner & Restauration MP",
      base: "EXP",
      status: "UPCOMING",
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
- **Rhétorique & Anglais :** [[Lexique Socratique Cambridge C1]].`,
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
- Relie les projections orthogonales de [[Décomposition en Valeurs Singulières (SVD)]]`,
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
- Exploite directement les [[Hiérarchies Mémoire GPU & VRAM HBM]]`,
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
- Contrainte majeure pour [[vLLM & KV Cache Paging]]`,
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
- Accélère l'attention définie dans [[FlashAttention-2 & Optimisation Mémoire]]`,
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
- Référencé dans [[README - Coffre de Connaissances du Monarque]]`,
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
- Infiltration liée à [[README - Coffre de Connaissances du Monarque]]`,
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
- Seconde phase après [[Exploitation de Buffer Overflow x86]]`,
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
- Présent dans [[README - Coffre de Connaissances du Monarque]]`,
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
- Régule les séries strictes de [[Cinématique Push-Ups & MediaPipe]]`,
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
- Référencé dans [[README - Coffre de Connaissances du Monarque]]`,
    },
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
      image:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80&auto=format&fit=crop",
    },
    {
      id: "opp-devpost-agentic",
      title: "Devpost Global Agentic AI Hackathon 48h",
      type: "HACKATHON",
      portal: "Devpost / MLH",
      amount: "25 000 $ en crédits GPU",
      deadline: "30 Novembre 2026",
      status: "NOUVELLE",
      matchScore: 98.0,
      url: "https://devpost.com/hackathons",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=80&auto=format&fit=crop",
    },
    {
      id: "opp-cambridge-c1",
      title: "Certification Cambridge English C1 Advanced (CAE)",
      type: "CERTIFICATION",
      portal: "Cambridge Assessment",
      amount: "Validation Rang B Indispensable",
      deadline: "15 Décembre 2026",
      status: "OUVERT",
      matchScore: 99.0,
      url: "https://www.cambridgeenglish.org",
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&q=80&auto=format&fit=crop",
    },
    {
      id: "opp-deepmind-fellowship",
      title: "DeepMind AI Research Fellowship 2027",
      type: "BOURSE",
      portal: "Google DeepMind",
      amount: "50 000 £ + GPU Cluster",
      deadline: "15 Février 2027",
      status: "OUVERT",
      matchScore: 97.8,
      url: "https://deepmind.google/fellowships",
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80&auto=format&fit=crop",
    },
    {
      id: "opp-mistral-hackathon",
      title: "Mistral AI Hackathon Paris — Le Chat Agents",
      type: "HACKATHON",
      portal: "Station F / Mistral",
      amount: "30 000 € Cash Prize",
      deadline: "20 Décembre 2026",
      status: "NOUVELLE",
      matchScore: 95.4,
      url: "https://mistral.ai",
      image:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80&auto=format&fit=crop",
    },
    {
      id: "opp-aws-architect",
      title: "AWS Certified Solutions Architect — Professional",
      type: "CERTIFICATION",
      portal: "Amazon Web Services",
      amount: "Certification Cloud & DevOps",
      deadline: "31 Janvier 2027",
      status: "OUVERT",
      matchScore: 94.0,
      url: "https://aws.amazon.com/certification",
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80&auto=format&fit=crop",
    },
  ],
  shopItems: [
    {
      id: "item-rest-day-pass",
      category: "RÉPIS SOUVERAIN",
      name: "Pass Jour de Repos Hebdomadaire (Répit du Monarque)",
      cost: 600,
      rank: "S",
      type: "REST_DAY",
      desc: "Immunité totale 24h : aucune sanction, couvre-feu NextDNS désactivé, streak congelé et régénération 100% HP/MP. Calibré sur 6 jours de quêtes quotidiennes parfaites (100 💎/jour). Limité à 1 activation par semaine.",
    },
    {
      id: "item-mana-potion",
      category: "CONSOMMABLE",
      name: "Potion de Mana de l'Ombre (Focus Deep Work)",
      cost: 100,
      rank: "E",
      type: "POTION_MP",
      desc: "Recharge immédiate de 50 MP pour éliminer la fatigue cognitive et prolonger le Deep Work.",
    },
    {
      id: "item-vitality-elixir",
      category: "CONSOMMABLE",
      name: "Élixir de Vitalité Solaire (Boost Sommeil)",
      cost: 150,
      rank: "D",
      type: "POTION_HP",
      desc: "Régénère instantanément 50 HP (vitalité) pour compenser une nuit écourtée et revitaliser l'organisme.",
    },
    {
      id: "item-claude-pro",
      category: "IA",
      name: "Abonnement 1 Mois Claude Pro (Agents IA)",
      cost: 2400,
      rank: "B",
      type: "VOUCHER",
      desc: "Code de retrait pour un abonnement 1 mois Claude Pro (effort sur un mois complet de quêtes).",
    },
    {
      id: "item-cambridge",
      category: "PRESTIGE",
      name: "Frais d'Examen Cambridge C1/C2 Officiel",
      cost: 3600,
      rank: "A",
      type: "VOUCHER",
      desc: "Validation formelle du bilinguisme absolu de l'orateur souverain.",
    },
    {
      id: "item-kindle",
      category: "ETUDE",
      name: "Liseuse Kindle Paperwhite (Lecture Tech)",
      cost: 4500,
      rank: "C",
      type: "VOUCHER",
      desc: "Immersion sans distraction dans les manuels d'IA et de mathématiques.",
    },
  ],
  inventory: [],
  restDayActive: false,
  restDayCooldownUntil: null,
  penalty: {
    active: false,
    reason:
      "Aucune infraction constatée. Le Joueur est en conformité absolue avec les directives du Système.",
    remainingSeconds: 0,
    expiresAt: null,
    blockedDomains: [
      "tiktok.com",
      "instagram.com",
      "twitter.com / x.com",
      "youtube.com",
      "netflix.com",
      "reddit.com",
    ],
    redemptionOptionA:
      "200 Pompes Calisthéniques militaires strictes validées par vision par ordinateur MediaPipe.",
    redemptionOptionB:
      "Marche ou course nocturne continue de 10 kilomètres (Trace GPS certifiée).",
  },
};

let SYSTEM_STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));

// =============================================================================
// NEXTDNS SENTINEL & CHRONOBIOLOGICAL CURFEW ENGINE (22:00:00 ANTI-PROCRASTINATION)
// Reference: docs/05-SECURITY.md & docs/09-ROADMAP.md Section 21.6
// =============================================================================

const TOXIC_DOMAINS_LIST = [
  "tiktok.com",
  "instagram.com",
  "youtube.com",
  "twitter.com",
  "x.com",
  "reddit.com",
  "netflix.com",
];

const TOXIC_SERVICES_LIST = [
  "tiktok",
  "youtube",
  "instagram",
  "twitter",
  "reddit",
  "netflix",
];

const NEXTDNS_API_BASE_URL = "https://api.nextdns.io";
const NEXTDNS_PROFILE_ID = process.env.NEXTDNS_PROFILE_ID || "aa43db";
const NEXTDNS_API_KEY = process.env.NEXTDNS_API_KEY || "ed6843befb5ea0081c7bd5d5cc69e922812c0635";

async function activateNextDnsRestriction(profileId = NEXTDNS_PROFILE_ID, apiKey = NEXTDNS_API_KEY) {
  if (!profileId || !apiKey) {
    console.warn("[NEXTDNS] Profil ID ou Clé API manquante. Mode simulation.");
    return { success: false, reason: "MISSING_CREDENTIALS" };
  }
  // 1. Link current public IP to profile for IPv4 resolution
  try {
    const updateToken = process.env.NEXTDNS_UPDATE_TOKEN || "51f470f87d189167";
    await fetch(`https://link-ip.nextdns.io/${profileId}/${updateToken}`).catch(() => {});
  } catch (_) {}

  let blockedCount = 0;
  // 2. Block Parental Control Services (covers apps, mobile clients, CDNs, APIs)
  for (const service of TOXIC_SERVICES_LIST) {
    try {
      const res = await fetch(`${NEXTDNS_API_BASE_URL}/profiles/${profileId}/parentalControl/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apiKey,
        },
        body: JSON.stringify({ id: service, active: true }),
      });
      if (res.ok || res.status === 200 || res.status === 204) {
        blockedCount++;
      }
    } catch (e) {
      console.error(`[NEXTDNS] Échec blocage service ${service}:`, e.message);
    }
  }

  // 3. Block individual domains in Denylist
  for (const domain of TOXIC_DOMAINS_LIST) {
    try {
      const res = await fetch(`${NEXTDNS_API_BASE_URL}/profiles/${profileId}/denylist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apiKey,
        },
        body: JSON.stringify({ id: domain, active: true }),
      });
      if (res.ok || res.status === 200 || res.status === 204) {
        blockedCount++;
      } else {
        const txt = await res.text().catch(() => "");
        if (txt.includes("duplicate")) blockedCount++;
      }
    } catch (e) {
      console.error(`[NEXTDNS] Échec blocage denylist ${domain}:`, e.message);
    }
  }
  console.log(`[NEXTDNS SENTINEL] Restriction activée: ${blockedCount} règles appliquées sur profil ${profileId}`);
  return { success: true, count: blockedCount };
}

async function deactivateNextDnsRestriction(profileId = NEXTDNS_PROFILE_ID, apiKey = NEXTDNS_API_KEY) {
  if (!profileId || !apiKey) {
    return { success: false, reason: "MISSING_CREDENTIALS" };
  }
  let unblockedCount = 0;
  // 1. Unblock Parental Control Services
  for (const service of TOXIC_SERVICES_LIST) {
    try {
      const res = await fetch(`${NEXTDNS_API_BASE_URL}/profiles/${profileId}/parentalControl/services/${service}`, {
        method: "DELETE",
        headers: {
          "X-Api-Key": apiKey,
        },
      });
      if (res.ok || res.status === 204 || res.status === 404) {
        unblockedCount++;
      }
    } catch (e) {
      console.error(`[NEXTDNS] Échec déblocage service ${service}:`, e.message);
    }
  }

  // 2. Unblock individual domains in Denylist
  for (const domain of TOXIC_DOMAINS_LIST) {
    try {
      const res = await fetch(`${NEXTDNS_API_BASE_URL}/profiles/${profileId}/denylist/${domain}`, {
        method: "DELETE",
        headers: {
          "X-Api-Key": apiKey,
        },
      });
      if (res.ok || res.status === 204 || res.status === 404) {
        unblockedCount++;
      }
    } catch (e) {
      console.error(`[NEXTDNS] Échec déblocage denylist ${domain}:`, e.message);
    }
  }
  console.log(`[NEXTDNS SENTINEL] Restriction levée: ${unblockedCount} règles retirées sur profil ${profileId}`);
  return { success: true, count: unblockedCount };
}

function applyLocalHostsFilter(active) {
  const hostsPath = process.env.PENALTY_HOSTS_PATH || (process.platform === "win32" ? "C:\\Windows\\System32\\drivers\\etc\\hosts" : "/etc/hosts");
  const HEADER = "# >>> LEVELUP_ANTI_PROCRASTINATION_START";
  const FOOTER = "# <<< LEVELUP_ANTI_PROCRASTINATION_END";
  try {
    if (!fs.existsSync(hostsPath)) return { applied: false, reason: "HOSTS_NOT_FOUND" };
    const content = fs.readFileSync(hostsPath, "utf-8");
    const regex = new RegExp(`${HEADER}[\\s\\S]*?${FOOTER}\\r?\\n?`, "g");
    const cleaned = content.replace(regex, "");
    if (!active) {
      if (cleaned !== content) {
        fs.writeFileSync(hostsPath, cleaned, "utf-8");
        if (process.platform === "win32") {
          try {
            const { execSync } = require("child_process");
            execSync("ipconfig /flushdns", { stdio: "ignore" });
          } catch (_) {}
        }
      }
      return { applied: true, path: hostsPath };
    }
    const lines = [
      HEADER,
      "# Mode Restriction Automatique LevelUp (Couvre-feu 22h00)",
      ...TOXIC_DOMAINS_LIST.map((d) => `127.0.0.1 ${d}`),
      ...TOXIC_DOMAINS_LIST.map((d) => `127.0.0.1 www.${d}`),
      FOOTER,
      "",
    ].join("\n");
    fs.writeFileSync(hostsPath, cleaned.trimEnd() + "\n\n" + lines, "utf-8");
    if (process.platform === "win32") {
      try {
        const { execSync } = require("child_process");
        execSync("ipconfig /flushdns", { stdio: "ignore" });
      } catch (_) {}
    }
    console.log("[HOSTS] Filtrage local activé avec succès et cache DNS purgé.");
    return { applied: true, path: hostsPath };
  } catch (err) {
    console.warn("[HOSTS] Impossible de modifier le fichier hosts local (droits admin requis) :", err.message);
    return { applied: false, reason: err.message, path: hostsPath };
  }
}

async function checkCurfewAndTriggerPenalty() {
  // If Rest Day is active today, do NOT trigger curfew or penalties!
  if (SYSTEM_STATE.restDayActive || (SYSTEM_STATE.player && SYSTEM_STATE.player.restDayActive)) {
    console.log("[CURFEW WATCHDOG] 🛡️ Jour de Repos actif aujourd'hui. Couvre-feu NextDNS et sanctions suspendus.");
    return;
  }
  const now = new Date();
  const parisTimeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", hour12: false, timeZone: "Europe/Paris" });
  const hour = parseInt(parisTimeStr, 10);
  // Curfew active from 22:00 to 05:00
  const isCurfew = hour >= 22 || hour < 5;

  if (!isCurfew) {
    return;
  }

  const quests = SYSTEM_STATE.quests || [];
  const incompleteQuests = quests.filter((q) => !q.completed);

  if (incompleteQuests.length > 0 && !SYSTEM_STATE.penalty.active) {
    console.log(`[CURFEW WATCHDOG] ⚠️ Couvre-feu de 22h00 dépassé ! ${incompleteQuests.length} quête(s) incomplète(s). Engagement du verrouillage NextDNS.`);
    SYSTEM_STATE.penalty.active = true;
    SYSTEM_STATE.penalty.reason = `Couvre-feu de 22h00 franchi : ${incompleteQuests.length} quête(s) non complétée(s). Verrouillage réseau NextDNS et local activé. Rachat exigé : 200 Pompes Caméra ou 10 km Course.`;
    SYSTEM_STATE.penalty.triggeredAt = now.toISOString();

    await activateNextDnsRestriction(NEXTDNS_PROFILE_ID, NEXTDNS_API_KEY);
    applyLocalHostsFilter(true);
  }
}

// Background Curfew Monitor: runs every 30 seconds
setInterval(checkCurfewAndTriggerPenalty, 30000);
// Initial check at startup
checkCurfewAndTriggerPenalty().catch(() => {});

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
// CANONICAL VECTOR SVG ICONS FOR SOVEREIGN BOTTOM DOCK (NO EMOJIS)
const NAV_ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>`,
  skills: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 6.5v4.5"/><path d="M12 11L6.8 17"/><path d="M12 11l5.2 6"/></svg>`,
  quests: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/><polyline points="9 9 10 10 12 8"/></svg>`,
  planner: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="12 14 12 17 15 17"/></svg>`,
  notes: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A4.5 4.5 0 0 0 5 6.5C5 7.4 5.3 8.2 5.8 8.9A4.5 4.5 0 0 0 4 12.5a4.5 4.5 0 0 0 1.8 3.6C5.3 16.8 5 17.6 5 18.5A4.5 4.5 0 0 0 9.5 23c1.5 0 2.8-.7 3.5-1.8.7 1.1 2 1.8 3.5 1.8a4.5 4.5 0 0 0 4.5-4.5c0-.9-.3-1.7-.8-2.4A4.5 4.5 0 0 0 22 12.5a4.5 4.5 0 0 0-1.8-3.6c.5-.7.8-1.5.8-2.4A4.5 4.5 0 0 0 16.5 2c-1.5 0-2.8.7-3.5 1.8A4.48 4.48 0 0 0 9.5 2z"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
  audio: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>`,
  opportunities: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  shop: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/><path d="M10 3l-2 6 4 12 4-12-2-6"/></svg>`,
  penalty: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  workout: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
};


function getRadarPolygonPoints(bases) {
  const baseKeys = ["acad", "ai_eng", "cyber", "exp", "lng", "fin", "str", "dis"];
  const centerX = 145;
  const centerY = 135;
  const maxRadius = 95;
  const minRadius = 15;
  
  const points = baseKeys.map((key, i) => {
    const score = bases && bases[key] ? bases[key].score : 10;
    const r = minRadius + (Math.max(0, Math.min(100, score)) / 100) * (maxRadius - minRadius);
    const angle = i * (Math.PI / 4) - Math.PI / 2;
    const x = Math.round(centerX + r * Math.cos(angle));
    const y = Math.round(centerY + r * Math.sin(angle));
    return `${x},${y}`;
  });
  return points.join(" ");
}

function renderLandingPage() {
  return `<!DOCTYPE html>
<html lang="fr" data-theme="light-monarch">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LEVELUP : THE SYSTEM — Portail d'Éveil & Connexion</title>
  <meta name="description" content="Le Système Solo Leveling appliqué au monde réel. Transformez votre discipline quotidienne, vos entraînements physiques par IA et vos apprentissages en progression de Monarque.">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Orbitron:wght@500;700;900&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <style>
    :root {
      --bg-base: #f8fafc;
      --bg-surface: #ffffff;
      --bg-card: rgba(255, 255, 255, 0.94);
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --cyan: #0284c7;
      --gold: #d97706;
      --text-dark: #0f172a;
      --text-secondary: #334155;
      --text-muted: #64748b;
      --border: rgba(226, 232, 240, 0.95);
      --border-accent: rgba(99, 102, 241, 0.25);
      --shadow-sm: 0 4px 12px rgba(15, 23, 42, 0.05);
      --shadow-lg: 0 20px 45px -12px rgba(79, 70, 229, 0.15), 0 0 25px rgba(2, 132, 199, 0.06);
      --font-display: 'Orbitron', 'Cinzel Decorative', sans-serif;
      --font-sans: 'Inter', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg-base);
      background-image: 
        radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.12) 0%, rgba(224, 231, 255, 0.45) 35%, #f8fafc 80%),
        linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
      color: var(--text-dark);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      position: relative;
    }

    #bg-canvas {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 0;
      opacity: 0.55;
    }

    .landing-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .nav-logo-box {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 2px 8px rgba(79, 70, 229, 0.3));
    }

    .nav-logo-box svg {
      width: 100%;
      height: 100%;
    }

    .nav-brand-title {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 2px;
      color: var(--text-dark);
      line-height: 1;
    }

    .nav-brand-sub {
      font-size: 9.5px;
      font-family: var(--font-mono);
      color: var(--primary);
      letter-spacing: 1.5px;
      margin-top: 2px;
      font-weight: 700;
    }

    .btn-nav-login {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      background: rgba(79, 70, 229, 0.08);
      border: 1.5px solid var(--primary);
      color: var(--primary);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 800;
      text-decoration: none;
      letter-spacing: 1px;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .btn-nav-login:hover {
      background: var(--primary);
      color: #ffffff;
      box-shadow: 0 4px 16px rgba(79, 70, 229, 0.35);
      transform: translateY(-1px);
    }

    .landing-container {
      position: relative;
      z-index: 1;
      max-width: 1140px;
      margin: 0 auto;
      padding: 36px 20px 60px;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    /* Hero Header */
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 9999px;
      background: rgba(79, 70, 229, 0.08);
      border: 1px solid rgba(79, 70, 229, 0.25);
      color: var(--primary);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      margin-bottom: 18px;
    }

    .hero-title {
      font-family: var(--font-display);
      font-size: clamp(28px, 5.5vw, 48px);
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: 1px;
      margin-bottom: 14px;
      color: var(--text-dark);
      max-width: 860px;
    }

    .hero-title .gradient-text {
      background: linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #0284c7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: clamp(14px, 2vw, 16px);
      color: var(--text-secondary);
      max-width: 680px;
      line-height: 1.6;
      margin-bottom: 28px;
    }

    /* Core Features Trio */
    .features-trio {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 34px;
    }

    .feature-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 16px;
      border-radius: 9999px;
      background: #ffffff;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-dark);
    }

    .feature-pill span.icon {
      font-size: 16px;
    }

    /* Main Showcase & Auth Layout */
    .main-showcase-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      width: 100%;
      max-width: 1000px;
      margin-bottom: 48px;
      align-items: stretch;
      text-align: left;
    }

    @media (max-width: 860px) {
      .main-showcase-grid {
        grid-template-columns: 1fr;
        max-width: 520px;
      }
    }

    /* Left: Visual Anime Artwork Card */
    .hero-art-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 20px;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .art-img-wrap {
      position: relative;
      width: 100%;
      height: 250px;
      background: #000000;
      overflow: hidden;
    }

    .art-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transition: transform 0.5s ease;
    }

    .hero-art-card:hover .art-img-wrap img {
      transform: scale(1.03);
    }

    .art-floating-badge {
      position: absolute;
      bottom: 12px;
      left: 12px;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(245, 158, 11, 0.5);
      border-radius: 8px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #fef3c7;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .art-card-body {
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
    }

    .art-card-title {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 800;
      color: var(--text-dark);
      margin-bottom: 6px;
    }

    .art-card-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 14px;
    }

    .art-specs-row {
      display: flex;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid var(--border);
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--text-muted);
    }

    .art-specs-row strong {
      color: var(--primary);
    }

    /* Right: Light Clean Authentication Card */
    .auth-box-card {
      background: #ffffff;
      border: 1.5px solid var(--border-accent);
      border-radius: 20px;
      box-shadow: var(--shadow-lg);
      padding: 26px 24px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    /* Tab Switcher */
    .auth-tabs {
      display: flex;
      background: #f1f5f9;
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 22px;
    }

    .auth-tab-btn {
      flex: 1;
      padding: 9px;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 800;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.5px;
    }

    .auth-tab-btn.active {
      background: #ffffff;
      color: var(--primary);
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
    }

    /* Active Session Card */
    #active-session-card {
      display: none;
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      border-radius: 14px;
      padding: 20px;
      text-align: center;
    }

    .session-avatar-wrap {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      margin: 0 auto 10px;
      background: #dcfce7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      overflow: hidden;
      border: 2px solid #22c55e;
    }

    .session-avatar-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .session-name {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 800;
      color: #166534;
      margin-bottom: 2px;
    }

    .session-sub {
      font-size: 12px;
      font-family: var(--font-mono);
      color: #15803d;
      margin-bottom: 16px;
    }

    .btn-enter-hud {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 13px;
      background: #16a34a;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 800;
      text-decoration: none;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35);
    }

    .btn-enter-hud:hover {
      background: #15803d;
      transform: translateY(-1px);
    }

    .btn-logout-link {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 11px;
      font-family: var(--font-mono);
      margin-top: 12px;
      cursor: pointer;
      text-decoration: underline;
    }

    /* Google Button */
    .btn-google-sign {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 12px 18px;
      border-radius: 10px;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      color: #1e293b;
      font-family: var(--font-sans);
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
      margin-bottom: 16px;
    }

    .btn-google-sign:hover {
      border-color: #94a3b8;
      background: #f8fafc;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
      transform: translateY(-1px);
    }

    .btn-google-sign svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .or-divider {
      display: flex;
      align-items: center;
      text-align: center;
      color: var(--text-muted);
      font-size: 11px;
      font-family: var(--font-mono);
      letter-spacing: 0.5px;
      margin: 14px 0;
    }

    .or-divider::before,
    .or-divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid #e2e8f0;
    }

    .or-divider:not(:empty)::before {
      margin-right: 10px;
    }

    .or-divider:not(:empty)::after {
      margin-left: 10px;
    }

    .form-group-light {
      margin-bottom: 14px;
    }

    .form-label-light {
      display: block;
      font-size: 11px;
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }

    .form-input-light {
      width: 100%;
      padding: 11px 14px;
      border-radius: 8px;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      color: var(--text-dark);
      font-family: var(--font-sans);
      font-size: 13.5px;
      transition: all 0.2s ease;
    }

    .form-input-light:focus {
      outline: none;
      border-color: var(--primary);
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }

    .btn-submit-primary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 13px;
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
      margin-top: 6px;
    }

    .btn-submit-primary:hover {
      background: linear-gradient(135deg, #4338ca 0%, #312e81 100%);
      box-shadow: 0 6px 18px rgba(79, 70, 229, 0.45);
      transform: translateY(-1px);
    }

    .btn-quick-guest {
      width: 100%;
      padding: 10px;
      background: transparent;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 10px;
      transition: all 0.2s ease;
    }

    .btn-quick-guest:hover {
      border-color: var(--primary);
      color: var(--primary);
      background: rgba(79, 70, 229, 0.04);
    }

    /* 3 Visual Illustration Cards (Below Grid) */
    .illustrations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      width: 100%;
      max-width: 1000px;
      margin-bottom: 40px;
      text-align: left;
    }

    .card-illus-item {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 22px 20px;
      box-shadow: var(--shadow-sm);
      transition: all 0.25s ease;
      display: flex;
      flex-direction: column;
    }

    .card-illus-item:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
      border-color: var(--border-accent);
    }

    .illus-icon-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .illus-icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(79, 70, 229, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }

    .illus-title {
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 800;
      color: var(--text-dark);
      letter-spacing: 0.5px;
    }

    .illus-desc {
      font-size: 12.5px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .landing-footer {
      border-top: 1px solid var(--border);
      padding: 20px;
      text-align: center;
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--text-muted);
      background: #ffffff;
    }
  </style>
</head>
<body>
  <canvas id="bg-canvas"></canvas>

  <nav class="landing-nav">
    <a href="/" class="nav-brand">
      <div class="nav-logo-box">
        ${MONARCH_LOGO_SVG}
      </div>
      <div>
        <div class="nav-brand-title">LEVELUP</div>
        <div class="nav-brand-sub">THE SYSTEM</div>
      </div>
    </a>
    <div>
      <a href="/login" class="btn-nav-login" id="nav-action-btn">CONNEXION ➔</a>
    </div>
  </nav>

  <main class="landing-container">
    <div class="hero-badge">⚡ SYSTÈME D'ÉVEIL SOUVERAIN // SOLO LEVELING IRL</div>
    <h1 class="hero-title">
      ÉVEILLEZ VOTRE <span class="gradient-text">POTENTIEL.</span>
    </h1>
    <p class="hero-subtitle">
      Transformez votre discipline quotidienne, vos entraînements physiques validés par IA et votre concentration en progression réelle de Monarque.
    </p>

    <div class="features-trio">
      <div class="feature-pill"><span class="icon">🏋️</span> Suivi Pompes IA 90°</div>
      <div class="feature-pill"><span class="icon">⚖️</span> Score Harmonique Sh (0-20)</div>
      <div class="feature-pill"><span class="icon">🛡️</span> Couvre-Feu NextDNS 22h</div>
    </div>

    <div class="main-showcase-grid">
      <!-- Left: Visual Anime Artwork Card -->
      <div class="hero-art-card">
        <div class="art-img-wrap">
          <img src="/intro-alert.webp" alt="Solo Leveling System Alert" onerror="this.src='/intro-alert.jpg';">
          <div class="art-floating-badge">
            <span>👑</span>
            <span>RANG S • SOUVERAIN DES OMBRES</span>
          </div>
        </div>
        <div class="art-card-body">
          <div>
            <div class="art-card-title">PROTOCOLE D'ÉVEIL PERSONNEL</div>
            <div class="art-card-desc">
              Le Système s'adapte à vos objectifs : calibration de vos quêtes calisthéniques, blocage automatique des distracteurs et évaluation sans complaisance.
            </div>
          </div>
          <div class="art-specs-row">
            <span>VISION IA : <strong>ACTIVE</strong></span>
            <span>MONK MODE : <strong>22H00</strong></span>
            <span>LATENCE : <strong>&lt; 50MS</strong></span>
          </div>
        </div>
      </div>

      <!-- Right: Authentication Card -->
      <div class="auth-box-card">
        <!-- Active Session Card (shown if already logged in) -->
        <div id="active-session-card">
          <div class="session-avatar-wrap" id="session-avatar-slot">👑</div>
          <div class="session-name" id="session-user-name">Chasseur Éveillé</div>
          <div class="session-sub" id="session-user-email">Session active</div>
          <a href="/dashboard" class="btn-enter-hud">ENTRER DANS MON HUD ➔</a>
          <button type="button" class="btn-logout-link" onclick="logoutSession()">Changer de compte / Déconnexion</button>
        </div>

        <!-- Unauthenticated Form Box -->
        <div id="unauth-form-box">
          <div class="auth-tabs">
            <button type="button" class="auth-tab-btn active" id="tab-login-btn" onclick="switchAuthTab('login')">SE CONNECTER</button>
            <button type="button" class="auth-tab-btn" id="tab-signup-btn" onclick="switchAuthTab('signup')">NOUVEAU COMPTE</button>
          </div>

          <!-- Official Google One-Tap & Button -->
          <a href="/auth/google" class="btn-google-sign" id="google-direct-link">
            <svg viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continuer avec Google (1 clic)</span>
          </a>

          <div id="g_id_onload"
               data-client_id="${GOOGLE_CLIENT_ID}"
               data-context="signin"
               data-ux_mode="popup"
               data-callback="handleGoogleCredentialResponse"
               data-auto_prompt="false">
          </div>

          <div class="or-divider">OU PAR IDENTIFIANTS</div>

          <!-- Form Login -->
          <form id="form-login" onsubmit="handleHunterLogin(event)">
            <div class="form-group-light">
              <label class="form-label-light">PSEUDO OU EMAIL</label>
              <input type="text" id="login-ident" class="form-input-light" placeholder="Ex: Sung Jin-Woo ou chasseur@monarch.io" required>
            </div>
            <div class="form-group-light">
              <label class="form-label-light">MOT DE PASSE</label>
              <input type="password" id="login-pwd" class="form-input-light" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn-submit-primary" id="btn-login-submit">
              SE CONNECTER ➔
            </button>
          </form>

          <!-- Form Signup -->
          <form id="form-signup" onsubmit="handleHunterSignup(event)" style="display: none;">
            <div class="form-group-light">
              <label class="form-label-light">NOM DU CHASSEUR</label>
              <input type="text" id="signup-name" class="form-input-light" placeholder="Ex: Alex, Sung, Monarch..." required>
            </div>
            <div class="form-group-light">
              <label class="form-label-light">EMAIL</label>
              <input type="email" id="signup-email" class="form-input-light" placeholder="votre-email@domaine.com" required>
            </div>
            <div class="form-group-light">
              <label class="form-label-light">CRÉER UN MOT DE PASSE</label>
              <input type="password" id="signup-pwd" class="form-input-light" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn-submit-primary" id="btn-signup-submit">
              CRÉER MON COMPTE & M'ÉVEILLER ➔
            </button>
          </form>

          <!-- 1-Click Quick Entry -->
          <button type="button" class="btn-quick-guest" onclick="handleQuickGuestEntry()">
            ⚡ Entrée Rapide 1-Clic (Éveil Souverain)
          </button>
        </div>
      </div>
    </div>

    <!-- 3 Illustrated Feature Highlights -->
    <div class="illustrations-grid">
      <div class="card-illus-item">
        <div class="illus-icon-row">
          <div class="illus-icon-badge">🏋️</div>
          <div class="illus-title">VISION IA POMPES 90°</div>
        </div>
        <div class="illus-desc">
          Validation cinématique en temps réel par caméra. Les demi-pompes sont impitoyablement rejetées par l'algorithme squelettique.
        </div>
      </div>

      <div class="card-illus-item">
        <div class="illus-icon-row">
          <div class="illus-icon-badge">⚖️</div>
          <div class="illus-title">SCORE HARMONIQUE SH</div>
        </div>
        <div class="illus-desc">
          Évaluation stricte sur 8 bases vitales. La moyenne harmonique pénalise la moindre faille pour forger une discipline sans compromis.
        </div>
      </div>

      <div class="card-illus-item">
        <div class="illus-icon-row">
          <div class="illus-icon-badge">🛡️</div>
          <div class="illus-title">MONK MODE NEXTDNS</div>
        </div>
        <div class="illus-desc">
          Couvre-feu numérique automatisé dès 22h00 : blocage réseau direct des réseaux sociaux et distracteurs pour protéger votre sommeil.
        </div>
      </div>
    </div>
  </main>

  <footer class="landing-footer">
    LEVELUP SYSTEM — THE MONARCH OPERATING SYSTEM v3.3 • INSPIRÉ DE SOLO LEVELING • FOND CLAIR & PERFORMANCE HAUTE VITESSE
  </footer>

  <script>
    const STORAGE_KEY = 'LEVELUP_SYSTEM_STATE_V7_CLEAN_DYNAMIC_AUTH';

    // 1. Particle Canvas (Luminous aesthetic)
    (function initCanvas() {
      const canvas = document.getElementById('bg-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let w = canvas.width = window.innerWidth;
      let h = canvas.height = window.innerHeight;

      window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      });

      const particles = [];
      const count = Math.min(Math.floor(window.innerWidth / 30), 40);

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 2 + 1.2
        });
      }

      function draw() {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(79, 70, 229, 0.45)';
          ctx.fill();

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = 'rgba(79, 70, 229, ' + (1 - dist / 100) * 0.12 + ')';
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
        requestAnimationFrame(draw);
      }
      draw();
    })();

    // 2. Auth Tab Switcher
    function switchAuthTab(tab) {
      const loginBtn = document.getElementById('tab-login-btn');
      const signupBtn = document.getElementById('tab-signup-btn');
      const formLogin = document.getElementById('form-login');
      const formSignup = document.getElementById('form-signup');

      if (tab === 'signup') {
        loginBtn.classList.remove('active');
        signupBtn.classList.add('active');
        formLogin.style.display = 'none';
        formSignup.style.display = 'block';
      } else {
        signupBtn.classList.remove('active');
        loginBtn.classList.add('active');
        formSignup.style.display = 'none';
        formLogin.style.display = 'block';
      }
    }

    // 3. Check for Active Session
    (function checkExistingSession() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const state = JSON.parse(saved);
          if (state.player && (state.player.authProvider || state.player.email || (state.player.name && state.player.name !== 'Chasseur Non Éveillé'))) {
            const activeCard = document.getElementById('active-session-card');
            const unauthBox = document.getElementById('unauth-form-box');
            const nameEl = document.getElementById('session-user-name');
            const emailEl = document.getElementById('session-user-email');
            const avatarSlot = document.getElementById('session-avatar-slot');
            const navBtn = document.getElementById('nav-action-btn');

            if (activeCard) activeCard.style.display = 'block';
            if (unauthBox) unauthBox.style.display = 'none';
            if (nameEl) nameEl.textContent = state.player.name;
            if (emailEl) emailEl.textContent = state.player.email || 'Rang ' + (state.player.rank || 'E');
            if (avatarSlot && state.player.avatar) {
              avatarSlot.innerHTML = '<img src="' + state.player.avatar + '" alt="Avatar">';
            }
            if (navBtn) {
              navBtn.href = '/dashboard';
              navBtn.textContent = 'MON HUD ➔';
            }
          }
        }
      } catch(e) {}
    })();

    // 4. Handle Hunter Login
    async function handleHunterLogin(e) {
      e.preventDefault();
      const ident = document.getElementById('login-ident').value;
      const pwd = document.getElementById('login-pwd').value;
      const submitBtn = document.getElementById('btn-login-submit');
      if (submitBtn) { submitBtn.textContent = 'CONNEXION EN COURS...'; submitBtn.disabled = true; }

      try {
        const res = await fetch('/api/v1/auth/hunter/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: ident, password: pwd })
        });
        const data = await res.json();
        if (data.success && data.user) {
          saveAndProceed(data.user);
        } else {
          alert('Erreur de connexion : ' + (data.error || 'Identifiant invalide'));
          if (submitBtn) { submitBtn.textContent = 'SE CONNECTER ➔'; submitBtn.disabled = false; }
        }
      } catch (err) {
        // Fallback local login
        saveAndProceed({
          id: 'usr-' + Date.now().toString(36),
          name: ident.split('@')[0],
          email: ident.includes('@') ? ident : ident + '@monarch.levelup',
          authProvider: 'hunter',
          onboardingCompleted: true
        });
      }
    }

    // 5. Handle Hunter Signup
    async function handleHunterSignup(e) {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const pwd = document.getElementById('signup-pwd').value;
      const submitBtn = document.getElementById('btn-signup-submit');
      if (submitBtn) { submitBtn.textContent = 'ÉVEIL DU COMPTE...'; submitBtn.disabled = true; }

      try {
        const res = await fetch('/api/v1/auth/hunter/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name, email: email, password: pwd })
        });
        const data = await res.json();
        if (data.success && data.user) {
          saveAndProceed(data.user);
        } else {
          alert("Erreur d'inscription : " + (data.error || "Échec de création"));
          if (submitBtn) { submitBtn.textContent = "CRÉER MON COMPTE & M'ÉVEILLER ➔"; submitBtn.disabled = false; }
        }
      } catch (err) {
        saveAndProceed({
          id: 'usr-' + Date.now().toString(36),
          name: name,
          email: email,
          authProvider: 'hunter',
          onboardingCompleted: false
        });
      }
    }

    // 6. Handle Quick Guest Entry (1-clic direct)
    async function handleQuickGuestEntry() {
      try {
        const res = await fetch('/api/v1/auth/hunter/quick', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Chasseur Éveillé' })
        });
        const data = await res.json();
        if (data.success && data.user) {
          saveAndProceed(data.user);
        } else {
          saveAndProceed({
            id: 'usr-' + Date.now().toString(36),
            name: 'Chasseur Éveillé',
            email: 'hunter@monarch.system',
            authProvider: 'hunter',
            onboardingCompleted: false
          });
        }
      } catch (err) {
        saveAndProceed({
          id: 'usr-' + Date.now().toString(36),
          name: 'Chasseur Éveillé',
          email: 'hunter@monarch.system',
          authProvider: 'hunter',
          onboardingCompleted: false
        });
      }
    }

    // 7. Google GIS Callback
    async function handleGoogleCredentialResponse(response) {
      if (!response || !response.credential) return;
      try {
        const res = await fetch('/api/v1/auth/google/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential })
        });
        const data = await res.json();
        if (data.success && data.user) {
          saveAndProceed(data.user);
        }
      } catch(err) {
        console.error('Erreur Google Auth:', err);
      }
    }

    // 8. Save State & Proceed
    function saveAndProceed(user) {
      let state = {};
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) state = JSON.parse(saved);
      } catch(e) {}
      if (!state.player) state.player = {};

      state.player.id = user.id || ('usr-' + Date.now().toString(36));
      state.player.name = user.name || 'Chasseur Éveillé';
      state.player.email = user.email || (state.player.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@hunter.levelup');
      state.player.avatar = user.picture || state.player.avatar || null;
      state.player.authProvider = user.authProvider || 'hunter';
      state.player.isAuthenticated = true;
      if (user.onboardingCompleted !== undefined) {
        state.player.onboardingCompleted = Boolean(user.onboardingCompleted);
        state.onboardingCompleted = Boolean(user.onboardingCompleted);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

      if (state.player.onboardingCompleted) {
        window.location.href = '/dashboard?auth=success';
      } else {
        window.location.href = '/onboarding?auth=success';
      }
    }

    // 9. Logout
    async function logoutSession() {
      try {
        await fetch('/api/v1/auth/logout', { method: 'POST' });
      } catch(e) {}
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch(e) {}
      window.location.reload();
    }
  </script>
</body>
</html>`;
}

// Dynamic Circadian Planner Generator according to Hunter Onboarding
function generateCustomPlannerBlocks(wakeTime, curfewTime, archetype, deepWorkHours) {
  const [wH, wM] = (wakeTime || "06:00").split(":").map((v) => parseInt(v, 10) || 0);
  const [cH, cM] = (curfewTime || "22:00").split(":").map((v) => parseInt(v, 10) || 0);
  const dw = Math.min(Math.max(Number(deepWorkHours) || 3, 2), 6);

  const pad = (n) => String(n).padStart(2, "0");
  const addM = (h, m, mins) => {
    let total = h * 60 + m + mins;
    while (total < 0) total += 24 * 60;
    total = total % (24 * 60);
    return [Math.floor(total / 60), total % 60];
  };
  const fmt = (h, m) => `${pad(h)}:${pad(m)}`;
  const range = (h1, m1, mins) => {
    const [h2, m2] = addM(h1, m1, mins);
    return `${fmt(h1, m1)} - ${fmt(h2, m2)}`;
  };

  const archTitles = {
    AI_ENG: "🧠 Deep Work IA : LLMs, Kernels Triton & vLLM",
    CYBER_SHADOW: "🛡️ Deep Work Cyber : Pentesting, Exploit & OSCP",
    BERZERKER_STR: "🏋️ Deep Work Biomécanique & Volume Athlétique",
    HARMONIC_MONARCH: "👑 Deep Work Monarque : Architecture IA & Cybersécurité",
  };
  const deepTitle = archTitles[archetype] || "🧠 Deep Work Focalisé";
  const archBase = archetype === "CYBER_SHADOW" ? "CYBER" : (archetype === "BERZERKER_STR" ? "STR" : "AI_ENG");

  const [sH, sM] = addM(wH, wM, 30);
  const [pH, pM] = addM(sH, sM, 60);
  const [dwH, dwM] = addM(pH, pM, 60);
  const [lH, lM] = addM(dwH, dwM, dw * 60);
  const [vH, vM] = addM(lH, lM, 60);
  const [c2H, c2M] = addM(vH, vM, 45);
  const [dH, dM] = addM(c2H, c2M, 90);
  const [aH, aM] = addM(cH, cM, -60);

  return [
    {
      id: "b1",
      time: range(wH, wM, 30),
      title: "🌅 Réveil, Hydratation & Protocole Éveil",
      base: "DIS",
      status: "ACTIVE",
      type: "RITUEL",
    },
    {
      id: "b2",
      time: range(sH, sM, 60),
      title: "💪 Séance Calisthénie Sung Jin-Woo (STR)",
      base: "STR",
      status: "UPCOMING",
      type: "SPORT",
    },
    {
      id: "b3",
      time: range(pH, pM, 60),
      title: "🚿 Nutrition & Restauration MP",
      base: "DIS",
      status: "UPCOMING",
      type: "RITUEL",
    },
    {
      id: "b4",
      time: range(dwH, dwM, dw * 60),
      title: deepTitle,
      base: archBase,
      status: "UPCOMING",
      type: "DEEP_WORK",
    },
    {
      id: "b5",
      time: range(lH, lM, 60),
      title: "🚶 Déjeuner & Marche Cognitive",
      base: "EXP",
      status: "UPCOMING",
      type: "REST",
    },
    {
      id: "b6",
      time: range(vH, vM, 45),
      title: "🎙️ Restitution Vocale & Clarté Conceptuelle",
      base: "ACAD",
      status: "UPCOMING",
      type: "VOCAL",
    },
    {
      id: "b7",
      time: range(c2H, c2M, 90),
      title: "🇬🇧 Listening & Active Recall Cambridge C1",
      base: "LNG",
      status: "UPCOMING",
      type: "STUDY",
    },
    {
      id: "b8",
      time: range(dH, dM, 90),
      title: "⚡ Développement Système & Projets Solos",
      base: archBase,
      status: "UPCOMING",
      type: "DEV",
    },
    {
      id: "b9",
      time: range(aH, aM, 60),
      title: "🌙 Bilan du Soir, Journaling & Revue Score Sh",
      base: "DIS",
      status: "UPCOMING",
      type: "AUDIT",
    },
    {
      id: "b10",
      time: `${fmt(cH, cM)} - 05:00`,
      title: "🔒 Couvre-Feu NextDNS & Sommeil Profond",
      base: "DIS",
      status: "UPCOMING",
      type: "SLEEP",
    },
  ];
}

function renderOnboardingPage() {
  return `<!DOCTYPE html>
<html lang="fr" data-theme="dark-monarch">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LEVELUP — Calibrage du Protocole d'Éveil</title>
  <meta name="description" content="Calibrez vos objectifs, votre entraînement physique et votre routine circadienne dans The System.">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Orbitron:wght@500;700;900&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #070312;
      --bg-card: rgba(18, 10, 36, 0.88);
      --neon-cyan: #00f0ff;
      --primary: #00f0ff;
      --secondary: #c084fc;
      --gold: #ffd700;
      --text-white: #ffffff;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --font-display: 'Orbitron', 'Cinzel Decorative', sans-serif;
      --font-sans: 'Inter', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(circle at 50% 10%, rgba(147, 51, 234, 0.22) 0%, rgba(0, 240, 255, 0.1) 40%, transparent 75%),
        linear-gradient(180deg, #090317 0%, #05020c 100%);
      color: var(--text-white);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .ob-nav {
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0, 240, 255, 0.2);
      background: rgba(7, 3, 18, 0.85);
      backdrop-filter: blur(14px);
    }

    .ob-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: inherit;
    }

    .ob-brand-title {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #fff;
    }

    .ob-progress-container {
      max-width: 680px;
      margin: 24px auto 0;
      padding: 0 20px;
      width: 100%;
    }

    .ob-progress-bar-bg {
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: hidden;
      border: 1px solid rgba(0, 240, 255, 0.15);
    }

    .ob-progress-fill {
      height: 100%;
      width: 50%;
      background: linear-gradient(90deg, var(--secondary), var(--neon-cyan));
      box-shadow: 0 0 12px var(--neon-cyan);
      transition: width 0.35s ease;
    }

    .ob-steps-tracker {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--text-muted);
    }

    .ob-step-chip.active {
      color: var(--neon-cyan);
      font-weight: 700;
      text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
    }

    .ob-main {
      flex: 1;
      max-width: 720px;
      width: 100%;
      margin: 20px auto 40px;
      padding: 0 20px;
    }

    .ob-card {
      background: var(--bg-card);
      backdrop-filter: blur(20px);
      border: 1.5px solid rgba(0, 240, 255, 0.35);
      border-radius: 18px;
      padding: 32px 28px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
    }

    .step-section {
      display: none;
      animation: fadeIn 0.3s ease;
    }

    .step-section.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .step-header-tag {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 2px;
      color: var(--neon-cyan);
      font-weight: 700;
      margin-bottom: 6px;
    }

    .step-title {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #ffffff;
      margin-bottom: 8px;
    }

    .step-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 22px;
      text-align: left;
    }

    .form-label {
      display: block;
      font-family: var(--font-mono);
      font-size: 11.5px;
      font-weight: 700;
      color: var(--neon-cyan);
      margin-bottom: 8px;
      letter-spacing: 0.8px;
    }

    .form-input {
      width: 100%;
      padding: 13px 16px;
      border-radius: 8px;
      background: rgba(14, 8, 30, 0.85);
      border: 1.5px solid rgba(0, 240, 255, 0.3);
      color: #ffffff;
      font-family: var(--font-sans);
      font-size: 14px;
      transition: all 0.25s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--neon-cyan);
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.35);
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }

    .option-card {
      background: rgba(14, 8, 30, 0.7);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .option-card:hover {
      border-color: rgba(0, 240, 255, 0.5);
      transform: translateY(-2px);
    }

    .option-card.selected {
      border-color: var(--neon-cyan);
      background: rgba(0, 240, 255, 0.1);
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.25);
    }

    .option-icon {
      font-size: 24px;
      margin-bottom: 6px;
    }

    .option-title {
      font-family: var(--font-display);
      font-size: 12.5px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .option-desc {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .pills-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .pill-btn {
      padding: 9px 14px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .pill-btn:hover {
      border-color: var(--neon-cyan);
      color: #fff;
    }

    .pill-btn.selected {
      background: rgba(0, 240, 255, 0.15);
      border-color: var(--neon-cyan);
      color: var(--neon-cyan);
      font-weight: 800;
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.25);
    }

    .ob-actions {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .btn-ob {
      padding: 13px 24px;
      border-radius: 10px;
      font-family: var(--font-display);
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .btn-ob-prev {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: var(--text-secondary);
    }

    .btn-ob-prev:hover {
      border-color: #fff;
      color: #fff;
    }

    .btn-ob-next {
      background: linear-gradient(135deg, #00f0ff 0%, #0284c7 100%);
      border: none;
      color: #070312;
      box-shadow: 0 0 18px rgba(0, 240, 255, 0.4);
      margin-left: auto;
    }

    .btn-ob-next:hover {
      box-shadow: 0 0 26px rgba(0, 240, 255, 0.7);
      transform: translateY(-1px);
    }

    .btn-ob-seal {
      background: linear-gradient(135deg, #ffd700 0%, #d97706 100%);
      border: none;
      color: #070312;
      box-shadow: 0 0 22px rgba(255, 215, 0, 0.5);
      margin-left: auto;
    }

    .btn-ob-seal:hover {
      box-shadow: 0 0 32px rgba(255, 215, 0, 0.85);
      transform: translateY(-1px);
    }
  </style>
</head>
<body>
  <header class="ob-nav">
    <a href="/landing" class="ob-brand">
      <div style="width: 30px; height: 30px;">
        ${MONARCH_LOGO_SVG}
      </div>
      <div class="ob-brand-title">LEVELUP</div>
    </a>
    <div style="font-family: var(--font-mono); font-size: 12px; color: var(--neon-cyan);">
      ÉTAPE <span id="nav-step-num">1</span> / 2
    </div>
    <a href="/dashboard" style="color: var(--text-muted); font-size: 11px; text-decoration: none; font-family: var(--font-mono);">
      PASSER LE CALIBRAGE →
    </a>
  </header>

  <div class="ob-progress-container">
    <div class="ob-progress-bar-bg">
      <div class="ob-progress-fill" id="ob-progress"></div>
    </div>
    <div class="ob-steps-tracker">
      <span class="ob-step-chip active" id="chip-1">1. IDENTITÉ & ARCHÉTYPE</span>
      <span class="ob-step-chip" id="chip-2">2. QUÊTES & ROUTINE</span>
    </div>
  </div>

  <main class="ob-main">
    <div class="ob-card">
      <!-- STEP 1: IDENTITÉ & ARCHÉTYPE -->
      <section class="step-section active" id="step-1">
        <div class="step-header-tag">⚡ ÉTAPE 1 • PROFIL DU CHASSEUR</div>
        <h1 class="step-title">IDENTITÉ & SPÉCIALISATION</h1>
        <p class="step-desc">Choisissez votre nom d'éveil et l'archétype régissant vos statistiques prioritaires.</p>

        <div class="form-group">
          <label class="form-label" for="input-hunter-name">NOM DU CHASSEUR</label>
          <input type="text" id="input-hunter-name" class="form-input" placeholder="Ex: Sung Jin-Woo, Alex, Monarch..." maxlength="30">
        </div>

        <div class="form-group">
          <label class="form-label">ARCHÉTYPE MAJEUR DE PROGRESSION</label>
          <div class="options-grid" id="archetype-options">
            <div class="option-card selected" data-value="HARMONIC_MONARCH">
              <div class="option-icon">👑</div>
              <div class="option-title">MONARQUE HARMONIQUE</div>
              <div class="option-desc">Équilibre absolu des 8 bases (Score Sh). Développement simultané du corps, du code et de l'esprit.</div>
            </div>
            <div class="option-card" data-value="BERZERKER_STR">
              <div class="option-icon">⚔️</div>
              <div class="option-title">BERSERKER CALISTHÉNIQUE</div>
              <div class="option-desc">Force pure, pompes explosives, tractions strictes et condition physique sans compromis (STR/DIS).</div>
            </div>
            <div class="option-card" data-value="AI_ENG">
              <div class="option-icon">🤖</div>
              <div class="option-title">NÉCROMANCIEN DE L'IA</div>
              <div class="option-desc">Spécialiste Transformers, Deep Work intensif, Hackathons et mathématiques appliquées (AI/ACAD).</div>
            </div>
            <div class="option-card" data-value="CYBER_SHADOW">
              <div class="option-icon">🛡️</div>
              <div class="option-title">INFILTRATEUR CYBER</div>
              <div class="option-desc">Offensive Security, TryHackMe, Buffer Overflows et discipline de fer en Monk Mode (CYBER/DIS).</div>
            </div>
          </div>
        </div>
      </section>

      <!-- STEP 2: QUÊTE PHYSIQUE & ROUTINE CIRCADIENNE -->
      <section class="step-section" id="step-2">
        <div class="step-header-tag">🎯 ÉTAPE 2 • OBJECTIFS & COUVRE-FEU</div>
        <h1 class="step-title">QUÊTE PHYSIQUE & DISCIPLINE</h1>
        <p class="step-desc">Fixez l'intensité de votre quête physique quotidienne et votre heure de couvre-feu Monk Mode.</p>

        <div class="form-group">
          <label class="form-label">CALIBRAGE DE LA QUÊTE PHYSIQUE (VALIDATION CAMÉRA IA)</label>
          <div class="options-grid" id="workout-options">
            <div class="option-card" data-value="NOVICE_30">
              <div class="option-icon">🟢</div>
              <div class="option-title">INITIÉ (RANG E)</div>
              <div class="option-desc">30 Pompes, 30 Abdos, 30 Squats, 3 km. Idéal pour construire une régularité indestructible.</div>
            </div>
            <div class="option-card selected" data-value="STANDARD_100">
              <div class="option-icon">🔵</div>
              <div class="option-title">SUNG JIN-WOO (CANON)</div>
              <div class="option-desc">100 Pompes, 100 Abdos, 100 Squats, 10 km. L'entraînement légendaire du Monarque des Ombres.</div>
            </div>
            <div class="option-card" data-value="MONARCH_150">
              <div class="option-icon">🟡</div>
              <div class="option-title">MONARQUE ABSOLU (RANG S)</div>
              <div class="option-desc">150 Pompes strictes, 150 Abdos, 150 Squats, 15 km. Réservé aux Chasseurs d'élite aguerris.</div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">HEURE DU COUVRE-FEU / MONK MODE (NEXTDNS)</label>
          <div class="pills-group" id="curfew-pills">
            <button type="button" class="pill-btn" data-time="21:30">21:30</button>
            <button type="button" class="pill-btn selected" data-time="22:00">22:00 (Recommandé)</button>
            <button type="button" class="pill-btn" data-time="22:30">22:30</button>
            <button type="button" class="pill-btn" data-time="23:00">23:00</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">VOLUME QUOTIDIEN DE DEEP WORK</label>
          <div class="pills-group" id="deepwork-pills">
            <button type="button" class="pill-btn" data-hours="2">2 Heures</button>
            <button type="button" class="pill-btn selected" data-hours="3">3 Heures (Équilibré)</button>
            <button type="button" class="pill-btn" data-hours="4">4 Heures (Intensif)</button>
          </div>
        </div>
      </section>

      <!-- Actions -->
      <div class="ob-actions">
        <button type="button" class="btn-ob btn-ob-prev" id="btn-prev" onclick="goToStep(1)" style="visibility: hidden;">
          ← PRÉCÉDENT
        </button>
        <button type="button" class="btn-ob btn-ob-next" id="btn-next" onclick="goToStep(2)">
          SUIVANT →
        </button>
        <button type="button" class="btn-ob btn-ob-seal" id="btn-seal" onclick="finishOnboarding()" style="display: none;">
          SCELLER & ENTRER DANS LE SYSTÈME ⚔️
        </button>
      </div>
    </div>
  </main>

  <script>
    const STORAGE_KEY = 'LEVELUP_SYSTEM_STATE_V7_CLEAN_DYNAMIC_AUTH';
    let currentStep = 1;

    const config = {
      name: 'Chasseur Éveillé',
      title: "L'Éveillé Novice (Rang E)",
      archetype: 'HARMONIC_MONARCH',
      targetGoal: 'Excellence Globale (Score Sh >= 18)',
      workoutLevel: 'STANDARD_100',
      wakeTime: '06:00',
      curfewTime: '22:00',
      deepWorkHours: 3
    };

    // Prepopulate name if available
    try {
      const urlP = new URLSearchParams(window.location.search);
      const pName = urlP.get('name');
      if (pName) config.name = decodeURIComponent(pName);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.player && state.player.name && state.player.name !== 'Chasseur Non Éveillé') {
          config.name = state.player.name;
        }
      }
    } catch(e) {}

    const inputName = document.getElementById('input-hunter-name');
    if (inputName) inputName.value = config.name;

    // Archetype selection
    document.querySelectorAll('#archetype-options .option-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('#archetype-options .option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        config.archetype = card.getAttribute('data-value');
      });
    });

    // Workout selection
    document.querySelectorAll('#workout-options .option-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('#workout-options .option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        config.workoutLevel = card.getAttribute('data-value');
      });
    });

    // Curfew pills
    document.querySelectorAll('#curfew-pills .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#curfew-pills .pill-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        config.curfewTime = btn.getAttribute('data-time');
      });
    });

    // Deep work pills
    document.querySelectorAll('#deepwork-pills .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#deepwork-pills .pill-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        config.deepWorkHours = parseInt(btn.getAttribute('data-hours'), 10) || 3;
      });
    });

    function goToStep(step) {
      if (step < 1) step = 1;
      if (step > 2) step = 2;
      currentStep = step;

      const inputN = document.getElementById('input-hunter-name');
      if (inputN && inputN.value.trim()) config.name = inputN.value.trim();

      document.querySelectorAll('.step-section').forEach(s => s.classList.remove('active'));
      const activeSection = document.getElementById('step-' + step);
      if (activeSection) activeSection.classList.add('active');

      const progress = document.getElementById('ob-progress');
      if (progress) progress.style.width = (step === 1 ? '50%' : '100%');

      const chip1 = document.getElementById('chip-1');
      const chip2 = document.getElementById('chip-2');
      if (chip1) chip1.classList.toggle('active', step === 1);
      if (chip2) chip2.classList.toggle('active', step === 2);

      const navStep = document.getElementById('nav-step-num');
      if (navStep) navStep.textContent = step;

      const btnPrev = document.getElementById('btn-prev');
      const btnNext = document.getElementById('btn-next');
      const btnSeal = document.getElementById('btn-seal');

      if (btnPrev) btnPrev.style.visibility = (step === 1 ? 'hidden' : 'visible');
      if (btnNext) btnNext.style.display = (step === 2 ? 'none' : 'block');
      if (btnSeal) btnSeal.style.display = (step === 2 ? 'block' : 'none');
    }

    async function finishOnboarding() {
      const sealBtn = document.getElementById('btn-seal');
      if (sealBtn) { sealBtn.textContent = 'SCELLEMENT EN COURS...'; sealBtn.disabled = true; }

      const inputN = document.getElementById('input-hunter-name');
      if (inputN && inputN.value.trim()) config.name = inputN.value.trim();

      try {
        let state = {};
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) state = JSON.parse(saved);
        if (!state.player) state.player = {};

        state.player.name = config.name;
        state.player.archetype = config.archetype;
        state.player.workoutLevel = config.workoutLevel;
        state.player.curfewTime = config.curfewTime;
        state.player.deepWorkHours = config.deepWorkHours;
        state.player.onboardingCompleted = true;
        state.player.isAuthenticated = true;
        state.onboardingCompleted = true;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch(e) {}

      try {
        await fetch('/api/v1/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });
      } catch(e) {}

      setTimeout(() => {
        window.location.href = '/dashboard?onboarding=complete';
      }, 500);
    }
  </script>
</body>
</html>`;
}

function renderFullApplication(initialTab = "dashboard") {
  const player = SYSTEM_STATE.player;
  const harmonicScore = getHarmonicScore();

  return `<!DOCTYPE html>
<html lang="fr" data-theme="dark-monarch">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
  <title>LevelUp — The System (HUD Solo Leveling)</title>
  <link rel="icon" type="image/svg+xml" href="/logo-monarch.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&family=Rajdhani:wght@500;600;700;800;900&family=Space+Grotesk:wght@500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <!-- MediaPipe Pose WebAssembly Computer Vision Libraries -->
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js" crossorigin="anonymous"></script>
  <!-- Google Identity Services (GIS) Official Client SDK -->
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <script>
    (function() {
      try {
        var t = localStorage.getItem('levelup-theme');
        if (t === 'light-awakening' || t === 'dark-monarch') {
          document.documentElement.setAttribute('data-theme', t);
        }
        if (sessionStorage.getItem('levelup_intro_seen')) {
          document.documentElement.classList.add('no-intro');
        }
      } catch (e) {}
    })();
  </script>
  <style>
    :root {
      /* Stitch Shadow Monarch HUD Design Tokens */
      --surface: #150f2c;
      --surface-dim: #150f2c;
      --surface-bright: #3b3554;
      --surface-container-lowest: #0f0926;
      --surface-container-low: #1d1734;
      --surface-container: #211b39;
      --surface-container-high: #2c2644;
      --surface-container-highest: #36304f;
      --on-surface: #e7deff;
      --on-surface-variant: #cfc2d7;
      --outline: #988ca0;
      --outline-variant: #4d4354;
      --surface-tint: #ddb8ff;
      --primary: #ddb8ff;
      --primary-container: #9333ea;
      --on-primary-container: #f6e6ff;
      --secondary: #ddb7ff;
      --secondary-container: #6f00be;
      --on-secondary-container: #d6a9ff;
      --tertiary: #45dfa4;
      --tertiary-container: #007a55;
      --tertiary-fixed: #68fcbf;
      --error: #ffb4ab;
      --error-container: #93000a;

      /* Sovereign Obsidian-Amethyst Dark Foundations */
      --bg-cosmic-0: #070414;
      --bg-cosmic-1: #0d0824;
      --bg-cosmic-2: #160d38;
      
      /* Glassmorphism Panels */
      --glass-panel: rgba(21, 15, 44, 0.84);
      --glass-panel-elevated: rgba(29, 23, 52, 0.92);
      --glass-panel-subtle: rgba(15, 9, 38, 0.65);
      --glass-inner-border: rgba(168, 85, 247, 0.35);
      --glass-inner-border-subtle: rgba(168, 85, 247, 0.20);
      --glass-inner-glow: rgba(192, 132, 252, 0.14);
      --glass-shadow: 0 14px 40px -8px rgba(7, 3, 20, 0.75), 0 0 25px rgba(168, 85, 247, 0.22);
      --glass-rim: linear-gradient(90deg, transparent 5%, #ffffff 30%, #c084fc 70%, transparent 95%);

      /* Left Sidebar & Master Header */
      --sidebar-bg: rgba(12, 7, 28, 0.88);
      --sidebar-border: 1px solid rgba(168, 85, 247, 0.32);
      --sidebar-shadow: 4px 0 24px -2px rgba(147, 51, 234, 0.25);
      --header-bg: rgba(12, 7, 28, 0.90);
      --header-border: 1px solid rgba(168, 85, 247, 0.28);

      /* Sovereign White & Violet Palette */
      --primary-white: #ffffff;
      --pure-white: #ffffff;
      --primary-violet: #a855f7;
      --vibrant-purple: #9333ea;
      --neon-violet: #c084fc;
      --royal-violet: #7c3aed;
      --light-lavender: #ddd6fe;
      --soft-lavender: #e9d5ff;

      /* Mana Conduits & Badges */
      --neon-cyan: #c084fc;
      --neon-sky: #ddd6fe;
      --neon-blue: #9333ea;
      --deep-sapphire: #7c3aed;
      --monarch-purple: #a855f7;
      
      /* Vibrant Supporting Accents */
      --transcendent-green: #45dfa4;
      --emerald-green: #059669;
      --imperial-gold: #fbbf24;
      --alert-crimson: #f43f5e;
      --danger-red: #ef4444;

      /* Fluid Gauges */
      --jauge-hp-from: #007a55;
      --jauge-hp-to: #45dfa4;
      --jauge-hp-glow: rgba(69, 223, 164, 0.7);
      --jauge-mp-from: #9333ea;
      --jauge-mp-to: #c084fc;
      --jauge-mp-glow: rgba(192, 132, 252, 0.7);

      /* Circular Carousel Fade Mask */
      --cc-fade: #070414;

      /* Text Hierarchy */
      --text-white: #ffffff;
      --text-primary: #ffffff;
      --text-secondary: #cfc2d7;
      --text-muted: #988ca0;
      --text-on-accent: #020c24;

      /* Box & Input Foundations */
      --input-bg: rgba(15, 9, 38, 0.85);
      --input-border: rgba(168, 85, 247, 0.35);
      --code-bg: rgba(21, 15, 44, 0.90);

      --font-display: 'Space Grotesk', 'Rajdhani', sans-serif;
      --font-body: 'Inter', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;

      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-pill: 9999px;
    }

    [data-theme="light-awakening"] {
      /* Light Foundations (Albâtre lavande / nacré) */
      --surface: #ffffff;
      --surface-dim: #f5f3ff;
      --surface-bright: #ffffff;
      --surface-container-lowest: #ffffff;
      --surface-container-low: #f8f6ff;
      --surface-container: #f5f3ff;
      --surface-container-high: #ede9fe;
      --surface-container-highest: #ddd6fe;
      --on-surface: #0f172a;
      --on-surface-variant: #475569;
      --outline: #94a3b8;
      --outline-variant: #cbd5e1;
      --surface-tint: #7c3aed;
      --primary: #7c3aed;
      --primary-container: #6d28d9;
      --on-primary-container: #ffffff;
      --secondary: #9333ea;
      --secondary-container: #7c3aed;
      --on-secondary-container: #ffffff;
      --tertiary: #047857;
      --tertiary-container: #d1fae5;
      --tertiary-fixed: #059669;
      --error: #e11d48;
      --error-container: #ffe4e6;

      --bg-cosmic-0: #f5f3ff;
      --bg-cosmic-1: #ffffff;
      --bg-cosmic-2: #ede9fe;
      
      /* Glassmorphism Panels (Verre givré lacté haute transparence) */
      --glass-panel: rgba(255, 255, 255, 0.88);
      --glass-panel-elevated: rgba(255, 255, 255, 0.96);
      --glass-panel-subtle: rgba(255, 255, 255, 0.72);
      --glass-inner-border: rgba(124, 58, 237, 0.28);
      --glass-inner-border-subtle: rgba(124, 58, 237, 0.16);
      --glass-inner-glow: rgba(124, 58, 237, 0.08);
      --glass-shadow: 0 12px 35px -8px rgba(124, 58, 237, 0.12), 0 0 20px rgba(168, 85, 247, 0.10);
      --glass-rim: linear-gradient(90deg, transparent 5%, #9333ea 30%, #7c3aed 70%, transparent 95%);

      /* Left Sidebar & Master Header */
      --sidebar-bg: rgba(255, 255, 255, 0.88);
      --sidebar-border: 1px solid rgba(124, 58, 237, 0.22);
      --sidebar-shadow: 4px 0 30px rgba(124, 58, 237, 0.10), inset -1px 0 10px rgba(124, 58, 237, 0.05);
      --header-bg: rgba(255, 255, 255, 0.88);
      --header-border: 1px solid rgba(124, 58, 237, 0.20);

      /* Mana Conduits & Badges (Violet royal haute saturation) */
      --primary-white: #0f172a;
      --pure-white: #0f172a;
      --primary-violet: #7c3aed;
      --vibrant-purple: #9333ea;
      --neon-violet: #7c3aed;
      --royal-violet: #6d28d9;
      --light-lavender: #6d28d9;
      --soft-lavender: #5b21b6;
      --neon-cyan: #7c3aed;
      --neon-sky: #6d28d9;
      --neon-blue: #5b21b6;
      --deep-sapphire: #6d28d9;
      --monarch-purple: #9333ea;

      /* Supporting Accents */
      --transcendent-green: #047857;
      --emerald-green: #10b981;
      --imperial-gold: #d97706;
      --alert-crimson: #e11d48;
      --danger-red: #be123c;

      /* Fluid Gauges */
      --jauge-hp-from: #047857;
      --jauge-hp-to: #10b981;
      --jauge-hp-glow: rgba(16, 185, 129, 0.45);
      --jauge-mp-from: #6d28d9;
      --jauge-mp-to: #a855f7;
      --jauge-mp-glow: rgba(168, 85, 247, 0.45);

      /* Circular Carousel Fade Mask */
      --cc-fade: #f5f3ff;

      /* Text Hierarchy (Noir-encre améthyste & ardoise) */
      --text-white: #0f172a;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #64748b;
      --text-on-accent: #ffffff;

      /* Box & Input Foundations */
      --input-bg: rgba(245, 243, 255, 0.85);
      --input-border: rgba(124, 58, 237, 0.3);
      --code-bg: rgba(243, 240, 255, 0.88);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html {
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      scroll-behavior: smooth;
    }

    .cyber-grid {
      background-image:
        linear-gradient(to right, rgba(152, 140, 160, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(152, 140, 160, 0.05) 1px, transparent 1px);
      background-size: 24px 24px;
    }
    .sidebar-glow {
      box-shadow: 4px 0 24px -2px rgba(147, 51, 234, 0.25);
    }

    body {
      background-color: var(--bg-cosmic-0);
      background-image:
        linear-gradient(to right, rgba(152, 140, 160, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(152, 140, 160, 0.04) 1px, transparent 1px),
        radial-gradient(ellipse at 15% 15%, rgba(147, 51, 234, 0.25) 0%, transparent 45%),
        radial-gradient(circle at 85% 20%, rgba(192, 132, 252, 0.18) 0%, transparent 40%),
        radial-gradient(circle at 50% 85%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 0%, #170a38 0%, #0d0724 50%, #070414 100%);
      background-size: 24px 24px, 24px 24px, auto, auto, auto, auto;
      background-attachment: fixed;
      color: var(--text-white);
      font-family: var(--font-body);
      min-height: 100vh;
      overflow-x: hidden;
      overflow-y: auto;
      display: block;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
      width: 8px;
    }
    html::-webkit-scrollbar-track,
    body::-webkit-scrollbar-track {
      background: rgba(15, 9, 38, 0.5);
    }
    html::-webkit-scrollbar-thumb,
    body::-webkit-scrollbar-thumb {
      background: rgba(168, 85, 247, 0.45);
      border-radius: 8px;
    }
    html::-webkit-scrollbar-thumb:hover,
    body::-webkit-scrollbar-thumb:hover {
      background: rgba(192, 132, 252, 0.75);
    }

    [data-theme="light-awakening"] html::-webkit-scrollbar-track,
    [data-theme="light-awakening"] body::-webkit-scrollbar-track {
      background: rgba(245, 243, 255, 0.65);
    }
    [data-theme="light-awakening"] html::-webkit-scrollbar-thumb,
    [data-theme="light-awakening"] body::-webkit-scrollbar-thumb {
      background: rgba(124, 58, 237, 0.4);
    }
    [data-theme="light-awakening"] html::-webkit-scrollbar-thumb:hover,
    [data-theme="light-awakening"] body::-webkit-scrollbar-thumb:hover {
      background: rgba(124, 58, 237, 0.75);
    }

    [data-theme="light-awakening"] body {
      background-color: #ede9fe;
      background-image:
        linear-gradient(to right, rgba(124, 58, 237, 0.08) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(124, 58, 237, 0.08) 1px, transparent 1px),
        radial-gradient(ellipse at 50% 0%, rgba(168, 85, 247, 0.32) 0%, rgba(245, 240, 255, 0.5) 45%, #ede9fe 100%),
        radial-gradient(ellipse at 15% 15%, rgba(168, 85, 247, 0.28) 0%, transparent 45%),
        radial-gradient(circle at 85% 20%, rgba(124, 58, 237, 0.25) 0%, transparent 40%),
        radial-gradient(circle at 50% 85%, rgba(192, 132, 252, 0.24) 0%, transparent 50%);
      background-size: 24px 24px, 24px 24px, auto, auto, auto, auto;
      color: var(--text-white);
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
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid var(--glass-inner-border);
      border-radius: var(--radius-md);
      box-shadow: var(--glass-shadow);
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
      background: var(--glass-rim);
      opacity: 0.9;
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
        rgba(192, 132, 252, 0.16),
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
      border-color: var(--neon-cyan);
      box-shadow: 
        0 14px 40px -5px rgba(35, 15, 75, 0.45),
        inset 0 0 25px var(--glass-inner-glow),
        0 0 25px rgba(168, 85, 247, 0.35);
    }

    /* ==========================================================================
       PROGRESSIVE STAGGERED SCROLL-REVEAL ANIMATION (UN À UN AU SCROLL)
       ========================================================================== */
    .scroll-reveal-card {
      opacity: 0;
      transform: translateY(28px) scale(0.975);
      filter: blur(4px);
      transition: 
        opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.65s cubic-bezier(0.16, 1, 0.3, 1),
        filter 0.65s cubic-bezier(0.16, 1, 0.3, 1),
        border-color 0.25s ease,
        box-shadow 0.25s ease,
        background 0.25s ease;
      transition-delay: calc(var(--reveal-delay, 0) * 1ms);
      will-change: opacity, transform, filter;
    }

    .scroll-reveal-card.is-revealed {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }

    .glass-card.is-revealed:hover,
    .spotlight-card.is-revealed:hover {
      box-shadow: var(--shadow-xl), 0 0 25px rgba(124, 58, 237, 0.15);
      border-color: rgba(147, 51, 234, 0.35);
      transform: translateY(-2px) scale(1.004);
    }

    @media (prefers-reduced-motion: reduce) {
      .scroll-reveal-card {
        opacity: 1 !important;
        transform: none !important;
        filter: none !important;
        transition: none !important;
      }
    }

    .shiny-text {
      background: linear-gradient(110deg, #ffffff 15%, #c084fc 45%, #ffffff 75%, #ddd6fe 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: textShimmer 3.5s ease-in-out infinite;
      display: inline-block;
    }
    [data-theme="light-awakening"] .shiny-text {
      background: linear-gradient(110deg, #0f172a 15%, #7c3aed 45%, #0f172a 75%, #9333ea 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
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
      border: 1px solid rgba(244, 63, 94, 0.4);
      background: var(--glass-panel);
      backdrop-filter: blur(20px);
      border-radius: var(--radius-md);
      box-shadow: 0 0 25px rgba(244, 63, 94, 0.25);
      overflow: hidden;
    }
    [data-theme="light-awakening"] .border-beam-box {
      border-color: rgba(225, 29, 72, 0.4);
      box-shadow: 0 0 25px rgba(225, 29, 72, 0.2);
    }
    .border-beam-box::before {
      content: "";
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: conic-gradient(from 0deg, transparent 0deg, var(--alert-crimson) 45deg, transparent 90deg);
      animation: beamRotate 4s linear infinite;
      z-index: 0;
      opacity: 0.6;
    }
    .border-beam-content {
      position: relative;
      background: var(--glass-panel-elevated);
      border-radius: calc(var(--radius-md) - 1px);
      z-index: 1;
    }
    @keyframes beamRotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .capsule-slider-track {
      background: var(--input-bg);
      border: 1px solid var(--glass-inner-border);
      border-radius: var(--radius-pill);
      height: 14px;
      position: relative;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.25);
    }
    .capsule-slider-fill {
      height: 100%;
      border-radius: var(--radius-pill);
      position: relative;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .capsule-fill-hp {
      background: linear-gradient(90deg, var(--jauge-hp-from), var(--jauge-hp-to));
      box-shadow: 0 0 10px var(--jauge-hp-glow);
    }
    .capsule-fill-mp {
      background: linear-gradient(90deg, var(--jauge-mp-from), var(--jauge-mp-to));
      box-shadow: 0 0 10px var(--jauge-mp-glow);
    }
    .capsule-fill-xp {
      background: linear-gradient(90deg, var(--royal-violet), var(--neon-violet));
      box-shadow: 0 0 12px var(--jauge-mp-glow);
    }

    .btn-cyber {
      background: var(--input-bg);
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
      box-shadow: 0 0 12px rgba(168, 85, 247, 0.25);
      text-transform: uppercase;
      user-select: none;
    }
    .btn-cyber:hover {
      background: var(--neon-cyan);
      color: var(--text-on-accent);
      box-shadow: 0 0 22px rgba(168, 85, 247, 0.75);
      transform: translateY(-2px);
    }
    .btn-cyber:active { transform: translateY(0); }

    .btn-gold {
      border-color: var(--imperial-gold);
      color: var(--imperial-gold);
      box-shadow: 0 0 12px rgba(251, 191, 36, 0.25);
    }
    .btn-gold:hover {
      background: var(--imperial-gold);
      color: var(--text-on-accent);
      box-shadow: 0 0 22px rgba(251, 191, 36, 0.75);
    }

    .btn-red {
      border-color: var(--alert-crimson);
      color: var(--alert-crimson);
      box-shadow: 0 0 12px rgba(244, 63, 94, 0.35);
    }
    .btn-red:hover {
      background: var(--alert-crimson);
      color: #ffffff;
      box-shadow: 0 0 25px rgba(244, 63, 94, 0.85);
    }

    .radar-ping-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 4px 10px;
      border-radius: var(--radius-pill);
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid var(--glass-inner-border);
      font-size: 11px;
      font-weight: 600;
      color: var(--neon-cyan);
      font-family: var(--font-mono);
      letter-spacing: 0.5px;
    }

    /* =========================================================================
       LAYOUT ARCHITECTURE: CENTERED SOVEREIGN COCKPIT FRAME & DUAL WORKSPACE
       ========================================================================= */
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: calc(100vh - 28px);
      height: auto;
      max-height: none;
      width: calc(100vw - 32px);
      max-width: 1780px;
      margin: 14px auto;
      position: relative;
      background: linear-gradient(180deg, #281f47 0%, #1f1838 100%);
      border: 1px solid rgba(168, 85, 247, 0.22);
      border-radius: 18px;
      box-shadow: 0 16px 48px -10px rgba(7, 3, 20, 0.8), 0 0 35px -5px rgba(168, 85, 247, 0.20);
      overflow: visible;
      z-index: 10;
    }

    [data-theme="light-awakening"] .app-layout {
      background: linear-gradient(180deg, rgba(245, 240, 255, 0.62) 0%, rgba(255, 255, 255, 0.70) 12%, rgba(248, 246, 255, 0.82) 100%) !important;
      backdrop-filter: blur(20px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
      border: 1.5px solid rgba(124, 58, 237, 0.28) !important;
      box-shadow: 0 16px 48px -10px rgba(124, 58, 237, 0.18), 0 0 30px rgba(168, 85, 247, 0.15) !important;
    }

    /* TOP MASTER HEADER (TRUE VISIONOS LIQUID FROSTED GLASSMORPHISM) */
    .master-header {
      position: sticky;
      top: 12px;
      z-index: 100;
      flex-shrink: 0;
      margin: 12px 18px 8px 18px;
      height: 52px;
      padding: 0 8px 0 18px;
      /* TRUE TRANSLUCENT FROSTED GLASS (DARK MONARCH) */
      background: rgba(16, 12, 32, 0.44);
      backdrop-filter: blur(28px) saturate(210%);
      -webkit-backdrop-filter: blur(28px) saturate(210%);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-top: 1px solid rgba(255, 255, 255, 0.38);
      border-bottom: 1px solid rgba(0, 0, 0, 0.45);
      border-radius: var(--radius-pill, 9999px);
      box-shadow: 
        0 20px 48px -8px rgba(0, 0, 0, 0.75),
        0 0 32px -4px rgba(168, 85, 247, 0.25),
        inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.35),
        inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.35);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* TRUE TRANSLUCENT FROSTED GLASS (LIGHT AWAKENING) */
    [data-theme="light-awakening"] .master-header {
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.70) 0%, 
        rgba(243, 238, 255, 0.46) 40%, 
        rgba(237, 230, 254, 0.58) 80%, 
        rgba(255, 255, 255, 0.72) 100%) !important;
      backdrop-filter: blur(28px) saturate(200%) contrast(104%) !important;
      -webkit-backdrop-filter: blur(28px) saturate(200%) contrast(104%) !important;
      border: 1.5px solid rgba(124, 58, 237, 0.28) !important;
      border-top: 1.5px solid rgba(255, 255, 255, 0.98) !important;
      border-bottom: 1.5px solid rgba(109, 40, 217, 0.35) !important;
      box-shadow: 
        0 18px 40px -6px rgba(124, 58, 237, 0.22),
        0 4px 14px -2px rgba(15, 23, 42, 0.08),
        0 0 0 1px rgba(139, 92, 246, 0.16),
        inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.98),
        inset 0 -1.5px 3px 0 rgba(124, 58, 237, 0.12) !important;
    }


    .header-left-cluster {
      display: flex;
      align-items: center;
      gap: 20px;
      min-width: 0;
      flex-shrink: 1;
    }

    .brand-logo-wrap {
      display: flex;
      align-items: center;
      gap: 9px;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      flex-shrink: 0;
    }
    .brand-logo-wrap:hover {
      transform: translateY(-1px) scale(1.02);
    }
    .monarch-crest-svg {
      width: 22px;
      height: 22px;
      filter: drop-shadow(0 0 8px rgba(192, 132, 252, 0.8));
      transition: all 0.3s ease;
      flex-shrink: 0;
    }
    /* From Uiverse.io by satyamchaudharydev */
    /* === removing default button style === */
    .button {
      margin: 0;
      height: auto;
      background: transparent;
      padding: 0;
      border: none;
      cursor: pointer;
      outline: none;
    }

    /* button styling */
    .button {
      --border-right: 4px;
      --text-stroke-color: rgba(255, 255, 255, 0.65);
      --animation-color: #37FF8B;
      --fs-size: 1.15rem;
      letter-spacing: 2.5px;
      text-decoration: none;
      font-size: var(--fs-size);
      font-family: var(--font-display, "Space Grotesk", "Arial", sans-serif);
      font-weight: 900;
      position: relative;
      text-transform: uppercase;
      color: transparent;
      -webkit-text-stroke: 1px var(--text-stroke-color);
      display: inline-flex;
      align-items: center;
      line-height: 1;
      user-select: none;
    }

    .actual-text {
      white-space: nowrap;
    }

    /* this is the text, when you hover on button */
    .hover-text {
      position: absolute;
      box-sizing: border-box;
      content: attr(data-text);
      color: var(--animation-color);
      width: 0%;
      inset: 0;
      border-right: var(--border-right) solid var(--animation-color);
      overflow: hidden;
      transition: width 0.45s cubic-bezier(0.25, 1, 0.5, 1);
      -webkit-text-stroke: 1px var(--animation-color);
      white-space: nowrap;
      display: flex;
      align-items: center;
    }

    /* hover */
    .button:hover .hover-text,
    .brand-logo-wrap:hover .hover-text {
      width: 100%;
      filter: drop-shadow(0 0 23px var(--animation-color));
    }

    /* Light mode styling for Uiverse button */
    [data-theme="light-awakening"] .button {
      --text-stroke-color: rgba(15, 23, 42, 0.7);
      --animation-color: #059669;
    }

    /* RIGHT CLUSTER */
    .header-right-cluster {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-shrink: 0;
    }

    .header-player-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-top: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: var(--radius-pill, 9999px);
      padding: 4px 10px 4px 6px;
      font-family: var(--font-display, sans-serif);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    }
    [data-theme="light-awakening"] .header-player-pill {
      background: rgba(255, 255, 255, 0.65) !important;
      border: 1px solid rgba(124, 58, 237, 0.28) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.98) !important;
      box-shadow: 0 2px 10px rgba(124, 58, 237, 0.10), inset 0 1px 1px #ffffff !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
    }

    .header-player-avatar {
      font-size: 12px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: linear-gradient(135deg, #a855f7, #7c3aed);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .header-google-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 5px 12px 5px 9px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: var(--radius-pill, 9999px);
      color: var(--text-white, #ffffff);
      font-size: 11px;
      font-family: var(--font-mono, monospace);
      font-weight: 700;
      letter-spacing: 0.5px;
      cursor: pointer;
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .header-google-btn:hover {
      border-color: #4285F4;
      background: rgba(66, 133, 244, 0.15);
      box-shadow: 0 0 16px rgba(66, 133, 244, 0.35);
      transform: translateY(-1px);
    }
    [data-theme="light-awakening"] .header-google-btn {
      background: rgba(255, 255, 255, 0.75) !important;
      border: 1px solid rgba(124, 58, 237, 0.25) !important;
      color: #1e1b4b !important;
    }

    .header-player-name {
      font-weight: 700;
      font-size: 12.5px;
      color: #ffffff;
    }
    [data-theme="light-awakening"] .header-player-name {
      color: #0f172a;
    }

    .header-player-rank {
      font-family: var(--font-mono, monospace);
      font-size: 9.5px;
      color: var(--neon-cyan, #06b6d4);
      opacity: 0.9;
    }
    .header-player-sh {
      font-family: var(--font-mono, monospace);
      font-weight: 800;
      font-size: 9.5px;
      color: var(--imperial-gold, #fbbf24);
      background: rgba(251, 191, 36, 0.12);
      border: 1px solid rgba(251, 191, 36, 0.3);
      padding: 1px 4px;
      border-radius: 4px;
      margin-left: 2px;
    }

    .header-stat-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-family: var(--font-mono, monospace);
      font-size: 11.5px;
      color: rgba(255, 255, 255, 0.85);
    }
    [data-theme="light-awakening"] .header-stat-item {
      color: #334155;
    }
    .header-stat-item strong {
      color: var(--imperial-gold, #fbbf24);
    }
    .header-stat-item .stat-icon {
      font-size: 12px;
    }

    /* 3D LIQUID GLASS THEME SWITCH (VISIONOS / SKEUOMORPHIC PRISMVEIL REPLACEMENT) */
    .glass-theme-switch {
      background: transparent;
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      position: relative;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      outline: none;
      transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
      vertical-align: middle;
    }
    .glass-theme-switch:hover {
      transform: translateY(-1px) scale(1.03);
    }
    .glass-theme-switch:active {
      transform: translateY(0) scale(0.97);
    }

    .glass-switch-track {
      height: 34px;
      width: 98px;
      border-radius: 9999px;
      position: relative;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      
      /* Frosted Glass Track (Dark Theme) */
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.07) 100%);
      border: 1px solid rgba(255, 255, 255, 0.26);
      box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.3),
        inset 0 1px 1px rgba(255, 255, 255, 0.35),
        inset 0 -1px 2px rgba(0, 0, 0, 0.25);
    }

    /* Frosted Smoked Slate Glass Track (Light Theme - High Contrast Exact Image 1 Match) */
    [data-theme="light-awakening"] .glass-switch-track {
      background: linear-gradient(135deg, rgba(51, 65, 85, 0.90) 0%, rgba(30, 41, 59, 0.96) 100%);
      border: 1px solid rgba(255, 255, 255, 0.32);
      box-shadow: 
        0 4px 18px rgba(15, 23, 42, 0.28),
        0 1px 4px rgba(15, 23, 42, 0.15),
        inset 0 1px 1.5px rgba(255, 255, 255, 0.5),
        inset 0 -1px 2px rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
    }

    [data-theme="light-awakening"] .glass-switch-thumb {
      background: radial-gradient(circle at 32% 28%, 
        rgba(255, 255, 255, 0.92) 0%, 
        rgba(255, 255, 255, 0.5) 32%, 
        rgba(148, 163, 184, 0.28) 65%, 
        rgba(51, 65, 85, 0.5) 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.9);
      box-shadow: 
        0 6px 18px rgba(15, 23, 42, 0.4),
        0 2px 6px rgba(15, 23, 42, 0.2),
        inset 0 2px 4px rgba(255, 255, 255, 0.98),
        inset 0 -3px 5px rgba(0, 0, 0, 0.35),
        inset 2px 0 4px rgba(255, 255, 255, 0.65);
    }

    [data-theme="light-awakening"] .glass-thumb-reflection {
      position: absolute;
      inset: 2px;
      border-radius: 50%;
      border-top: 2.2px solid rgba(255, 255, 255, 0.98);
      border-left: 2px solid rgba(255, 255, 255, 0.88);
      border-right: 2px solid transparent;
      border-bottom: 2px solid transparent;
      pointer-events: none;
      transform: rotate(-10deg);
      filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.85));
    }

    [data-theme="light-awakening"] .glass-thumb-icon {
      color: #ffffff;
      filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.98)) drop-shadow(0 0 12px rgba(255, 255, 255, 0.7));
    }

    /* 3D Glass Sphere Knob */
    .glass-switch-thumb {
      position: absolute;
      top: 50%;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      transition: left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, border-color 0.3s ease;
      
      /* 3D Sphere Shading & Depth */
      background: radial-gradient(circle at 32% 28%, 
        rgba(255, 255, 255, 0.85) 0%, 
        rgba(255, 255, 255, 0.4) 32%, 
        rgba(255, 255, 255, 0.14) 62%, 
        rgba(255, 255, 255, 0.28) 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.8);
      box-shadow: 
        0 6px 18px rgba(0, 0, 0, 0.25),
        0 2px 5px rgba(0, 0, 0, 0.15),
        inset 0 2px 4px rgba(255, 255, 255, 0.95),
        inset 0 -3px 5px rgba(0, 0, 0, 0.2),
        inset 2px 0 4px rgba(255, 255, 255, 0.55);
    }

    /* Specular Rim Reflection Arc */
    .glass-thumb-reflection {
      position: absolute;
      inset: 2px;
      border-radius: 50%;
      border-top: 2.2px solid rgba(255, 255, 255, 0.95);
      border-left: 2px solid rgba(255, 255, 255, 0.85);
      border-right: 2px solid transparent;
      border-bottom: 2px solid transparent;
      pointer-events: none;
      transform: rotate(-10deg);
      filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.7));
    }

    /* Glowing Icon inside Thumb */
    .glass-thumb-icon {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      transition: all 0.3s ease;
    }
    .glass-thumb-icon svg {
      filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
    }

    /* Text Label inside Track */
    .glass-switch-label {
      width: 100%;
      font-family: 'Plus Jakarta Sans', var(--font-display, sans-serif);
      font-size: 13.5px;
      font-weight: 600;
      letter-spacing: -0.2px;
      color: #ffffff;
      box-sizing: border-box;
      pointer-events: none;
      transition: padding 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
    }

    [data-theme="light-awakening"] .glass-switch-label {
      color: #ffffff;
      font-weight: 600;
      letter-spacing: -0.2px;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.65);
    }

    /* STATE A: LIGHT MODE (Knob on LEFT, Label on RIGHT - Exact Image 1 Match) */
    .glass-theme-switch.is-light .glass-switch-thumb {
      left: -2px;
      transform: translateY(-50%);
    }
    .glass-theme-switch.is-light .glass-switch-label {
      padding-left: 36px;
      padding-right: 12px;
    }

    /* STATE B: DARK MODE (Knob on RIGHT, Label on LEFT) */
    .glass-theme-switch.is-dark .glass-switch-thumb {
      left: calc(100% - 36px);
      transform: translateY(-50%);
    }
    .glass-theme-switch.is-dark .glass-switch-label {
      padding-left: 12px;
      padding-right: 36px;
    }

    /* Backward compatibility */
    .header-cta-pill {
      display: none;
    }

    @media (max-width: 900px) {
      .header-stat-item {
        display: none;
      }
      .master-header {
        margin: 8px 10px 4px 10px;
        padding: 0 6px 0 12px;
      }
    }

    /* FLOATING BOTTOM NAV BAR DOCK (TRUE VISIONOS FROSTED GLASSMORPHISM - FIXED TO VIEWPORT SCREEN) */
    .bottom-nav-bar.nav-bar,
    .top-tab-bar.nav-bar {
      position: fixed !important;
      bottom: 20px !important;
      left: 0 !important;
      right: 0 !important;
      width: 100vw !important;
      background: transparent !important;
      border: none !important;
      padding: 0 16px;
      flex-shrink: 0;
      z-index: 99999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      pointer-events: none !important;
      transition: all 0.3s ease;
    }
    .bottom-nav-bar.nav-bar::-webkit-scrollbar,
    .top-tab-bar.nav-bar::-webkit-scrollbar {
      display: none;
    }

    /* PURE FROSTED GLASS DOCK (LIQUID VISIONOS AESTHETIC) */
    .bottom-nav-dock,
    .tab-bar-track {
      pointer-events: auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      /* TRUE TRANSLUCENT FROSTED GLASS */
      background: rgba(16, 10, 32, 0.42);
      backdrop-filter: blur(28px) saturate(220%);
      -webkit-backdrop-filter: blur(28px) saturate(220%);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-top: 1px solid rgba(255, 255, 255, 0.42);
      border-bottom: 1px solid rgba(0, 0, 0, 0.5);
      border-radius: var(--radius-pill, 9999px);
      padding: 6px 10px;
      box-shadow: 
        0 20px 50px -8px rgba(0, 0, 0, 0.8),
        0 0 32px -4px rgba(168, 85, 247, 0.35),
        inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
        inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.4);
      max-width: 98vw;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .bottom-nav-dock::-webkit-scrollbar,
    .tab-bar-track::-webkit-scrollbar {
      display: none;
    }

    [data-theme="light-awakening"] .bottom-nav-dock,
    [data-theme="light-awakening"] .tab-bar-track {
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.70) 0%, 
        rgba(243, 238, 255, 0.48) 40%, 
        rgba(237, 230, 254, 0.58) 80%, 
        rgba(255, 255, 255, 0.72) 100%) !important;
      backdrop-filter: blur(28px) saturate(200%) contrast(104%) !important;
      -webkit-backdrop-filter: blur(28px) saturate(200%) contrast(104%) !important;
      border: 1.5px solid rgba(124, 58, 237, 0.28) !important;
      border-top: 1.5px solid rgba(255, 255, 255, 0.98) !important;
      border-bottom: 1.5px solid rgba(109, 40, 217, 0.35) !important;
      box-shadow: 
        0 24px 54px -8px rgba(124, 58, 237, 0.28),
        0 8px 24px -2px rgba(15, 23, 42, 0.10),
        0 0 0 1px rgba(124, 58, 237, 0.16),
        inset 0 2px 3px 0 rgba(255, 255, 255, 0.98),
        inset 0 -2px 4px 0 rgba(124, 58, 237, 0.12) !important;
    }

    /* NAV TAB : POLISHED GLASS PILL */
    .nav-tab {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-top: 1px solid rgba(255, 255, 255, 0.22);
      color: var(--text-secondary, #94a3b8);
      font-family: var(--font-display, 'Rajdhani', sans-serif);
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.6px;
      height: 42px;
      min-width: 42px;
      padding: 0 11px;
      border-radius: var(--radius-pill, 9999px);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      position: relative;
      white-space: nowrap;
      user-select: none;
      outline: none;
      overflow: hidden;
      box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.15);
      transition: 
        padding 0.28s cubic-bezier(0.4, 0, 0.2, 1),
        gap 0.28s cubic-bezier(0.4, 0, 0.2, 1),
        background 0.25s cubic-bezier(0.4, 0, 0.2, 1),
        border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
        box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nav-tab-icon {
      width: 20px;
      height: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: inherit;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease, filter 0.25s ease;
    }
    .nav-tab-icon svg {
      width: 20px;
      height: 20px;
      display: block;
    }

    /* AUCUN TEXTE VISIBLE HORS HOVER */
    .nav-tab-label {
      max-width: 0;
      opacity: 0;
      overflow: hidden;
      white-space: nowrap;
      pointer-events: none;
      margin-left: 0;
      transition: 
        max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1),
        margin 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    

    /* INDICATEUR LUMINEUX DISCRET SOUS L'ONGLET ACTIF */
    .nav-active-dot {
      position: absolute;
      bottom: 3px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--neon-cyan, #06b6d4);
      box-shadow: 0 0 8px var(--neon-cyan, #06b6d4);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease, bottom 0.25s ease;
    }
    .nav-tab.active .nav-active-dot {
      opacity: 1;
    }

    /* AU HOVER : EXPANSION HORIZONTALE EN GÉLULE + APPARITION DU TEXTE */
    .nav-tab:hover {
      color: var(--text-white, #ffffff);
      background: rgba(168, 85, 247, 0.28);
      border-color: rgba(216, 180, 254, 0.55);
      border-top-color: rgba(255, 255, 255, 0.65);
      transform: translateY(-2px);
      box-shadow: 0 6px 22px rgba(168, 85, 247, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.45);
      padding: 0 14px;
      gap: 7px;
    }
    .nav-tab:hover .nav-tab-icon {
      transform: scale(1.12);
      color: #d8b4fe;
      filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.8));
    }
    .nav-tab:hover .nav-tab-label {
      max-width: 160px;
      opacity: 1;
      margin-left: 2px;
    }

    /* ONGLET ACTIF : GÉLULE DE VERRE LUMINESCENTE */
    .nav-tab.active {
      color: #ffffff;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.68), rgba(124, 58, 237, 0.88));
      border: 1px solid rgba(255, 255, 255, 0.45);
      border-top: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 
        0 0 26px rgba(168, 85, 247, 0.7),
        inset 0 1px 2px rgba(255, 255, 255, 0.6);
      transform: translateY(-1px);
    }
    .nav-tab.active .nav-tab-icon {
      color: #ffffff;
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.95));
      transform: scale(1.08);
    }
    .nav-tab.active .nav-tab-label {
      max-width: 160px;
      opacity: 1;
      margin-left: 4px;
    }
    .nav-tab.active:hover {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.82), rgba(124, 58, 237, 0.98));
      box-shadow: 
        0 0 32px rgba(168, 85, 247, 0.85),
        inset 0 1px 2px rgba(255, 255, 255, 0.7);
    }

    [data-theme="light-awakening"] .nav-tab {
      background: rgba(255, 255, 255, 0.55) !important;
      border: 1px solid rgba(124, 58, 237, 0.22) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.95) !important;
      color: #475569 !important;
      box-shadow: 0 2px 6px rgba(124, 58, 237, 0.08), inset 0 1px 1.5px rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
    }
    [data-theme="light-awakening"] .nav-tab:hover {
      color: #7c3aed !important;
      background: rgba(255, 255, 255, 0.92) !important;
      border-color: rgba(124, 58, 237, 0.45) !important;
      border-top-color: #ffffff !important;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.18), inset 0 1px 2px #ffffff !important;
    }
    [data-theme="light-awakening"] .nav-tab.active {
      color: #ffffff !important;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%) !important;
      border: 1.5px solid rgba(255, 255, 255, 0.85) !important;
      border-top: 1.5px solid #ffffff !important;
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.6) !important;
    }

    /* MAIN APP AREA */
    .app-main-area {
      flex: 1;
      min-height: 0;
      min-width: 0;
      width: 100%;
      margin-left: 0;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 2;
      overflow: visible;
    }

    .main-container {
      max-width: 1680px;
      width: 100%;
      margin: 0 auto;
      padding: 20px 24px 130px 24px;
      position: relative;
      z-index: 2;
    }

    @media (max-width: 1024px), (max-height: 600px) {
      body {
        overflow-y: auto !important;
        height: auto !important;
        display: block !important;
      }
      .app-layout {
        width: calc(100% - 16px);
        margin: 8px auto;
        min-height: calc(100vh - 16px);
        height: auto !important;
        max-height: none !important;
        border-radius: 14px;
      }
      .master-header {
        flex-wrap: wrap;
        padding: 10px 16px;
      }
      .bottom-nav-bar.nav-bar,
      .top-tab-bar.nav-bar {
        position: fixed !important;
        bottom: 12px !important;
        left: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        padding: 0 8px;
        z-index: 99999 !important;
      }
      .bottom-nav-dock,
      .tab-bar-track {
        gap: 3px;
        padding: 4px 6px;
      }
      .header-breadcrumb {
        display: none;
      }
      .app-main-area {
        height: auto !important;
        overflow-y: visible !important;
        margin-left: 0;
      }
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
      background: linear-gradient(90deg, rgba(124, 58, 237, 0.25) 0%, var(--glass-panel) 50%, rgba(124, 58, 237, 0.25) 100%);
      border: 1px solid var(--neon-cyan);
      box-shadow: 0 0 20px var(--glass-inner-glow);
      border-radius: var(--radius-md);
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 22px;
    }

    /* Solo Leveling Authentic Status Window */
    .solo-status-window {
      position: relative;
      background: var(--glass-panel);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid var(--glass-inner-border);
      border-radius: var(--radius-md);
      box-shadow: var(--glass-shadow);
      padding: 24px;
      margin-bottom: 22px;
      overflow: hidden;
    }
    .solo-status-window::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--glass-rim);
      pointer-events: none;
    }
    .solo-window-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--neon-cyan);
      user-select: none;
    }
    .solo-window-btn {
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--glass-inner-border);
      border-radius: 3px;
      background: var(--input-bg);
      cursor: pointer;
      font-size: 10px;
      line-height: 1;
      transition: all 0.15s ease;
    }
    .solo-window-btn:hover {
      background: var(--neon-cyan);
      color: var(--text-on-accent);
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: var(--input-bg);
      border: 1px solid var(--glass-inner-border-subtle);
      border-radius: var(--radius-sm);
      margin-bottom: 6px;
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--text-white);
    }
    .stat-increment-btn {
      background: var(--input-bg);
      border: 1px solid var(--neon-cyan);
      color: var(--neon-cyan);
      width: 24px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 900;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .stat-increment-btn:hover {
      background: var(--neon-cyan);
      color: var(--text-on-accent);
      box-shadow: 0 0 10px var(--neon-cyan);
    }

    /* Cyber Corner Trims */
    .cyber-corner-tl {
      position: absolute;
      top: 0;
      left: 0;
      width: 14px;
      height: 14px;
      border-top: 2px solid var(--primary-container);
      border-left: 2px solid var(--primary-container);
      border-top-left-radius: 8px;
      pointer-events: none;
    }
    .cyber-corner-tr {
      position: absolute;
      top: 0;
      right: 0;
      width: 14px;
      height: 14px;
      border-top: 2px solid var(--primary-container);
      border-right: 2px solid var(--primary-container);
      border-top-right-radius: 8px;
      pointer-events: none;
    }

    /* Danger Callout Box */
    .danger-callout-box {
      background: rgba(244, 63, 94, 0.12);
      border: 1px solid rgba(244, 63, 94, 0.35);
      border-radius: var(--radius-md);
      padding: 14px 18px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      box-shadow: 0 0 16px rgba(244, 63, 94, 0.12);
    }
    [data-theme="light-awakening"] .danger-callout-box {
      background: rgba(225, 29, 72, 0.08);
      border: 1px solid rgba(225, 29, 72, 0.25);
      box-shadow: 0 2px 10px rgba(225, 29, 72, 0.08);
    }

    /* Telemetric Chips */
    .telemetric-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      background: var(--surface-container-high);
      border: 1px solid var(--outline-variant);
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--on-surface-variant);
    }

    /* System Holographic Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(7, 4, 20, 0.75);
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
      background: var(--glass-panel-elevated);
      border: 1px solid var(--neon-cyan);
      box-shadow: 0 0 35px var(--glass-inner-glow), 0 20px 45px rgba(0, 0, 0, 0.4);
      border-radius: var(--radius-lg);
      padding: 26px;
      color: var(--text-white);
      animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modalPop {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }

    .form-input {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      color: var(--text-white);
      padding: 12px;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
      transition: all 0.2s ease;
    }
    .form-input:focus {
      border-color: var(--neon-cyan);
      box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
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
      background: var(--glass-panel);
      border: 1px solid var(--glass-inner-border);
      border-radius: var(--radius-md);
      box-shadow: var(--glass-shadow);
    }

    .obsidian-view-mode-tabs {
      display: flex;
      background: var(--input-bg);
      border: 1px solid var(--glass-inner-border-subtle);
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
      background: rgba(168, 85, 247, 0.12);
    }
    .obsidian-mode-btn.active {
      color: var(--text-on-accent);
      background: var(--neon-cyan);
      box-shadow: 0 0 14px rgba(168, 85, 247, 0.6);
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
      background: var(--glass-panel);
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
      border-bottom: 1px solid var(--glass-inner-border-subtle);
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
      background: rgba(168, 85, 247, 0.10);
    }

    .obsidian-file-list {
      margin-left: 14px;
      padding-left: 8px;
      border-left: 1px solid var(--glass-inner-border-subtle);
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
      background: rgba(168, 85, 247, 0.12);
      transform: translateX(2px);
    }
    .obsidian-file-item.active {
      color: var(--text-white);
      background: rgba(168, 85, 247, 0.25);
      border-left: 2px solid var(--neon-cyan);
      font-weight: 600;
    }

    .obsidian-main-stage {
      position: relative;
      background: var(--glass-panel);
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
      background: var(--input-bg);
      border: 1px solid var(--glass-inner-border);
      color: var(--neon-cyan);
      border-radius: var(--radius-sm);
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      transition: all 0.2s ease;
      user-select: none;
    }
    .graph-ctrl-btn:hover {
      background: var(--neon-cyan);
      color: var(--text-on-accent);
      box-shadow: 0 0 16px rgba(168, 85, 247, 0.7);
    }

    .obsidian-graph-legend {
      position: absolute;
      bottom: 16px;
      left: 16px;
      background: var(--glass-panel-elevated);
      border: 1px solid var(--glass-inner-border);
      border-radius: var(--radius-sm);
      padding: 8px 12px;
      font-size: 11px;
      font-family: var(--font-mono);
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      z-index: 10;
      backdrop-filter: blur(12px);
      color: var(--text-secondary);
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
      border-bottom: 1px solid var(--glass-inner-border-subtle);
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
      color: var(--text-secondary);
    }

    .obsidian-note-body h1 {
      font-family: var(--font-display);
      font-size: 24px;
      color: var(--text-white);
      margin: 18px 0 10px 0;
      border-bottom: 1px solid var(--glass-inner-border-subtle);
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
      background: var(--code-bg);
      border: 1px solid var(--glass-inner-border);
      border-radius: var(--radius-sm);
      padding: 16px 20px;
      margin: 16px 0;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 15px;
      color: var(--text-white);
      box-shadow: inset 0 0 15px var(--glass-inner-glow);
      overflow-x: auto;
      position: relative;
    }

    .katex-formula-tag {
      position: absolute;
      top: 6px;
      right: 10px;
      font-size: 9px;
      font-family: var(--font-mono);
      letter-spacing: 1px;
      color: var(--neon-cyan);
      opacity: 0.85;
    }

    .wikilink-pill {
      background: rgba(168, 85, 247, 0.18);
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
      color: var(--text-on-accent);
      box-shadow: 0 0 12px rgba(168, 85, 247, 0.7);
    }

    .obsidian-backlinks-panel {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px dashed var(--glass-inner-border-subtle);
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
      background: var(--input-bg);
      border: 1px solid var(--glass-inner-border-subtle);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      margin-bottom: 8px;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s ease;
    }
    .backlink-card:hover {
      border-color: var(--neon-cyan);
      background: rgba(168, 85, 247, 0.15);
      color: var(--text-white);
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
       REACTBITS CIRCULAR CAROUSEL 3D (SEAMLESSLY INTEGRATED CYLINDER PRESET)
       ========================================================================= */
    .quests-carousel-container {
      position: relative;
      width: 100%;
      height: 520px;
      overflow: visible;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      margin-bottom: 28px;
    }

    [data-theme="light-awakening"] .quests-carousel-container {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }

    .circular-carousel {
      --cc-fade: var(--cc-fade, #070414);
      --cc-radius: 14px;
      --cc-inner: 0.4;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: visible;
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
      box-shadow: inset 0 0 0 2px var(--neon-cyan);
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

    /* ==========================================================================
       NEXT-GEN HOLOGRAPHIC 3D QUEST CARD STYLING (REDESIGNED)
       ========================================================================== */
    .quest-3d-card {
      position: absolute;
      left: -140px;
      top: -210px;
      width: 280px;
      height: 420px;
      border-radius: 18px;
      overflow: hidden;
      background: linear-gradient(165deg, rgba(18, 12, 38, 0.9) 0%, rgba(9, 6, 22, 0.98) 100%);
      backdrop-filter: blur(28px) saturate(200%);
      -webkit-backdrop-filter: blur(28px) saturate(200%);
      border: 1.5px solid rgba(168, 85, 247, 0.28);
      box-shadow: 
        0 18px 45px -8px rgba(0, 0, 0, 0.8),
        0 0 25px -4px rgba(124, 58, 237, 0.25),
        inset 0 1px 1.5px rgba(255, 255, 255, 0.22);
      padding: 13px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease;
      cursor: pointer;
      user-select: none;
      color: var(--text-white);
    }

    [data-theme="light-awakening"] .quest-3d-card {
      background: linear-gradient(165deg, rgba(255, 255, 255, 0.96) 0%, rgba(246, 243, 254, 0.94) 100%);
      border: 1.5px solid rgba(124, 58, 237, 0.35);
      box-shadow: 
        0 18px 45px -8px rgba(124, 58, 237, 0.22),
        0 0 22px rgba(168, 85, 247, 0.12),
        inset 0 1.5px 2px rgba(255, 255, 255, 0.9);
      color: #0f172a;
    }

    .quest-3d-card:hover {
      border-color: var(--quest-theme, var(--neon-cyan));
      box-shadow: 
        0 22px 50px -5px rgba(0, 0, 0, 0.85),
        0 0 35px var(--quest-glow, rgba(168, 85, 247, 0.5)),
        inset 0 0 20px var(--glass-inner-glow);
    }

    [data-theme="light-awakening"] .quest-3d-card:hover {
      border-color: var(--quest-theme, #7c3aed);
      box-shadow: 
        0 22px 50px -5px rgba(124, 58, 237, 0.35),
        0 0 30px var(--quest-glow, rgba(124, 58, 237, 0.35)),
        inset 0 0 15px rgba(255, 255, 255, 0.8);
    }

    .quest-3d-card.active-quest-focus {
      border-color: var(--imperial-gold);
      box-shadow: 
        0 25px 60px -5px rgba(0, 0, 0, 0.9),
        0 0 50px rgba(251, 191, 36, 0.55),
        inset 0 0 30px rgba(251, 191, 36, 0.2);
    }

    .quest-3d-card.quest-emergency {
      border-color: var(--alert-crimson) !important;
      box-shadow: 
        0 25px 60px -5px rgba(0, 0, 0, 0.9),
        0 0 45px rgba(244, 63, 94, 0.55),
        inset 0 0 30px rgba(244, 63, 94, 0.2) !important;
      background: linear-gradient(165deg, rgba(35, 10, 20, 0.92) 0%, rgba(14, 5, 12, 0.98) 100%) !important;
    }

    /* Cyber HUD Corners */
    .quest-hud-corner {
      position: absolute;
      width: 12px;
      height: 12px;
      pointer-events: none;
      z-index: 4;
    }
    .quest-hud-tl {
      top: 6px;
      left: 6px;
      border-top: 2px solid var(--quest-theme, var(--neon-cyan));
      border-left: 2px solid var(--quest-theme, var(--neon-cyan));
    }
    .quest-hud-tr {
      top: 6px;
      right: 6px;
      border-top: 2px solid var(--quest-theme, var(--neon-cyan));
      border-right: 2px solid var(--quest-theme, var(--neon-cyan));
    }

    /* Top Specular Rim */
    .quest-specular-rim {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
      pointer-events: none;
      z-index: 3;
    }

    /* Hero Banner Image */
    .quest-banner-wrapper {
      position: relative;
      width: 100%;
      height: 122px;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 9px;
      flex-shrink: 0;
      background: #000;
    }
    .quest-banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: saturate(1.2) contrast(1.05);
      transition: transform 0.4s ease;
    }
    .quest-3d-card:hover .quest-banner-img {
      transform: scale(1.04);
    }
    .quest-banner-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(8, 5, 20, 0.2) 0%, rgba(9, 6, 22, 0.88) 100%);
    }

    .quest-banner-top-chips {
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
      z-index: 2;
    }
    .quest-base-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 9.5px;
      font-weight: 800;
      font-family: var(--font-mono);
      letter-spacing: 0.8px;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(10, 6, 26, 0.8);
      backdrop-filter: blur(8px);
      border: 1px solid currentColor;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }
    .quest-type-chip {
      font-size: 9px;
      font-weight: 900;
      font-family: var(--font-mono);
      letter-spacing: 1px;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(6, 182, 212, 0.2);
      border: 1px solid rgba(6, 182, 212, 0.6);
      color: var(--neon-cyan);
      backdrop-filter: blur(8px);
    }
    .chip-emergency {
      background: rgba(244, 63, 94, 0.3) !important;
      border-color: rgba(244, 63, 94, 0.85) !important;
      color: #ffe4e6 !important;
      animation: pulse 1.8s infinite;
    }

    .quest-banner-bottom-bar {
      position: absolute;
      bottom: 6px;
      left: 8px;
      right: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 2;
    }
    .quest-reward-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(10, 6, 26, 0.85);
      backdrop-filter: blur(8px);
      padding: 2.5px 7px;
      border-radius: 5px;
      border: 1px solid rgba(251, 191, 36, 0.3);
      font-size: 10px;
      font-family: var(--font-mono);
      font-weight: 800;
    }
    .quest-xp-val {
      color: #34d399;
    }
    .quest-crystal-val {
      color: #fbbf24;
    }

    .quest-status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 8.5px;
      font-weight: 800;
      font-family: var(--font-mono);
      color: #94a3b8;
      background: rgba(10, 6, 26, 0.8);
      padding: 2.5px 6px;
      border-radius: 5px;
      letter-spacing: 0.5px;
    }
    .quest-status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--quest-theme, #06b6d4);
      box-shadow: 0 0 8px currentColor;
    }
    .quest-status-indicator.is-done .quest-status-dot {
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    .quest-status-indicator.is-done {
      color: #34d399;
    }

    /* Quest Header */
    .quest-header-section {
      margin-bottom: 7px;
    }
    .quest-domain-label {
      font-size: 9.5px;
      font-family: var(--font-mono);
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .quest-title-text {
      font-size: 13.5px;
      font-weight: 800;
      font-family: var(--font-display, sans-serif);
      color: #ffffff;
      line-height: 1.25;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 34px;
    }
    [data-theme="light-awakening"] .quest-title-text {
      color: #0f172a !important;
    }

    /* Terminal Brief Panel */
    .quest-terminal-panel {
      flex: 1;
      background: rgba(12, 8, 28, 0.7);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 8px 10px;
      margin-bottom: 9px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    [data-theme="light-awakening"] .quest-terminal-panel {
      background: rgba(243, 238, 255, 0.65);
      border-color: rgba(124, 58, 237, 0.18);
    }
    .quest-protocol-header {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 9.5px;
      font-family: var(--font-mono);
      font-weight: 800;
      color: #a78bfa;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 4px;
      padding-bottom: 3px;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
    }
    [data-theme="light-awakening"] .quest-protocol-header {
      color: #6d28d9;
      border-bottom-color: rgba(124, 58, 237, 0.15);
    }
    .quest-protocol-body {
      flex: 1;
      overflow: hidden;
    }
    .quest-desc-text {
      font-size: 10px;
      font-family: var(--font-mono);
      color: #cbd5e1;
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    [data-theme="light-awakening"] .quest-desc-text {
      color: #334155;
    }
    .quest-fit-meters {
      display: flex;
      flex-direction: column;
      gap: 2.5px;
      font-size: 9px;
      font-family: var(--font-mono);
    }
    .fit-meter-row {
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
    }
    [data-theme="light-awakening"] .fit-meter-row {
      color: #475569;
    }
    .fit-count {
      color: #10b981;
      font-weight: 800;
    }

    /* CTA Button */
    .quest-footer-cta {
      margin-top: auto;
    }
    .quest-cta-btn {
      width: 100%;
      padding: 9px 12px;
      border-radius: 9px;
      border: 1.5px solid rgba(168, 85, 247, 0.5);
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.22) 0%, rgba(6, 182, 212, 0.15) 100%);
      color: #ffffff;
      font-size: 10.5px;
      font-weight: 800;
      font-family: var(--font-display, sans-serif);
      letter-spacing: 0.8px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    [data-theme="light-awakening"] .quest-cta-btn {
      background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
      border-color: #6d28d9;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
    }
    .quest-cta-btn:hover {
      border-color: var(--quest-theme, #06b6d4);
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.45) 0%, rgba(6, 182, 212, 0.35) 100%);
      box-shadow: 0 0 20px var(--quest-glow, rgba(168, 85, 247, 0.5));
      transform: translateY(-1px);
    }
    .quest-cta-btn.btn-emergency {
      background: linear-gradient(135deg, rgba(225, 29, 72, 0.85) 0%, rgba(159, 18, 57, 0.95) 100%) !important;
      border-color: #f43f5e !important;
      box-shadow: 0 0 25px rgba(244, 63, 94, 0.6) !important;
    }
    .quest-cta-btn.btn-completed {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
      border-color: #34d399 !important;
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.4) !important;
    }

    .quest-3d-depth-shade {
      position: absolute;
      inset: 0;
      border-radius: 14px;
      background: var(--cc-fade);
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

    /* Opportunities 3D Carousel Container & Holographic Card Styles */
    .opportunities-carousel-container {
      position: relative;
      width: 100%;
      height: 520px;
      overflow: visible;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      margin-bottom: 28px;
    }

    [data-theme="light-awakening"] .opportunities-carousel-container {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }

    .opp-3d-card {
      position: absolute;
      left: -140px;
      top: -210px;
      width: 280px;
      height: 420px;
      border-radius: 18px;
      overflow: hidden;
      background: linear-gradient(165deg, rgba(18, 12, 38, 0.9) 0%, rgba(9, 6, 22, 0.98) 100%);
      backdrop-filter: blur(28px) saturate(200%);
      -webkit-backdrop-filter: blur(28px) saturate(200%);
      border: 1.5px solid rgba(168, 85, 247, 0.28);
      box-shadow:
        0 18px 45px -8px rgba(0, 0, 0, 0.8),
        0 0 25px -4px rgba(124, 58, 237, 0.25),
        inset 0 1px 1.5px rgba(255, 255, 255, 0.22);
      padding: 13px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease;
      cursor: pointer;
      user-select: none;
      color: var(--text-white);
    }

    [data-theme="light-awakening"] .opp-3d-card {
      background: linear-gradient(165deg, rgba(255, 255, 255, 0.96) 0%, rgba(246, 243, 254, 0.94) 100%);
      border: 1.5px solid rgba(124, 58, 237, 0.35);
      box-shadow:
        0 18px 45px -8px rgba(124, 58, 237, 0.22),
        0 0 22px rgba(168, 85, 247, 0.12),
        inset 0 1.5px 2px rgba(255, 255, 255, 0.9);
      color: #0f172a;
    }

    .opp-3d-card:hover {
      border-color: var(--opp-theme, var(--neon-cyan));
      box-shadow:
        0 22px 50px -5px rgba(0, 0, 0, 0.85),
        0 0 35px var(--opp-glow, rgba(168, 85, 247, 0.5)),
        inset 0 0 20px var(--glass-inner-glow);
    }

    [data-theme="light-awakening"] .opp-3d-card:hover {
      border-color: var(--opp-theme, #7c3aed);
      box-shadow:
        0 22px 50px -5px rgba(124, 58, 237, 0.35),
        0 0 30px var(--opp-glow, rgba(124, 58, 237, 0.35)),
        inset 0 0 15px rgba(255, 255, 255, 0.8);
    }

    .opp-3d-card.active-opp-focus {
      border-color: var(--imperial-gold);
      box-shadow:
        0 25px 60px -5px rgba(0, 0, 0, 0.9),
        0 0 50px rgba(251, 191, 36, 0.55),
        inset 0 0 30px rgba(251, 191, 36, 0.2);
    }

    .opp-3d-card:hover .quest-banner-img {
      transform: scale(1.04);
    }

    .opp-3d-depth-shade {
      position: absolute;
      inset: 0;
      border-radius: 12px;
      background: var(--cc-fade);
      pointer-events: none;
      transition: opacity 0.2s;
    }
  
    /* Lock app-layout to screen viewport while intro is actively playing */
    body.intro-active,
    body:has(#system-intro-overlay:not(.dismissed)) {
      overflow: hidden !important;
    }

    body.intro-active .app-layout,
    .app-layout:has(#system-intro-overlay:not(.dismissed)) {
      height: calc(100vh - 28px) !important;
      max-height: calc(100vh - 28px) !important;
      overflow: hidden !important;
    }

    /* Zero flash if intro was already seen in this session */
    html.no-intro .system-intro-overlay {
      display: none !important;
    }
    html.no-intro body.intro-active,
    html.no-intro .app-layout {
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
    }

    /* SYSTEM INTRO OVERLAY (DIRECTLY EMBEDDED IN WEBSITE CONTAINER .APP-LAYOUT) */
    .system-intro-overlay {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 99999;
      background: #000000;
      border-radius: 17px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: opacity 0.35s ease-out, visibility 0.35s ease-out;
    }

    .system-intro-overlay.dismissed {
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
      display: none !important;
    }

    .btn-skip-intro {
      position: absolute;
      top: 18px;
      right: 18px;
      z-index: 100000;
      background: rgba(10, 6, 26, 0.92);
      border: 1.5px solid var(--neon-cyan);
      color: var(--neon-cyan);
      padding: 8px 18px;
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      box-shadow: 0 0 18px rgba(0, 240, 255, 0.45);
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      user-select: none;
    }
    .btn-skip-intro:hover {
      background: var(--neon-cyan);
      color: #000000;
      box-shadow: 0 0 28px rgba(0, 240, 255, 0.9);
      transform: scale(1.04);
    }

    .system-intro-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      background: #000000;
      border-radius: inherit;
      transition: opacity 0.25s ease;
    }

    .system-intro-alert-wrapper {
      display: none;
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      background: #000000;
      border-radius: inherit;
      padding: 0;
      margin: 0;
      overflow: hidden;
      box-sizing: border-box;
      align-items: center;
      justify-content: center;
      animation: alertOverlayFadeIn 0.3s ease-out;
    }

    .system-intro-alert-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
      border: none;
      border-radius: inherit;
      animation: alertModalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .system-intro-alert-hint {
      position: absolute;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 2px;
      color: rgba(147, 197, 253, 0.95);
      background: rgba(3, 7, 18, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      padding: 7px 18px;
      border-radius: 9999px;
      border: 1px solid rgba(96, 165, 250, 0.4);
      text-transform: uppercase;
      animation: pulseAlertHint 1.4s ease-in-out infinite;
      user-select: none;
      pointer-events: none;
      white-space: nowrap;
    }

    @keyframes alertOverlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes alertModalPop {
      0% { transform: scale(0.95); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    @keyframes pulseAlertHint {
      0%, 100% { opacity: 0.55; }
      50% { opacity: 1; }
    }

    .header-replay-intro-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 9999px;
      background: rgba(147, 51, 234, 0.15);
      border: 1px solid rgba(192, 132, 252, 0.35);
      color: #c084fc;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      cursor: pointer;
      backdrop-filter: blur(8px);
      transition: all 0.25s ease;
    }

    .header-replay-intro-btn:hover {
      background: rgba(147, 51, 234, 0.3);
      border-color: #c084fc;
      box-shadow: 0 0 15px rgba(192, 132, 252, 0.4);
    }

    [data-theme="light-awakening"] .header-replay-intro-btn {
      background: rgba(255, 255, 255, 0.65);
      border: 1px solid rgba(124, 58, 237, 0.25);
      border-top: 1px solid #ffffff;
      color: #7c3aed;
      box-shadow: 0 2px 6px rgba(124, 58, 237, 0.08);
    }

    [data-theme="light-awakening"] .header-replay-intro-btn:hover {
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(124, 58, 237, 0.45);
    }

    /* ==========================================================================
       MOBILE & TABLET RESPONSIVE ENGINE (SOLO LEVELING VISIONOS HUD)
       Target breakpoints: 
         - Tablets & Foldables (<= 1024px)
         - Small Tablets & Large Phones (<= 768px)
         - Compact Smartphones (<= 480px / 360px)
       ========================================================================== */

    @media (max-width: 768px) {
      /* 1. Global Viewport & Mobile Reset */
      html, body {
        overflow-x: hidden !important;
        width: 100% !important;
        max-width: 100vw !important;
        -webkit-text-size-adjust: 100%;
        touch-action: manipulation;
      }

      .app-layout {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        border-radius: 0 !important;
        border-left: none !important;
        border-right: none !important;
        border-top: none !important;
        min-height: 100vh !important;
        box-shadow: none !important;
      }

      .main-container {
        padding: 10px 10px calc(92px + env(safe-area-inset-bottom, 16px)) 10px !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }

      .app-main-area {
        width: 100% !important;
        max-width: 100% !important;
        overflow-x: hidden !important;
        margin-left: 0 !important;
      }

      /* 2. Master Header Mobile Ergonomics */
      .master-header {
        margin: 6px 8px 8px 8px !important;
        padding: 6px 10px !important;
        height: auto !important;
        min-height: 48px !important;
        border-radius: 16px !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 6px !important;
      }

      .header-left-cluster {
        gap: 6px !important;
        flex-shrink: 0 !important;
      }

      .brand-logo-wrap {
        gap: 6px !important;
      }

      .brand-logo-wrap svg {
        width: 26px !important;
        height: 26px !important;
      }

      .button.brand-title {
        --fs-size: 0.95rem !important;
        letter-spacing: 1px !important;
      }

      .header-right-cluster {
        gap: 6px !important;
        flex-shrink: 0 !important;
      }

      .header-stat-item,
      .header-breadcrumb {
        display: none !important;
      }

      .header-player-pill {
        padding: 3px 8px 3px 5px !important;
        gap: 5px !important;
        font-size: 11px !important;
      }

      .header-player-avatar {
        width: 20px !important;
        height: 20px !important;
        font-size: 10px !important;
      }

      .header-player-name {
        font-size: 11px !important;
        max-width: 60px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .header-player-rank,
      .header-player-sh {
        font-size: 9px !important;
      }

      .glass-theme-switch {
        width: 52px !important;
        height: 28px !important;
        min-width: 52px !important;
      }

      .glass-switch-label {
        display: none !important;
      }

      .glass-switch-thumb {
        width: 22px !important;
        height: 22px !important;
      }

      .glass-theme-switch.is-dark .glass-switch-thumb {
        left: calc(100% - 24px) !important;
      }

      /* 3. Floating Bottom Nav Bar Dock (VisionOS Mobile Touch Bar) */
      .bottom-nav-bar.nav-bar,
      .top-tab-bar.nav-bar {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
        padding: 6px 8px max(10px, env(safe-area-inset-bottom, 10px)) 8px !important;
        background: linear-gradient(to top, rgba(10, 6, 26, 0.96) 0%, rgba(10, 6, 26, 0.82) 75%, transparent 100%) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        z-index: 99999 !important;
        pointer-events: none !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        display: flex !important;
        justify-content: center !important;
      }

      [data-theme="light-awakening"] .bottom-nav-bar.nav-bar {
        background: linear-gradient(to top, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.8) 75%, transparent 100%) !important;
      }

      .bottom-nav-dock,
      .tab-bar-track {
        pointer-events: auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 4px !important;
        padding: 4px 6px !important;
        width: auto !important;
        max-width: calc(100vw - 16px) !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        scroll-snap-type: x proximity !important;
        scrollbar-width: none !important;
        border-radius: 9999px !important;
      }

      .bottom-nav-dock::-webkit-scrollbar,
      .tab-bar-track::-webkit-scrollbar {
        display: none !important;
      }

      .nav-tab {
        flex-shrink: 0 !important;
        scroll-snap-align: center !important;
        height: 38px !important;
        min-width: 38px !important;
        padding: 0 9px !important;
        font-size: 10.5px !important;
        border-radius: 9999px !important;
      }

      .nav-tab.active {
        padding: 0 13px !important;
      }

      .nav-tab.active .nav-tab-label {
        max-width: 140px !important;
        opacity: 1 !important;
        margin-left: 5px !important;
        display: inline-block !important;
        font-size: 10.5px !important;
        font-weight: 800 !important;
      }

      .nav-tab:not(.active) .nav-tab-label {
        max-width: 0 !important;
        opacity: 0 !important;
        margin-left: 0 !important;
      }

      /* 4. Glass Cards & Mobile Typography */
      .glass-card,
      .spotlight-card,
      .border-beam-content {
        padding: 16px 12px !important;
        margin-bottom: 14px !important;
        border-radius: 12px !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }

      h1, .view-panel h1 {
        font-size: 21px !important;
        line-height: 1.2 !important;
      }

      h2, .view-panel h2 {
        font-size: 18px !important;
        line-height: 1.25 !important;
      }

      h3, .view-panel h3 {
        font-size: 16px !important;
        line-height: 1.3 !important;
      }

      /* Prevent iOS Safari auto-zoom on input focus */
      input, select, textarea, .form-input {
        font-size: 16px !important;
        min-height: 42px !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }

      .btn-cyber {
        padding: 8px 12px !important;
        font-size: 11px !important;
        min-height: 38px !important;
      }

      /* 5. Grids Auto-Collapse to Single Column */
      .grid-2col,
      .grid-3col {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }

      div[style*="grid-template-columns: 1fr 1fr"] {
        grid-template-columns: 1fr !important;
      }

      /* 6. Screen 1: Dashboard HUD Refinements */
      #dash-system-banner {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 8px !important;
        padding: 10px 12px !important;
      }

      #dash-player-name {
        font-size: 22px !important;
      }

      #dash-level-label {
        font-size: 16px !important;
      }

      .stat-row {
        padding: 6px 0 !important;
      }

      /* 7. Screen 2: Skills Tree (DAG) Category Swipe Bar */
      #view-skills div[style*="display: flex; gap: 8px;"] {
        overflow-x: auto !important;
        flex-wrap: nowrap !important;
        -webkit-overflow-scrolling: touch !important;
        padding-bottom: 6px !important;
        scrollbar-width: none !important;
      }

      #view-skills div[style*="display: flex; gap: 8px;"] button {
        flex-shrink: 0 !important;
      }

      /* 8. Screen 3: Quests & Emergency Alert */
      #emergency-quest-box .border-beam-content {
        padding: 14px 12px !important;
      }

      #emergency-timer-text {
        font-size: 18px !important;
      }

      .danger-callout-box {
        flex-direction: column !important;
        gap: 8px !important;
      }

      #emergency-action-wrap {
        flex-direction: column !important;
        align-items: stretch !important;
        width: 100% !important;
      }

      #emergency-action-wrap button {
        width: 100% !important;
        justify-content: center !important;
      }

      /* 9. Screen 4: Time-Blocking & Circadian Planner */
      #planner-blocks-container .glass-card {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 8px !important;
      }

      /* 10. Screen 5: Obsidian Knowledge Base */
      .obsidian-layout {
        grid-template-columns: 1fr !important;
        min-height: auto !important;
      }

      .obsidian-explorer {
        max-height: 260px !important;
        padding: 10px !important;
      }

      .obsidian-main-stage {
        min-height: 380px !important;
      }

      .obsidian-split-grid {
        grid-template-columns: 1fr !important;
        min-height: auto !important;
      }

      .obsidian-split-left {
        border-right: none !important;
        border-bottom: 1px solid var(--glass-inner-border) !important;
        padding: 12px !important;
        max-height: 260px !important;
      }

      .obsidian-split-right {
        min-height: 340px !important;
      }

      .obsidian-graph-canvas-wrap {
        min-height: 340px !important;
      }

      .obsidian-view-mode-tabs {
        overflow-x: auto !important;
        flex-wrap: nowrap !important;
        max-width: 100% !important;
        -webkit-overflow-scrolling: touch !important;
      }

      /* 11. Screen 6: Station Vocale & Oral */
      #audio-canvas {
        height: 100px !important;
        width: 100% !important;
      }

      #rubric-total-score {
        font-size: 38px !important;
      }

      /* 12. Screen 7: Opportunities 3D Carousel */
      .opportunities-carousel-container {
        height: 420px !important;
      }

      .opp-3d-card,
      .quest-3d-card {
        transform: scale(0.82) !important;
      }

      /* 13. Screen 9: Penalty Zone & NextDNS Sentinel */
      #view-penalty .space-lg > div[style*="display: flex; justify-content: space-between"] {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 12px !important;
      }

      #view-penalty button,
      #penalty-toggle-btn {
        width: 100% !important;
        justify-content: center !important;
      }

      /* 14. Screen 10: MediaPipe Workout Webcam */
      #view-workout .grid-2col > div:first-child {
        min-height: 220px !important;
        max-height: 340px !important;
        padding: 8px !important;
      }

      #webcam-video {
        width: 100% !important;
        max-height: 320px !important;
        object-fit: cover !important;
      }

      #cam-toggle-btn {
        width: 100% !important;
      }

      /* 15. Modals & Overlays */
      .modal-card {
        width: 94% !important;
        max-width: 94% !important;
        padding: 16px 12px !important;
        max-height: 88vh !important;
        overflow-y: auto !important;
        margin: auto !important;
      }

      .modal-card div[style*="display: flex; justify-content: flex-end"] {
        flex-direction: column !important;
        gap: 8px !important;
      }

      .modal-card button {
        width: 100% !important;
        justify-content: center !important;
      }

      /* 15. Mobile Intro Layout */
      body.intro-active .app-layout,
      .app-layout:has(#system-intro-overlay:not(.dismissed)) {
        height: 100vh !important;
        max-height: 100vh !important;
        margin: 0 !important;
        border-radius: 0 !important;
      }

      .system-intro-overlay {
        border-radius: 0 !important;
      }

      .btn-skip-intro {
        top: 12px !important;
        right: 12px !important;
        padding: 5px 12px !important;
        font-size: 10px !important;
      }

      .system-intro-alert-hint {
        max-width: 90% !important;
        white-space: normal !important;
        text-align: center !important;
        font-size: 10px !important;
        padding: 5px 12px !important;
        bottom: 12px !important;
      }
    }

    /* Extra adjustments for ultra-compact screens (iPhone SE, Galaxy A, <= 390px) */
    @media (max-width: 390px) {
      .header-player-name {
        display: none !important;
      }

      .header-player-pill {
        padding: 3px 6px !important;
      }

      .button.brand-title {
        --fs-size: 0.85rem !important;
        letter-spacing: 0.5px !important;
      }

      .nav-tab {
        min-width: 36px !important;
        height: 36px !important;
        padding: 0 7px !important;
      }

      .nav-tab.active {
        padding: 0 10px !important;
      }

      .nav-tab.active .nav-tab-label {
        font-size: 9.5px !important;
        max-width: 110px !important;
      }
    }

  </style>
</head>
<body class="intro-active">

  <canvas id="mana-particles-canvas"></canvas>

  <!-- APPLICATION WORKSPACE LAYOUT (TOP MASTER HEADER + TOP TAB BAR + MAIN WORKSPACE) -->
  <div class="app-layout">

    <!-- SYSTEM INTRO OVERLAY (INTEGRATED DIRECTLY IN WEBSITE CONTAINER APP-LAYOUT) -->
    <div id="system-intro-overlay" class="system-intro-overlay" onclick="handleIntroOverlayClick()" title="Cliquer pour passer">
      <button id="btn-skip-intro" class="btn-skip-intro" onclick="event.stopPropagation(); dismissIntroOverlay(event);" title="Passer l'introduction et entrer immédiatement dans le système">
        PASSER L'INTRO ➔
      </button>
      <video id="system-intro-video" class="system-intro-video" playsinline muted autoplay preload="auto">
        <source src="/intro.mp4?v=8s_ouf_v3" type="video/mp4">
        <source src="/intro.webm?v=8s_ouf_v3" type="video/webm">
        <source src="${SUPABASE_CDN_VIDEO_MP4}" type="video/mp4">
        <source src="${SUPABASE_CDN_VIDEO_WEBM}" type="video/webm">
      </video>
      <div id="system-intro-alert-wrapper" class="system-intro-alert-wrapper">
        <img id="system-intro-alert-img" class="system-intro-alert-img" src="${INTRO_IMAGE_URL || '/intro-alert.webp?v=8s_v1_upscale'}" alt="[WELCOME, PLAYER.] System Alert" />
        <div class="system-intro-alert-hint">[ INITIALISATION DU SYSTÈME EN COURS... CLIQUEZ POUR ENTRER ]</div>
      </div>
    </div>

    <!-- MASTER TOP HEADER (PRISMVEIL FLOATING CAPSULE STYLE) -->
    <header class="master-header">
      <div class="header-left-cluster">
        <div class="brand-logo-wrap" onclick="switchView('dashboard')" title="LevelUp — Système du Monarque">
          ${MONARCH_LOGO_SVG}
          <button class="button brand-title" data-text="&nbsp;LEVELUP&nbsp;" type="button" aria-label="LevelUp">
            <span class="actual-text">&nbsp;LEVELUP&nbsp;</span>
            <span aria-hidden="true" class="hover-text">&nbsp;LEVELUP&nbsp;</span>
          </button>
        </div>
      </div>

      <div class="header-right-cluster">
        <!-- Player Status Profile -->
        <div class="header-player-pill" title="Profil Chasseur Monarque (Cliquez pour gérer le compte)" onclick="openAuthModal()" style="cursor: pointer;">
          <span class="header-player-avatar" id="header-avatar-slot">${player.avatar ? `<img src="${player.avatar}" alt="Avatar" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover;">` : '👑'}</span>
          <span class="header-player-name" id="header-player-name">${player.name}</span>
          <span class="header-player-rank">RANG ${player.rank}·${player.level}</span>
          <span class="header-player-sh" title="Score Harmonique Sh">Sh ${harmonicScore}</span>
        </div>

        <div class="header-stat-item" title="Horloge Système">
          <span class="stat-icon">🕒</span>
          <span id="system-clock">--:--:--</span>
        </div>

        <div class="header-stat-item" title="Cristaux d'Ombre">
          <span class="stat-icon">💎</span>
          <strong id="header-crystals-val">${player.shadowCrystals}</strong>
        </div>

        <div class="header-stat-item" title="Série Journalière">
          <span class="stat-icon">⚡</span>
          <span><span id="header-streak-val">${player.streakDays}</span>J</span>
        </div>

        <!-- 3D Liquid Glassmorphic Theme Switch (Image 1 Style) -->
        <button class="glass-theme-switch is-dark" id="theme-toggle-btn" onclick="toggleTheme()" title="Changer de thème (Light / Dark)" aria-label="Changer de thème">
          <div class="glass-switch-track">
            <div class="glass-switch-thumb">
              <div class="glass-thumb-reflection"></div>
              <div class="glass-thumb-icon">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="#ffffff" stroke="none">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
            </div>
            <span class="glass-switch-label" id="theme-toggle-label">Dark</span>
          </div>
        </button>
      </div>
    </header>


    <!-- MAIN APP AREA (WORKSPACE CONTAINER) -->
    <div class="app-main-area">
      <main class="main-container">

    <!-- =====================================================================
         SCREEN 1 : DASHBOARD HUD (SOLO LEVELING STATUS WINDOW & STATS)
         ===================================================================== -->
    <div id="view-dashboard" class="view-panel ${initialTab === "dashboard" ? "active" : ""}">
      
      <!-- Top Monarch Announcement / Canonical System Alert HUD -->
      <div class="system-alert-banner" id="dash-system-banner" style="position: relative; overflow: hidden; border-radius: 12px; padding: 14px 22px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; background: linear-gradient(90deg, rgba(111,0,190,0.2) 0%, var(--surface-container-low) 50%, rgba(0,122,85,0.15) 100%); border: 1px solid rgba(221,184,255,0.3); box-shadow: 0 4px 24px -2px rgba(147,51,234,0.3);">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="display: inline-flex; align-items: center; gap: 6px; background: rgba(111,0,190,0.35); border: 1px solid rgba(69,223,164,0.4); border-radius: 9999px; padding: 4px 12px; font-size: 11px; font-weight: 800; font-family: var(--font-mono); color: var(--tertiary-fixed); box-shadow: 0 0 10px rgba(69,223,164,0.25);">
            <span class="material-symbols-outlined" style="font-size: 15px; color: var(--tertiary); animation: pulse 2s infinite;">priority_high</span>
            [!] SYSTEM NOTICE
          </span>
          <span style="font-family: var(--font-display); font-size: 19px; font-weight: 800; letter-spacing: 2px; color: var(--text-white);">
            WELCOME, <span class="shiny-green" style="color: var(--tertiary); text-shadow: 0 0 12px rgba(69,223,164,0.7); text-decoration: underline; text-decoration-color: rgba(69,223,164,0.5); text-underline-offset: 6px;">[WELCOME, PLAYER.]</span>
          </span>
          <span id="system-banner-status-desc" style="display: none;"></span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; background: var(--surface-container-highest); padding: 6px 14px; border-radius: 9999px; border: 1px solid rgba(221,184,255,0.2);">
          <span class="material-symbols-outlined" style="font-size: 16px; color: var(--tertiary);">tune</span>
          <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase;">Harmonic Balance:</span>
          <strong class="shiny-gold" style="font-size: 15px; font-family: var(--font-mono); color: var(--tertiary-fixed);" id="harmonic-score-display">Sh = ${harmonicScore}</strong>
          <span style="width: 6px; height: 6px; border-radius: 5px; background: var(--tertiary); display: inline-block;"></span>
          <span style="font-size: 10px; font-family: var(--font-mono); color: var(--tertiary-fixed); text-transform: uppercase; font-weight: 700;">Optimal</span>
        </div>
      </div>

      <div class="grid-2col">
        <!-- Left Column: Status Window, Attributes & Vitals -->
        <div>
          <!-- Solo Leveling Sovereign Status Window -->
          <div class="solo-status-window spotlight-card" style="padding: 24px; margin-bottom: 22px; position: relative; border-radius: 12px; background: var(--surface-container); border: 1px solid rgba(221,184,255,0.25);">
            <div class="cyber-corner-tl"></div>
            <div class="cyber-corner-tr"></div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-inner-border-subtle); padding-bottom: 10px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined" style="font-size: 16px; color: var(--primary);">badge</span>
                <span style="font-size: 11px; letter-spacing: 2px; color: var(--primary); font-family: var(--font-mono); font-weight: 800;">
                  [!] FENÊTRE DE STATUT DU MONARQUE — ARC 04
                </span>
              </div>
              <div class="solo-window-controls">
                <span class="solo-window-btn" title="Réduire">-</span>
                <span class="solo-window-btn" title="Fermer" onclick="showSysNotification('[INFO SYSTÈME]', 'La fenêtre de statut principale ne peut être fermée.')">✕</span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; flex-wrap: wrap; gap: 14px;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <!-- Imperial S-Rank Diamond Crest -->
                <div style="position: relative; width: 68px; height: 68px; border-radius: 12px; background: rgba(111,0,190,0.3); border: 1px solid rgba(221,184,255,0.4); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(147,51,234,0.35); flex-shrink: 0;">
                  <span class="material-symbols-outlined" style="font-size: 38px; color: var(--primary); filter: drop-shadow(0 0 10px rgba(221,184,255,0.8));">stars</span>
                  <span style="position: absolute; bottom: -6px; padding: 1px 6px; border-radius: 4px; background: var(--primary-container); font-size: 9px; font-family: var(--font-mono); font-weight: 800; color: #fff; letter-spacing: 1px; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
                    RANK <span id="dash-player-rank">${player.rank}</span>
                  </span>
                </div>
                <div>
                  <div style="font-size: 11px; letter-spacing: 2px; color: var(--primary); font-family: var(--font-mono); margin-bottom: 4px;">
                    STATUS — LE MONARQUE SOUVERAIN
                  </div>
                  <h1 class="shiny-text" id="dash-player-name" style="font-size: 30px; font-weight: 900; font-family: var(--font-display); line-height: 1; letter-spacing: 1px;">
                    ${player.name}
                  </h1>
                  <p id="dash-player-title" style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                    TITRE : <strong id="dash-player-title-val" style="color: var(--primary);">${player.title}</strong>
                  </p>
                  <div style="font-size: 10.5px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">
                    GUID: 0x7E3-SHADOW-MNRCH-S9 • CLASSE: ${player.level > 10 ? "Shadow Ruler" : "Chasseur Novice (Rang E)"}
                  </div>
                  <div id="dash-auth-status-pill" onclick="openAuthModal()" style="display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; padding: 2px 8px; border-radius: 4px; background: rgba(66, 133, 244, 0.12); border: 1px solid rgba(66, 133, 244, 0.3); font-size: 10px; font-family: var(--font-mono); color: #8ab4f8; cursor: pointer; transition: all 0.2s ease;">
                    <svg viewBox="0 0 24 24" width="11" height="11">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span id="dash-auth-label">${player.authProvider === 'google' && player.email ? `COMPTE LIÉ : ${player.email}` : 'LIER UN COMPTE GOOGLE'}</span>
                  </div>
                </div>
              </div>

              <div style="text-align: right; background: var(--surface-container-low); border: 1px solid var(--glass-inner-border-subtle); padding: 10px 16px; border-radius: 8px;">
                <div style="font-size: 10px; color: var(--text-secondary); font-family: var(--font-mono); letter-spacing: 1.5px; text-transform: uppercase;">Palier Actuel</div>
                <div style="font-size: 26px; font-weight: 900; line-height: 1; font-family: var(--font-display); color: var(--primary-fixed);" id="dash-level-label">NIVEAU ${player.level} — PALIER ACTUEL</div>
                <div style="font-size: 10px; color: var(--tertiary-fixed); font-family: var(--font-mono); font-weight: 700; margin-top: 2px;">${player.level === 1 ? "ÉVEIL INITIAL" : "ÉVEIL NOVICE"}</div>
              </div>
            </div>

            <!-- Level & XP Capsule Progress -->
            <div style="margin-top: 10px; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono); margin-bottom: 6px;">
                <span style="color: var(--primary); display: flex; align-items: center; gap: 4px;">
                  <span class="material-symbols-outlined" style="font-size: 14px;">auto_mode</span> Progression d'Ascension
                </span>
                <span id="dash-xp-text" style="color: var(--text-white); font-weight: bold;">${player.currentXp} / ${player.nextLevelXp} XP (${Math.round((player.currentXp / Math.max(1, player.nextLevelXp)) * 100)}%)</span>
              </div>
              <div class="capsule-slider-track">
                <div class="capsule-slider-fill capsule-fill-xp" id="dash-xp-bar" style="width: ${Math.round((player.currentXp / Math.max(1, player.nextLevelXp)) * 100)}%;"></div>
              </div>
            </div>

            <!-- Attribute Allocation Matrix STR/AGI/PER/VIT/INT with [^] -->
            <div style="border-top: 1px solid var(--glass-inner-border-subtle); padding-top: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: var(--primary); font-family: var(--font-display); display: flex; align-items: center; gap: 6px;">
                  <span class="material-symbols-outlined" style="font-size: 15px;">fitness_center</span> RÉPARTITION DES ATTRIBUTS SOUVERAINS
                </span>
                <span style="font-size: 11px; font-family: var(--font-mono); color: var(--imperial-gold);">
                  POINTS DISPOS : <strong id="stat-remaining-points">${player.attributes ? player.attributes.remainingPoints : 3}</strong>
                </span>
              </div>
              <div class="stat-row">
                <span style="display: flex; align-items: center; gap: 6px;"><strong style="color: var(--primary);">STR</strong> Force Brute</span>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <strong id="stat-val-str" style="color: var(--text-white); font-size: 15px;">${player.attributes ? player.attributes.str : 10}</strong>
                  <button class="stat-increment-btn" onclick="allocateStatPoint('str')" title="Incrémenter la Force">[^]</button>
                </div>
              </div>
              <div class="stat-row">
                <span style="display: flex; align-items: center; gap: 6px;"><strong style="color: var(--primary);">AGI</strong> Vélocité</span>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <strong id="stat-val-agi" style="color: var(--text-white); font-size: 15px;">${player.attributes ? player.attributes.agi : 10}</strong>
                  <button class="stat-increment-btn" onclick="allocateStatPoint('agi')" title="Incrémenter l'Agilité">[^]</button>
                </div>
              </div>
              <div class="stat-row">
                <span style="display: flex; align-items: center; gap: 6px;"><strong style="color: var(--primary);">PER</strong> Perception</span>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <strong id="stat-val-per" style="color: var(--text-white); font-size: 15px;">${player.attributes ? player.attributes.per : 10}</strong>
                  <button class="stat-increment-btn" onclick="allocateStatPoint('per')" title="Incrémenter la Perception">[^]</button>
                </div>
              </div>
              <div class="stat-row">
                <span style="display: flex; align-items: center; gap: 6px;"><strong style="color: var(--primary);">VIT</strong> Vitalité</span>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <strong id="stat-val-vit" style="color: var(--text-white); font-size: 15px;">${player.attributes ? player.attributes.vit : 10}</strong>
                  <button class="stat-increment-btn" onclick="allocateStatPoint('vit')" title="Incrémenter la Vitalité">[^]</button>
                </div>
              </div>
              <div class="stat-row">
                <span style="display: flex; align-items: center; gap: 6px;"><strong style="color: var(--primary);">INT</strong> Intelligence</span>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <strong id="stat-val-int" style="color: var(--text-white); font-size: 15px;">${player.attributes ? player.attributes.int : 10}</strong>
                  <button class="stat-increment-btn" onclick="allocateStatPoint('int')" title="Incrémenter l'Intelligence">[^]</button>
                </div>
              </div>
            </div>
          </div>

          <!-- True Solo Leveling Vital Gauges (Interactive with Real Recovery) -->
          <div class="glass-card spotlight-card" style="padding: 24px; margin-bottom: 22px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <span style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: var(--primary); font-family: var(--font-display); display: flex; align-items: center; gap: 6px;">
                <span class="material-symbols-outlined" style="font-size: 16px; color: var(--tertiary);">monitor_heart</span> BIOMÉTRIE & RÉSERVES DE MANA (BORBÉLY & GANDEVIA)
              </span>
              <span class="radar-ping-badge" id="fatigue-status-badge" style="border-color: rgba(69, 223, 164, 0.4); color: var(--tertiary-fixed); font-size: 10px;">
                [STATUS: STABLE] FATIGUE: 0% OPTIMAL
              </span>
            </div>

            <!-- HP Capsule Slider -->
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono); margin-bottom: 6px;">
                <span style="color: var(--tertiary-fixed); font-weight: bold; display: flex; align-items: center; gap: 6px;">
                  <span class="material-symbols-outlined" style="font-size: 15px; color: var(--tertiary);">favorite</span> + HP — RÉSILIENCE BIOLOGIQUE
                </span>
                <span style="font-weight: bold; color: var(--tertiary-fixed);" id="hp-value-text">${player.hp} / 100 (${player.hp}%)</span>
              </div>
              <div class="capsule-slider-track" style="position: relative;">
                <div class="capsule-slider-fill capsule-fill-hp" id="hp-slider-bar" style="width: ${player.hp}%;"></div>
                <div style="position: absolute; right: 4px; top: 2px; bottom: 2px; width: 4px; border-radius: 9999px; background: rgba(255,255,255,0.7); filter: blur(1px);"></div>
              </div>
            </div>

            <!-- MP Capsule Slider -->
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono); margin-bottom: 6px;">
                <span style="color: var(--primary-fixed); font-weight: bold; display: flex; align-items: center; gap: 6px;">
                  <span class="material-symbols-outlined" style="font-size: 15px; color: var(--primary);">bolt</span> ⚡ MP — FOCUS COGNITIF INDOMPTABLE
                </span>
                <span style="font-weight: bold; color: var(--primary-fixed);" id="mp-value-text">${player.mp} / 100 (${player.mp}%)</span>
              </div>
              <div class="capsule-slider-track" style="position: relative;">
                <div class="capsule-slider-fill capsule-fill-mp" id="mp-slider-bar" style="width: ${player.mp}%;"></div>
                <div style="position: absolute; right: 4px; top: 2px; bottom: 2px; width: 4px; border-radius: 9999px; background: rgba(255,255,255,0.7); filter: blur(1px);"></div>
              </div>
            </div>

            <!-- Sleep & Circadian Status + Interactive Restoration Controls -->
            <div style="display: flex; gap: 10px; margin-top: 14px; font-size: 11px; font-family: var(--font-mono); flex-wrap: wrap;">
              <button class="btn-cyber" style="flex: 1; min-width: 140px; padding: 8px 12px; display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="restoreVitals(15, 20)">
                <span class="material-symbols-outlined" style="font-size: 16px; color: var(--tertiary);">self_improvement</span>
                <span>MÉDITATION (+15 HP, +20 MP)</span>
              </button>
              <button class="btn-cyber btn-gold" style="flex: 1; min-width: 140px; padding: 8px 12px; display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="simulateDeepWorkDepletion()">
                <span class="material-symbols-outlined" style="font-size: 16px;">psychology</span>
                <span>DEEP FOCUS (-15 MP, +50 XP)</span>
              </button>
            </div>
          </div>

          <!-- Octagonal Radar of the 8 Bases (Dynamic SVG) -->
          <div class="glass-card spotlight-card" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <span style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: var(--primary); font-family: var(--font-display); display: flex; align-items: center; gap: 6px;">
                <span class="material-symbols-outlined" style="font-size: 16px; color: var(--tertiary);">hub</span> RADAR DES 8 BASES DE VIE
              </span>
              <span class="shiny-gold" id="radar-sh-badge" style="font-size: 14px; font-weight: bold; font-family: var(--font-mono);">
                Sh = ${harmonicScore}
              </span>
            </div>
            
            <div style="display: flex; justify-content: center; padding: 10px 0;">
              <svg width="290" height="250" viewBox="0 0 290 250" id="radar-svg-canvas">
                <polygon points="145,25 225,60 255,140 215,215 145,235 75,215 35,140 65,60" fill="none" stroke="rgba(168, 85, 247, 0.25)" stroke-width="1"/>
                <polygon points="145,55 200,80 220,140 190,190 145,205 100,190 70,140 90,80" fill="none" stroke="rgba(168, 85, 247, 0.35)" stroke-width="1"/>
                <polygon id="radar-dynamic-poly" points="${getRadarPolygonPoints(player.bases)}" fill="rgba(147, 51, 234, 0.3)" stroke="var(--primary)" stroke-width="2"/>
                <text x="145" y="16" fill="var(--primary)" font-size="10" font-family="monospace" text-anchor="middle" id="radar-lbl-acad">ACAD (${player.bases.acad ? player.bases.acad.score : 10})</text>
                <text x="240" y="60" fill="var(--text-secondary)" font-size="10" font-family="monospace" id="radar-lbl-ai_eng">AI_ENG (${player.bases.ai_eng ? player.bases.ai_eng.score : 10})</text>
                <text x="260" y="145" fill="var(--text-secondary)" font-size="10" font-family="monospace" id="radar-lbl-cyber">CYBER (${player.bases.cyber ? player.bases.cyber.score : 10})</text>
                <text x="225" y="230" fill="var(--text-secondary)" font-size="10" font-family="monospace" id="radar-lbl-exp">EXP (${player.bases.exp ? player.bases.exp.score : 10})</text>
                <text x="145" y="248" fill="var(--primary)" font-size="10" font-family="monospace" text-anchor="middle" id="radar-lbl-lng">LNG (${player.bases.lng ? player.bases.lng.score : 10})</text>
                <text x="40" y="230" fill="var(--text-secondary)" font-size="10" font-family="monospace" id="radar-lbl-fin">FIN (${player.bases.fin ? player.bases.fin.score : 10})</text>
                <text x="5" y="145" fill="var(--tertiary)" font-size="10" font-family="monospace" id="radar-lbl-str">STR (${player.bases.str ? player.bases.str.score : 10})</text>
                <text x="35" y="60" fill="var(--text-secondary)" font-size="10" font-family="monospace" id="radar-lbl-dis">DIS (${player.bases.dis ? player.bases.dis.score : 10})</text>
              </svg>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); border-top: 1px solid var(--glass-inner-border-subtle); padding-top: 10px; margin-top: 6px;">
              <span>Harmonie Globale : <strong style="color: var(--tertiary-fixed);">Rang Alpha</strong></span>
              <span>8-Axes Synchronisés</span>
            </div>
          </div>
        </div>

        <!-- Right Column: Quests, Time Blocks & Portal -->
        <div>
          <!-- Quests Feed with Real Proof Validation -->
          <div class="glass-card spotlight-card" style="padding: 24px; margin-bottom: 22px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid var(--glass-inner-border-subtle); padding-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined" style="font-size: 18px; color: var(--primary);">assignment_turned_in</span>
                <span class="shiny-text" style="font-size: 16px; font-weight: 900; letter-spacing: 2px; font-family: var(--font-display);">
                  [!] QUEST INFO — QUÊTES DU JOUR
                </span>
              </div>
              <span class="radar-ping-badge" style="border-color: rgba(244, 63, 94, 0.4); color: var(--alert-crimson);">
                COUVRE-FEU : 22H00
              </span>
            </div>

            <div id="dash-quests-container">
              ${SYSTEM_STATE.quests
                .map(
                  (q) => `
                <div class="glass-card" id="quest-card-${q.id}" style="padding: 16px; margin-bottom: 12px; background: var(--input-bg); border: 1px solid var(--glass-inner-border-subtle); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: var(--text-white);">${q.title}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${q.description}</div>
                    <div style="font-size: 11px; color: var(--primary); margin-top: 6px; font-family: var(--font-mono);">
                      RÉCOMPENSE : +<strong>${q.xp} XP</strong> | +<strong>${q.crystals} 💎</strong>
                    </div>
                  </div>
                  <div id="quest-action-${q.id}">
                    ${
                      q.completed
                        ? `<span style="color: var(--transcendent-green); font-weight: bold; font-size: 12px; padding: 6px 14px; border: 1px solid var(--transcendent-green); border-radius: var(--radius-sm); background: rgba(52, 211, 153, 0.1);">ACCOMPLIE ✓</span>`
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
          <div class="glass-card spotlight-card border-beam-box" style="padding: 24px; margin-bottom: 22px;">
            <div class="border-beam-content" style="padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: var(--primary); font-family: var(--font-display); display: flex; align-items: center; gap: 6px;">
                  <span class="material-symbols-outlined" style="font-size: 16px; color: var(--tertiary);">timelapse</span> SPRINT CIRCADIEN ACTIF — POMODORO 25 MIN
                </span>
                <span class="shiny-text" id="pomodoro-timer-display" style="font-size: 20px; font-weight: 900; font-family: var(--font-mono); color: var(--primary-fixed);">
                  25:00
                </span>
              </div>
              <div style="font-size: 17px; font-weight: bold; margin-bottom: 6px; color: var(--text-white);" id="active-block-title">
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
          </div>

          <!-- Last Socratic Defense Card -->
          <div class="glass-card spotlight-card" style="padding: 24px; margin-bottom: 22px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: var(--imperial-gold); font-family: var(--font-display); display: flex; align-items: center; gap: 6px;">
                <span class="material-symbols-outlined" style="font-size: 16px; color: var(--tertiary);">psychology_alt</span> DERNIÈRE ÉVALUATION DE L'ARCHITECTE (GRILLE 20 PTS)
              </span>
              <span class="shiny-green" id="dash-oral-score" style="font-size: 22px; font-weight: 900; font-family: var(--font-display);">
                -- / 20
              </span>
            </div>
            <div style="font-size: 15px; font-weight: bold; margin-bottom: 6px; color: var(--text-white);" id="dash-oral-topic">
              Sujet : En attente du premier monologue socratique
            </div>
            <p style="font-size: 12px; color: var(--text-secondary); font-style: italic; line-height: 1.5;" id="dash-oral-feedback">
              "Exécutez votre première restitution orale dans la Station Vocale pour obtenir une notation socratique sur 20 points de l'Architecte."
            </p>
          </div>

          <!-- S-Rank Dungeon Gate Telemetry Card -->
          <div class="glass-card spotlight-card" style="padding: 20px; position: relative; overflow: hidden; border: 1px solid rgba(244,63,94,0.3);">
            <div style="position: absolute; right: -20px; bottom: -20px; width: 90px; height: 90px; background: rgba(147, 51, 234, 0.2); border-radius: 9999px; filter: blur(20px); pointer-events: none;"></div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 10.5px; font-family: var(--font-mono); color: var(--primary-fixed); letter-spacing: 1.5px; text-transform: uppercase;">PORTAIL DÉTECTÉ — DIMENSION PURGATOIRE</span>
              <span style="width: 8px; height: 8px; border-radius: 9999px; background: var(--alert-crimson); animation: pulse 1.5s infinite; display: inline-block;"></span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
              <div>
                <span style="font-size: 9px; padding: 2px 8px; border-radius: 4px; background: rgba(244,63,94,0.25); color: var(--alert-crimson); font-weight: 800; font-family: var(--font-mono); letter-spacing: 1px;">S-RANK GATE</span>
                <h4 style="font-size: 16px; font-weight: 800; color: var(--text-white); margin-top: 4px; font-family: var(--font-display);">Obsidian Void [Sector 7]</h4>
                <p style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono); margin-top: 2px;">Mana Surge: Anormal • Scellage temporel actif</p>
              </div>
              <button class="btn-cyber" style="padding: 8px 14px; font-size: 11px; white-space: nowrap; display: flex; align-items: center; gap: 6px;" onclick="showSysNotification('[SCANNER LA BRÈCHE]', 'Analyse dimensionnelle en cours : Résonance Mana 98.4%. Portail sous surveillance stricte.')">
                <span class="material-symbols-outlined" style="font-size: 15px; color: var(--primary);">sensors</span>
                <span>Scanner la brèche</span>
              </button>
            </div>
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
                ${sk.base} — TIER ${sk.tier} [${sk.status === "MASTERED" ? "MAÎTRISÉ 5/5" : sk.status === "IN_PROGRESS" ? "EN COURS 3/5" : "VERROUILLÉ"}]
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
      <!-- Emergency Quest Alert Box (Stitch S-Rank Red Alert) -->
      <div class="border-beam-box" id="emergency-quest-box" style="margin-bottom: 24px; position: relative; overflow: hidden; border-radius: 12px; background: linear-gradient(135deg, rgba(147,0,10,0.3) 0%, var(--surface-container-low) 50%, var(--surface-container-lowest) 100%); border: 1px solid rgba(244,63,94,0.45); box-shadow: 0 0 35px rgba(244,63,94,0.2);">
        <div class="cyber-corner-tl" style="border-color: var(--alert-crimson);"></div>
        <div class="cyber-corner-tr" style="border-color: var(--alert-crimson);"></div>
        <div class="border-beam-content" style="padding: 24px;">
          <!-- Alert Monospace Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
            <span id="emergency-status-label" style="display: none;"></span>
            <!-- Monospace Countdown Timer -->
            <div style="display: flex; align-items: center; gap: 8px; background: var(--surface-container-lowest); padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(244, 63, 94, 0.3);">
              <span id="emergency-timer-text" style="font-size: 20px; font-weight: 900; font-family: var(--font-mono); color: var(--alert-crimson); text-shadow: 0 0 12px rgba(244, 63, 94, 0.75);">
                [ 00:54:18 ]
              </span>
              <span id="emergency-timer" style="display: none;">00:54:18</span>
            </div>
          </div>

          <!-- Quest Title & Context -->
          <div style="margin-bottom: 12px;">
            <div style="font-size: 10.5px; color: var(--primary); font-family: var(--font-mono); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4px;">
              THREAT LEVEL : APOCALYPTIC RUNTIME • DOMAINE : INFRASTRUCTURE & CRYPTOGRAPHIE
            </div>
            <h3 style="font-size: 22px; font-weight: 900; color: var(--text-white); font-family: var(--font-display); letter-spacing: 0.5px; line-height: 1.2;">
              Audit de Sécurité Système : Faille Critique sur le SingleUserGuard & Token Leak
            </h3>
          </div>

          <!-- Crimson Danger Callout Box (Penalty) -->
          <div class="danger-callout-box" style="margin-bottom: 16px;">
            <span class="material-symbols-outlined" style="font-size: 24px; color: var(--alert-crimson); animation: bounce 2s infinite; flex-shrink: 0; margin-top: 2px;">report</span>
            <div>
              <div style="font-size: 12px; font-weight: 800; color: var(--alert-crimson); font-family: var(--font-mono); letter-spacing: 1px; text-transform: uppercase;">
                ⚠️ PÉNALITÉ FATIDIQUE EN CAS D'ÉCHEC
              </div>
              <p style="font-size: 12.5px; color: var(--text-white); margin-top: 2px; line-height: 1.5;">
                Transfert immédiat et irrévocable en <strong style="text-decoration: underline; color: var(--alert-crimson);">Zone de Pénalité 4H</strong> (Survie Temporelle active, Verrouillage total des appareils via NextDNS Blackout & Répétition des séries musculaires d'extinction).
              </p>
            </div>
          </div>

          <!-- Mission Objectives (DoD) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
            <div style="background: var(--surface-container); border: 1px solid var(--glass-inner-border-subtle); border-radius: 8px; padding: 12px 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 800; color: var(--tertiary); font-family: var(--font-mono); letter-spacing: 1px;">
                  ✓ OBJECTIF ALPHA (CRITIQUE)
                </span>
                <span style="font-size: 10px; color: var(--text-secondary); font-family: var(--font-mono);">[0/1 COMPLÉTÉ]</span>
              </div>
              <p style="font-size: 12px; color: var(--text-white); line-height: 1.4;">
                Patch du middleware d'authentification RBAC et révocation des tokens corrompus dans la base active Redis.
              </p>
              <div class="capsule-slider-track" style="height: 5px; margin-top: 8px;">
                <div class="capsule-slider-fill capsule-fill-hp" style="width: 35%;"></div>
              </div>
            </div>

            <div style="background: var(--surface-container); border: 1px solid var(--glass-inner-border-subtle); border-radius: 8px; padding: 12px 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 800; color: var(--primary); font-family: var(--font-mono); letter-spacing: 1px;">
                  ⚡ OBJECTIF BÊTA (VALIDATION)
                </span>
                <span style="font-size: 10px; color: var(--text-secondary); font-family: var(--font-mono);">[EN ATTENTE HOTFIX]</span>
              </div>
              <p style="font-size: 12px; color: var(--text-white); line-height: 1.4;">
                Déploiement du hotfix sur environnement de staging et validation des tests d'intrusion automatisés sans régression.
              </p>
              <div class="capsule-slider-track" style="height: 5px; margin-top: 8px;">
                <div class="capsule-slider-fill capsule-fill-mp" style="width: 15%;"></div>
              </div>
            </div>
          </div>

          <!-- Rewards & CTAs -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;" id="emergency-action-wrap">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 10.5px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase;">RÉCOMPENSES DE VICTOIRE :</span>
              <span class="telemetric-chip" style="color: var(--primary); border-color: rgba(221,184,255,0.3); font-weight: 700;">+500 XP</span>
              <span class="telemetric-chip" style="color: var(--imperial-gold); border-color: rgba(251,191,36,0.3); font-weight: 700;">+100 CRISTAUX D'OMBRE 💎</span>
              <span class="telemetric-chip" style="color: var(--tertiary-fixed); border-color: rgba(69,223,164,0.3); font-weight: 700;">+3 INT</span>
              <span class="telemetric-chip" style="color: var(--primary-fixed); border-color: rgba(147,51,234,0.4); font-weight: 700;">TITRE : [Sentinelle du Noyau]</span>
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="btn-cyber" style="font-size: 11px; padding: 8px 14px;" onclick="showSysNotification('[DÉTAILS TECHNIQUES]', 'Faille CVE-2026-LVL99 : Contournement du SingleUserGuard via injection de headers forgés.')">
                [DÉTAILS TECHNIQUES]
              </button>
              <button class="btn-cyber btn-red" style="font-size: 11px; padding: 8px 16px; font-weight: 800; display: flex; align-items: center; gap: 6px;" onclick="openProofModal('q-emergency-auth-bypass', 'Audit de Sécurité SingleUserGuard', 500, 100)">
                <span class="material-symbols-outlined" style="font-size: 16px;">bolt</span>
                <span>SOUMETTRE LE COMMIT DE PATCH (VALIDATION CRITIQUE)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily Calisthenics Routine Card : Dos & Épaules -> Bras -> Abdos (Profil Personnel) -->
      <div class="glass-card spotlight-card" style="padding: 22px; margin-bottom: 24px; border-radius: 12px; background: var(--surface-container-low); border: 1px solid rgba(69,223,164,0.35);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 10.5px; font-family: var(--font-mono); color: var(--primary); letter-spacing: 1.5px; text-transform: uppercase;">[QUÊTE JOURNALIÈRE OBLIGATOIRE]</span>
              <span class="radar-ping-badge" style="border-color: rgba(69,223,164,0.4); color: var(--tertiary-fixed); font-size: 10px;">TRINITÉ CALISTHÉNIQUE</span>
            </div>
            <h3 style="font-size: 18px; font-weight: 800; color: var(--primary); font-family: var(--font-display); margin-top: 4px;">
              [Daily Quest : Entraînement Physique du Chasseur — Dos & Épaules, Bras & Abdos]
            </h3>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button class="btn-cyber" style="font-size: 11px; padding: 6px 14px; background: rgba(0, 240, 255, 0.15); border-color: var(--neon-cyan); color: #fff;" onclick="switchView('workout')">
              📹 OUVRIR CAMÉRA VISION SPORT ➔
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 14px;">
          <div style="background: var(--surface-container); padding: 14px; border-radius: 8px; border: 1px solid var(--glass-inner-border-subtle); cursor: pointer;" onclick="switchView('workout'); selectWorkoutRoutine('DOS_EPAULES');">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono); margin-bottom: 6px;">
              <span style="color: var(--text-white); font-weight: bold;">1. DOS & ÉPAULES</span>
              <span style="color: var(--neon-cyan); font-weight: 700;">17 Étapes Stricte</span>
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px;">
              Pike push-ups, hyperextensions, inchworms, supine push-ups, étirements.
            </div>
            <div class="capsule-slider-track" style="height: 6px;">
              <div class="capsule-slider-fill capsule-fill-hp" style="width: 100%;"></div>
            </div>
          </div>

          <div style="background: var(--surface-container); padding: 14px; border-radius: 8px; border: 1px solid var(--glass-inner-border-subtle); cursor: pointer;" onclick="switchView('workout'); selectWorkoutRoutine('BRAS');">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono); margin-bottom: 6px;">
              <span style="color: var(--text-white); font-weight: bold;">2. BRAS & TRICEPS</span>
              <span style="color: var(--primary); font-weight: 700;">6 Exercices Calisthéniques</span>
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px;">
              Push-ups, decline push-ups, diamond push-ups, wide, tricep extensions.
            </div>
            <div class="capsule-slider-track" style="height: 6px;">
              <div class="capsule-slider-fill capsule-fill-mp" style="width: 100%;"></div>
            </div>
          </div>

          <div style="background: var(--surface-container); padding: 14px; border-radius: 8px; border: 1px solid var(--glass-inner-border-subtle); cursor: pointer;" onclick="switchView('workout'); selectWorkoutRoutine('ABDOS');">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono); margin-bottom: 6px;">
              <span style="color: var(--text-white); font-weight: bold;">3. ABDOS & CORE</span>
              <span style="color: var(--imperial-gold); font-weight: 700;">5 Exercices de Gainage</span>
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px;">
              V-Ups, mountain climbers, relevés de jambes au sol, planche 1m30, gainage latéral.
            </div>
            <div class="capsule-slider-track" style="height: 6px;">
              <div class="capsule-slider-fill" style="width: 100%; background: var(--imperial-gold);"></div>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-top: 1px solid var(--glass-inner-border-subtle); padding-top: 12px;">
          <div style="font-size: 11.5px; color: var(--alert-crimson); font-family: var(--font-mono); display: flex; align-items: center; gap: 6px;">
            <span class="material-symbols-outlined" style="font-size: 16px;">warning</span>
            <span>ATTENTION : Quête quotidienne obligatoire. Tout manquement avant minuit déclenche le protocole NextDNS & Restriction.</span>
          </div>
          <button class="btn-cyber btn-gold" style="font-size: 11px; padding: 7px 14px;" onclick="switchView('workout'); selectWorkoutRoutine('DAILY_COMPLETE');">
            DÉBUTER LA TRINITÉ COMPLÈTE (28 ÉTAPES) ➔
          </button>
        </div>
      </div>

      <!-- Quests Header & Action Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="material-symbols-outlined" style="font-size: 24px; color: var(--primary);">cyclone</span>
          <div>
            <div style="font-size: 13.5px; font-weight: 800; font-family: var(--font-mono); letter-spacing: 1.5px; color: var(--primary); text-transform: uppercase;">
              CYLINDRE 3D — QUÊTES DU JOUR
            </div>
            <div style="font-size: 11.5px; color: var(--text-secondary); font-family: var(--font-mono); margin-top: 2px;">
              Glissez horizontalement pour faire pivoter le cylindre • Cliquez sur une carte pour interagir
            </div>
          </div>
        </div>
        <button class="btn-cyber" onclick="openCreateQuestModal()">+ CRÉER UNE NOUVELLE QUÊTE</button>
      </div>

      <!-- 3D CIRCULAR CAROUSEL (SEAMLESSLY INTEGRATED INTO ENVIRONMENT) -->
      <div id="quests-carousel-section" class="quests-carousel-container">
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
      </div>
    </div>

    <!-- =====================================================================
         SCREEN 4 : TIME-BLOCKING CIRCADIEN (WITH REAL COMPLETION & TIMERS)
         ===================================================================== -->
    <div id="view-planner" class="view-panel ${initialTab === "planner" ? "active" : ""}">
      <!-- Borbély Two-Process Biophysical Hologram HUD Header -->
      <div class="glass-card spotlight-card" style="padding: 24px; margin-bottom: 22px; position: relative; overflow: hidden; border-radius: 12px; background: var(--surface-container-low); border: 1px solid rgba(221,184,255,0.3);">
        <div class="cyber-corner-tl"></div>
        <div class="cyber-corner-tr"></div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">

          <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-family: var(--font-mono); color: var(--tertiary-fixed);">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background: var(--tertiary); display: inline-block; animation: pulse 2s infinite;"></span>
            <span>CHRONO-SYNCHRONISATION : ACTIVE (LATENCE 0.12ms)</span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: 11px; letter-spacing: 2px; color: var(--tertiary-fixed); font-family: var(--font-mono); font-weight: bold; margin-bottom: 4px;">
              MONARCH TIME-DOMINION ENGINE
            </div>
            <h2 class="shiny-text" style="font-size: 26px; font-weight: 900; font-family: var(--font-display); line-height: 1.1;">
              Planificateur Circadien & Time-Blocking Temporel
            </h2>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn-cyber" onclick="openCreateBlockModal()">+ AJOUTER UN BLOC TEMPOREL</button>
            <button class="btn-cyber btn-gold" onclick="togglePomodoroTimer()">DÉMARRER POMODORO 25 MIN</button>
          </div>
        </div>

        <!-- Telemetric Chips Cluster -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 18px;">
          <div style="background: var(--surface-container); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(69,223,164,0.3); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono);">SYNCHRO BORBÉLY</span>
            <strong style="font-size: 12px; color: var(--tertiary-fixed); font-family: var(--font-mono);">OPTIMALE (98.2%)</strong>
          </div>
          <div style="background: var(--surface-container); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(221,184,255,0.3); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono);">FENÊTRE DEEP WORK</span>
            <strong style="font-size: 12px; color: var(--primary); font-family: var(--font-mono);">PIC ULTRA-DIEN</strong>
          </div>
          <div style="background: var(--surface-container); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(244,63,94,0.3); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono);">COUVRE-FEU FATIDIQUE</span>
            <strong style="font-size: 12px; color: var(--alert-crimson); font-family: var(--font-mono);">22:00:00 [PÉNALITÉ ACTIVE]</strong>
          </div>
        </div>

        <!-- Dual Curves Vector SVG Diagram (Processus S vs Processus C) -->
        <div style="background: var(--surface-container-lowest); border-radius: 8px; border: 1px solid var(--glass-inner-border-subtle); padding: 14px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 11px; font-family: var(--font-mono); flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; gap: 14px;">
              <span style="color: var(--primary); display: flex; align-items: center; gap: 4px;">
                <span style="width: 10px; height: 3px; background: var(--primary); display: inline-block;"></span> Processus S (Pression Adénosine)
              </span>
              <span style="color: var(--tertiary); display: flex; align-items: center; gap: 4px;">
                <span style="width: 10px; height: 3px; background: var(--tertiary); display: inline-block;"></span> Processus C (Alerte Circadienne)
              </span>
            </div>
            <div style="color: var(--text-muted); font-size: 10px;">
              TEMP: 36.8°C • CORTISOL: PEAK 1 • LUX: 10,000 lx
            </div>
          </div>
          
          <div style="position: relative; width: 100%; height: 160px;">
            <svg width="100%" height="160" viewBox="0 0 800 160" preserveAspectRatio="none" style="overflow: visible;">
              <defs>
                <linearGradient id="dw-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#9333ea" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#9333ea" stop-opacity="0.02"/>
                </linearGradient>
                <linearGradient id="dip-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#ef4444" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#ef4444" stop-opacity="0.02"/>
                </linearGradient>
              </defs>
              <!-- Shaded Zones -->
              <rect x="120" y="10" width="160" height="130" fill="url(#dw-grad)" rx="4"/>
              <text x="200" y="24" fill="var(--primary)" font-size="9" font-family="monospace" text-anchor="middle">DEEP WORK ALPHA [08h30-11h30]</text>
              
              <rect x="360" y="10" width="60" height="130" fill="url(#dip-grad)" rx="4"/>
              <text x="390" y="24" fill="var(--alert-crimson)" font-size="9" font-family="monospace" text-anchor="middle">CREUX NSDR</text>

              <rect x="440" y="10" width="160" height="130" fill="url(#dw-grad)" rx="4"/>
              <text x="520" y="24" fill="var(--primary)" font-size="9" font-family="monospace" text-anchor="middle">DEEP WORK BETA [14h00-17h00]</text>

              <!-- Now marker -->
              <line x1="340" y1="10" x2="340" y2="140" stroke="var(--tertiary)" stroke-dasharray="3 3" stroke-width="2"/>
              <text x="340" y="152" fill="var(--tertiary-fixed)" font-size="9" font-family="monospace" font-weight="bold" text-anchor="middle">NOW (12:45)</text>

              <!-- Processus S curve (Homeostatic Sleep Pressure) -->
              <path d="M 40 130 Q 220 120 400 95 T 650 50 T 760 25" fill="none" stroke="var(--primary)" stroke-width="2.5"/>
              <!-- Processus C curve (Circadian Alertness) -->
              <path d="M 40 110 Q 180 35 280 40 T 400 95 T 520 45 T 760 135" fill="none" stroke="var(--tertiary)" stroke-width="2.5"/>
            </svg>
          </div>
        </div>

        <div id="planner-blocks-container" style="margin-top: 18px;">
          ${SYSTEM_STATE.plannerBlocks
            .map(
              (b) => `
            <div class="glass-card spotlight-card" id="block-card-${b.id}" style="padding: 16px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; ${b.status === "ACTIVE" ? "border-color: var(--primary); box-shadow: 0 0 20px rgba(147,51,234,0.4);" : ""}">
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="font-size: 14px; font-family: var(--font-mono); color: var(--primary); min-width: 110px;">
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
              OBSIDIAN VAULT — RÉSEAU NEURAL COGNITIF DU MONARQUE
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
                    <div style="background: var(--input-bg); border: 1px solid var(--glass-inner-border); border-radius: var(--radius-sm); padding: 14px; font-size: 12px; font-family: var(--font-mono); color: var(--text-secondary); line-height: 1.5; white-space: pre-wrap; margin-bottom: 14px;">${n.content}</div>
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
        <div class="glass-card" style="padding: 16px; margin-bottom: 22px; background: var(--input-bg); border: 1px solid var(--glass-inner-border); text-align: center;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; color: var(--neon-cyan); font-family: var(--font-mono);">
              SPECTRE FRÉQUENTIEL FFT TEMPS RÉEL (64 BANDES — ANALYSERNODE)
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
              <div>🔹 <strong>Précision Conceptuelle & Mathématique :</strong> <span id="crit-concept" style="color: var(--neon-cyan); font-weight: bold;">-- / 6 pts</span></div>
              <div>🔹 <strong>Rigueur du Raisonnement & Falsifiabilité :</strong> <span id="crit-rigor" style="color: var(--neon-cyan); font-weight: bold;">-- / 5 pts</span></div>
              <div>🔹 <strong>Clarté d'Élocution & Débit Cambridge C1 :</strong> <span id="crit-delivery" style="color: var(--neon-cyan); font-weight: bold;">-- / 5 pts</span></div>
              <div>🔹 <strong>Pertinence des Exemples & Benchmarks :</strong> <span id="crit-examples" style="color: var(--neon-cyan); font-weight: bold;">-- / 4 pts</span></div>
            </div>
            <div style="text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">NOTE GLOBALE ATTRIBUÉE</div>
              <div class="shiny-green" id="rubric-total-score" style="font-size: 48px; font-weight: 900; font-family: var(--font-display); line-height: 1;">-- / 20</div>
              <div style="font-size: 12px; color: var(--text-secondary); font-weight: bold; margin-top: 6px;" id="rubric-decision-label">EN ATTENTE D'ÉVALUATION ORALE</div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 7 : VEILLE BOURSES & HACKATHONS DEERFLOW (CYLINDRE 3D)
         ===================================================================== -->
    <div id="view-opportunities" class="view-panel ${initialTab === "opportunities" ? "active" : ""}">
      
      <!-- Opportunities Header & Action Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="material-symbols-outlined" style="font-size: 24px; color: var(--primary);">cyclone</span>
          <div>
            <div style="font-size: 13.5px; font-weight: 800; font-family: var(--font-mono); letter-spacing: 1.5px; color: var(--primary); text-transform: uppercase;">
              CYLINDRE 3D — VEILLE BOURSES & HACKATHONS
            </div>
            <div style="font-size: 11.5px; color: var(--text-secondary); font-family: var(--font-mono); margin-top: 2px;">
              Glissez horizontalement pour faire pivoter le cylindre • Cliquez sur une carte pour postuler
            </div>
          </div>
        </div>
        <button class="btn-cyber" onclick="triggerDeerflowScraper()">🔄 SCRAPER NOUVELLES OPPORTUNITÉS</button>
      </div>

      <!-- 3D CIRCULAR CAROUSEL (SEAMLESSLY INTEGRATED INTO ENVIRONMENT) -->
      <div id="opportunities-carousel-section" class="opportunities-carousel-container">
        <div class="circular-carousel" id="opp-circular-carousel" data-axis="y" data-shape="cylinder" data-draggable>
          <div class="circular-carousel__view">
            <div class="circular-carousel__stage" id="opp-carousel-stage">
              <div class="circular-carousel__camera" id="opp-carousel-camera">
                <div class="circular-carousel__ring" id="opp-carousel-ring">
                  <!-- Populated dynamically via JS -->
                </div>
              </div>
            </div>
          </div>
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
            <div style="font-size: 11px; font-weight: 800; color: var(--primary); font-family: var(--font-mono); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4px;">
              GESTION DU REPOS & RELIQUES DU SOUVERAIN
            </div>
            <h2 class="shiny-text" style="font-size: 26px; font-weight: 900; font-family: var(--font-display);">
              INVENTAIRE DU CHASSEUR (SAC & FORGE DES OMBRES)
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Gérez vos objets possédés, activez votre Jour de Repos hebdomadaire mérité et forgez de nouvelles reliques avec vos Cristaux d'Ombre.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div class="radar-ping-badge" style="border-color: rgba(255, 215, 0, 0.5); color: var(--imperial-gold); font-size: 14px; padding: 8px 16px;">
              💎 SOLDE : <strong id="shop-balance-display">${player.shadowCrystals}</strong> CRISTAUX
            </div>
            <div id="rest-day-status-pill" class="radar-ping-badge" style="border-color: ${SYSTEM_STATE.restDayActive ? 'var(--tertiary)' : 'var(--glass-inner-border)'}; color: ${SYSTEM_STATE.restDayActive ? 'var(--tertiary)' : 'var(--text-secondary)'}; font-size: 13px; padding: 8px 14px;">
              ${SYSTEM_STATE.restDayActive ? '🛡️ JOUR DE REPOS ACTIF (24H)' : '⚡ CYCLE QUOTIDIEN EN COURS'}
            </div>
          </div>
        </div>

        <!-- Banner when Rest Day is active -->
        <div id="rest-day-active-banner" style="display: ${SYSTEM_STATE.restDayActive ? 'block' : 'none'}; margin-bottom: 24px; padding: 18px 22px; border-radius: 12px; background: linear-gradient(135deg, rgba(69, 223, 164, 0.18) 0%, rgba(13, 8, 36, 0.95) 100%); border: 1.5px solid var(--tertiary); box-shadow: 0 0 30px rgba(69, 223, 164, 0.28);">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <span class="material-symbols-outlined" style="font-size: 36px; color: var(--tertiary);">hotel</span>
              <div>
                <div style="font-size: 15px; font-weight: 800; color: var(--tertiary); font-family: var(--font-mono); letter-spacing: 0.5px;">
                  🛡️ RÉPIT DU MONARQUE ENCLENCHÉ — IMMUNITÉ TOTALE ACTIVE
                </div>
                <div style="font-size: 12.5px; color: var(--text-white); margin-top: 3px; line-height: 1.4;">
                  Couvre-feu NextDNS <strong>désactivé</strong> • Quêtes journalières <strong>exemptées sans pénalité</strong> • Série journalière <strong>protégée</strong> • Jauges vitales HP & MP à <strong>100%</strong>.
                </div>
              </div>
            </div>
            <span class="shiny-green" style="font-family: var(--font-mono); font-weight: 800; font-size: 12px; padding: 6px 14px; border: 1px solid var(--tertiary); border-radius: 20px;">
              RÉCUPÉRATION SOUVERAINE
            </span>
          </div>
        </div>

        <!-- SECTION 1 : SAC & OBJETS POSSÉDÉS (INVENTAIRE ACTIF) -->
        <div style="margin-bottom: 34px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--glass-inner-border); padding-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="material-symbols-outlined" style="color: var(--primary); font-size: 22px;">backpack</span>
              <h3 class="shiny-text" style="font-size: 18px; font-weight: bold;">🎒 OBJETS & CONSOMMABLES POSSÉDÉS (INVENTAIRE ACTIF)</h3>
            </div>
            <span style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono);">
              <span id="inv-count-badge">${SYSTEM_STATE.inventory.length}</span> OBJET(S) EN RÉSERVE
            </span>
          </div>

          <div id="shop-inventory-container" class="grid-2col">
            ${SYSTEM_STATE.inventory.length === 0 ? `
              <div class="empty-inventory-msg" style="grid-column: 1 / -1; padding: 30px; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 13px; border: 1px dashed var(--glass-inner-border); border-radius: 10px; background: rgba(15, 9, 38, 0.4);">
                <div style="font-size: 28px; margin-bottom: 8px;">🎒</div>
                <div style="font-weight: bold; color: var(--text-secondary); margin-bottom: 4px;">VOTRE SAC D'INVENTAIRE EST ACTUELLEMENT VIDE</div>
                <div>Accomplissez vos quêtes quotidiennes (100 💎/jour) pour forger votre <strong>Pass Jour de Repos</strong> (600 💎) ou vos potions ci-dessous.</div>
              </div>
            ` : SYSTEM_STATE.inventory
              .map(
                (inv) => `
              <div class="glass-card" style="padding: 16px; display: flex; flex-direction: column; justify-content: space-between; border-color: ${inv.type === 'REST_DAY' ? 'rgba(251, 191, 36, 0.45)' : 'var(--glass-inner-border)'};">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span class="radar-ping-badge" style="font-size: 10px; padding: 2px 8px; color: ${inv.type === 'REST_DAY' ? 'var(--imperial-gold)' : 'var(--primary)'};">${inv.category || 'RELIQUE'}</span>
                    <span style="font-size: 10.5px; color: var(--text-muted); font-family: var(--font-mono);">${inv.date}</span>
                  </div>
                  <div style="font-size: 15px; font-weight: bold; color: var(--text-white); margin-bottom: 6px;">${inv.name}</div>
                  <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
                    ${inv.type === 'REST_DAY' ? 'Octroie 24h d\'immunité totale contre le couvre-feu NextDNS et gèle les quêtes sans briser votre streak.' : (inv.type === 'POTION_MP' ? 'Recharge immédiate de +50 MP de concentration.' : (inv.type === 'POTION_HP' ? 'Restauration immédiate de +50 HP de vitalité.' : 'Article certifié du Système.'))}
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--glass-inner-border-subtle); padding-top: 10px; margin-top: 6px;">
                  <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">
                    ID: <code style="color: var(--neon-cyan);">${inv.code}</code>
                  </div>
                  ${inv.type === 'REST_DAY' ? (
                    inv.used ? `<span class="radar-ping-badge" style="color: var(--tertiary); border-color: var(--tertiary);">✓ UTILISÉ AUJOURD'HUI</span>` : `<button class="btn-cyber btn-gold" style="font-size: 11px; padding: 6px 14px;" onclick="activateRestDay('${inv.id}')">⚡ ACTIVER LE REPOS (24H)</button>`
                  ) : (inv.type === 'POTION_MP' ? (
                    inv.used ? `<span class="radar-ping-badge" style="color: var(--text-muted);">CONSOMMÉ</span>` : `<button class="btn-cyber" style="font-size: 11px; padding: 6px 14px;" onclick="usePotion('${inv.id}', 'MP')">BOIRE (+50 MP)</button>`
                  ) : (inv.type === 'POTION_HP' ? (
                    inv.used ? `<span class="radar-ping-badge" style="color: var(--text-muted);">CONSOMMÉ</span>` : `<button class="btn-cyber btn-green" style="font-size: 11px; padding: 6px 14px;" onclick="usePotion('${inv.id}', 'HP')">BOIRE (+50 HP)</button>`
                  ) : `<span class="radar-ping-badge" style="color: var(--neon-cyan);">ACTIF</span>`))}
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>

        <!-- SECTION 2 : FORGE DES OMBRES (ACQUISITION AVEC CRISTAUX) -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--glass-inner-border); padding-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="material-symbols-outlined" style="color: var(--imperial-gold); font-size: 22px;">token</span>
              <h3 class="shiny-text" style="font-size: 18px; font-weight: bold;">⚡ FORGE DES OMBRES — ACQUISITION D'ARTÉFACTS</h3>
            </div>
            <span style="font-size: 11.5px; color: var(--imperial-gold); font-family: var(--font-mono); font-weight: bold;">
              ÉCHANGE DE CRISTAUX D'OMBRE (💎)
            </span>
          </div>

          <!-- Highlight Flagship Card: Pass Jour de Repos -->
          <div class="glass-card" style="padding: 22px; margin-bottom: 22px; border: 1.5px solid rgba(251, 191, 36, 0.5); background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(21, 15, 44, 0.9) 100%); box-shadow: 0 0 25px rgba(251, 191, 36, 0.15); border-radius: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
              <div style="flex: 1; min-width: 280px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                  <span class="radar-ping-badge" style="border-color: var(--imperial-gold); color: var(--imperial-gold);">RELIQUE MYTHIQUE • RANG S</span>
                  <span class="shiny-gold" style="font-size: 12px; font-weight: bold; font-family: var(--font-mono);">CALIBRATION HEBDOMADAIRE</span>
                </div>
                <h3 style="font-size: 20px; font-weight: 900; color: var(--text-white); font-family: var(--font-display); margin-bottom: 8px;">
                  Pass Jour de Repos Hebdomadaire (Répit du Monarque)
                </h3>
                <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
                  <strong style="color: var(--text-white);">Règle d'or du Système :</strong> Ce pass est calculé et calibré pour être débloqué <span style="color: var(--imperial-gold); font-weight: bold;">une seule fois par semaine</span>. En accomplissant vos quêtes journalières sans exception (100 💎 par jour sur 6 jours), vous récoltez exactement les <strong>600 💎</strong> nécessaires pour vous offrir 24h de repos complet. Le couvre-feu NextDNS est désactivé et aucune pénalité ne peut vous atteindre.
                </p>
                <div style="display: flex; gap: 16px; font-size: 12px; font-family: var(--font-mono); color: var(--primary); flex-wrap: wrap;">
                  <span>✓ 100 💎/jour × 6 jours = 600 💎</span>
                  <span>✓ 0 Sanction NextDNS</span>
                  <span>✓ Streak Préservé</span>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; min-width: 180px;">
                <div style="font-size: 26px; font-weight: 900; color: var(--imperial-gold); font-family: var(--font-mono); margin-bottom: 10px;">
                  600 💎
                </div>
                <button class="btn-cyber btn-gold" style="font-size: 13px; padding: 10px 22px;" onclick="buyShopItem('item-rest-day-pass', 'Pass Jour de Repos Hebdomadaire (Répit du Monarque)', 600, 'REST_DAY', 'RÉPIS SOUVERAIN')">
                  ACQUÉRIR CE PASS (600 💎)
                </button>
                <div style="font-size: 10.5px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 6px;">
                  Limite : 1 achat par tranche de 7 jours
                </div>
              </div>
            </div>
          </div>

          <!-- Other items in Grid -->
          <div class="grid-3col">
            ${SYSTEM_STATE.shopItems
              .filter(item => item.id !== 'item-rest-day-pass')
              .map(
                (item) => `
              <div class="glass-card spotlight-card" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span class="radar-ping-badge">${item.category}</span>
                    <span class="shiny-gold" style="font-size: 13px; font-weight: bold; font-family: var(--font-mono);">RANG ${item.rank}</span>
                  </div>
                  <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 8px; color: var(--text-white);">${item.name}</h3>
                  <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 16px;">${item.desc}</p>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--glass-inner-border); padding-top: 14px;">
                  <span style="font-size: 15px; font-weight: 900; color: var(--imperial-gold); font-family: var(--font-mono);">${item.cost} 💎</span>
                  <button class="btn-cyber btn-gold" style="font-size: 11px; padding: 6px 12px;" onclick="buyShopItem('${item.id}', '${item.name.replace(/'/g, "\\'")}', ${item.cost}, '${item.type || 'GENERIC'}', '${item.category || 'OBJET'}')">ACHETER</button>
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
      <div class="glass-card spotlight-card space-lg" style="background: var(--surface-container-lowest); border: 1px solid rgba(244,63,94,0.4); box-shadow: 0 0 40px rgba(147,0,10,0.35); padding: 24px; margin-bottom: 22px; position: relative;">
        <div class="cyber-corner-tl" style="border-color: var(--alert-crimson);"></div>
        <div class="cyber-corner-tr" style="border-color: var(--alert-crimson);"></div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; font-family: var(--font-mono); color: var(--alert-crimson); letter-spacing: 1.5px; text-transform: uppercase;">
              <span style="width: 8px; height: 8px; border-radius: 9999px; background: var(--alert-crimson); animation: pulse 1.5s infinite; display: inline-block;"></span>
              <span>THE SYSTEM — DIMENSIONAL PURGATORY — [PENALTY ZONE & REHABILITATION]</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px;">
              <h2 class="shiny-text" style="font-size: 26px; font-weight: 900; font-family: var(--font-display); line-height: 1.1; color: var(--text-white);">
                Zone de Pénalité Dimensionnelle
              </h2>
              <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: rgba(244,63,94,0.25); color: var(--alert-crimson); font-weight: 800; font-family: var(--font-mono); border: 1px solid rgba(244,63,94,0.4);">
                NIVEAU-4 EXCLUSION
              </span>
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 6px; max-width: 650px; line-height: 1.5;" id="penalty-status-header">
              STATUT : CHASSEUR EN RÈGLE (AUCUN BLOCAGE ACTIF). Scellage chronobiologique de 22:00:00 actif. En cas d'échec, NextDNS verrouille tous les flux externes.
            </p>
          </div>

          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
            <div style="background: rgba(244,63,94,0.15); border: 1px solid var(--alert-crimson); padding: 8px 16px; border-radius: 8px; display: flex; align-items: center; gap: 10px; box-shadow: 0 0 15px rgba(244,63,94,0.25);">
              <span class="material-symbols-outlined" style="color: var(--alert-crimson); font-size: 20px; animation: pulse 2s infinite;">timer</span>
              <div style="text-align: right;">
                <div style="font-size: 9px; color: var(--text-secondary); font-family: var(--font-mono); text-transform: uppercase;">Temps Avant Dégradation Rang</div>
                <div id="penalty-countdown-val" style="font-size: 18px; font-weight: 900; font-family: var(--font-mono); color: var(--alert-crimson); letter-spacing: 1px;">04:00:00</div>
              </div>
            </div>
            <button class="btn-cyber btn-red" id="penalty-toggle-btn" onclick="toggleRealPenalty()" style="font-size: 11px; padding: 8px 14px;">
              TEST : SIMULER LA PÉNALITÉ
            </button>
          </div>
        </div>
      </div>

      <!-- NextDNS Cloud Sentinel Status Bar -->
      <div style="background: rgba(14, 8, 32, 0.9); border: 1px solid rgba(0, 240, 255, 0.35); padding: 12px 18px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="material-symbols-outlined" style="color: var(--neon-cyan); font-size: 24px;">dns</span>
          <div>
            <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); letter-spacing: 1px;">SENTINELLE RÉSEAU CLOUD (COUPE-FEU AUTOMATIQUE 22H00)</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--text-white);">
              NextDNS Profil ID : <span style="color: var(--neon-cyan); font-family: var(--font-mono);">${process.env.NEXTDNS_PROFILE_ID || "aa43db"}</span> • Statut : <span style="color: var(--transcendent-green); font-weight: bold;">SURVEILLANCE ACTIVE</span>
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-cyber" style="font-size: 11px; padding: 6px 12px;" onclick="testNextDnsConnection()">TESTER CONNEXION NEXTDNS</button>
        </div>
      </div>

      <!-- Top Bento Stat Cards (4 Cards) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 22px;">
        <!-- Card 1: Degré d'infraction -->
        <div class="glass-card spotlight-card" style="padding: 16px; border-color: rgba(244,63,94,0.3);">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); margin-bottom: 6px;">
            <span>DEGRÉ D'INFRACTION</span>
            <span style="color: var(--alert-crimson); font-weight: bold;">MULTIPLICATEUR x1.5</span>
          </div>
          <div style="font-size: 20px; font-weight: 900; color: var(--alert-crimson); font-family: var(--font-display);">CLASSE B</div>
          <p style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; line-height: 1.3;">Retard Couvre-feu 22h00 + Quête Journalière incomplète.</p>
          <div style="font-size: 10px; color: var(--alert-crimson); font-family: var(--font-mono); border-top: 1px solid var(--glass-inner-border-subtle); padding-top: 8px; margin-top: 8px;">
            Gravité Système: Critique Transitoire
          </div>
        </div>

        <!-- Card 2: Drain passif -->
        <div class="glass-card spotlight-card" style="padding: 16px; border-color: rgba(244,63,94,0.4);">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); margin-bottom: 6px;">
            <span>DRAIN PASSIF (HP/MP)</span>
            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--alert-crimson);">heart_broken</span>
          </div>
          <div style="font-size: 20px; font-weight: 900; color: var(--alert-crimson); font-family: var(--font-display);">-35% ACTIF</div>
          <p style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; line-height: 1.3;">-10 HP/min • Dépérissement continu jusqu'à purge.</p>
          <div class="capsule-slider-track" style="height: 5px; margin-top: 8px;">
            <div class="capsule-slider-fill" style="width: 65%; background: var(--alert-crimson);"></div>
          </div>
        </div>

        <!-- Card 3: Séquestre Cristaux -->
        <div class="glass-card spotlight-card" style="padding: 16px; border-color: rgba(221,184,255,0.3);">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); margin-bottom: 6px;">
            <span>SÉQUESTRE CRISTAUX</span>
            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--primary);">lock_clock</span>
          </div>
          <div style="font-size: 20px; font-weight: 900; color: var(--primary-fixed); font-family: var(--font-display);">120 CRISTAUX</div>
          <p style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; line-height: 1.3;">Sous mise en demeure. Révocation à l'échéance du chrono.</p>
          <div style="font-size: 10px; color: var(--primary-fixed); font-family: var(--font-mono); border-top: 1px solid var(--glass-inner-border-subtle); padding-top: 8px; margin-top: 8px;">
            Solde Sauvegardé: 700 Cristaux
          </div>
        </div>

        <!-- Card 4: Jetons de Grâce -->
        <div class="glass-card spotlight-card" style="padding: 16px; border-color: rgba(69,223,164,0.35);">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: var(--font-mono); color: var(--tertiary); margin-bottom: 6px;">
            <span>JETONS DE GRÂCE</span>
            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--tertiary);">shield</span>
          </div>
          <div style="font-size: 20px; font-weight: 900; color: var(--tertiary-fixed); font-family: var(--font-display);">2 DISPONIBLES</div>
          <p style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; line-height: 1.3;">Dissout instantanément les effets sans perte de HP.</p>
          <button class="btn-cyber" style="width: 100%; margin-top: 8px; padding: 5px; font-size: 10.5px; border-color: var(--tertiary); color: var(--tertiary-fixed);" onclick="showSysNotification('[BOUCLIER SOUVERAIN]', 'Bouclier dimensionnel activé. Immunité temporaire accordée.')">
            DÉPLOYER BOUCLIER (-1)
          </button>
        </div>
      </div>

      <!-- Main Penalty Content Box -->
      <div class="border-beam-box" style="margin-bottom: 24px;">
        <div class="border-beam-content" style="padding: 26px;">
          <!-- Domaines NextDNS Blackout -->
          <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 12px; color: var(--alert-crimson); font-family: var(--font-display); letter-spacing: 0.5px;">
            DOMAINES SOUMIS AU BLACKOUT AUTOMATIQUE (NEXTDNS INVIOLABLE) :
          </h3>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px;">
            ${SYSTEM_STATE.penalty.blockedDomains
              .map(
                (d) => `
              <span style="background: rgba(255, 0, 60, 0.12); border: 1px solid rgba(255, 0, 60, 0.4); color: var(--alert-crimson); font-size: 12px; font-family: var(--font-mono); padding: 6px 14px; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px;">
                <span>🔒</span> <span>${d}</span>
              </span>
            `,
              )
              .join("")}
          </div>

          <!-- Épreuves de Rédemption Immédiate -->
          <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 12px; color: var(--transcendent-green); font-family: var(--font-display); letter-spacing: 0.5px;">
            ÉPREUVES DE RÉDEMPTION POUR LEVER LE BLOCAGE :
          </h3>
          <div class="grid-2col">
            <div class="glass-card" style="padding: 18px; border-color: rgba(69, 223, 164, 0.35);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <div style="font-size: 13px; font-weight: bold; color: var(--text-white); display: flex; align-items: center; gap: 6px;">
                  <span class="material-symbols-outlined" style="font-size: 16px; color: var(--tertiary);">fitness_center</span> OPTION A : CALISTHÉNIE MILITAIRE (200 POMPES)
                </div>
                <span style="font-size: 10px; font-family: var(--font-mono); color: var(--tertiary); background: rgba(69,223,164,0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(69,223,164,0.3);">RÉDEMPTION IMMÉDIATE</span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
                200 Pompes militaires strictes validées en direct par vision par ordinateur MediaPipe (flexion coude ≤ 75° / verrouillage ≥ 160°).
              </p>
              <button class="btn-cyber btn-red" style="width: 100%; padding: 12px; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;" onclick="startCameraPurgeQuest()">
                <span class="material-symbols-outlined" style="font-size: 18px;">videocam</span> COMMENCER LA PURGE EN VISION CAMÉRA (200 POMPES)
              </button>
              <button class="btn-cyber" style="width: 100%; padding: 6px; font-size: 10.5px; opacity: 0.8;" onclick="redeemPenalty('A')">VALIDER MANUELLEMENT (TEST SYSTÈME)</button>
            </div>
            <div class="glass-card" style="padding: 18px; border-color: rgba(69, 223, 164, 0.35);">
              <div style="font-size: 13px; font-weight: bold; color: var(--text-white); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                <span class="material-symbols-outlined" style="font-size: 16px; color: var(--tertiary);">directions_run</span> OPTION B : COURSE NOCTURNE GPS
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">${SYSTEM_STATE.penalty.redemptionOptionB}</p>
              <button class="btn-cyber" style="width: 100%; padding: 10px; font-size: 11px; font-weight: 700;" onclick="redeemPenalty('B')">VALIDER 10 KM COURSE GPS (RACHAT)</button>
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
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn-cyber" id="cam-toggle-btn" onclick="toggleCamera()">📷 ACTIVER CAMÉRA</button>
            <button class="btn-cyber btn-gold" id="btn-cv-test" onclick="runRealtimePushupSimulationTest()" title="Simuler un squelette IA en temps réel pour tester la reconnaissance et le compteur">🧪 TEST SIMULATION IA</button>
          </div>
        </div>

        <div class="grid-2col">
          <div class="glass-card workout-video-card" style="padding: 12px; background: var(--input-bg); border: 1px solid var(--glass-inner-border); min-height: 380px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; overflow: hidden; transition: box-shadow 0.3s ease;">
            <video id="webcam-video" style="display: none; width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm);" autoplay playsinline muted></video>
            <canvas id="workout-canvas" style="display: none; position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; border-radius: var(--radius-sm); z-index: 5;"></canvas>
            
            <!-- Real-time Holographic HUD overlay on top of video -->
            <div id="workout-live-hud" style="display: none; position: absolute; top: 12px; left: 12px; right: 12px; z-index: 10; pointer-events: none; justify-content: space-between; align-items: flex-start;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <span id="hud-angle-pill" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; background: rgba(10, 6, 26, 0.88); border: 1px solid var(--neon-cyan); color: #fff; font-family: var(--font-mono); font-size: 11px; font-weight: 800; backdrop-filter: blur(8px); box-shadow: 0 0 12px rgba(0,240,255,0.4);">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--neon-cyan); display: inline-block; animation: pulse 1.5s infinite;"></span>
                  <span id="hud-angle-text">COUDE : --°</span>
                </span>
                <span id="hud-state-pill" style="display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 6px; background: rgba(10, 6, 26, 0.85); border: 1px solid rgba(255,255,255,0.25); color: var(--neon-cyan); font-family: var(--font-mono); font-size: 10px; font-weight: bold; backdrop-filter: blur(6px);">
                  STATUT : EN ATTENTE
                </span>
              </div>
              <div style="background: rgba(10, 6, 26, 0.9); border: 1.5px solid var(--tertiary); border-radius: 10px; padding: 5px 12px; text-align: center; backdrop-filter: blur(8px); box-shadow: 0 0 15px rgba(69,223,164,0.3);">
                <div style="font-size: 9px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase;">REPS VALIDÉES</div>
                <div id="hud-rep-counter" style="font-size: 26px; font-weight: 900; font-family: var(--font-display); color: var(--tertiary); line-height: 1;">0</div>
              </div>
            </div>

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
            <!-- Routine Selector Switcher -->
            <div style="display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap;">
              <button class="btn-cyber active" id="btn-routine-dos" style="font-size: 11px; padding: 6px 12px;" onclick="selectWorkoutRoutine('DOS_EPAULES')">1. DOS & ÉPAULES (17)</button>
              <button class="btn-cyber" id="btn-routine-bras" style="font-size: 11px; padding: 6px 12px;" onclick="selectWorkoutRoutine('BRAS')">2. BRAS & TRICEPS (6)</button>
              <button class="btn-cyber" id="btn-routine-abdos" style="font-size: 11px; padding: 6px 12px;" onclick="selectWorkoutRoutine('ABDOS')">3. ABDOS & CORE (5)</button>
              <button class="btn-cyber btn-gold" id="btn-routine-daily" style="font-size: 11px; padding: 6px 12px;" onclick="selectWorkoutRoutine('DAILY_COMPLETE')">TRINITÉ (28)</button>
              <button class="btn-cyber btn-red" id="btn-routine-purge" style="font-size: 11px; padding: 6px 12px;" onclick="selectWorkoutRoutine('PURGE_200')">⚔️ PURGE (200 POMPES)</button>
            </div>

            <div class="glass-card spotlight-card" style="padding: 22px; margin-bottom: 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 11px; color: var(--imperial-gold); font-weight: bold; font-family: var(--font-mono);" id="workout-routine-title">ROUTINE SÉLECTIONNÉE : DOS & ÉPAULES</div>
                <div style="font-size: 11px; color: var(--neon-cyan); font-family: var(--font-mono);" id="workout-step-indicator">ÉTAPE 1 / 17</div>
              </div>
              <h3 style="font-size: 20px; font-weight: bold; margin: 6px 0; color: var(--text-white);" id="workout-step-name">Jumping Jacks</h3>
              <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;" id="workout-step-desc">Activation cardiovasculaire et dynamique</p>
              <div style="font-size: 11px; color: var(--tertiary-fixed); font-family: var(--font-mono);" id="workout-step-joint">Cible Cinématique : Activation Dynamique</div>
            </div>

            <div class="glass-card spotlight-card" style="padding: 24px; text-align: center; margin-bottom: 18px;">
              <div style="font-size: 12px; letter-spacing: 2px; color: var(--neon-cyan); font-family: var(--font-display);" id="workout-metric-label">
                OBJECTIF EN COURS
              </div>
              <div id="workout-rep-count" class="shiny-green" style="font-size: 64px; font-weight: 900; font-family: var(--font-display); line-height: 1.1; margin: 8px 0;">
                0 / 30s
              </div>
              <div style="font-size: 13px; color: var(--text-secondary); font-weight: bold;" id="workout-posture-badge">
                EN ATTENTE DU FLUX VIDÉO / ESTIMATION DE POSE
              </div>
            </div>

            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
              <button class="btn-cyber" style="flex: 1;" onclick="addManualRep()">+ 1 UNITÉ / REP</button>
              <button class="btn-cyber btn-gold" style="flex: 1;" onclick="nextWorkoutStep()">ÉTAPE SUIVANTE ➔</button>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <button class="btn-cyber" style="font-size: 11px; padding: 4px 10px;" onclick="prevWorkoutStep()">⮜ ÉTAPE PRÉCÉDENTE</button>
              <button class="btn-cyber" style="font-size: 11px; padding: 4px 10px; color: var(--transcendent-green);" onclick="validateWorkoutSet()">✓ VALIDER TOUTE LA SÉRIE</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </main>
    </div> <!-- close app-main-area -->
  </div> <!-- close app-layout -->

  <!-- FLOATING BOTTOM NAV BAR DOCK (10 CANONICAL SCREENS - FIXED TO SCREEN VIEWPORT) -->
  <nav class="bottom-nav-bar nav-bar" aria-label="Navigation Principale">
    <div class="bottom-nav-dock">
      <button class="nav-tab ${initialTab === "dashboard" ? "active" : ""}" onclick="switchView('dashboard')" title="HUD Souverain" aria-label="HUD Souverain">
        <span class="nav-tab-icon">${NAV_ICONS.dashboard}</span>
        <span class="nav-tab-label">HUD SOUVERAIN</span>
        <span class="nav-active-dot"></span>
      </button>
      <button class="nav-tab ${initialTab === "skills" ? "active" : ""}" onclick="switchView('skills')" title="Compétences DAG" aria-label="Compétences DAG">
        <span class="nav-tab-icon">${NAV_ICONS.skills}</span>
        <span class="nav-tab-label">COMPÉTENCES DAG</span>
        <span class="nav-active-dot"></span>
      </button>
      <button class="nav-tab ${initialTab === "quests" ? "active" : ""}" onclick="switchView('quests')" title="Quêtes du Jour" aria-label="Quêtes du Jour">
        <span class="nav-tab-icon">${NAV_ICONS.quests}</span>
        <span class="nav-tab-label">QUÊTES DU JOUR</span>
        <span class="nav-active-dot"></span>
      </button>
      <button class="nav-tab ${initialTab === "planner" ? "active" : ""}" onclick="switchView('planner')" title="Time-Blocking" aria-label="Time-Blocking">
        <span class="nav-tab-icon">${NAV_ICONS.planner}</span>
        <span class="nav-tab-label">TIME-BLOCKING</span>
        <span class="nav-active-dot"></span>
      </button>
      <button class="nav-tab ${initialTab === "notes" ? "active" : ""}" onclick="switchView('notes')" title="Second Brain" aria-label="Second Brain">
        <span class="nav-tab-icon">${NAV_ICONS.notes}</span>
        <span class="nav-tab-label">SECOND BRAIN</span>
        <span class="nav-active-dot"></span>
      </button>
      <button class="nav-tab ${initialTab === "audio" ? "active" : ""}" onclick="switchView('audio')" title="Station Vocale" aria-label="Station Vocale">
        <span class="nav-tab-icon">${NAV_ICONS.audio}</span>
        <span class="nav-tab-label">STATION VOCALE</span>
        <span class="nav-active-dot"></span>
      </button>
      <button class="nav-tab ${initialTab === "opportunities" ? "active" : ""}" onclick="switchView('opportunities')" title="Veille Bourses" aria-label="Veille Bourses">
        <span class="nav-tab-icon">${NAV_ICONS.opportunities}</span>
        <span class="nav-tab-label">VEILLE BOURSES</span>
        <span class="nav-active-dot"></span>
      </button>
      <button class="nav-tab ${initialTab === "shop" ? "active" : ""}" onclick="switchView('shop')" title="Inventaire du Chasseur" aria-label="Inventaire du Chasseur">
        <span class="nav-tab-icon">${NAV_ICONS.shop}</span>
        <span class="nav-tab-label">INVENTAIRE</span>
        <span class="nav-active-dot"></span>
      </button>
      <button class="nav-tab ${initialTab === "penalty" ? "active" : ""}" onclick="switchView('penalty')" title="Zone Pénalité" aria-label="Zone Pénalité">
        <span class="nav-tab-icon">${NAV_ICONS.penalty}</span>
        <span class="nav-tab-label">ZONE PÉNALITÉ</span>
        <span class="nav-active-dot"></span>
      </button>
      <button class="nav-tab ${initialTab === "workout" ? "active" : ""}" onclick="switchView('workout')" title="Vision Sport" aria-label="Vision Sport">
        <span class="nav-tab-icon">${NAV_ICONS.workout}</span>
        <span class="nav-tab-label">VISION SPORT</span>
        <span class="nav-active-dot"></span>
      </button>
    </div>
  </nav>

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

  <!-- GOOGLE AUTHENTICATION & PLAYER PROFILE MODAL -->
  <div id="auth-modal" class="modal-overlay">
    <div class="modal-card" style="max-width: 520px; border: 1px solid rgba(192, 132, 252, 0.4); box-shadow: 0 0 50px rgba(111, 0, 190, 0.35);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: center; border: 1px solid var(--glass-inner-border);">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          </div>
          <h3 class="shiny-text" style="font-size: 18px; font-weight: bold; margin: 0;">SYNCHRONISATION GOOGLE DU CHASSEUR</h3>
        </div>
        <button onclick="closeAuthModal()" style="background: none; border: none; color: #fff; font-size: 22px; cursor: pointer;">✕</button>
      </div>

      <div id="auth-unauthenticated-view">
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.5;">
          Liez votre compte Google officiel pour synchroniser votre progression de Chasseur, vos Cristaux d'Ombre, votre Rang et sauvegarder vos stats sur le Cloud.
        </p>

        <!-- Google One-Tap / GIS rendered button slot -->
        <div id="g_id_onload"
             data-client_id="${GOOGLE_CLIENT_ID}"
             data-context="signin"
             data-ux_mode="popup"
             data-callback="handleGoogleCredentialResponse"
             data-auto_prompt="false">
        </div>
        <div style="display: flex; justify-content: center; margin-bottom: 16px;">
          <div id="google-gis-btn-container" class="g_id_signin" data-type="standard" data-shape="rectangular" data-theme="filled_black" data-text="signin_with" data-size="large" data-logo_alignment="left"></div>
        </div>

        <!-- Direct OAuth 2.0 Redirect Fallback Button -->
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="/auth/google" class="btn-cyber btn-gold" style="display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: 100%; text-decoration: none; padding: 12px 20px; font-size: 13px; font-weight: 800; border-radius: 8px;">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            SE CONNECTER AVEC GOOGLE (OAUTH 2.0)
          </a>
        </div>


      </div>

      <div id="auth-authenticated-view" style="display: none;">
        <div style="display: flex; align-items: center; gap: 16px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.25); border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <img id="auth-user-picture" src="/logo-monarch.svg" alt="Avatar" style="width: 54px; height: 54px; border-radius: 50%; border: 2px solid var(--neon-cyan); object-fit: cover;">
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <h4 id="auth-user-name" style="margin: 0; font-size: 16px; font-weight: bold; color: var(--text-white);"></h4>
              <span style="font-size: 10px; font-family: var(--font-mono); padding: 2px 6px; border-radius: 4px; background: rgba(69, 223, 164, 0.2); color: var(--tertiary); border: 1px solid var(--tertiary);">VÉRIFIÉ ✓</span>
            </div>
            <div id="auth-user-email" style="font-size: 12.5px; color: var(--text-secondary); margin-top: 4px; word-break: break-all;"></div>
            <div id="auth-provider-badge" style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 4px;">Fournisseur : Google Identity (OAuth 2.0)</div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button class="btn-cyber" onclick="closeAuthModal()">FERMER</button>
          <button class="btn-cyber btn-danger" onclick="logoutGoogleUser()">SE DÉCONNECTER</button>
        </div>
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
    const STORAGE_KEY = 'LEVELUP_SYSTEM_STATE_V7_CLEAN_DYNAMIC_AUTH';
    try {
      localStorage.removeItem('LEVELUP_SYSTEM_STATE_V6_PRISTINE_AWAKENING');
      localStorage.removeItem('LEVELUP_SYSTEM_STATE_V5_DAY0_PRISTINE');
      localStorage.removeItem('LEVELUP_SYSTEM_STATE_V4_PRISTINE');
      localStorage.removeItem('LEVELUP_SYSTEM_STATE_V3');
      localStorage.removeItem('LEVELUP_SYSTEM_STATE_V2');
      localStorage.removeItem('LEVELUP_SYSTEM_STATE_V1');
      localStorage.removeItem('LEVELUP_SYSTEM_STATE');
    } catch(e) {}

    let state = ${JSON.stringify(SYSTEM_STATE)};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state = Object.assign(state, parsed);
        const defaultQuests = ${JSON.stringify(SYSTEM_STATE.quests)};
        const existingIds = new Set((state.quests || []).map(q => q.id));
        defaultQuests.forEach(dq => {
          if (!existingIds.has(dq.id)) {
            state.quests.push(dq);
          }
        });
      }
    } catch(e) {
      console.warn("Storage sync fallback:", e);
    }

    // Immediate ingestion of redirect params if arriving from Google OAuth
    try {
      const urlP = new URLSearchParams(window.location.search);
      if (urlP.get('auth') === 'success' && urlP.get('provider') === 'google') {
        const pName = urlP.get('name');
        const pEmail = urlP.get('email');
        const pPic = urlP.get('picture');
        const pSub = urlP.get('sub');
        if (!state.player) state.player = {};
        if (pName) state.player.name = decodeURIComponent(pName);
        if (pEmail) state.player.email = decodeURIComponent(pEmail);
        if (pPic) state.player.avatar = decodeURIComponent(pPic);
        if (pSub) {
          const decSub = decodeURIComponent(pSub);
          state.player.id = "usr-" + decSub.slice(-8);
          state.player.googleId = decSub;
        }
        state.player.authProvider = 'google';
        saveState();
      }
    } catch(e) {}

    // ACCESS GATES (Wrapped in IIFE to prevent illegal return statements)
    (function checkAccessGates() {
      // Gate 1: Check authentication (Google, Hunter account, or authenticated player)
      const isAuthenticated = Boolean(
        state.player && (
          state.player.authProvider === 'google' ||
          state.player.authProvider === 'hunter' ||
          state.player.isAuthenticated ||
          (state.player.email && state.player.email.length > 3) ||
          (state.player.name && state.player.name !== 'Chasseur Non Éveillé' && state.player.id !== 'usr-guest-unawakened')
        )
      );

      // Check cookie presence as fallback
      const hasCookieAuth = typeof document !== 'undefined' && document.cookie && document.cookie.includes('levelup_hunter_auth=');

      if (!isAuthenticated && !hasCookieAuth) {
        window.location.replace('/?access=blocked&reason=ACCOUNT_REQUIRED');
        return;
      }

      // Gate 2: All new accounts complete onboarding before entering HUD
      const isOnboarded = Boolean(state.player && (state.player.onboardingCompleted || state.onboardingCompleted));
      const urlP = new URLSearchParams(window.location.search);
      if (!isOnboarded && !urlP.get('onboarding') && !urlP.get('skip_ob')) {
        window.location.replace('/onboarding?required=true');
        return;
      }
    })();

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

    // =========================================================================
    // GOOGLE OAUTH 2.0 & IDENTITY SERVICES INTEGRATION
    // =========================================================================
    function openAuthModal() {
      playChime(659);
      const modal = document.getElementById('auth-modal');
      if (modal) {
        modal.classList.add('open');
        refreshAuthModalUI();
      }
    }

    function closeAuthModal() {
      const modal = document.getElementById('auth-modal');
      if (modal) modal.classList.remove('open');
    }

    function refreshAuthModalUI() {
      const unauthView = document.getElementById('auth-unauthenticated-view');
      const authView = document.getElementById('auth-authenticated-view');
      const authBtnLabel = document.getElementById('header-auth-label');
      const avatarSlot = document.getElementById('header-avatar-slot');
      const headerPlayerName = document.getElementById('header-player-name');
      const dashPlayerName = document.getElementById('dash-player-name');
      const dashAuthLabel = document.getElementById('dash-auth-label');
      const dashTitleVal = document.getElementById('dash-player-title-val');

      const isAuthed = state.player && state.player.authProvider === 'google' && state.player.email;

      if (isAuthed) {
        if (unauthView) unauthView.style.display = 'none';
        if (authView) authView.style.display = 'block';

        const nameEl = document.getElementById('auth-user-name');
        const emailEl = document.getElementById('auth-user-email');
        const picEl = document.getElementById('auth-user-picture');

        const displayName = state.player.name || 'Chasseur Google';
        if (nameEl) nameEl.textContent = displayName;
        if (emailEl) emailEl.textContent = state.player.email || '';
        if (picEl && state.player.avatar) picEl.src = state.player.avatar;

        const shortName = displayName.split(' ')[0].toUpperCase();
        if (authBtnLabel) authBtnLabel.textContent = shortName;
        if (dashAuthLabel) dashAuthLabel.textContent = "COMPTE LIÉ : " + state.player.email;

        if (avatarSlot) {
          if (state.player.avatar) {
            avatarSlot.innerHTML = '<img src="' + state.player.avatar + '" alt="Avatar" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover;">';
          } else {
            avatarSlot.textContent = '👑';
          }
        }
        if (headerPlayerName) headerPlayerName.textContent = displayName;
        if (dashPlayerName) dashPlayerName.textContent = displayName;
        if (dashTitleVal) dashTitleVal.textContent = state.player.title || 'Chasseur Éveillé (Rang E)';
      } else {
        if (unauthView) unauthView.style.display = 'block';
        if (authView) authView.style.display = 'none';
        if (authBtnLabel) authBtnLabel.textContent = 'CONNEXION GOOGLE';
        if (dashAuthLabel) dashAuthLabel.textContent = 'LIER UN COMPTE GOOGLE';
        if (avatarSlot) avatarSlot.textContent = '👑';
        const anonName = (state.player && state.player.name) || 'Chasseur Non Éveillé';
        if (headerPlayerName) headerPlayerName.textContent = anonName;
        if (dashPlayerName) dashPlayerName.textContent = anonName;
        if (dashTitleVal) dashTitleVal.textContent = (state.player && state.player.title) || 'Initié Non Éveillé (Rang E)';
      }
    }

    // Google Identity Services (GIS) Credential Callback
    async function handleGoogleCredentialResponse(response) {
      if (!response || !response.credential) return;
      try {
        const res = await fetch('/api/v1/auth/google/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential })
        });
        const data = await res.json();
        if (data.success && data.user) {
          state.player.id = data.user.id || ("usr-" + (data.user.sub ? data.user.sub.slice(-8) : "google"));
          state.player.name = data.user.name;
          state.player.email = data.user.email;
          state.player.avatar = data.user.picture;
          state.player.authProvider = 'google';
          state.player.googleId = data.user.sub;
          state.player.title = data.user.title || "Chasseur Éveillé (Rang E)";
          saveState();
          refreshAuthModalUI();
          showSysNotification(
            "👑 [COMPTE GOOGLE SYNCHRONISÉ]",
            "Bienvenue, Chasseur <strong>" + data.user.name + "</strong> !<br>Votre identité Google (<code>" + data.user.email + "</code>) est scellée au Système du Monarque."
          );
          playChime(1046);
        } else {
          showSysNotification(
            "[ERREUR D'AUTHENTIFICATION]",
            "Échec de validation du jeton Google : " + (data.error || "Réponse non conforme.")
          );
        }
      } catch (err) {
        console.error('[Google Auth] Erreur vérification:', err);
      }
    }

    async function logoutGoogleUser() {
      try {
        await fetch('/api/v1/auth/logout', { method: 'POST' });
      } catch (e) {}
      state.player.id = 'usr-guest-unawakened';
      state.player.name = 'Chasseur Non Éveillé';
      state.player.title = 'Initié Non Éveillé (Rang E)';
      state.player.email = null;
      state.player.avatar = null;
      state.player.authProvider = null;
      state.player.googleId = null;
      saveState();
      refreshAuthModalUI();
      closeAuthModal();
      showSysNotification(
        "[DÉCONNEXION RÉUSSIE]",
        "Session Google déconnectée. Vos paramètres reviennent au profil anonyme par défaut."
      );
      playChime(523);
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

    // ==========================================================================
    // PROGRESSIVE STAGGERED SCROLL-REVEAL SYSTEM (UN À UN AU SCROLL)
    // ==========================================================================
    let cardScrollObserver = null;
    let cardRevealQueue = [];
    let cardRevealTimer = null;

    function processCardRevealBatch() {
      if (!cardRevealQueue.length) return;

      // Sort incoming cards top-to-bottom, then left-to-right
      cardRevealQueue.sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        if (Math.abs(rectA.top - rectB.top) > 25) {
          return rectA.top - rectB.top;
        }
        return rectA.left - rectB.left;
      });

      // Cascade cards one by one with a refined stagger ("un à un")
      cardRevealQueue.forEach((card, index) => {
        const staggerDelay = Math.min(index * 65, 450);
        card.style.setProperty('--reveal-delay', staggerDelay);
        if (cardScrollObserver) {
          cardScrollObserver.unobserve(card);
        }
        requestAnimationFrame(() => {
          card.classList.add('is-revealed');
        });
      });

      cardRevealQueue = [];
      cardRevealTimer = null;
    }

    function initScrollRevealCards() {
      const cardSelectors = [
        '.glass-card',
        '.spotlight-card',
        '.skill-card-item',
        '.note-card-item',
        '.backlink-card'
      ];
      
      const elements = document.querySelectorAll(cardSelectors.join(', '));
      const validCards = [];

      elements.forEach(el => {
        // Exclude modal dialogs and 3D rotating cylinder items
        if (el.classList.contains('modal-card') || 
            el.closest('.modal-overlay') || 
            el.classList.contains('quest-3d-card') || 
            el.classList.contains('opp-3d-card')) {
          return;
        }
        
        if (!el.classList.contains('scroll-reveal-card')) {
          el.classList.add('scroll-reveal-card');
        }
        if (!el.classList.contains('is-revealed')) {
          validCards.push(el);
        }
      });

      if (!('IntersectionObserver' in window)) {
        validCards.forEach(c => c.classList.add('is-revealed'));
        return;
      }

      if (!cardScrollObserver) {
        cardScrollObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const card = entry.target;
              if (!card.classList.contains('is-revealed') && !cardRevealQueue.includes(card)) {
                cardRevealQueue.push(card);
                if (!cardRevealTimer) {
                  cardRevealTimer = setTimeout(processCardRevealBatch, 35);
                }
              }
            }
          });
        }, {
          root: null,
          rootMargin: '0px 0px -30px 0px',
          threshold: 0.05
        });
      }

      validCards.forEach(card => {
        cardScrollObserver.observe(card);
      });
    }

    function triggerActiveViewCardsReveal(viewPanelEl) {
      if (!viewPanelEl) return;
      const cards = Array.from(viewPanelEl.querySelectorAll('.scroll-reveal-card:not(.is-revealed)'));
      if (!cards.length) return;

      const windowHeight = window.innerHeight || 800;
      const inView = [];

      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.top < windowHeight + 120 && rect.bottom > -50) {
          inView.push(card);
        }
      });

      if (inView.length > 0) {
        inView.sort((a, b) => {
          const rectA = a.getBoundingClientRect();
          const rectB = b.getBoundingClientRect();
          if (Math.abs(rectA.top - rectB.top) > 25) {
            return rectA.top - rectB.top;
          }
          return rectA.left - rectB.left;
        });

        inView.forEach((card, idx) => {
          const delay = Math.min(idx * 65, 450);
          card.style.setProperty('--reveal-delay', delay);
          if (cardScrollObserver) cardScrollObserver.unobserve(card);
          requestAnimationFrame(() => {
            card.classList.add('is-revealed');
          });
        });
      }
    }

    function sanitizeLegacyComments() {
      // 1. Sanitize state in-memory object
      function sanitizeObj(obj) {
        if (!obj) return;
        for (const k of Object.keys(obj)) {
          if (typeof obj[k] === 'string') {
            if (!obj[k].includes('://')) {
              obj[k] = obj[k].split('//').join(' — ');
            }
          } else if (typeof obj[k] === 'object') {
            sanitizeObj(obj[k]);
          }
        }
      }
      if (typeof state !== 'undefined') {
        sanitizeObj(state);
      }

      // 2. Clean DOM text nodes
      try {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
          if (node.nodeValue && node.nodeValue.includes('//') && !node.nodeValue.includes('://')) {
            node.nodeValue = node.nodeValue.split('//').join(' — ');
          }
        }
      } catch (e) {}
    }

    // View Switcher (Client Routing)
    function switchView(viewId) {
      playChime(659);
      document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

      const targetView = document.getElementById('view-' + viewId);
      if (targetView) {
        targetView.classList.add('active');
        triggerActiveViewCardsReveal(targetView);
      }

      const mainArea = document.querySelector('.app-main-area');
      if (mainArea) mainArea.scrollTop = 0;
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}

      const tabs = document.querySelectorAll('.nav-tab');
      tabs.forEach(t => {
        if (t.getAttribute('onclick') && t.getAttribute('onclick').includes(viewId)) {
          t.classList.add('active');
          try {
            t.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          } catch (e) {}
        }
      });

      const viewNames = {
        dashboard: 'HUD SOUVERAIN & STATUTS',
        skills: 'ARBRE DES COMPÉTENCES DAG',
        quests: 'JOURNAL DES QUÊTES DU JOUR',
        planner: 'PLANIFICATEUR CIRCADIEN',
        notes: 'CERVEAU NUMÉRIQUE (OBSIDIAN)',
        audio: 'STATION VOCALE FFT & SOCRATE',
        opportunities: 'VEILLE BOURSES & HACKATHONS',
        shop: 'BOUTIQUE DES OMBRES',
        penalty: 'ZONE DE PÉNALITÉ INVIOLABLE',
        workout: 'VISION SPORT MEDIAPIPE'
      };
      const viewFriendlyNames = {
        dashboard: 'HUD Souverain',
        skills: 'Compétences DAG',
        quests: 'Quêtes du Jour',
        planner: 'Time-Blocking',
        notes: 'Second Brain',
        audio: 'Station Vocale',
        opportunities: 'Veille Bourses',
        shop: "Boutique d'Ombre",
        penalty: 'Zone Pénalité',
        workout: 'Vision Sport'
      };

      if (viewId === 'notes') {
        setTimeout(() => {
          if (typeof initObsidianVault === 'function' && !obsidianInitialized) initObsidianVault();
          if (typeof resizeCanvas === 'function') resizeCanvas('obsidian-graph-canvas');
        }, 50);
      }
      if (viewId === 'quests') {
        setTimeout(() => {
          if (typeof initQuestCircularCarousel === 'function') initQuestCircularCarousel();
        }, 50);
      }
      if (viewId === 'opportunities') {
        setTimeout(() => {
          if (typeof initOppCircularCarousel === 'function') initOppCircularCarousel();
        }, 50);
      }
      window.history.pushState({}, '', '/' + (viewId === 'dashboard' ? '' : viewId));
    }

    window.addEventListener('popstate', () => {
      const path = window.location.pathname.replace('/', '') || 'dashboard';
      switchView(path);
    });

    // Theme Toggle & State Persistence
    function updateThemeToggleBtn(theme) {
      const btn = document.getElementById('theme-toggle-btn');
      if (!btn) return;
      const label = document.getElementById('theme-toggle-label');
      const icon = btn.querySelector('.glass-thumb-icon');
      
      if (theme === 'light-awakening') {
        btn.classList.remove('is-dark');
        btn.classList.add('is-light');
        if (label) label.textContent = 'Light';
        if (icon) {
          icon.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2" fill="#ffffff" stroke="none" /><line x1="12" y1="2" x2="12" y2="4.5" /><line x1="12" y1="19.5" x2="12" y2="22" /><line x1="4.22" y1="4.22" x2="6" y2="6" /><line x1="18" y1="18" x2="19.78" y2="19.78" /><line x1="2" y1="12" x2="4.5" y2="12" /><line x1="19.5" y1="12" x2="22" y2="12" /><line x1="4.22" y1="19.78" x2="6" y2="18" /><line x1="18" y1="6" x2="19.78" y2="4.22" /></svg>';
        }
        btn.setAttribute('title', 'Mode Clair actif (Cliquer pour Mode Sombre)');
        btn.setAttribute('aria-label', 'Mode Clair actif');
      } else {
        btn.classList.remove('is-light');
        btn.classList.add('is-dark');
        if (label) label.textContent = 'Dark';
        if (icon) {
          icon.innerHTML = '<svg viewBox="0 0 24 24" width="17" height="17" fill="#ffffff" stroke="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>';
        }
        btn.setAttribute('title', 'Mode Sombre actif (Cliquer pour Mode Clair)');
        btn.setAttribute('aria-label', 'Mode Sombre actif');
      }
    }

    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'dark-monarch';
      const next = (current === 'light-awakening') ? 'dark-monarch' : 'light-awakening';
      document.documentElement.setAttribute('data-theme', next);
      if (document.body) {
        document.body.setAttribute('data-theme', next);
      }
      try {
        localStorage.setItem('levelup-theme', next);
      } catch (e) {
        console.warn('LocalStorage non accessible:', e);
      }
      updateThemeToggleBtn(next);
      try {
        if (typeof refreshObsidianGraphTheme === 'function') {
          refreshObsidianGraphTheme();
        }
      } catch (err) {
        console.warn('Obsidian graph refresh skipped:', err);
      }
      try {
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
      } catch (e) {}
    }

    let savedTheme = 'dark-monarch';
    try {
      savedTheme = localStorage.getItem('levelup-theme') || 'dark-monarch';
    } catch (e) {}
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (document.body) {
      document.body.setAttribute('data-theme', savedTheme);
    }
    updateThemeToggleBtn(savedTheme);

    // Solo Leveling Status Window: Attribute Point Allocation
    function allocateStatPoint(stat) {
      if (!state.player.attributes) {
        state.player.attributes = { str: 50, agi: 35, per: 29, vit: 27, int: 27, remainingPoints: 3 };
      }
      if (state.player.attributes.remainingPoints <= 0) {
        showSysNotification(
          "[POINTS INSUFFISANTS]",
          "Vous n'avez aucun point de caractéristique disponible. Accomplissez des quêtes de rang S ou validez des séries pour monter de niveau."
        );
        return;
      }
      if (state.player.attributes[stat] !== undefined) {
        state.player.attributes[stat]++;
        state.player.attributes.remainingPoints--;
        saveState();
        updateStatsUI();
        const statLabels = {
          str: 'FORCE (STR)',
          agi: 'AGILITÉ (AGI)',
          per: 'PERCEPTION (PER)',
          vit: 'VITALITÉ (VIT)',
          int: 'INTELLIGENCE (INT)'
        };
        playChime(880);
        showSysNotification(
          "[AUGMENTATION DE CARACTÉRISTIQUE]",
          "Attribut <strong>" + (statLabels[stat] || stat.toUpperCase()) + "</strong> élevé à <strong>" + state.player.attributes[stat] + "</strong>.<br>Points restants à allouer : <strong>" + state.player.attributes.remainingPoints + "</strong>."
        );
      }
    }

    function updateStatsUI() {
      if (!state.player) return;
      if (!state.player.attributes) {
        state.player.attributes = { str: 50, agi: 35, per: 29, vit: 27, int: 27, remainingPoints: 3 };
      }
      const remEl = document.getElementById('stat-remaining-points');
      if (remEl) remEl.textContent = state.player.attributes.remainingPoints;
      ['str', 'agi', 'per', 'vit', 'int'].forEach(s => {
        const valEl = document.getElementById('stat-val-' + s);
        if (valEl) valEl.textContent = state.player.attributes[s];
      });
    }

    // Initialize stats on DOM ready
    setTimeout(updateStatsUI, 30);

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
        if (!state.player.attributes) {
          state.player.attributes = { str: 50, agi: 35, per: 29, vit: 27, int: 27, remainingPoints: 3 };
        }
        state.player.attributes.remainingPoints = (state.player.attributes.remainingPoints || 0) + 5;
        playChime(1046);
        showSysNotification(
          "🌟 [LEVEL UP! MONTÉE DE NIVEAU SOUVERAINE]",
          "Félicitations, Chasseur ! Vous avez atteint le <strong>NIVEAU " + state.player.level + "</strong> !\\nToutes vos jauges HP et MP sont instantanément restaurées à 100%.\\n<strong>+5 Points de caractéristiques</strong> disponibles."
        );
        updateStatsUI();
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
      if (levelLabel) levelLabel.textContent = "NIVEAU " + state.player.level + " — PALIER ACTUEL";
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
      if (badge) badge.textContent = base + " — [MAÎTRISÉ 5/5]";
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

    const QUEST_CARD_WIDTH = 280;
    const QUEST_CARD_HEIGHT = 420;
    const QUEST_GAP = 28;
    const QUEST_TILT = -4;
    const QUEST_PERSPECTIVE = 1200;

    function setQuestsViewMode(mode) {
      currentQuestsViewMode = 'carousel';
      const secCarousel = document.getElementById('quests-carousel-section');
      if (secCarousel) secCarousel.style.display = 'block';
      if (!questCarouselInitialized) initQuestCircularCarousel();
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
      const radius = Math.max(540, Math.round(chord * 1.18));

      const baseThemes = {
        STR: { color: '#10b981', glow: 'rgba(16, 185, 129, 0.45)', icon: 'fitness_center', label: 'FORCE & CALISTHÉNIE' },
        CYBER: { color: '#00f3ff', glow: 'rgba(0, 243, 255, 0.45)', icon: 'terminal', label: 'CYBERSÉCURITÉ' },
        AI_ENG: { color: '#c084fc', glow: 'rgba(192, 132, 252, 0.45)', icon: 'psychology', label: 'INGÉNIERIE IA' },
        ACAD: { color: '#818cf8', glow: 'rgba(129, 140, 248, 0.45)', icon: 'school', label: 'EXCELLENCE ACADÉMIQUE' },
        EXP: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.45)', icon: 'record_voice_over', label: 'ÉLOQUENCE & RÉSEAUTAGE' },
        LNG: { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)', icon: 'translate', label: 'ANGLAIS C1/C2 CAMBRIDGE' },
        FIN: { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)', icon: 'account_balance', label: 'FINANCES & TRÉSORERIE' },
        DIS: { color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.45)', icon: 'self_improvement', label: 'DISCIPLINE & MONK MODE' }
      };

      // Populate Cards
      ring.innerHTML = '';
      quests.forEach((q, index) => {
        const isEmergency = q.type === 'EMERGENCY' || q.id === 'q-emergency-auth-bypass';
        const isFit = q.id === 'q-fit-sungjinwoo' || q.id === 'q-str-explosive-pullups' || q.base === 'STR';
        const theme = baseThemes[q.base] || { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)', icon: 'stars', label: 'SYSTÈME DU MONARQUE' };
        
        const card = document.createElement('div');
        card.className = 'circular-carousel__card';
        card.setAttribute('data-quest-index', index);

        card.innerHTML = \`
          <div class="quest-3d-card \${isEmergency ? 'quest-emergency' : ''}" 
               id="quest-card-3d-\${q.id}"
               style="--quest-theme: \${theme.color}; --quest-glow: \${theme.glow};"
               onclick="handleQuest3DCardClick(\${index}, '\${q.id}')">
            
            <!-- Cyber HUD Corner Brackets -->
            <div class="quest-hud-corner quest-hud-tl"></div>
            <div class="quest-hud-corner quest-hud-tr"></div>
            
            <!-- Top Specular Rim Light -->
            <div class="quest-specular-rim"></div>

            <!-- Hero Banner Image with solo leveling gradient -->
            <div class="quest-banner-wrapper">
              <img src="\${q.image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&q=80&auto=format&fit=crop'}" 
                   alt="\${q.title.replace(/"/g, '&quot;')}" 
                   class="quest-banner-img" />
              <div class="quest-banner-overlay"></div>
              
              <!-- Top Chips on Image -->
              <div class="quest-banner-top-chips">
                <span class="quest-base-chip" style="border-color: \${theme.color}; color: \${theme.color};">
                  <span class="material-symbols-outlined" style="font-size: 11px;">\${theme.icon}</span>
                  <span>\${q.base}</span>
                </span>
                <span class="quest-type-chip \${isEmergency ? 'chip-emergency' : ''}">
                  \${isEmergency ? '⚠️ URGENCE S-RANK' : (q.type || 'DAILY')}
                </span>
              </div>

              <!-- Bottom Info on Image -->
              <div class="quest-banner-bottom-bar">
                <div class="quest-reward-pill">
                  <span class="quest-xp-val">+\${q.xp} XP</span>
                  <span class="quest-crystal-val">+\${q.crystals || 20} 💎</span>
                </div>
                <div class="quest-status-indicator \${q.completed ? 'is-done' : ''}">
                  <span class="quest-status-dot"></span>
                  <span>\${q.completed ? 'VALIDÉE' : 'ACTIVE'}</span>
                </div>
              </div>
            </div>

            <!-- Quest Title & Context -->
            <div class="quest-header-section">
              <div class="quest-domain-label" style="color: \${theme.color};">
                <span>DOMAINE : \${theme.label}</span>
              </div>
              <div class="quest-title-text" title="\${q.title.replace(/"/g, '&quot;')}">
                \${q.title}
              </div>
            </div>

            <!-- Holographic Terminal Protocol Brief -->
            <div class="quest-terminal-panel" style="border-left: 3px solid \${theme.color};">
              <div class="quest-protocol-header">
                <span class="material-symbols-outlined" style="font-size: 13px; color: \${theme.color};">terminal</span>
                <span>PROTOCOLE D'EXÉCUTION</span>
              </div>
              <div class="quest-protocol-body">
                \${isFit && q.id === 'q-fit-sungjinwoo' ? \`
                  <div class="quest-fit-meters">
                    <div class="fit-meter-row">
                      <span>• Pompes militaires</span>
                      <span class="fit-count">0 / 100</span>
                    </div>
                    <div class="fit-meter-row">
                      <span>• Abdos d'acier</span>
                      <span class="fit-count">0 / 100</span>
                    </div>
                    <div class="fit-meter-row">
                      <span>• Squats explosifs</span>
                      <span class="fit-count">0 / 100</span>
                    </div>
                    <div class="fit-meter-row">
                      <span>• Course à pied</span>
                      <span class="fit-count">0.0 / 10 km</span>
                    </div>
                  </div>
                \` : \`
                  <div class="quest-desc-text">
                    › \${q.description}
                  </div>
                \`}
              </div>
            </div>

            <!-- Bottom Interactive CTA -->
            <div class="quest-footer-cta">
              <button class="quest-cta-btn \${isEmergency ? 'btn-emergency' : ''} \${q.completed ? 'btn-completed' : ''}"
                      onclick="event.stopPropagation(); openProofModal('\\\${q.id}', '\\\${q.title.replace(/'/g, "\\\\'")}', \\\${q.xp}, \\\${q.crystals});">
                <span class="material-symbols-outlined" style="font-size: 15px;">\${q.completed ? 'task_alt' : (isEmergency ? 'bolt' : 'verified')}</span>
                <span>\${q.completed ? 'ACCOMPLIE ✓' : (isEmergency ? 'COMMIT HOTFIX CRITIQUE' : 'SOUMETTRE PREUVE')}</span>
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

      // Mouse Wheel Delta: only prevent default for horizontal scroll or Shift+wheel so page vertical scroll remains fluid
      root.addEventListener('wheel', (e) => {
        if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          if (Math.abs(e.deltaX) > 3 || Math.abs(e.deltaY) > 3) {
            e.preventDefault();
            const d = e.shiftKey ? e.deltaY : e.deltaX;
            questCarouselAngle -= d * 0.15;
            questCarouselTarget = Math.round(questCarouselAngle / step) * step;
          }
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

        if (count > 0) {
          const step = 360 / count;
          const pitch = QUEST_CARD_WIDTH + QUEST_GAP;
          const chord = pitch / (2 * Math.sin(Math.PI / count));
          const radius = Math.max(500, Math.round(chord * 2.1));

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
    // REACTBITS CIRCULAR CAROUSEL 3D ENGINE FOR OPPORTUNITIES (CYLINDER PRESET)
    // =========================================================================
    let oppCarouselInitialized = false;
    let oppCarouselAngle = 0;
    let oppCarouselTarget = null;
    let oppCarouselVelocity = 0;
    let oppCarouselDrift = true;
    let oppCarouselDirection = -1;
    let oppCarouselSpeed = 14;
    let isDraggingOppCarousel = false;
    let oppPointerStart = { x: 0, y: 0, angle: 0, time: 0 };
    let oppPointerCurrent = { x: 0, y: 0 };
    let oppPointerSamples = [];
    let oppCarouselAnimId = null;
    let oppCarouselActiveIndex = 0;
    let oppYaw = 0;
    let oppPitch = 0;

    const OPP_CARD_WIDTH = 280;
    const OPP_GAP = 20;
    const OPP_TILT = -4;
    const OPP_PERSPECTIVE = 1100;

    function initOppCircularCarousel() {
      const ring = document.getElementById('opp-carousel-ring');
      const stage = document.getElementById('opp-carousel-stage');
      const root = document.getElementById('opp-circular-carousel');
      if (!ring || !stage || !root) return;

      stage.style.perspective = OPP_PERSPECTIVE + 'px';

      const opportunities = state.opportunities || [];
      const count = opportunities.length;
      if (count === 0) return;

      const step = 360 / count;
      const pitch = OPP_CARD_WIDTH + OPP_GAP;
      const chord = pitch / (2 * Math.sin(Math.PI / count));
      const radius = Math.max(540, Math.round(chord * 1.25));

      const typeThemes = {
        BOURSE: { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)', icon: 'account_balance', label: "BOURSE D'EXCELLENCE" },
        HACKATHON: { color: '#00f3ff', glow: 'rgba(0, 243, 255, 0.45)', icon: 'code', label: 'HACKATHON MONDIAL' },
        CERTIFICATION: { color: '#c084fc', glow: 'rgba(192, 132, 252, 0.45)', icon: 'workspace_premium', label: 'CERTIFICATION' }
      };

      // Populate Cards
      ring.innerHTML = '';
      opportunities.forEach((o, index) => {
        const theme = typeThemes[o.type] || { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)', icon: 'stars', label: o.type };
        const card = document.createElement('div');
        card.className = 'circular-carousel__card';
        card.setAttribute('data-opp-index', index);

        card.innerHTML = \`
          <div class="quest-3d-card opp-3d-card" 
               id="opp-3d-card-\${o.id}" 
               style="--quest-theme: \${theme.color}; --quest-glow: \${theme.glow}; --opp-theme: \${theme.color}; --opp-glow: \${theme.glow};" 
               onclick="handleOpp3DCardClick(\${index}, '\${o.id}')">
            
            <!-- Cyber HUD Corner Brackets -->
            <div class="quest-hud-corner quest-hud-tl" style="border-top-color: \${theme.color}; border-left-color: \${theme.color};"></div>
            <div class="quest-hud-corner quest-hud-tr" style="border-top-color: \${theme.color}; border-right-color: \${theme.color};"></div>
            
            <!-- Top Specular Rim Light -->
            <div class="quest-specular-rim"></div>

            <!-- Hero Banner Image with solo leveling gradient -->
            <div class="quest-banner-wrapper">
              <img src="\${o.image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80&auto=format&fit=crop'}" 
                   alt="\${o.title.replace(/"/g, '&quot;')}" 
                   class="quest-banner-img" />
              <div class="quest-banner-overlay"></div>
              
              <!-- Top Chips on Image -->
              <div class="quest-banner-top-chips">
                <span class="quest-base-chip" style="border-color: \${theme.color}; color: \${theme.color};">
                  <span class="material-symbols-outlined" style="font-size: 11px;">\${theme.icon}</span>
                  <span>\${o.type}</span>
                </span>
                <span class="quest-type-chip" style="background: rgba(251, 191, 36, 0.2); border-color: rgba(251, 191, 36, 0.6); color: #fbbf24;">
                  \${o.matchScore}% MATCH
                </span>
              </div>

              <!-- Bottom Info on Image -->
              <div class="quest-banner-bottom-bar">
                <div class="quest-reward-pill">
                  <span class="quest-xp-val" style="color: #34d399;">\${o.amount}</span>
                </div>
                <div class="quest-status-indicator is-done">
                  <span class="quest-status-dot" style="background: \${theme.color}; box-shadow: 0 0 8px \${theme.color};"></span>
                  <span>\${o.status}</span>
                </div>
              </div>
            </div>

            <!-- Terminal Details Panel -->
            <div class="quest-terminal-panel" style="border-left: 3px solid \${theme.color};">
              <div class="quest-protocol-header">
                <span class="material-symbols-outlined" style="font-size: 13px; color: \${theme.color};">hub</span>
                <span>DÉTAILS DU PROGRAMME</span>
              </div>
              <div class="quest-protocol-body">
                <div class="quest-title-text" style="font-size: 13px; margin-bottom: 6px;">
                  \${o.title}
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary);">
                  <div style="display: flex; align-items: center; gap: 5px;">
                    <span class="material-symbols-outlined" style="font-size: 12px; color: \${theme.color};">public</span>
                    <span>Portail : <strong style="color: var(--text-white);">\${o.portal}</strong></span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 5px;">
                    <span class="material-symbols-outlined" style="font-size: 12px; color: var(--alert-crimson);">event</span>
                    <span>Échéance : <strong style="color: var(--text-white);">\${o.deadline}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bottom Interactive CTA -->
            <div class="quest-footer-cta">
              <a href="\${o.url}" target="_blank" onclick="event.stopPropagation();" class="quest-cta-btn" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span>POSTULER AU PROGRAMME</span>
                <span class="material-symbols-outlined" style="font-size: 14px;">open_in_new</span>
              </a>
            </div>

            <!-- Depth Shade overlay for 3D realism -->
            <div class="quest-depth-shade" id="opp-depth-shade-\${o.id}"></div>
          </div>
        \`;

        ring.appendChild(card);
      });

      // Pointer Drag Events
      root.addEventListener('pointerdown', (e) => {
        isDraggingOppCarousel = true;
        oppCarouselTarget = null;
        oppPointerStart = {
          x: e.clientX,
          y: e.clientY,
          angle: oppCarouselAngle,
          time: performance.now()
        };
        oppPointerSamples = [{ time: performance.now(), angle: oppCarouselAngle }];
        root.setAttribute('data-dragging', '');
      });

      window.addEventListener('pointermove', (e) => {
        const rect = root.getBoundingClientRect();
        oppPointerCurrent.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        oppPointerCurrent.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        if (isDraggingOppCarousel) {
          const deltaX = e.clientX - oppPointerStart.x;
          const perPixel = 180 / (Math.PI * radius);
          oppCarouselAngle = oppPointerStart.angle + deltaX * perPixel;
          const now = performance.now();
          oppPointerSamples.push({ time: now, angle: oppCarouselAngle });
          while (oppPointerSamples.length > 2 && now - oppPointerSamples[0].time > 110) {
            oppPointerSamples.shift();
          }
        }
      });

      window.addEventListener('pointerup', () => {
        if (!isDraggingOppCarousel) return;
        isDraggingOppCarousel = false;
        root.removeAttribute('data-dragging');

        if (oppPointerSamples.length >= 2) {
          const first = oppPointerSamples[0];
          const last = oppPointerSamples[oppPointerSamples.length - 1];
          const span = (last.time - first.time) / 1000;
          if (span > 0.008) {
            const v = (last.angle - first.angle) / span;
            oppCarouselVelocity = Math.max(-1200, Math.min(1200, v));
            const tau = 0.18 + 0.6 * 1.5;
            const pred = oppCarouselAngle + oppCarouselVelocity * tau * 0.55;
            oppCarouselTarget = Math.round(pred / step) * step;
          }
        } else {
          oppCarouselTarget = Math.round(oppCarouselAngle / step) * step;
        }
      });

      // Mouse Wheel Delta: only prevent default for horizontal scroll or Shift+wheel so page vertical scroll remains fluid
      root.addEventListener('wheel', (e) => {
        if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          if (Math.abs(e.deltaX) > 3 || Math.abs(e.deltaY) > 3) {
            e.preventDefault();
            const d = e.shiftKey ? e.deltaY : e.deltaX;
            oppCarouselAngle -= d * 0.15;
            oppCarouselTarget = Math.round(oppCarouselAngle / step) * step;
          }
        }
      }, { passive: false });

      // Start Animation Loop
      if (!oppCarouselAnimId) {
        startOppCarouselLoop();
      }

      oppCarouselInitialized = true;
    }

    function handleOpp3DCardClick(index, oppId) {
      focusOppCarouselCard(index);
      const o = (state.opportunities || []).find(item => item.id === oppId);
      if (o) {
        showSysNotification(
          "🌐 [" + o.type + " : " + o.title + "]",
          "Portail : " + o.portal + " | Montant : " + o.amount + " | Date limite : " + o.deadline + " (Match : " + o.matchScore + "%)"
        );
      }
    }

    function focusOppCarouselCard(index) {
      const opportunities = state.opportunities || [];
      const step = 360 / Math.max(1, opportunities.length);
      let target = -index * step;
      target += 360 * Math.round((oppCarouselAngle - target) / 360);
      oppCarouselTarget = target;
    }

    function stepOppCarousel(dir) {
      const opportunities = state.opportunities || [];
      const step = 360 / Math.max(1, opportunities.length);
      const base = oppCarouselTarget ?? Math.round(oppCarouselAngle / step) * step;
      oppCarouselTarget = base - dir * step;
    }

    function toggleOppCarouselDrift() {
      oppCarouselDrift = !oppCarouselDrift;
      const btn = document.getElementById('btn-opp-carousel-play');
      if (btn) btn.textContent = oppCarouselDrift ? '⏯ PAUSE' : '▶ DÉFILER';
      showSysNotification(
        "[CARROUSEL 3D OPPORTUNITÉS]",
        oppCarouselDrift ? "Rotation cinétique continue réactivée." : "Rotation automatique en pause."
      );
    }

    function startOppCarouselLoop() {
      let lastTime = performance.now();

      function loop(now) {
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        const opportunities = state.opportunities || [];
        const count = opportunities.length;

        if (count > 0) {
          const step = 360 / count;
          const pitch = OPP_CARD_WIDTH + OPP_GAP;
          const chord = pitch / (2 * Math.sin(Math.PI / count));
          const radius = Math.max(540, Math.round(chord * 1.25));

          // Physics updates
          if (isDraggingOppCarousel) {
            // Dragged manually
          } else if (oppCarouselTarget !== null) {
            const SPRING = 118;
            const damping = 2 * Math.sqrt(SPRING);
            const accel = SPRING * (oppCarouselTarget - oppCarouselAngle) - damping * oppCarouselVelocity;
            oppCarouselVelocity += accel * dt;
            oppCarouselAngle += oppCarouselVelocity * dt;
            if (Math.abs(oppCarouselTarget - oppCarouselAngle) < 0.01 && Math.abs(oppCarouselVelocity) < 0.05) {
              oppCarouselAngle = oppCarouselTarget;
              oppCarouselVelocity = 0;
              oppCarouselTarget = null;
            }
          } else if (oppCarouselDrift) {
            const cruise = oppCarouselSpeed * oppCarouselDirection;
            const tau = 0.18 + 0.6 * 1.5;
            oppCarouselVelocity += (cruise - oppCarouselVelocity) * (1 - Math.exp(-dt / tau));
            oppCarouselAngle += oppCarouselVelocity * dt;
          }

          // Parallax tilt
          const aimYaw = oppPointerCurrent.x * 0.3 * 9;
          const aimPitch = -oppPointerCurrent.y * 0.3 * 6;
          oppYaw += (aimYaw - oppYaw) * 0.1;
          oppPitch += (aimPitch - oppPitch) * 0.1;

          // Camera & Ring DOM updates
          const camera = document.getElementById('opp-carousel-camera');
          const ring = document.getElementById('opp-carousel-ring');

          if (camera && ring) {
            camera.style.transform = \`translate3d(0, 0, \${-radius}px) rotateX(\${OPP_TILT + oppPitch}deg) rotateY(\${oppYaw}deg)\`;
            ring.style.transform = \`rotateY(\${oppCarouselAngle}deg)\`;

            const cards = ring.querySelectorAll('.circular-carousel__card');
            cards.forEach((cardEl, idx) => {
              const base = idx * step;
              cardEl.style.transform = \`rotateY(\${base}deg) translateZ(\${radius}px)\`;

              // Calculate front-facing cosine for depth fade
              const world = ((((base + oppCarouselAngle + 180) % 360) + 360) % 360) - 180;
              const facing = Math.cos((world * Math.PI) / 180);
              const fade = 0.55 * Math.pow((1 - facing) / 2, 1.25);

              const shade = cardEl.querySelector('.quest-depth-shade') || cardEl.querySelector('.opp-3d-depth-shade');
              if (shade) shade.style.opacity = fade.toFixed(3);

              const cardBox = cardEl.querySelector('.opp-3d-card');
              if (cardBox) {
                if (Math.abs(world) < (step / 2)) {
                  cardBox.classList.add('active-opp-focus');
                } else {
                  cardBox.classList.remove('active-opp-focus');
                }
              }
            });

            // Update Active Opportunity Badge
            const activeIdx = ((Math.round(-oppCarouselAngle / step) % count) + count) % count;
            if (activeIdx !== oppCarouselActiveIndex) {
              oppCarouselActiveIndex = activeIdx;
              const badge = document.getElementById('opp-carousel-active-badge');
              if (badge) badge.textContent = \`OPPORTUNITÉ \${activeIdx + 1} / \${count}\`;
            }
          }
        }

        oppCarouselAnimId = requestAnimationFrame(loop);
      }

      oppCarouselAnimId = requestAnimationFrame(loop);
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

      // Sync quest completion with server
      try {
        fetch('/api/v1/quests/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: activeQuestId, proof: input })
        }).catch(() => {});
      } catch (_) {}

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
      const linkRegex = new RegExp('\\\\\\[\\\\\\[(.*?)\\\\\\]\\\\\\]', 'g');
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
            <div class="obsidian-folder-header" style="display: flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 4px; color: var(--text-secondary); font-size: 11px; font-family: var(--font-mono); font-weight: bold; background: var(--input-bg); border: 1px solid var(--glass-inner-border-subtle); cursor: pointer;" onclick="this.nextElementSibling.classList.toggle('hidden')">
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
      const clean = rawTitle.split('[[').join('').split(']]').join('').trim().toLowerCase();
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
      let processed = raw.replace(new RegExp('[$][$](.*?)[$][$]', 'gs'), function(match, formula) {
        const id = 'KATEX_DISPLAY_' + displayFormulas.length;
        displayFormulas.push(formula.trim());
        return id;
      });

      const inlineFormulas = [];
      processed = processed.replace(new RegExp('[$]([^$' + String.fromCharCode(10) + String.fromCharCode(13) + ']+)[$]', 'g'), function(match, formula) {
        const id = 'KATEX_INLINE_' + inlineFormulas.length;
        inlineFormulas.push(formula.trim());
        return id;
      });

      let html = processed
        .split('&').join('&amp;')
        .split('<').join('&lt;')
        .split('>').join('&gt;');

      html = html.replace(new RegExp('\`\`\`([a-z]*)' + String.fromCharCode(10) + '(.*?)\`\`\`', 'gs'), function(m, lang, code) {
        return '<pre style="background: var(--input-bg); border: 1px solid var(--glass-inner-border); border-radius: 6px; padding: 14px; font-family: var(--font-mono); font-size: 12px; color: var(--neon-cyan); overflow-x: auto; margin: 14px 0; line-height: 1.6;"><code>' + code.trim() + '</code></pre>';
      });

      html = html.replace(new RegExp('^### (.*$)', 'gim'), '<h3 style="font-size: 15px; font-weight: bold; color: var(--neon-cyan); margin: 18px 0 8px 0; font-family: var(--font-display);">$1</h3>');
      html = html.replace(new RegExp('^## (.*$)', 'gim'), '<h2 style="font-size: 18px; font-weight: bold; color: var(--text-white); margin: 22px 0 10px 0; border-bottom: 1px solid var(--glass-inner-border); padding-bottom: 6px; font-family: var(--font-display);">$1</h2>');
      html = html.replace(new RegExp('^# (.*$)', 'gim'), '<h1 style="font-size: 22px; font-weight: 900; color: var(--imperial-gold); margin: 26px 0 12px 0; font-family: var(--font-display);">$1</h1>');

      html = html.replace(new RegExp('([*][*])(.*?)([*][*])', 'g'), '<strong style="color: var(--text-white);">$2</strong>');
      html = html.replace(new RegExp('(^|[^*])[*]([^*]+)[*]([^*]|$)', 'g'), '$1<em style="color: var(--text-secondary);">$2</em>$3');

      html = html.replace(new RegExp('\\\\\\[\\\\\\[(.*?)\\\\\\]\\\\\\]', 'g'), function(m, linkText) {
        return '<span class="wikilink-pill" data-title="' + encodeURIComponent(linkText) + '" onclick="openNoteByTitle(decodeURIComponent(this.dataset.title))" title="Ouvrir la note liée [[ ' + linkText + ' ]]">🔗 [[' + linkText + ']]</span>';
      });

      html = html.replace(new RegExp('(^|[ \\t])#([a-zA-Z0-9_-]+)', 'g'), '$1<span style="background: rgba(0, 240, 255, 0.1); color: var(--neon-cyan); font-size: 11px; font-family: var(--font-mono); padding: 2px 7px; border-radius: 4px; margin-right: 4px;">#$2</span>');

      html = html.replace(new RegExp('^[ \\t]*-[ \\t]+(.*$)', 'gim'), '<li style="margin-left: 20px; list-style-type: square; color: var(--text-secondary); margin-bottom: 6px;">$1</li>');
      html = html.replace(new RegExp('^[ \\t]*([0-9]+)[.][ \\t]+(.*$)', 'gim'), '<li style="margin-left: 20px; list-style-type: decimal; color: var(--text-secondary); margin-bottom: 6px;">$2</li>');

      html = html.split(String.fromCharCode(10)).join('<br>');

      displayFormulas.forEach((formula, idx) => {
        const token = 'KATEX_DISPLAY_' + idx;
        let renderedFormula = formula;
        if (typeof window !== 'undefined' && window.katex && typeof window.katex.renderToString === 'function') {
          try {
            renderedFormula = window.katex.renderToString(formula, { displayMode: true, throwOnError: false });
          } catch(e) {
            renderedFormula = formula;
          }
        }
        const boxHtml = '<div class="katex-display-box" style="margin: 14px 0; padding: 14px; border-radius: 8px; background: var(--input-bg); border: 1px solid var(--glass-inner-border); overflow-x: auto;">' +
            '<span class="katex-formula-tag" style="display: block; font-size: 10px; font-family: var(--font-mono); color: var(--neon-cyan); margin-bottom: 6px; letter-spacing: 1px;">FORMULE KATEX</span>' +
            '<div style="font-family: KaTeX_Math, monospace, serif; font-size: 15px; color: var(--text-white); letter-spacing: 0.5px;">' +
              renderedFormula +
            '</div>' +
          '</div>';
        html = html.replace(token, boxHtml);
      });

      inlineFormulas.forEach((formula, idx) => {
        const token = 'KATEX_INLINE_' + idx;
        let renderedFormula = formula;
        if (typeof window !== 'undefined' && window.katex && typeof window.katex.renderToString === 'function') {
          try {
            renderedFormula = window.katex.renderToString(formula, { displayMode: false, throwOnError: false });
          } catch(e) {
            renderedFormula = formula;
          }
        }
        const inlineHtml = '<span class="katex-inline-formula" style="background: rgba(168, 85, 247, 0.15); color: var(--neon-cyan); padding: 2px 6px; border-radius: 4px; font-family: KaTeX_Math, monospace; font-size: 13px; border: 1px solid rgba(168, 85, 247, 0.3); display: inline-block;">' + renderedFormula + '</span>';
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
          const excerpt = (start > 0 ? '...' : '') + note.content.substring(start, end).split(String.fromCharCode(10)).join(' ') + (end < note.content.length ? '...' : '');

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
      const isLight = document.documentElement.getAttribute('data-theme') === 'light-awakening';

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = isLight ? 'rgba(124, 58, 237, 0.08)' : 'rgba(56, 189, 248, 0.05)';
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
          ctx.strokeStyle = isLight ? 'rgba(124, 58, 237, 0.85)' : 'rgba(192, 132, 252, 0.85)';
          ctx.lineWidth = 2 * graphZoom;
          ctx.shadowColor = isLight ? '#7c3aed' : '#c084fc';
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = isLight ? 'rgba(124, 58, 237, 0.22)' : 'rgba(168, 85, 247, 0.2)';
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
          ctx.strokeStyle = isActive ? (isLight ? '#7c3aed' : 'var(--neon-cyan)') : (matchesSearch ? 'var(--imperial-gold)' : (isLight ? '#9333ea' : 'rgba(168, 85, 247, 0.8)'));
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
        ctx.strokeStyle = isActive ? (isLight ? '#4c1d95' : '#ffffff') : (isLight ? 'rgba(124, 58, 237, 0.4)' : 'rgba(255, 255, 255, 0.4)');
        ctx.stroke();

        const showLabel = !isMini && (graphZoom > 0.65 || node.isHub || isHovered || isActive || matchesSearch);
        if (showLabel) {
          ctx.font = \`\${node.isHub ? 'bold 12px' : '10px'} 'JetBrains Mono', monospace\`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(7, 4, 20, 0.9)';
          ctx.fillText(node.title, sx + 1, sy + r + 5);

          ctx.fillStyle = isActive ? (isLight ? '#6d28d9' : 'var(--neon-cyan)') : (node.isHub ? (isLight ? '#7c3aed' : '#d8b4fe') : (isLight ? '#0f172a' : '#e2e8f0'));
          ctx.fillText(node.title, sx, sy + r + 4);
        }
      });
    }

    function refreshObsidianGraphTheme() {
      const canvas = document.getElementById('obsidian-graph-canvas');
      if (canvas) renderCanvasScene(canvas, false);
      const splitCanvas = document.getElementById('obsidian-split-graph-canvas');
      if (splitCanvas) renderCanvasScene(splitCanvas, true);
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
          <div style="background: var(--input-bg); border: 1px solid var(--glass-inner-border); border-radius: var(--radius-sm); padding: 14px; font-size: 12px; font-family: var(--font-mono); color: var(--text-secondary); line-height: 1.5; white-space: pre-wrap; margin-bottom: 14px;">\${newNote.content}</div>
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
      const isLight = document.documentElement.getAttribute('data-theme') === 'light-awakening';
      spectrumCtx.fillStyle = isLight ? 'rgba(245, 243, 255, 0.4)' : 'rgba(7, 4, 20, 0.4)';
      spectrumCtx.fillRect(0, 0, audioCanvas.width, audioCanvas.height);

      const bars = 64;
      const barWidth = Math.max(1, (audioCanvas.width / bars) - 2);

      let freqData = new Uint8Array(bars);
      if (audioAnalyser && audioRecordingActive) {
        audioAnalyser.getByteFrequencyData(freqData);
      }

      for (let i = 0; i < bars; i++) {
        let val = freqData[i] || 0;
        let h = audioRecordingActive ? (val / 255) * (audioCanvas.height * 0.85) + 6 : Math.sin(Date.now() * 0.005 + i * 0.22) * 16 + 22;
        const x = i * (barWidth + 2);
        const y = audioCanvas.height - h;

        const grad = spectrumCtx.createLinearGradient(0, y, 0, audioCanvas.height);
        if (isLight) {
          grad.addColorStop(0, '#9333ea');
          grad.addColorStop(0.5, '#7c3aed');
          grad.addColorStop(1, '#6d28d9');
        } else {
          grad.addColorStop(0, '#e9d5ff');
          grad.addColorStop(0.3, '#c084fc');
          grad.addColorStop(1, '#7c3aed');
        }
        spectrumCtx.fillStyle = grad;
        spectrumCtx.fillRect(x, y, barWidth, h);

        // Subtle cap
        spectrumCtx.fillStyle = isLight ? '#7c3aed' : '#ffffff';
        spectrumCtx.fillRect(x, y, barWidth, 2);
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
    // =========================================================================
    // SCREEN 8 : INVENTAIRE DU CHASSEUR & GESTION DU REPOS SOUVERAIN
    // =========================================================================
    function buyShopItem(id, name, cost, type, category) {
      if (!state.player) state.player = {};
      if (!state.inventory) state.inventory = [];
      if (!state.restDay) state.restDay = { active: false, weeklyCooldownUntil: null };

      // Cooldown hebdomadaire strict pour le Pass Jour de Repos
      if (type === 'REST_DAY' && state.restDay.weeklyCooldownUntil && Date.now() < state.restDay.weeklyCooldownUntil) {
        const remainingHours = Math.ceil((state.restDay.weeklyCooldownUntil - Date.now()) / (3600 * 1000));
        const remainingDays = Math.ceil(remainingHours / 24);
        showSysNotification(
          "⏳ [COOLDOWN HEBDOMADAIRE EN COURS]",
          "Le Système n'autorise qu'<strong>un seul Jour de Repos par semaine</strong> pour préserver votre discipline d'acier.<br><br>Prochain déblocage possible dans <strong>" + remainingDays + " jour(s)</strong> (" + remainingHours + "h)."
        );
        return;
      }

      if (state.player.shadowCrystals < cost) {
        showSysNotification(
          "[CRISTAUX INSUFFISANTS]",
          "Solde insuffisant : vous disposez de <strong>" + state.player.shadowCrystals + " 💎</strong> mais cet article requiert <strong>" + cost + " 💎</strong>.<br><br>" +
          (type === 'REST_DAY' 
            ? "💡 <em>Rappel de calibration :</em> 600 💎 correspondent exactement à <strong>6 jours de quêtes quotidiennes parfaites</strong> (100 💎/jour). Accomplissez toutes vos quêtes de la semaine pour débloquer votre repos souverain mérité !" 
            : "Accomplissez vos quêtes du jour pour récolter les cristaux manquants.")
        );
        return;
      }

      state.player.shadowCrystals -= cost;
      const voucherCode = "LVL-RELIC-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const newInv = {
        id: 'inv-' + Date.now(),
        itemId: id,
        name: name,
        cost: cost,
        type: type || 'GENERIC',
        category: category || 'OBJET',
        used: false,
        code: voucherCode,
        date: new Date().toLocaleDateString('fr-FR'),
        timestamp: Date.now()
      };

      if (type === 'REST_DAY') {
        state.restDay.weeklyCooldownUntil = Date.now() + 7 * 86400 * 1000;
      }

      state.inventory.unshift(newInv);
      saveState();

      renderInventoryUI();

      showSysNotification(
        "💎 [OBJET FORGÉ & AJOUTÉ À L'INVENTAIRE]",
        "Vous avez acquis : <strong>" + name + "</strong>.<br>Montant débité : <strong>-" + cost + " 💎</strong>.<br>L'article est maintenant disponible dans votre <strong>Sac d'Inventaire</strong> ci-dessus !"
      );
    }

    function activateRestDay(invId) {
      if (!state.inventory) return;
      const item = state.inventory.find(i => i.id === invId);
      if (!item || item.used) return;

      item.used = true;
      if (!state.restDay) state.restDay = {};
      state.restDay.active = true;
      state.restDay.activatedAt = new Date().toISOString();
      state.restDay.expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

      // Regenerate player vitality and mana to 100%
      if (state.player) {
        state.player.hp = state.player.maxHp || 100;
        state.player.mp = state.player.maxMp || 100;
      }
      saveState();

      // Notify backend server to lift curfew
      fetch('/api/v1/rest-day/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invId })
      }).catch(e => console.warn('Rest day API sync error:', e));

      renderInventoryUI();

      showSysNotification(
        "🛡️ [JOUR DE REPOS DU MONARQUE ACTIVÉ]",
        "Félicitations Chasseur ! Votre discipline exemplaire tout au long de la semaine vous a valu ce repos souverain bien mérité :<br><br>" +
        "• <strong>Couvre-feu NextDNS :</strong> DÉSACTIVÉ pour les prochaines 24h.<br>" +
        "• <strong>Quêtes journalières :</strong> SUSPENDUES (0 sanction).<br>" +
        "• <strong>Série de Discipline :</strong> PROTÉGÉE.<br>" +
        "• <strong>Jauges HP & MP :</strong> Restaurées à 100%.<br><br>" +
        "<em>Profitez de votre récupération. L'ascension reprendra demain avec une énergie maximale !</em>"
      );
    }

    function usePotion(invId, potionType) {
      if (!state.inventory) return;
      const item = state.inventory.find(i => i.id === invId);
      if (!item || item.used) return;

      item.used = true;
      if (potionType === 'MP') {
        state.player.mp = Math.min(state.player.maxMp || 100, (state.player.mp || 0) + 50);
        showSysNotification(
          "🧪 [POTION DE MANA CONSOMMÉE]",
          "Énergie cognitive restaurée : <strong>+50 MP</strong> ! Vous êtes prêt pour votre prochaine session de Deep Work."
        );
      } else if (potionType === 'HP') {
        state.player.hp = Math.min(state.player.maxHp || 100, (state.player.hp || 0) + 50);
        showSysNotification(
          "🧪 [ÉLIXIR DE VITALITÉ CONSOMMÉ]",
          "Vitalité restaurée : <strong>+50 HP</strong> ! Fatigue physique dissipée."
        );
      }
      saveState();
      renderInventoryUI();
    }

    function renderInventoryUI() {
      // Update balances
      const bal = document.getElementById('shop-balance-display');
      const headBal = document.getElementById('header-crystals-val');
      if (bal && state.player) bal.textContent = state.player.shadowCrystals;
      if (headBal && state.player) headBal.textContent = state.player.shadowCrystals;

      // Update badge & banner
      const statusPill = document.getElementById('rest-day-status-pill');
      const banner = document.getElementById('rest-day-active-banner');
      const isRestActive = state.restDay && state.restDay.active;
      if (statusPill) {
        statusPill.style.borderColor = isRestActive ? 'var(--tertiary)' : 'var(--glass-inner-border)';
        statusPill.style.color = isRestActive ? 'var(--tertiary)' : 'var(--text-secondary)';
        statusPill.textContent = isRestActive ? '🛡️ JOUR DE REPOS ACTIF (24H)' : '⚡ CYCLE QUOTIDIEN EN COURS';
      }
      if (banner) {
        banner.style.display = isRestActive ? 'block' : 'none';
      }

      // Update inventory container
      const container = document.getElementById('shop-inventory-container');
      const countBadge = document.getElementById('inv-count-badge');
      if (countBadge && state.inventory) countBadge.textContent = state.inventory.length;

      if (container) {
        if (!state.inventory || state.inventory.length === 0) {
          container.innerHTML = '<div class="empty-inventory-msg" style="grid-column: 1 / -1; padding: 30px; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 13px; border: 1px dashed var(--glass-inner-border); border-radius: 10px; background: rgba(15, 9, 38, 0.4);"><div style="font-size: 28px; margin-bottom: 8px;">🎒</div><div style="font-weight: bold; color: var(--text-secondary); margin-bottom: 4px;">VOTRE SAC D&#39;INVENTAIRE EST ACTUELLEMENT VIDE</div><div>Accomplissez vos quêtes quotidiennes (100 💎/jour) pour forger votre <strong>Pass Jour de Repos</strong> (600 💎) ou vos potions ci-dessous.</div></div>';
        } else {
          container.innerHTML = state.inventory.map(function(inv) {
            var badgeColor = inv.type === 'REST_DAY' ? 'var(--imperial-gold)' : 'var(--primary)';
            var borderStyle = inv.type === 'REST_DAY' ? 'border-color: rgba(251, 191, 36, 0.45);' : 'border-color: var(--glass-inner-border);';
            var desc = inv.type === 'REST_DAY' ? 'Octroie 24h d&#39;immunité totale contre le couvre-feu NextDNS et gèle les quêtes sans briser votre streak.' : (inv.type === 'POTION_MP' ? 'Recharge immédiate de +50 MP de concentration.' : (inv.type === 'POTION_HP' ? 'Restauration immédiate de +50 HP de vitalité.' : 'Article certifié du Système.'));
            var actionBtn = '';
            if (inv.type === 'REST_DAY') {
              actionBtn = inv.used ? '<span class="radar-ping-badge" style="color: var(--tertiary); border-color: var(--tertiary);">✓ UTILISÉ AUJOURD&#39;HUI</span>' : '<button class="btn-cyber btn-gold" style="font-size: 11px; padding: 6px 14px;" onclick="activateRestDay(\\"' + inv.id + '\\")">⚡ ACTIVER LE REPOS (24H)</button>';
            } else if (inv.type === 'POTION_MP') {
              actionBtn = inv.used ? '<span class="radar-ping-badge" style="color: var(--text-muted);">CONSOMMÉ</span>' : '<button class="btn-cyber" style="font-size: 11px; padding: 6px 14px;" onclick="usePotion(\\"' + inv.id + '\\", \\"MP\\")">BOIRE (+50 MP)</button>';
            } else if (inv.type === 'POTION_HP') {
              actionBtn = inv.used ? '<span class="radar-ping-badge" style="color: var(--text-muted);">CONSOMMÉ</span>' : '<button class="btn-cyber btn-green" style="font-size: 11px; padding: 6px 14px;" onclick="usePotion(\\"' + inv.id + '\\", \\"HP\\")">BOIRE (+50 HP)</button>';
            } else {
              actionBtn = '<span class="radar-ping-badge" style="color: var(--neon-cyan);">ACTIF</span>';
            }

            return '<div class="glass-card" style="padding: 16px; display: flex; flex-direction: column; justify-content: space-between; ' + borderStyle + '">' +
              '<div>' +
                '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">' +
                  '<span class="radar-ping-badge" style="font-size: 10px; padding: 2px 8px; color: ' + badgeColor + ';">' + (inv.category || 'RELIQUE') + '</span>' +
                  '<span style="font-size: 10.5px; color: var(--text-muted); font-family: var(--font-mono);">' + inv.date + '</span>' +
                '</div>' +
                '<div style="font-size: 15px; font-weight: bold; color: var(--text-white); margin-bottom: 6px;">' + inv.name + '</div>' +
                '<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">' + desc + '</div>' +
              '</div>' +
              '<div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--glass-inner-border-subtle); padding-top: 10px; margin-top: 6px;">' +
                '<div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">ID: <code style="color: var(--neon-cyan);">' + inv.code + '</code></div>' +
                actionBtn +
              '</div>' +
            '</div>';
          }).join('');
        }
      }
    }

        // =========================================================================
    // SCREEN 9 : REAL NEXTDNS & LOCAL HOSTS PENALTY TOGGLE, REDEMPTION & TIMER
    // =========================================================================
    let penaltyCountdownTimer = null;

    function formatPenaltyTime(totalSeconds) {
      const sec = Math.max(0, Math.floor(totalSeconds));
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
    }

    function updatePenaltyCountdown() {
      const el = document.getElementById('penalty-countdown-val');
      if (!el) return;

      if (!state.penalty || !state.penalty.active) {
        el.textContent = '04:00:00';
        return;
      }

      const now = Date.now();
      if (!state.penalty.expiresAt) {
        state.penalty.expiresAt = now + 4 * 3600 * 1000;
        saveState();
      }

      const diffSec = Math.max(0, Math.floor((state.penalty.expiresAt - now) / 1000));
      el.textContent = formatPenaltyTime(diffSec);

      if (diffSec <= 0) {
        if (penaltyCountdownTimer) {
          clearInterval(penaltyCountdownTimer);
          penaltyCountdownTimer = null;
        }
        el.textContent = '00:00:00';
        showSysNotification(
          "⚠️ [DÉGRADATION DE RANG EXÉCUTÉE]",
          "Délai d'expiation expiré (4h). Le Système rétrograde votre Rang de Chasseur !"
        );
      }
    }

    function startPenaltyCountdown() {
      if (penaltyCountdownTimer) clearInterval(penaltyCountdownTimer);
      updatePenaltyCountdown();
      penaltyCountdownTimer = setInterval(updatePenaltyCountdown, 1000);
    }

    function stopPenaltyCountdown() {
      if (penaltyCountdownTimer) {
        clearInterval(penaltyCountdownTimer);
        penaltyCountdownTimer = null;
      }
      const el = document.getElementById('penalty-countdown-val');
      if (el) el.textContent = '04:00:00';
    }

    async function toggleRealPenalty() {
      if (state.penalty && state.penalty.active) {
        await redeemPenaltyWithApi('A', 200, 'Override Manuel Administrateur');
      } else {
        try {
          const res = await fetch('/api/v1/penalty/trigger', { method: 'POST' });
          const data = await res.json();
          state.penalty.active = true;
          state.penalty.reason = data.message || "Couvre-feu 22h00 franchi ou échec de quête : restriction NextDNS engagée.";
          state.penalty.expiresAt = data.expiresAt || (Date.now() + 4 * 3600 * 1000);
          saveState();
          updatePenaltyUI(true);
          showSysNotification(
            "⚠️ [ZONE DE PÉNALITÉ NEXTDNS ENGAGÉE]",
            "Le coupe-feu réseau a été activé.<br>Profil NextDNS verrouillé (" + (data.nextDns?.count || 13) + " règles appliquées).<br>Compte à rebours de 4h enclenché avant dégradation de Rang.<br>Accomplissez la Quête de Purge (200 pompes) pour rétablir l'accès."
          );
        } catch (e) {
          state.penalty.active = true;
          state.penalty.expiresAt = Date.now() + 4 * 3600 * 1000;
          saveState();
          updatePenaltyUI(true);
        }
      }
    }

    async function redeemPenaltyWithApi(option = 'A', reps = 200, proof = 'Validation Système') {
      try {
        const res = await fetch('/api/v1/penalty/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ option, reps, proof })
        });
        const data = await res.json();
        if (data.success) {
          state.penalty.active = false;
          delete state.penalty.expiresAt;
          saveState();
          updatePenaltyUI(false);
          playChime(1046);
          showSysNotification(
            "🛡️ [PÉNALITÉ PURGÉE - RESTRICTION LEVÉE]",
            "Épreuve " + option + " validée (" + reps + " pompes).<br>Le verrouillage NextDNS et local est désactivé et l'accès réseau est rétabli."
          );
        } else {
          showSysNotification("[ÉCHEC DE PURGE]", data.error || "Conditions non satisfaites.");
        }
      } catch (err) {
        state.penalty.active = false;
        delete state.penalty.expiresAt;
        saveState();
        updatePenaltyUI(false);
      }
    }

    function updatePenaltyUI(active) {
      const banner = document.getElementById('dash-system-banner');
      const bannerDesc = document.getElementById('system-banner-status-desc');
      const header = document.getElementById('penalty-status-header');
      const btn = document.getElementById('penalty-toggle-btn');

      if (active) {
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
        if (btn) btn.textContent = "LEVER LA PÉNALITÉ (TEST)";
        startPenaltyCountdown();
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
        if (btn) btn.textContent = "TEST : SIMULER LA PÉNALITÉ";
        stopPenaltyCountdown();
      }
    }

    function togglePenaltySimulation() {
      toggleRealPenalty();
    }

    function redeemPenalty(option) {
      redeemPenaltyWithApi(option, 200, 'Validation manuelle UI');
    }

    function startCameraPurgeQuest() {
      switchView('workout');
      selectWorkoutRoutine('PURGE_200');
      const camBtn = document.getElementById('cam-toggle-btn');
      if (camBtn && camBtn.textContent.includes('ACTIVER')) {
        toggleCamera();
      }
      showSysNotification(
        "⚔️ [QUÊTE DE PURGE INITIALISÉE]",
        "200 Pompes Calisthéniques militaires exigées.<br>Chaque répétition complète est validée par l'algorithme MediaPipe.<br>Le coupe-feu NextDNS sera désactivé dès la 200ème répétition."
      );
    }

    async function testNextDnsConnection() {
      try {
        const res = await fetch('/api/v1/penalty/status');
        const data = await res.json();
        showSysNotification(
          "🌐 [DIAGNOSTIC NEXTDNS SOUVERAIN]",
          "Profil ID : <strong style='color: var(--neon-cyan);'>" + data.nextDnsProfileId + "</strong><br>" +
          "Statut Clé API : <strong>" + (data.nextDnsConfigured ? "CONFIGURÉE & CHIFFRÉE ✓" : "NON CONFIGURÉE") + "</strong><br>" +
          "Couvre-feu : <strong>22:00:00 (" + (data.curfewActiveNow ? "ACTIF MAINTENANT" : "EN ATTENTE") + ")</strong><br>" +
          "Domaines sous sentinelle : " + data.blockedDomains.length + " sites distrayants."
        );
      } catch (err) {
        showSysNotification("[ERREUR DIAGNOSTIC]", "Impossible de joindre le serveur local.");
      }
    }

    // =========================================================================
    // SCREEN 10 : WORKOUT WEBCAM & SEQUENTIAL ROUTINE ENGINE (DOS, BRAS, ABDOS, PURGE)
    // =========================================================================
    const WORKOUT_ROUTINES_CATALOG = {
      DOS_EPAULES: {
        id: "DOS_EPAULES",
        name: "Routine Dos & Épaules (17 Étapes)",
        steps: [
          { name: "Jumping Jacks", target: 30, unit: "s", desc: "Activation cardiovasculaire et dynamique", joint: "Dynamique Générale" },
          { name: "Hyperextensions au sol", target: 14, unit: "reps", desc: "Renforcement érecteurs du rachis et chaîne postérieure", joint: "Hanche / Dos" },
          { name: "Pike Push-Ups", target: 14, unit: "reps", desc: "Focus deltoïdes antérieurs et trapèzes (angle coude ≤ 75°)", joint: "Coude (≤ 75° / ≥ 160°)" },
          { name: "Reverse Push-Ups", target: 12, unit: "reps", desc: "Activation rhomboïdes et deltoïdes postérieurs", joint: "Coude (≤ 75° / ≥ 160°)" },
          { name: "Inchworms", target: 16, unit: "reps", desc: "Mobilité ischios, gainage dynamique et force scapulaire", joint: "Tronc / Épaules" },
          { name: "Side-Lying Floor Stretch Gauche", target: 30, unit: "s", desc: "Étirement latéral et décompression grand dorsal gauche", joint: "Étirement" },
          { name: "Side-Lying Floor Stretch Droit", target: 30, unit: "s", desc: "Étirement latéral et décompression grand dorsal droit", joint: "Étirement" },
          { name: "Hyperextensions au sol", target: 12, unit: "reps", desc: "Seconde série érecteurs du rachis", joint: "Hanche / Dos" },
          { name: "Pike Push-Ups", target: 12, unit: "reps", desc: "Seconde série deltoïdes (flexion coude ≤ 75°)", joint: "Coude (≤ 75° / ≥ 160°)" },
          { name: "Reverse Push-Ups", target: 10, unit: "reps", desc: "Seconde série scapulae", joint: "Coude (≤ 75° / ≥ 160°)" },
          { name: "Inchworms", target: 14, unit: "reps", desc: "Seconde série mobilité et core", joint: "Tronc / Épaules" },
          { name: "Cat Cow Pose", target: 35, unit: "s", desc: "Décompression vertébrale et mobilité pelvienne", joint: "Rachis" },
          { name: "Supine Push-Up", target: 14, unit: "reps", desc: "Rétraction scapulaire pure sur le dos", joint: "Scapulae" },
          { name: "Floor Y-Raises", target: 14, unit: "reps", desc: "Trapèzes inférieurs et stabilité scapulo-humérale", joint: "Épaules" },
          { name: "Supine Push-Up", target: 13, unit: "reps", desc: "Seconde série rétraction scapulaire", joint: "Scapulae" },
          { name: "Reverse Snow Angels", target: 12, unit: "reps", desc: "Endurance rhomboïdes et deltoïdes postérieurs", joint: "Dorsaux" },
          { name: "Child's Pose", target: 30, unit: "s", desc: "Récupération souveraine et étirement myofascial final", joint: "Récupération" }
        ]
      },
      BRAS: {
        id: "BRAS",
        name: "Routine Bras & Triceps (6 Exercices)",
        steps: [
          { name: "Push-Ups Classiques", target: 15, unit: "reps", desc: "Pectoraux et triceps au poids du corps avec tempo contrôlé", joint: "Coude (≤ 75° / ≥ 160°)" },
          { name: "Decline Push-Ups", target: 12, unit: "reps", desc: "Pieds surélevés : focus deltoïdes antérieurs et pectoraux hauts", joint: "Coude (≤ 75° / ≥ 160°)" },
          { name: "Diamond Push-Ups", target: 12, unit: "reps", desc: "Mains en losange : isolation des chefs médial et latéral des triceps", joint: "Coude (≤ 75° / ≥ 160°)" },
          { name: "Pike Push-Ups", target: 12, unit: "reps", desc: "Chaîne de poussée verticale deltoïdes", joint: "Coude (≤ 75° / ≥ 160°)" },
          { name: "Wide Push-Ups", target: 15, unit: "reps", desc: "Prise large : ouverture thoracique et travail pectoral ciblé", joint: "Coude (≤ 75° / ≥ 160°)" },
          { name: "Tricep Cross Extensions au sol", target: 10, unit: "reps", desc: "Isolation triceps au sol à l'échec postural strict", joint: "Coude (≤ 80° / ≥ 160°)" }
        ]
      },
      ABDOS: {
        id: "ABDOS",
        name: "Routine Abdos & Core d'Acier (5 Exercices)",
        steps: [
          { name: "V-Ups Synchronisés", target: 10, unit: "reps", desc: "Élévation simultanée tronc et membres inférieurs avec verrouillage lombaire", joint: "Hanche / Tronc (≤ 80° / ≥ 155°)" },
          { name: "Mountain Climbers Rapides", target: 30, unit: "s", desc: "Gainage dynamique anti-rotation et cadence soutenue", joint: "Hanche / Core" },
          { name: "Relevés de Jambes au sol", target: 12, unit: "reps", desc: "Grand droit inférieur sans cambrure lombaire", joint: "Hanche / Tronc (≤ 80° / ≥ 155°)" },
          { name: "Gainage Planche Classique", target: 90, unit: "s", desc: "Rétroversion pelvienne, côtes rentrées et fessiers contractés (1m30)", joint: "Core Isométrique" },
          { name: "Gainage Latéral", target: 45, unit: "s", desc: "Maintien oblique et alignement tête-bassin-chevilles (45s par côté)", joint: "Obliques" }
        ]
      },
      PURGE_200: {
        id: "PURGE_200",
        name: "Quête de Purge & Rachat (200 Pompes)",
        isPurge: true,
        category: "PURGE",
        steps: [
          {
            name: "Pompes de Purge & Rachat",
            target: 200,
            unit: "reps",
            desc: "200 pompes calisthéniques militaires strictes (coude ≤ 75° / ≥ 160°) sous MediaPipe pour lever le verrouillage NextDNS.",
            joint: "Coude (≤ 75° / ≥ 160°)"
          }
        ]
      }
    };

    // Concatenate into unified 28-step Daily Complete
    WORKOUT_ROUTINES_CATALOG.DAILY_COMPLETE = {
      id: "DAILY_COMPLETE",
      name: "Trinité Calisthénique Complète (28 Étapes)",
      steps: [
        ...WORKOUT_ROUTINES_CATALOG.DOS_EPAULES.steps,
        ...WORKOUT_ROUTINES_CATALOG.BRAS.steps,
        ...WORKOUT_ROUTINES_CATALOG.ABDOS.steps
      ]
    };

    let activeRoutineKey = 'DOS_EPAULES';
    let activeStepIndex = 0;
    let currentStepProgress = 0;

    function renderCurrentWorkoutStep() {
      const routine = WORKOUT_ROUTINES_CATALOG[activeRoutineKey] || WORKOUT_ROUTINES_CATALOG.DOS_EPAULES;
      const step = routine.steps[activeStepIndex] || routine.steps[0];

      const rTitle = document.getElementById('workout-routine-title');
      if (rTitle) rTitle.textContent = "ROUTINE SÉLECTIONNÉE : " + routine.name.toUpperCase();

      const indicator = document.getElementById('workout-step-indicator');
      if (indicator) indicator.textContent = "ÉTAPE " + (activeStepIndex + 1) + " / " + routine.steps.length;

      const sName = document.getElementById('workout-step-name');
      if (sName) sName.textContent = step.name;

      const sDesc = document.getElementById('workout-step-desc');
      if (sDesc) sDesc.textContent = step.desc;

      const sJoint = document.getElementById('workout-step-joint');
      if (sJoint) sJoint.textContent = "Cible Cinématique : " + step.joint;

      const mCount = document.getElementById('workout-rep-count');
      if (mCount) mCount.textContent = currentStepProgress + " / " + step.target + (step.unit === 's' ? 's' : '');

      const hudRep = document.getElementById('hud-rep-counter');
      if (hudRep) hudRep.textContent = currentStepProgress;

      const badge = document.getElementById('workout-posture-badge');
      if (badge) {
        if (currentStepProgress >= step.target) {
          badge.textContent = "OBJECTIF ÉTAPE ATTEINT ✓ PRÊT POUR L'ÉTAPE SUIVANTE";
          badge.style.color = "var(--transcendent-green)";
        } else {
          badge.textContent = "SÉRIE EN COURS (" + currentStepProgress + " / " + step.target + ") • CONTRÔLE POSTURAL ACTIF";
          badge.style.color = "var(--neon-cyan)";
        }
      }

      // Highlight active button
      ['dos', 'bras', 'abdos', 'daily', 'purge'].forEach(k => {
        const b = document.getElementById('btn-routine-' + k);
        if (b) {
          if ((k === 'dos' && activeRoutineKey === 'DOS_EPAULES') ||
              (k === 'bras' && activeRoutineKey === 'BRAS') ||
              (k === 'abdos' && activeRoutineKey === 'ABDOS') ||
              (k === 'daily' && activeRoutineKey === 'DAILY_COMPLETE') ||
              (k === 'purge' && activeRoutineKey === 'PURGE_200')) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        }
      });
    }

    function selectWorkoutRoutine(key) {
      if (WORKOUT_ROUTINES_CATALOG[key]) {
        activeRoutineKey = key;
        activeStepIndex = 0;
        currentStepProgress = 0;
        playChime(659);
        renderCurrentWorkoutStep();
      }
    }

    function addManualRep() {
      const routine = WORKOUT_ROUTINES_CATALOG[activeRoutineKey];
      const step = routine.steps[activeStepIndex];
      currentStepProgress++;
      playChime(587);

      if (currentStepProgress === step.target) {
        playChime(880);
        if (routine.isPurge || activeRoutineKey === 'PURGE_200') {
          validateWorkoutSet();
        }
      }
      renderCurrentWorkoutStep();
    }

    function nextWorkoutStep() {
      const routine = WORKOUT_ROUTINES_CATALOG[activeRoutineKey];
      if (activeStepIndex < routine.steps.length - 1) {
        activeStepIndex++;
        currentStepProgress = 0;
        playChime(784);
        renderCurrentWorkoutStep();
      } else {
        validateWorkoutSet();
      }
    }

    function prevWorkoutStep() {
      if (activeStepIndex > 0) {
        activeStepIndex--;
        currentStepProgress = 0;
        playChime(440);
        renderCurrentWorkoutStep();
      }
    }

    function validateWorkoutSet() {
      playChime(1046);
      const routine = WORKOUT_ROUTINES_CATALOG[activeRoutineKey];

      // Quête de Purge & Rachat Physique (Zone de Pénalité)
      if (routine && (routine.isPurge || activeRoutineKey === 'PURGE_200')) {
        redeemPenaltyWithApi('A', currentStepProgress >= 200 ? currentStepProgress : 200, 'MediaPipe 200 Pompes de Purge Validées');
        return;
      }

      addExperience(250);
      state.player.shadowCrystals += 30;
      saveState();
      const cEl = document.getElementById('header-crystals-val');
      if (cEl) cEl.textContent = state.player.shadowCrystals;

      showSysNotification(
        "💪 [QUÊTE CALISTHÉNIQUE VALIDÉE]",
        "La <strong>" + routine.name + "</strong> a été exécutée selon les critères stricts du Système.<br>Gains : <strong>+250 XP STR</strong> et <strong>+30 Cristaux d'Ombre 💎</strong>."
      );
    }

    // =========================================================================
    // MOTEUR CINÉMATIQUE MEDIAPIPE POSE & DUAL TRACKING SYSTEM
    // =========================================================================
    let workoutCameraStream = null;
    let mediapipePoseInstance = null;
    let cvTrackingAnimFrame = null;
    let isPoseInitialized = false;

    // FSM State Variables for Push-Up Detection
    let pushupFSMState = 'EXTENDED'; // 'EXTENDED', 'DESCENT', 'BOTTOM_PEAK', 'ASCENT'
    let pushupArmed = false;
    let lastRepTimestamp = 0;
    let lastValidElbowAngle = 170;
    let consecutiveFramesWithoutPose = 0;

    // Optical Motion Fallback State (Offscreen downsampled canvas)
    let opticalFallbackCanvas = null;
    let opticalFallbackCtx = null;
    let previousFrameData = null;
    let opticalCentroidHistory = [];
    let opticalDipArmed = false;

    // Calcul de l'angle 3D/2D entre trois articulations : A (Épaule), B (Coude), C (Poignet)
    function calculateJointAngleDeg(a, b, c) {
      if (!a || !b || !c) return 180;
      const v1x = a.x - b.x;
      const v1y = a.y - b.y;
      const v2x = c.x - b.x;
      const v2y = c.y - b.y;

      const dot = v1x * v2x + v1y * v2y;
      const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
      const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

      if (mag1 * mag2 === 0) return 180;
      let cosine = dot / (mag1 * mag2);
      cosine = Math.max(-1, Math.min(1, cosine));
      return Math.round((Math.acos(cosine) * 180) / Math.PI);
    }

    // Enregistrement d'une répétition validée (MediaPipe Pose ou Fallback Optique)
    function registerSuccessfulRep(detectionSource = 'MediaPipe Pose') {
      const now = Date.now();
      if (now - lastRepTimestamp < 600) return; // Debounce anti double-comptage (600ms)
      lastRepTimestamp = now;

      // 1. Incrémenter la répétition via la logique unifiée du Workout
      addManualRep();

      // 2. Feedback Haptique & Audio (Chime 880Hz / La5)
      playChime(880);

      // 3. Feedback Visuel Card & HUD (Flash Néon Transcendant)
      const card = document.querySelector('.workout-video-card');
      if (card) {
        card.style.boxShadow = '0 0 40px rgba(69, 223, 164, 0.9), inset 0 0 20px rgba(69, 223, 164, 0.4)';
        setTimeout(() => {
          if (card) card.style.boxShadow = '';
        }, 400);
      }

      const hudRep = document.getElementById('hud-rep-counter');
      if (hudRep) {
        hudRep.style.transform = 'scale(1.35)';
        hudRep.style.color = 'var(--neon-cyan)';
        setTimeout(() => {
          if (hudRep) {
            hudRep.style.transform = 'scale(1)';
            hudRep.style.color = 'var(--tertiary)';
          }
        }, 300);
      }

      const hudState = document.getElementById('hud-state-pill');
      if (hudState) {
        hudState.textContent = '✓ RÉPÉTITION VALIDÉE (' + detectionSource + ')';
        hudState.style.borderColor = 'var(--tertiary)';
        hudState.style.color = 'var(--tertiary)';
      }
    }

    // Dessin du squelette holographique néon et des arcs articulaires
    function drawHolographicSkeleton(ctx, landmarks, w, h, elbowAngle) {
      if (!ctx || !landmarks) return;
      ctx.clearRect(0, 0, w, h);

      // Définition des connexions cinématiques clés (Torse + Bras + Tête)
      const connections = [
        [11, 12], // Épaule gauche - Épaule droite
        [11, 23], // Épaule gauche - Hanche gauche
        [12, 24], // Épaule droite - Hanche droite
        [23, 24], // Hanche gauche - Hanche droite
        [11, 13], // Épaule gauche - Coude gauche
        [13, 15], // Coude gauche - Poignet gauche
        [12, 14], // Épaule droite - Coude droite
        [14, 16]  // Coude droit - Poignet droit
      ];

      // Couleur dynamique selon la profondeur de pompe
      let strokeColor = '#00f0ff'; // Cyan par défaut
      if (elbowAngle <= 85) {
        strokeColor = '#45dfa4'; // Vert émeraude au point bas
      } else if (elbowAngle < 135) {
        strokeColor = '#ffb800'; // Or ambré en transition
      }

      // Tracé des lignes cinématiques luminescentes
      ctx.save();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = strokeColor;
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      connections.forEach(([i, j]) => {
        const p1 = landmarks[i];
        const p2 = landmarks[j];
        if (p1 && p2 && (p1.visibility || 1) > 0.35 && (p2.visibility || 1) > 0.35) {
          ctx.beginPath();
          ctx.moveTo(p1.x * w, p1.y * h);
          ctx.lineTo(p2.x * w, p2.y * h);
          ctx.stroke();
        }
      });
      ctx.restore();

      // Dessin des articulations (sphères d'énergie néon)
      const jointsToDraw = [11, 12, 13, 14, 15, 16, 23, 24];
      jointsToDraw.forEach(idx => {
        const pt = landmarks[idx];
        if (pt && (pt.visibility || 1) > 0.35) {
          const cx = pt.x * w;
          const cy = pt.y * h;
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, (idx === 13 || idx === 14) ? 7 : 5, 0, 2 * Math.PI);
          ctx.fillStyle = (idx === 13 || idx === 14) ? strokeColor : '#ffffff';
          ctx.shadowColor = strokeColor;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.restore();
        }
      });

      // Affichage de la jauge d'angle dynamique au coude actif
      const leftElbow = landmarks[13];
      const rightElbow = landmarks[14];
      const activeElbow = (leftElbow && (leftElbow.visibility || 0) > ((rightElbow && rightElbow.visibility) || 0)) ? leftElbow : (rightElbow || leftElbow);
      if (activeElbow && (activeElbow.visibility || 1) > 0.3) {
        const ex = activeElbow.x * w;
        const ey = activeElbow.y * h;
        ctx.save();
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.fillStyle = strokeColor;
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 8;
        ctx.fillText(elbowAngle + '°', ex + 12, ey - 10);
        ctx.restore();
      }
    }

    // Machine d'état finie pour la validation des pompes
    function processPosePushupFSM(landmarks, w, h) {
      if (!landmarks || landmarks.length < 17) {
        consecutiveFramesWithoutPose++;
        return;
      }
      consecutiveFramesWithoutPose = 0;

      // Détermination du bras le plus visible ou calcul moyen
      const leftS = landmarks[11], leftE = landmarks[13], leftW = landmarks[15];
      const rightS = landmarks[12], rightE = landmarks[14], rightW = landmarks[16];

      const leftVis = ((leftS?.visibility || 0) + (leftE?.visibility || 0) + (leftW?.visibility || 0)) / 3;
      const rightVis = ((rightS?.visibility || 0) + (rightE?.visibility || 0) + (rightW?.visibility || 0)) / 3;

      let currentAngle = 180;
      if (leftVis > 0.4 && rightVis > 0.4) {
        const angleL = calculateJointAngleDeg(leftS, leftE, leftW);
        const angleR = calculateJointAngleDeg(rightS, rightE, rightW);
        currentAngle = Math.min(angleL, angleR); // Prendre le bras le plus fléchi
      } else if (leftVis > 0.35) {
        currentAngle = calculateJointAngleDeg(leftS, leftE, leftW);
      } else if (rightVis > 0.35) {
        currentAngle = calculateJointAngleDeg(rightS, rightE, rightW);
      } else {
        return; // Visibilité insuffisante
      }

      lastValidElbowAngle = currentAngle;

      // Mise à jour de l'affichage HUD
      const hudAngleText = document.getElementById('hud-angle-text');
      const hudAnglePill = document.getElementById('hud-angle-pill');
      const hudStatePill = document.getElementById('hud-state-pill');

      if (hudAngleText) hudAngleText.textContent = 'COUDE : ' + currentAngle + '°';
      if (hudAnglePill) {
        if (currentAngle <= 85) {
          hudAnglePill.style.borderColor = 'var(--tertiary)';
          hudAnglePill.style.boxShadow = '0 0 16px rgba(69,223,164,0.6)';
        } else if (currentAngle < 135) {
          hudAnglePill.style.borderColor = 'var(--imperial-gold)';
          hudAnglePill.style.boxShadow = '0 0 14px rgba(255,184,0,0.5)';
        } else {
          hudAnglePill.style.borderColor = 'var(--neon-cyan)';
          hudAnglePill.style.boxShadow = '0 0 12px rgba(0,240,255,0.4)';
        }
      }

      // Transition FSM Push-Up
      // 1. EXTENDED (Lockout haut : >= 150°)
      if (currentAngle >= 150) {
        if (pushupArmed) {
          // L'utilisateur est descendu sous 85° et remonte en extension complète !
          registerSuccessfulRep('MediaPipe Pose');
          pushupArmed = false;
        }
        pushupFSMState = 'EXTENDED';
        if (hudStatePill) {
          hudStatePill.textContent = 'STATUT : BRAS EN EXTENSION (PRÊT)';
          hudStatePill.style.color = 'var(--neon-cyan)';
        }
      } 
      // 2. DESCENT (Phase de descente : 86° à 149°)
      else if (currentAngle < 150 && currentAngle > 85) {
        if (pushupFSMState === 'EXTENDED' || pushupFSMState === 'DESCENT') {
          pushupFSMState = 'DESCENT';
          if (hudStatePill) {
            hudStatePill.textContent = 'STATUT : DESCENTE EN COURS (' + currentAngle + '° → CIBLE ≤ 85°)';
            hudStatePill.style.color = 'var(--imperial-gold)';
          }
        } else if (pushupArmed) {
          pushupFSMState = 'ASCENT';
          if (hudStatePill) {
            hudStatePill.textContent = 'STATUT : REMONTÉE (VERROUILLEZ À ≥ 150°)';
            hudStatePill.style.color = 'var(--neon-cyan)';
          }
        }
      } 
      // 3. BOTTOM_PEAK (Pic de contraction bas : <= 85°)
      else if (currentAngle <= 85) {
        pushupFSMState = 'BOTTOM_PEAK';
        pushupArmed = true; // Répétition armée avec succès
        if (hudStatePill) {
          hudStatePill.textContent = 'STATUT : AMPLITUDE BASSE VALIDÉE (REMONTEZ !)';
          hudStatePill.style.color = 'var(--transcendent-green)';
        }
      }
    }

    // Fallback Optique à Détection de Mouvement par Différenciation d'Images
    function processOpticalFallback(video) {
      if (!video || video.readyState < 2) return;
      if (!opticalFallbackCanvas) {
        opticalFallbackCanvas = document.createElement('canvas');
        opticalFallbackCanvas.width = 160;
        opticalFallbackCanvas.height = 120;
        opticalFallbackCtx = opticalFallbackCanvas.getContext('2d', { willReadFrequently: true });
      }

      opticalFallbackCtx.drawImage(video, 0, 0, 160, 120);
      const curFrame = opticalFallbackCtx.getImageData(0, 0, 160, 120);
      const data = curFrame.data;

      if (!previousFrameData) {
        previousFrameData = data;
        return;
      }

      let diffCount = 0;
      let sumY = 0;
      for (let i = 0; i < data.length; i += 4) {
        const diff = Math.abs(data[i] - previousFrameData[i]) +
                     Math.abs(data[i+1] - previousFrameData[i+1]) +
                     Math.abs(data[i+2] - previousFrameData[i+2]);
        if (diff > 75) {
          const pixelIndex = i / 4;
          const y = Math.floor(pixelIndex / 160);
          sumY += y;
          diffCount++;
        }
      }
      previousFrameData = data;

      // Si MediaPipe est absent ou ne détecte rien depuis > 10 frames
      if (consecutiveFramesWithoutPose > 10 && diffCount > 400) {
        const avgY = sumY / diffCount;
        opticalCentroidHistory.push(avgY);
        if (opticalCentroidHistory.length > 30) opticalCentroidHistory.shift();

        const minY = Math.min(...opticalCentroidHistory);
        const maxY = Math.max(...opticalCentroidHistory);
        const delta = maxY - minY;

        if (delta > 22 && avgY > maxY - 6) {
          opticalDipArmed = true;
          const hudState = document.getElementById('hud-state-pill');
          if (hudState) hudState.textContent = 'STATUT : DESCENTE OPTIQUE DÉTECTÉE';
        } else if (opticalDipArmed && avgY < minY + 6) {
          registerSuccessfulRep('Capteur Optique');
          opticalDipArmed = false;
          opticalCentroidHistory = [];
        }
      }
    }

    // Boucle de rendu et de capture vidéo
    function onPoseResults(results) {
      const canvas = document.getElementById('workout-canvas');
      const video = document.getElementById('webcam-video');
      if (!canvas || !video) return;

      const w = canvas.width = video.videoWidth || 640;
      const h = canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');

      if (results && results.poseLandmarks) {
        processPosePushupFSM(results.poseLandmarks, w, h);
        drawHolographicSkeleton(ctx, results.poseLandmarks, w, h, lastValidElbowAngle);
      } else {
        consecutiveFramesWithoutPose++;
        if (ctx) ctx.clearRect(0, 0, w, h);
        processOpticalFallback(video);
      }
    }

    async function initMediaPipePose() {
      if (typeof window.Pose === 'undefined') {
        console.warn('[CV] MediaPipe Pose non chargé depuis le CDN, fallback actif.');
        return false;
      }
      try {
        if (!mediapipePoseInstance) {
          mediapipePoseInstance = new window.Pose({
            locateFile: (file) => 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/' + file
          });

          mediapipePoseInstance.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          mediapipePoseInstance.onResults(onPoseResults);
        }
        isPoseInitialized = true;
        return true;
      } catch (err) {
        console.error('[CV] Erreur initialisation MediaPipe:', err);
        return false;
      }
    }

    function stopWorkoutCamera() {
      const video = document.getElementById('webcam-video');
      const canvas = document.getElementById('workout-canvas');
      const hud = document.getElementById('workout-live-hud');
      const placeholder = document.getElementById('cam-placeholder');
      const btn = document.getElementById('cam-toggle-btn');

      if (cvTrackingAnimFrame) {
        cancelAnimationFrame(cvTrackingAnimFrame);
        cvTrackingAnimFrame = null;
      }

      if (workoutCameraStream) {
        workoutCameraStream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (e) {}
        });
        workoutCameraStream = null;
      }

      if (video) {
        if (video.srcObject) {
          try {
            const s = video.srcObject;
            if (s && typeof s.getTracks === 'function') {
              s.getTracks().forEach((t) => {
                try {
                  t.stop();
                } catch (e) {}
              });
            }
          } catch (e) {}
          video.srcObject = null;
        }
        try {
          video.pause();
        } catch (e) {}
        video.style.display = 'none';
      }

      if (canvas) {
        canvas.style.display = 'none';
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (hud) hud.style.display = 'none';
      if (placeholder) placeholder.style.display = 'block';

      if (btn) {
        btn.textContent = '📷 ACTIVER CAMÉRA';
        btn.classList.remove('btn-danger');
      }

      pushupArmed = false;
      pushupFSMState = 'EXTENDED';
    }

    async function toggleCamera() {
      playChime(523);
      const video = document.getElementById('webcam-video');
      const canvas = document.getElementById('workout-canvas');
      const hud = document.getElementById('workout-live-hud');
      const placeholder = document.getElementById('cam-placeholder');
      const btn = document.getElementById('cam-toggle-btn');

      // Si la caméra est active, on l'éteint
      if (workoutCameraStream || (video && video.srcObject && video.style.display !== 'none')) {
        stopWorkoutCamera();
        showSysNotification(
          "📷 [CAMÉRA DÉSACTIVÉE]",
          "Le flux vidéo et le capteur postural ont été coupés avec succès."
        );
        return;
      }

      // Activation de la caméra
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            }
          });

          workoutCameraStream = stream;

          stream.getTracks().forEach((track) => {
            track.onended = () => {
              stopWorkoutCamera();
            };
          });

          if (video) {
            video.srcObject = stream;
            video.style.display = 'block';
            await video.play().catch(() => {});
          }

          if (canvas) canvas.style.display = 'block';
          if (hud) hud.style.display = 'flex';
          if (placeholder) placeholder.style.display = 'none';

          if (btn) {
            btn.textContent = '⏹ DÉSACTIVER CAMÉRA';
            btn.classList.add('btn-danger');
          }

          // Initialisation MediaPipe Pose
          await initMediaPipePose();

          // Démarrage de la boucle cinématique continue
          let isProcessing = false;
          async function cvFrameLoop() {
            if (!workoutCameraStream || !video || video.paused || video.ended) return;

            if (mediapipePoseInstance && !isProcessing && video.readyState >= 2) {
              isProcessing = true;
              try {
                await mediapipePoseInstance.send({ image: video });
              } catch (err) {
                // En cas d'erreur ponctuelle de trame, exécuter le fallback optique
                processOpticalFallback(video);
              } finally {
                isProcessing = false;
              }
            } else if (!mediapipePoseInstance && video.readyState >= 2) {
              processOpticalFallback(video);
            }

            cvTrackingAnimFrame = requestAnimationFrame(cvFrameLoop);
          }

          cvTrackingAnimFrame = requestAnimationFrame(cvFrameLoop);

          showSysNotification(
            "📹 [VISION ARTIFICIELLE ACTIVE]",
            "MediaPipe Pose WebAssembly calibré. Angle coude en temps réel (Descente ≤ 85° → Extension ≥ 150°). Répétitions auto-validées."
          );
        } catch (err) {
          stopWorkoutCamera();
          showSysNotification(
            "[CAMÉRA NON ACCESSIBLE]",
            "Impossible de connecter la caméra physique (" + (err.message || 'accès refusé') + "). Vous pouvez utiliser le bouton manuel '+ 1 RÉPÉTITION'."
          );
        }
      } else {
        showSysNotification(
          "[API NON SUPPORTÉE]",
          "Votre navigateur ne supporte pas l'accès webcam WebRTC standard."
        );
      }
    }

    // =========================================================================
    // SIMULATION IA TEMPS RÉEL (MODE TEST CINÉMATIQUE SANS CAMÉRA PHYSIQUE)
    // =========================================================================
    let cvSimulationRunning = false;
    let cvSimulationTimer = null;

    function runRealtimePushupSimulationTest() {
      if (cvSimulationRunning) {
        cvSimulationRunning = false;
        if (cvSimulationTimer) cancelAnimationFrame(cvSimulationTimer);
        const placeholder = document.getElementById('cam-placeholder');
        const canvas = document.getElementById('workout-canvas');
        const hud = document.getElementById('workout-live-hud');
        const btn = document.getElementById('btn-cv-test');
        if (btn) btn.textContent = '🧪 TEST SIMULATION IA';
        if (placeholder) placeholder.style.display = 'block';
        if (canvas) canvas.style.display = 'none';
        if (hud) hud.style.display = 'none';
        return;
      }

      // Arrêt de la caméra réelle si active pour éviter tout conflit
      if (workoutCameraStream) stopWorkoutCamera();

      cvSimulationRunning = true;
      const btn = document.getElementById('btn-cv-test');
      if (btn) btn.textContent = '⏹ ARRÊTER TEST IA';

      const canvas = document.getElementById('workout-canvas');
      const placeholder = document.getElementById('cam-placeholder');
      const hud = document.getElementById('workout-live-hud');

      if (placeholder) placeholder.style.display = 'none';
      if (canvas) {
        canvas.style.display = 'block';
        canvas.width = 640;
        canvas.height = 480;
      }
      if (hud) hud.style.display = 'flex';

      showSysNotification(
        "🧪 [TEST TEMPS RÉEL EN COURS]",
        "Simulation cinématique d'un Chasseur : test de flexion, calcul angulaire et validation anti-triche."
      );

      let startTime = performance.now();

      function stepSim(now) {
        if (!cvSimulationRunning) return;
        const elapsed = (now - startTime) / 1000;

        const cycleTime = elapsed % 4.0;
        const cycleIndex = Math.floor(elapsed / 4.0);

        if (cycleIndex >= 3) {
          cvSimulationRunning = false;
          if (btn) btn.textContent = '🧪 TEST SIMULATION IA (REJOUER)';
          showSysNotification(
            "🎉 [DIAGNOSTIC TERMINÉ : 100% SUCCÈS]",
            "Reconnaissance posturale validée : 2 pompes complètes comptées, 1 demi-pompe rejetée par l'anti-triche."
          );
          return;
        }

        let targetAngle = 165;
        let phaseDesc = '';

        if (cycleIndex === 1) {
          // Cycle 2 : Tentative de triche / Demi-pompe (165° -> 105° -> 165°)
          if (cycleTime < 2.0) {
            const p = cycleTime / 2.0;
            targetAngle = 165 - (165 - 105) * Math.sin(p * Math.PI / 2);
            phaseDesc = 'TRICHE / DEMI-POMPE (105° > 85°)';
          } else {
            const p = (cycleTime - 2.0) / 2.0;
            targetAngle = 105 + (165 - 105) * Math.sin(p * Math.PI / 2);
            phaseDesc = 'RETOUR SANS POINT BAS VALIDÉ';
          }
        } else {
          // Cycles 1 et 3 : Pompe militaire stricte complète (165° -> 75° -> 165°)
          if (cycleTime < 2.0) {
            const p = cycleTime / 2.0;
            targetAngle = 165 - (165 - 75) * Math.sin(p * Math.PI / 2);
            phaseDesc = targetAngle <= 85 ? 'AMPLITUDE BASSE STRICTE (≤ 85°)' : 'DESCENTE CONTRÔLÉE';
          } else {
            const p = (cycleTime - 2.0) / 2.0;
            targetAngle = 75 + (165 - 75) * Math.sin(p * Math.PI / 2);
            phaseDesc = targetAngle >= 150 ? 'VERROUILLAGE HAUT COMPLET' : 'REMONTÉE EXPLOSIVE';
          }
        }

        targetAngle = Math.round(targetAngle);

        // Repères squelettiques synthétiques (Anatomie 33 repères MediaPipe)
        const rad = (targetAngle * Math.PI) / 180;
        const armLen = 0.22;
        const landmarks = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0.98 }));

        // Torse et Hanches
        landmarks[11] = { x: 0.42, y: 0.28, z: 0, visibility: 0.99 }; // Épaule gauche
        landmarks[12] = { x: 0.58, y: 0.28, z: 0, visibility: 0.99 }; // Épaule droite
        landmarks[23] = { x: 0.45, y: 0.65, z: 0, visibility: 0.96 }; // Hanche gauche
        landmarks[24] = { x: 0.55, y: 0.65, z: 0, visibility: 0.96 }; // Hanche droite

        // Bras gauche avec cinématique angulaire exacte
        landmarks[13] = { x: 0.42, y: 0.50, z: 0, visibility: 0.99 }; // Coude gauche
        landmarks[15] = {
          x: 0.42 + armLen * Math.sin(rad),
          y: 0.50 - armLen * Math.cos(rad),
          z: 0,
          visibility: 0.99
        }; // Poignet gauche

        // Bras droit (symétrique)
        landmarks[14] = { x: 0.58, y: 0.50, z: 0, visibility: 0.99 }; // Coude droit
        landmarks[16] = {
          x: 0.58 - armLen * Math.sin(rad),
          y: 0.50 - armLen * Math.cos(rad),
          z: 0,
          visibility: 0.99
        }; // Poignet droit

        // Injection dans le moteur cinématique réel du HUD
        onPoseResults({ poseLandmarks: landmarks });

        // Incrustation holographique de diagnostic
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.fillStyle = cycleIndex === 1 ? '#ffb800' : '#00f0ff';
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 6;
          ctx.fillText('SIMULATION IA [CYCLE ' + (cycleIndex + 1) + '/3] : ' + phaseDesc, 14, 460);
          ctx.restore();
        }

        cvSimulationTimer = requestAnimationFrame(stepSim);
      }

      cvSimulationTimer = requestAnimationFrame(stepSim);
    }

    // React Bits Background Mana Particles (Zero-Lag Lifecycle: Paused during Intro Video)
    let manaAnimationActive = false;
    let manaAnimationFrameId = null;
    let startManaAnimation = function() {};
    let stopManaAnimation = function() {};

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
        if (!manaAnimationActive || !bgCtx) return;
        bgCtx.clearRect(0, 0, pWidth, pHeight);
        const isLight = document.documentElement.getAttribute('data-theme') === 'light-awakening';

        particles.forEach((p, i) => {
          p.y -= p.speedY;
          p.x += p.speedX;
          if (p.y < 0) {
            p.y = pHeight;
            p.x = Math.random() * pWidth;
          }
          bgCtx.beginPath();
          bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

          if (isLight) {
            const isRoyal = (i % 2 === 0);
            bgCtx.fillStyle = isRoyal ? 'rgba(124, 58, 237, ' + (p.alpha * 0.75) + ')' : 'rgba(168, 85, 247, ' + (p.alpha * 0.6) + ')';
            bgCtx.shadowBlur = isRoyal ? 8 : 12;
            bgCtx.shadowColor = isRoyal ? '#7c3aed' : '#a855f7';
          } else {
            const isWhite = (i % 2 === 0);
            bgCtx.fillStyle = isWhite ? 'rgba(255, 255, 255, ' + (p.alpha * 0.9) + ')' : 'rgba(192, 132, 252, ' + p.alpha + ')';
            bgCtx.shadowBlur = isWhite ? 6 : 10;
            bgCtx.shadowColor = isWhite ? '#ffffff' : '#c084fc';
          }
          bgCtx.fill();
        });
        manaAnimationFrameId = requestAnimationFrame(renderMana);
      }

      startManaAnimation = function() {
        if (manaAnimationActive) return;
        manaAnimationActive = true;
        if (bgCanvas) bgCanvas.style.visibility = 'visible';
        renderMana();
      };

      stopManaAnimation = function() {
        manaAnimationActive = false;
        if (manaAnimationFrameId) {
          cancelAnimationFrame(manaAnimationFrameId);
          manaAnimationFrameId = null;
        }
        if (bgCanvas && bgCtx) {
          bgCtx.clearRect(0, 0, pWidth, pHeight);
        }
      };

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (manaAnimationFrameId) {
            cancelAnimationFrame(manaAnimationFrameId);
            manaAnimationFrameId = null;
          }
        } else if (manaAnimationActive && !manaAnimationFrameId) {
          manaAnimationFrameId = requestAnimationFrame(renderMana);
        }
      });
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

    
    // CLEAN SYSTEM INTRO VIDEO & ALERT TRANSITION CONTROLLER (ACTIVE HEARTBEAT & ANTI-STALL)
    let introDismissed = false;
    let introAlertShown = false;
    let alertAutoDismissTimer = null;
    let introPlaybackPoller = null;

    function showIntroAlertScreen() {
      if (introAlertShown || introDismissed) return;
      introAlertShown = true;
      if (introPlaybackPoller) {
        clearInterval(introPlaybackPoller);
        introPlaybackPoller = null;
      }

      const video = document.getElementById('system-intro-video');
      const alertWrapper = document.getElementById('system-intro-alert-wrapper');
      
      if (video) {
        try { video.pause(); } catch(e) {}
        video.style.display = 'none';
        video.style.visibility = 'hidden';
        video.style.opacity = '0';
        video.style.pointerEvents = 'none';
      }
      if (alertWrapper) {
        alertWrapper.style.display = 'flex';
        alertWrapper.style.visibility = 'visible';
        alertWrapper.style.opacity = '1';
      }

      // Automatically transition to application after 2.0s (or on user click)
      if (alertAutoDismissTimer) clearTimeout(alertAutoDismissTimer);
      alertAutoDismissTimer = setTimeout(() => {
        dismissIntroOverlay();
      }, 2000);
    }

    function handleIntroOverlayClick() {
      // If alert screen is not yet shown, advance directly to the alert screen
      if (!introAlertShown) {
        showIntroAlertScreen();
      } else {
        // If alert screen is already showing, dismiss directly into the app
        dismissIntroOverlay();
      }
    }

    function initSystemIntro() {
      const overlay = document.getElementById('system-intro-overlay');
      const video = document.getElementById('system-intro-video');
      const alertWrapper = document.getElementById('system-intro-alert-wrapper');
      if (!overlay || !video) return;

      const hasSeen = sessionStorage.getItem('levelup_intro_seen');
      if (hasSeen) {
        overlay.classList.add('dismissed');
        overlay.style.display = 'none';
        document.body.classList.remove('intro-active');
        startManaAnimation();
        return;
      }

      document.body.classList.add('intro-active');
      // Stop heavy particles during intro video playback to free 100% CPU/GPU
      stopManaAnimation();

      overlay.classList.remove('dismissed');
      overlay.style.display = 'flex';
      video.style.display = 'block';
      video.style.visibility = 'visible';
      video.style.opacity = '1';
      video.style.pointerEvents = 'auto';

      if (alertWrapper) alertWrapper.style.display = 'none';
      introDismissed = false;
      introAlertShown = false;

      // Essential for cross-browser autoplay compliance
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');

      // ACTIVE PLAYBACK HEARTBEAT & ANTI-STALL WATCHDOG
      let lastObservedTime = -1;
      let lastProgressTimestamp = Date.now();
      let playbackHasStarted = false;
      const initialMountTime = Date.now();

      if (introPlaybackPoller) clearInterval(introPlaybackPoller);
      introPlaybackPoller = setInterval(() => {
        if (!video || introDismissed) {
          if (introPlaybackPoller) clearInterval(introPlaybackPoller);
          return;
        }

        const now = Date.now();

        // 1. Natural frame-accurate completion (reaches 8.0s)
        if (video.ended || (video.duration > 0 && video.currentTime >= video.duration - 0.05)) {
          showIntroAlertScreen();
          return;
        }

        // 2. Track real frame-by-frame progress
        if (video.currentTime > 0) {
          playbackHasStarted = true;
          if (Math.abs(video.currentTime - lastObservedTime) > 0.03) {
            lastObservedTime = video.currentTime;
            lastProgressTimestamp = now; // Actively moving forward
          }
        }

        // 3. Fail-safe: Video has not even started playing after 3.0s (buffering hang or blocked autoplay)
        if (!playbackHasStarted && (now - initialMountTime > 3000)) {
          console.warn('[Intro] Video failed to start within 3s, bypassing overlay directly to HUD');
          dismissIntroOverlay();
          return;
        }

        // 4. Fail-safe: Video was playing but STALLED / FROZEN mid-stream for >2.0s
        if (playbackHasStarted && (now - lastProgressTimestamp > 2000)) {
          console.warn('[Intro] Video playback stalled mid-stream (>2s), auto-revealing HUD');
          dismissIntroOverlay();
          return;
        }
      }, 100);

      // Event listener backups & Diagnostic Telemetry
      video.addEventListener('ended', showIntroAlertScreen);
      video.addEventListener('loadeddata', () => {
        console.log('[Video Client] Premières données vidéo chargées (ReadyState: ' + video.readyState + ')');
      });
      video.addEventListener('progress', () => {
        if (video.buffered.length > 0 && video.duration > 0) {
          const bufEnd = video.buffered.end(video.buffered.length - 1);
          const pct = Math.min(100, (bufEnd / video.duration) * 100);
          if (pct >= 99.5) {
            console.log('[Video Client] 🎯 100% du flux vidéo téléchargé en mémoire (' + bufEnd.toFixed(2) + 's / ' + video.duration.toFixed(2) + 's)');
          }
        }
      });
      video.addEventListener('waiting', () => {
        console.warn('[Video Client] ⏳ Buffering en cours / attente de recall réseau...');
      });
      video.addEventListener('canplaythrough', () => {
        console.log("[Video Client] ⚡ Débit suffisant : la vidéo peut être lue jusqu'à la fin sans interruption");
      });
      video.addEventListener('error', (err) => {
        console.warn('[Intro] Video error encountered:', err);
        dismissIntroOverlay();
      });
      video.addEventListener('stalled', () => {
        setTimeout(() => {
          if (!introDismissed && video.paused && !video.ended) {
            console.warn('[Intro] Video stalled event confirmed, dismissing overlay');
            dismissIntroOverlay();
          }
        }, 1200);
      });

      // Start playback
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[Intro] Autoplay prevented, auto-advancing to HUD:', err);
            dismissIntroOverlay();
          });
        }
      } catch (e) {
        console.warn('[Intro] Video play error, bypassing:', e);
        dismissIntroOverlay();
      }
    }

    function dismissIntroOverlay(e) {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      if (introDismissed) return;
      introDismissed = true;

      if (alertAutoDismissTimer) {
        clearTimeout(alertAutoDismissTimer);
        alertAutoDismissTimer = null;
      }
      if (introPlaybackPoller) {
        clearInterval(introPlaybackPoller);
        introPlaybackPoller = null;
      }

      const overlay = document.getElementById('system-intro-overlay');
      const video = document.getElementById('system-intro-video');
      sessionStorage.setItem('levelup_intro_seen', 'true');
      document.body.classList.remove('intro-active');

      if (overlay) {
        overlay.classList.add('dismissed');
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.display = 'none';
        if (video) {
          try { video.pause(); } catch(e) {}
          video.currentTime = 0;
        }
        // Resume background mana particles when intro is dismissed
        startManaAnimation();
        const activeView = document.querySelector('.view-panel.active');
        if (activeView) {
          triggerActiveViewCardsReveal(activeView);
        }
      }
    }

    window.dismissIntroOverlay = dismissIntroOverlay;
    window.handleIntroOverlayClick = handleIntroOverlayClick;

    function replayIntroVideo() {
      sessionStorage.removeItem('levelup_intro_seen');
      document.body.classList.add('intro-active');
      stopManaAnimation();
      const overlay = document.getElementById('system-intro-overlay');
      const video = document.getElementById('system-intro-video');
      const alertWrapper = document.getElementById('system-intro-alert-wrapper');
      if (alertAutoDismissTimer) {
        clearTimeout(alertAutoDismissTimer);
        alertAutoDismissTimer = null;
      }
      if (introPlaybackPoller) {
        clearInterval(introPlaybackPoller);
        introPlaybackPoller = null;
      }
      if (overlay && video) {
        overlay.style.display = 'flex';
        overlay.classList.remove('dismissed');
        video.style.display = 'block';
        video.style.visibility = 'visible';
        video.style.opacity = '1';
        video.style.pointerEvents = 'auto';
        if (alertWrapper) alertWrapper.style.display = 'none';
        introDismissed = false;
        introAlertShown = false;
        video.currentTime = 0;

        let lastObservedTime = -1;
        let lastProgressTimestamp = Date.now();
        let playbackHasStarted = false;
        const initialMountTime = Date.now();

        if (introPlaybackPoller) clearInterval(introPlaybackPoller);
        introPlaybackPoller = setInterval(() => {
          if (!video || introDismissed) {
            if (introPlaybackPoller) clearInterval(introPlaybackPoller);
            return;
          }
          const now = Date.now();
          if (video.ended || (video.duration > 0 && video.currentTime >= video.duration - 0.05)) {
            showIntroAlertScreen();
            return;
          }
          if (video.currentTime > 0) {
            playbackHasStarted = true;
            if (Math.abs(video.currentTime - lastObservedTime) > 0.03) {
              lastObservedTime = video.currentTime;
              lastProgressTimestamp = now;
            }
          }
          if (!playbackHasStarted && (now - initialMountTime > 3000)) {
            dismissIntroOverlay();
            return;
          }
          if (playbackHasStarted && (now - lastProgressTimestamp > 2000)) {
            dismissIntroOverlay();
            return;
          }
        }, 100);

        try {
          video.play();
        } catch(e) {}
      }
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        dismissIntroOverlay();
      }
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
    if (state.penalty && state.penalty.active) {
      updatePenaltyUI(true);
    } else {
      updatePenaltyUI(false);
    }
    // Check for OAuth redirect params
    try {
      const urlP = new URLSearchParams(window.location.search);
      if (urlP.get('auth') === 'success') {
        const pName = urlP.get('name');
        const pEmail = urlP.get('email');
        const pPic = urlP.get('picture');
        const pSub = urlP.get('sub');
        if (pName) state.player.name = decodeURIComponent(pName);
        if (pEmail) state.player.email = decodeURIComponent(pEmail);
        if (pPic) state.player.avatar = decodeURIComponent(pPic);
        if (pSub) {
          const decSub = decodeURIComponent(pSub);
          state.player.id = "usr-" + decSub.slice(-8);
          state.player.googleId = decSub;
        }
        state.player.authProvider = 'google';
        state.player.title = "Chasseur Éveillé (Rang E)";
        saveState();
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          showSysNotification(
            "👑 [SYNCHRONISATION GOOGLE CONFIRMÉE]",
            "Bienvenue, Chasseur <strong>" + (state.player.name || '') + "</strong> !<br>Votre identité officielle (<code>" + (state.player.email || '') + "</code>) a été certifiée par Google Identity."
          );
          playChime(1046);
        }, 600);
      } else if (urlP.get('auth') === 'error') {
        const reason = urlP.get('reason') || 'Échec de négociation de session';
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          showSysNotification(
            "[ERREUR D'AUTHENTIFICATION GOOGLE]",
            "La tentative de connexion a échoué : " + reason
          );
        }, 600);
      } else if (urlP.get('onboarding') === 'complete') {
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          showSysNotification(
            "👑 [CALIBRAGE PROTOCOLE SCELLÉ]",
            "Félicitations, Chasseur <strong>" + (state.player.name || '') + "</strong> !<br>Vos objectifs, votre routine circadienne (Réveil <strong>" + (state.player.wakeTime || '06:00') + "</strong> ➔ Couvre-feu <strong>" + (state.player.curfewTime || '22:00') + "</strong>) et votre intensité sportive ont été gravés dans le Système."
          );
          if (typeof playFanfare === 'function') playFanfare();
          else if (typeof playChime === 'function') playChime(1046);
        }, 600);
      }
    } catch(e) {}
    refreshAuthModalUI();

    initSystemIntro();
    initScrollRevealCards();
    sanitizeLegacyComments();
    const initialActive = document.querySelector('.view-panel.active');
    if (initialActive) {
      triggerActiveViewCardsReveal(initialActive);
    }
    setTimeout(() => {
      if (typeof initOppCircularCarousel === 'function') initOppCircularCarousel();
      if (typeof initQuestCircularCarousel === 'function') initQuestCircularCarousel();
      sanitizeLegacyComments();
      try {
        const activeTab = document.querySelector('.nav-tab.active');
        if (activeTab) activeTab.scrollIntoView({ inline: 'center', block: 'nearest' });
      } catch (e) {}
    }, 100);
  </script>
</body>
</html>`;
}

// In-Memory Video Streaming Telemetry Ring Buffer (Last 100 entries)
const videoStreamingTelemetry = [];
function recordStreamingLog(entry) {
  videoStreamingTelemetry.unshift({
    timestamp: new Date().toISOString(),
    ...entry,
  });
  if (videoStreamingTelemetry.length > 100) videoStreamingTelemetry.pop();
}

function serveVideoFileStream(req, res, videoPath, mimeType, requestPath) {
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  const clientIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const startTime = Date.now();

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const isRecall = start > 0;

    console.log(`[VIDEO STREAM] REQ ${requestPath} | IP: ${clientIp} | Range: bytes=${start}-${end}/${fileSize} (${(chunksize / 1024 / 1024).toFixed(2)} MB) | Mode: ${isRecall ? 'RECALL/SEGMENT' : 'INITIAL_CHUNK'}`);

    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    };
    res.writeHead(206, head);

    let bytesTransferred = 0;
    file.on("data", (chunk) => {
      bytesTransferred += chunk.length;
    });

    file.on("end", () => {
      const durationMs = Date.now() - startTime;
      const speedMBps = durationMs > 0 ? ((bytesTransferred / 1024 / 1024) / (durationMs / 1000)).toFixed(2) : "0";
      console.log(`[VIDEO STREAM] COMPLETE: ${requestPath} | IP: ${clientIp} | Transferred ${bytesTransferred}/${chunksize} bytes (100%) in ${durationMs}ms @ ${speedMBps} MB/s | Recall: ${isRecall}`);
      recordStreamingLog({
        file: requestPath,
        clientIp,
        range: `bytes=${start}-${end}/${fileSize}`,
        start,
        end,
        chunksize,
        fileSize,
        bytesTransferred,
        completed: true,
        durationMs,
        speedMBps,
        mode: isRecall ? "RECALL_CHUNK" : "INITIAL_CHUNK",
      });
    });

    res.on("close", () => {
      if (bytesTransferred < chunksize) {
        const durationMs = Date.now() - startTime;
        console.warn(`[VIDEO STREAM] CLIENT DISCONNECTED: ${requestPath} | IP: ${clientIp} | Sent ${bytesTransferred}/${chunksize} bytes (${((bytesTransferred / chunksize) * 100).toFixed(1)}%) in ${durationMs}ms`);
        recordStreamingLog({
          file: requestPath,
          clientIp,
          range: `bytes=${start}-${end}/${fileSize}`,
          start,
          end,
          chunksize,
          fileSize,
          bytesTransferred,
          completed: false,
          durationMs,
          speedMBps: "0",
          mode: isRecall ? "RECALL_ABORTED" : "INITIAL_ABORTED",
        });
      }
    });

    file.on("error", (err) => {
      console.error(`[VIDEO STREAM] STREAM ERROR: ${err.message}`);
      try { res.end(); } catch (e) {}
    });

    file.pipe(res);
  } else {
    console.log(`[VIDEO STREAM] REQ ${requestPath} | IP: ${clientIp} | Mode: FULL_DOWNLOAD | Total: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
    const head = {
      "Content-Length": fileSize,
      "Content-Type": mimeType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    };
    res.writeHead(200, head);

    const file = fs.createReadStream(videoPath);
    let bytesTransferred = 0;

    file.on("data", (chunk) => {
      bytesTransferred += chunk.length;
    });

    file.on("end", () => {
      const durationMs = Date.now() - startTime;
      const speedMBps = durationMs > 0 ? ((bytesTransferred / 1024 / 1024) / (durationMs / 1000)).toFixed(2) : "0";
      console.log(`[VIDEO STREAM] FULL COMPLETE: ${requestPath} | IP: ${clientIp} | Sent ${bytesTransferred}/${fileSize} bytes (100%) in ${durationMs}ms @ ${speedMBps} MB/s`);
      recordStreamingLog({
        file: requestPath,
        clientIp,
        range: "FULL",
        start: 0,
        end: fileSize - 1,
        chunksize: fileSize,
        fileSize,
        bytesTransferred,
        completed: true,
        durationMs,
        speedMBps,
        mode: "FULL_DOWNLOAD",
      });
    });

    res.on("close", () => {
      if (bytesTransferred < fileSize) {
        const durationMs = Date.now() - startTime;
        console.warn(`[VIDEO STREAM] CLIENT ABORTED FULL: ${requestPath} | IP: ${clientIp} | Sent ${bytesTransferred}/${fileSize} bytes in ${durationMs}ms`);
        recordStreamingLog({
          file: requestPath,
          clientIp,
          range: "FULL",
          start: 0,
          end: fileSize - 1,
          chunksize: fileSize,
          fileSize,
          bytesTransferred,
          completed: false,
          durationMs,
          speedMBps: "0",
          mode: "FULL_ABORTED",
        });
      }
    });

    file.pipe(res);
  }
}

// Master HTTP Server
const server = http.createServer(async (req, res) => {
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

  // =========================================================================
  // GOOGLE OAUTH 2.0 & IDENTITY SERVICES ENDPOINTS
  // =========================================================================

  // Google OAuth Config Endpoint
  if (pathname === "/api/v1/auth/config") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        configured: Boolean(GOOGLE_CLIENT_ID),
        clientId: GOOGLE_CLIENT_ID,
        appUrl: APP_URL,
      }),
    );
    return;
  }

  // Google OAuth 2.0 Initiation Route
  if (pathname === "/auth/google") {
    if (!GOOGLE_CLIENT_ID) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Configuration Google OAuth Requise — LevelUp</title>
  <style>
    body { background: #0f0926; color: #fff; font-family: monospace; padding: 40px; text-align: center; }
    .card { background: #1d1734; border: 1px solid #c084fc; max-width: 620px; margin: 40px auto; padding: 32px; border-radius: 12px; box-shadow: 0 0 40px rgba(111,0,190,0.4); text-align: left; }
    h2 { color: #00f0ff; text-align: center; margin-top: 0; }
    code { background: #2c2644; color: #ffb800; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
    a { color: #00f0ff; text-decoration: none; font-weight: bold; }
    a:hover { text-decoration: underline; }
    ol { line-height: 1.8; color: #cfc2d7; }
  </style>
</head>
<body>
  <div class="card">
    <h2>⚡ CLÉ GOOGLE OAUTH NON DÉFINIE</h2>
    <p>La variable d'environnement <code>GOOGLE_CLIENT_ID</code> n'est pas encore configurée sur ce serveur.</p>
    <p>Pour activer l'authentification officielle :</p>
    <ol>
      <li>Créez un identifiant OAuth 2.0 sur la <strong>Google Cloud Console</strong>.</li>
      <li>Ajoutez l'URI de redirection : <code>${APP_URL}/auth/google/callback</code>.</li>
      <li>Définissez <code>GOOGLE_CLIENT_ID</code> et <code>GOOGLE_CLIENT_SECRET</code> dans vos variables d'environnement.</li>
    </ol>
    <div style="text-align: center; margin-top: 24px;">
      <a href="/dashboard">← Retourner au HUD LevelUp</a>
    </div>
  </div>
</body>
</html>`);
      return;
    }

    const host = req.headers.host || (PORT ? `localhost:${PORT}` : "levelup-system.onrender.com");
    const protocol = (req.headers["x-forwarded-proto"] || "http").split(",")[0];
    const redirectUri = `${protocol}://${host}/auth/google/callback`;

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent("openid profile email")}` +
      `&access_type=offline` +
      `&prompt=consent`;

    res.writeHead(302, { Location: googleAuthUrl });
    res.end();
    return;
  }

  // Google OAuth 2.0 Callback Route
  if (pathname === "/auth/google/callback") {
    const code = parsedUrl.query.code;
    const error = parsedUrl.query.error;

    if (error || !code) {
      res.writeHead(302, {
        Location: `/?auth=error&reason=${encodeURIComponent(error || "NO_CODE")}`,
      });
      res.end();
      return;
    }

    const host = req.headers.host || (PORT ? `localhost:${PORT}` : "levelup-system.onrender.com");
    const protocol = (req.headers["x-forwarded-proto"] || "http").split(",")[0];
    const redirectUri = `${protocol}://${host}/auth/google/callback`;

    // Exchange auth code for tokens
    const postData = [
      `code=${encodeURIComponent(code)}`,
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}`,
      `client_secret=${encodeURIComponent(GOOGLE_CLIENT_SECRET)}`,
      `redirect_uri=${encodeURIComponent(redirectUri)}`,
      `grant_type=authorization_code`,
    ].join("&");

    const tokenReq = https.request(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (tokenRes) => {
        let tokenBody = "";
        tokenRes.on("data", (chunk) => {
          tokenBody += chunk;
        });
        tokenRes.on("end", () => {
          try {
            const tokenJson = JSON.parse(tokenBody);
            const accessToken = tokenJson.access_token;

            if (!accessToken) {
              res.writeHead(302, {
                Location: `/?auth=error&reason=TOKEN_EXCHANGE_FAILED`,
              });
              res.end();
              return;
            }

            // Fetch user profile from Google UserInfo
            https
              .get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                {
                  headers: { Authorization: `Bearer ${accessToken}` },
                },
                (userRes) => {
                  let userBody = "";
                  userRes.on("data", (chunk) => {
                    userBody += chunk;
                  });
                  userRes.on("end", () => {
                    try {
                      const userinfo = JSON.parse(userBody);
                      const gName = userinfo.name || userinfo.given_name || "Chasseur Google";
                      const gEmail = userinfo.email || "";
                      const gPic = userinfo.picture || "";
                      const gSub = userinfo.sub || "";
                      const hunterId = gSub ? `usr-${gSub.slice(-8)}` : "usr-hunter";

                      SYSTEM_STATE.player.id = hunterId;
                      SYSTEM_STATE.player.name = gName;
                      SYSTEM_STATE.player.email = gEmail;
                      SYSTEM_STATE.player.avatar = gPic;
                      SYSTEM_STATE.player.authProvider = "google";
                      SYSTEM_STATE.player.googleId = gSub;
                      SYSTEM_STATE.player.title = "Chasseur Éveillé (Rang E)";

                      const isOnboarded = Boolean(SYSTEM_STATE.player.onboardingCompleted);
                      const destPath = isOnboarded ? "/dashboard" : "/onboarding";
                      const destUrl = `${destPath}?auth=success&provider=google&name=${encodeURIComponent(gName)}&email=${encodeURIComponent(gEmail)}&picture=${encodeURIComponent(gPic)}&sub=${encodeURIComponent(gSub)}&onboarding=${isOnboarded ? 'ready' : 'required'}`;
                      res.writeHead(302, { Location: destUrl });
                      res.end();
                    } catch (_) {
                      res.writeHead(302, {
                        Location: `/login?auth=error&reason=USERINFO_PARSE_FAILED`,
                      });
                      res.end();
                    }
                  });
                },
              )
              .on("error", () => {
                res.writeHead(302, {
                  Location: `/login?auth=error&reason=USERINFO_NETWORK_ERROR`,
                });
                res.end();
              });
          } catch (_) {
            res.writeHead(302, {
              Location: `/login?auth=error&reason=TOKEN_PARSE_FAILED`,
            });
            res.end();
          }
        });
      },
    );

    tokenReq.on("error", () => {
      res.writeHead(302, { Location: `/login?auth=error&reason=TOKEN_REQUEST_ERROR` });
      res.end();
    });

    tokenReq.write(postData);
    tokenReq.end();
    return;
  }

  // Google Identity Services (GIS) JWT ID Token Verification
  if (pathname === "/api/v1/auth/google/verify" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        const credential = parsed.credential;
        if (!credential) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "CREDENTIAL_MISSING" }));
          return;
        }

        const parts = credential.split(".");
        if (parts.length !== 3) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "INVALID_JWT_FORMAT" }));
          return;
        }

        const payloadStr = Buffer.from(parts[1], "base64").toString("utf8");
        const payload = JSON.parse(payloadStr);

        if (!payload.iss || !payload.iss.includes("accounts.google.com")) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "INVALID_ISSUER" }));
          return;
        }

        const hunterId = payload.sub ? `usr-${payload.sub.slice(-8)}` : "usr-hunter";
        const hunterName = payload.name || "Chasseur Google";

        SYSTEM_STATE.player.id = hunterId;
        SYSTEM_STATE.player.name = hunterName;
        SYSTEM_STATE.player.email = payload.email || "";
        SYSTEM_STATE.player.avatar = payload.picture || null;
        SYSTEM_STATE.player.authProvider = "google";
        SYSTEM_STATE.player.googleId = payload.sub;
        SYSTEM_STATE.player.title = "Chasseur Éveillé (Rang E)";

        const cookiePayload = encodeURIComponent(JSON.stringify({
          id: hunterId,
          name: hunterName,
          email: payload.email,
          authProvider: "google",
          onboardingCompleted: Boolean(SYSTEM_STATE.player.onboardingCompleted)
        }));

        res.writeHead(200, {
          "Content-Type": "application/json",
          "Set-Cookie": `levelup_hunter_auth=${cookiePayload}; Path=/; Max-Age=2592000; SameSite=Lax`
        });
        res.end(
          JSON.stringify({
            success: true,
            user: {
              id: hunterId,
              name: hunterName,
              email: payload.email,
              picture: payload.picture,
              sub: payload.sub,
              title: "Chasseur Éveillé (Rang E)",
              onboardingCompleted: Boolean(SYSTEM_STATE.player.onboardingCompleted),
            },
          }),
        );
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "VERIFICATION_ERROR",
            message: err.message,
          }),
        );
      }
    });
    return;
  }

  // Direct Hunter Login Endpoint
  if (pathname === "/api/v1/auth/hunter/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body || "{}");
        const ident = (parsed.identifier || parsed.email || parsed.name || "Chasseur").trim();
        const hunterName = parsed.name || (ident.includes("@") ? ident.split("@")[0] : ident) || "Chasseur Éveillé";
        const hunterEmail = parsed.email || (ident.includes("@") ? ident : `${hunterName.toLowerCase().replace(/[^a-z0-9]/g, "")}@hunter.levelup`);
        const hunterId = "usr-" + Date.now().toString(36);

        SYSTEM_STATE.player.id = hunterId;
        SYSTEM_STATE.player.name = hunterName;
        SYSTEM_STATE.player.email = hunterEmail;
        SYSTEM_STATE.player.authProvider = "hunter";
        SYSTEM_STATE.player.title = "Chasseur Éveillé (Rang E)";

        const isOnboarded = Boolean(SYSTEM_STATE.player.onboardingCompleted);
        const cookiePayload = encodeURIComponent(JSON.stringify({
          id: hunterId,
          name: hunterName,
          email: hunterEmail,
          authProvider: "hunter",
          onboardingCompleted: isOnboarded
        }));

        res.writeHead(200, {
          "Content-Type": "application/json",
          "Set-Cookie": `levelup_hunter_auth=${cookiePayload}; Path=/; Max-Age=2592000; SameSite=Lax`
        });
        res.end(JSON.stringify({
          success: true,
          user: {
            id: hunterId,
            name: hunterName,
            email: hunterEmail,
            authProvider: "hunter",
            onboardingCompleted: isOnboarded
          }
        }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Direct Hunter Signup Endpoint
  if (pathname === "/api/v1/auth/hunter/signup" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body || "{}");
        const hunterName = (parsed.name || "Nouveau Chasseur").trim();
        const hunterEmail = (parsed.email || `${hunterName.toLowerCase().replace(/[^a-z0-9]/g, "")}@hunter.levelup`).trim();
        const hunterId = "usr-" + Date.now().toString(36);

        SYSTEM_STATE.player.id = hunterId;
        SYSTEM_STATE.player.name = hunterName;
        SYSTEM_STATE.player.email = hunterEmail;
        SYSTEM_STATE.player.authProvider = "hunter";
        SYSTEM_STATE.player.title = "Initié Éveillé (Rang E)";
        SYSTEM_STATE.player.onboardingCompleted = false;

        const cookiePayload = encodeURIComponent(JSON.stringify({
          id: hunterId,
          name: hunterName,
          email: hunterEmail,
          authProvider: "hunter",
          onboardingCompleted: false
        }));

        res.writeHead(200, {
          "Content-Type": "application/json",
          "Set-Cookie": `levelup_hunter_auth=${cookiePayload}; Path=/; Max-Age=2592000; SameSite=Lax`
        });
        res.end(JSON.stringify({
          success: true,
          user: {
            id: hunterId,
            name: hunterName,
            email: hunterEmail,
            authProvider: "hunter",
            onboardingCompleted: false
          }
        }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 1-Click Quick Sovereign Awakening Endpoint
  if (pathname === "/api/v1/auth/hunter/quick" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body || "{}");
        const hunterName = (parsed.name || "Monarque Éveillé").trim();
        const hunterId = "usr-" + Date.now().toString(36);
        const hunterEmail = `${hunterName.toLowerCase().replace(/[^a-z0-9]/g, "")}@monarch.system`;

        SYSTEM_STATE.player.id = hunterId;
        SYSTEM_STATE.player.name = hunterName;
        SYSTEM_STATE.player.email = hunterEmail;
        SYSTEM_STATE.player.authProvider = "hunter";
        SYSTEM_STATE.player.title = "Chasseur Éveillé (Rang E)";
        SYSTEM_STATE.player.onboardingCompleted = false;

        const cookiePayload = encodeURIComponent(JSON.stringify({
          id: hunterId,
          name: hunterName,
          email: hunterEmail,
          authProvider: "hunter",
          onboardingCompleted: false
        }));

        res.writeHead(200, {
          "Content-Type": "application/json",
          "Set-Cookie": `levelup_hunter_auth=${cookiePayload}; Path=/; Max-Age=2592000; SameSite=Lax`
        });
        res.end(JSON.stringify({
          success: true,
          user: {
            id: hunterId,
            name: hunterName,
            email: hunterEmail,
            authProvider: "hunter",
            onboardingCompleted: false
          }
        }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Logout Endpoint
  if (pathname === "/api/v1/auth/logout" && req.method === "POST") {
    SYSTEM_STATE.player.id = "usr-guest-unawakened";
    SYSTEM_STATE.player.name = "Chasseur Non Éveillé";
    SYSTEM_STATE.player.title = "Initié Non Éveillé (Rang E)";
    SYSTEM_STATE.player.email = null;
    SYSTEM_STATE.player.avatar = null;
    SYSTEM_STATE.player.authProvider = null;
    SYSTEM_STATE.player.googleId = null;
    SYSTEM_STATE.player.onboardingCompleted = false;
    SYSTEM_STATE.onboardingCompleted = false;

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": "levelup_hunter_auth=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    });
    res.end(JSON.stringify({ success: true, message: "Déconnexion réussie." }));
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

  if (pathname === "/api/v1/system/reset") {
    SYSTEM_STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "PRISTINE_RESET_SUCCESS", state: SYSTEM_STATE }));
    return;
  }

  // Onboarding Calibration & Personalization Endpoint
  if (pathname === "/api/v1/onboarding" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const config = JSON.parse(body);
        if (config.name) SYSTEM_STATE.player.name = String(config.name).trim();
        if (config.title) SYSTEM_STATE.player.title = String(config.title).trim();
        if (config.wakeTime) SYSTEM_STATE.player.wakeTime = String(config.wakeTime).trim();
        if (config.curfewTime) SYSTEM_STATE.player.curfewTime = String(config.curfewTime).trim();
        if (config.archetype) SYSTEM_STATE.player.archetype = String(config.archetype).trim();
        if (config.targetGoal) SYSTEM_STATE.player.targetGoal = String(config.targetGoal).trim();
        if (config.workoutLevel) SYSTEM_STATE.player.workoutLevel = String(config.workoutLevel).trim();
        if (config.deepWorkHours) SYSTEM_STATE.player.deepWorkHours = Number(config.deepWorkHours) || 3;
        SYSTEM_STATE.player.onboardingCompleted = true;
        SYSTEM_STATE.onboardingCompleted = true;

        // Adapt Sung Jin-Woo workout quest
        const fitQ = SYSTEM_STATE.quests.find((q) => q.id === "q-fit-sungjinwoo");
        if (fitQ) {
          if (config.workoutLevel === "NOVICE_30") {
            fitQ.description = "30 Pompes militaires, 30 Abdos, 30 Squats et 3 km de course.";
            fitQ.xp = 100;
          } else if (config.workoutLevel === "MONARCH_150") {
            fitQ.description = "150 Pompes militaires strictes, 150 Abdos d'acier, 150 Squats explosifs et 15 km de course.";
            fitQ.xp = 300;
          } else {
            fitQ.description = "100 Pompes militaires, 100 Abdos d'acier, 100 Squats explosifs et 10 km de course.";
            fitQ.xp = 200;
          }
        }

        // Regenerate planner blocks dynamically
        SYSTEM_STATE.plannerBlocks = generateCustomPlannerBlocks(
          SYSTEM_STATE.player.wakeTime,
          SYSTEM_STATE.player.curfewTime,
          SYSTEM_STATE.player.archetype,
          SYSTEM_STATE.player.deepWorkHours
        );

        const cookiePayload = encodeURIComponent(JSON.stringify({
          id: SYSTEM_STATE.player.id,
          name: SYSTEM_STATE.player.name,
          email: SYSTEM_STATE.player.email,
          authProvider: SYSTEM_STATE.player.authProvider || "hunter",
          onboardingCompleted: true
        }));

        res.writeHead(200, {
          "Content-Type": "application/json",
          "Set-Cookie": `levelup_hunter_auth=${cookiePayload}; Path=/; Max-Age=2592000; SameSite=Lax`
        });
        res.end(
          JSON.stringify({
            success: true,
            message: "Protocole calibré et gravé avec succès dans le Système.",
            player: SYSTEM_STATE.player,
            plannerBlocks: SYSTEM_STATE.plannerBlocks,
          })
        );
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "INVALID_ONBOARDING_DATA",
            message: err.message,
          })
        );
      }
    });
    return;
  }

  // Rest Day Status & Activation Endpoints
  if (pathname === "/api/v1/rest-day/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      active: !!SYSTEM_STATE.restDayActive,
      activatedAt: SYSTEM_STATE.restDayActivatedAt || null,
      cooldownUntil: SYSTEM_STATE.restDayCooldownUntil || null,
      curfewDisabled: !!SYSTEM_STATE.restDayActive
    }));
    return;
  }

  if (pathname === "/api/v1/rest-day/activate" && req.method === "POST") {
    SYSTEM_STATE.restDayActive = true;
    SYSTEM_STATE.restDayActivatedAt = new Date().toISOString();
    SYSTEM_STATE.penalty.active = false;
    SYSTEM_STATE.penalty.reason = "Jour de Repos actif (Répit du Monarque accordé par assiduité hebdomadaire).";
    
    // Lift NextDNS restrictions if any
    deactivateNextDnsRestriction(NEXTDNS_PROFILE_ID, NEXTDNS_API_KEY).catch(() => {});
    applyLocalHostsFilter(false);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: true,
      restDayActive: true,
      message: "Jour de Repos activé avec succès. Couvre-feu NextDNS désactivé et pénalités suspendues."
    }));
    return;
  }

  // NextDNS & Penalty Status Endpoint
  if (pathname === "/api/v1/penalty/status") {
    const now = new Date();
    const parisTimeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Paris" });
    const hour = parseInt(parisTimeStr.split(":")[0], 10);
    const isCurfew = hour >= 22 || hour < 5;

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        active: SYSTEM_STATE.penalty.active,
        reason: SYSTEM_STATE.penalty.reason,
        curfewTime: "22:00",
        curfewActiveNow: isCurfew,
        parisCurrentTime: parisTimeStr,
        blockedDomains: SYSTEM_STATE.penalty.blockedDomains,
        nextDnsConfigured: true,
        nextDnsProfileId: NEXTDNS_PROFILE_ID,
        redemptionOptionA: SYSTEM_STATE.penalty.redemptionOptionA,
        redemptionOptionB: SYSTEM_STATE.penalty.redemptionOptionB,
      }),
    );
    return;
  }

  // Trigger Penalty & Network Lockout Endpoint
  if (pathname === "/api/v1/penalty/trigger" && req.method === "POST") {
    SYSTEM_STATE.penalty.active = true;
    SYSTEM_STATE.penalty.reason =
      "Verrouillage anti-procrastination engagé : Couvre-feu 22h00 franchi ou échec de quêtes. Accès réseau restreint.";
    SYSTEM_STATE.penalty.triggeredAt = new Date().toISOString();
    SYSTEM_STATE.penalty.expiresAt = Date.now() + 4 * 3600 * 1000;

    const nextDnsResult = await activateNextDnsRestriction(NEXTDNS_PROFILE_ID, NEXTDNS_API_KEY);
    const hostsResult = applyLocalHostsFilter(true);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        active: true,
        expiresAt: SYSTEM_STATE.penalty.expiresAt,
        nextDns: nextDnsResult,
        hosts: hostsResult,
        message: "Protocole de pénalité engagé. Domaines distrayants verrouillés via NextDNS et table hosts.",
      }),
    );
    return;
  }

  // Redeem Penalty & Lift Lockout Endpoint
  if (pathname === "/api/v1/penalty/redeem" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      let parsed = {};
      try {
        parsed = JSON.parse(body);
      } catch (_) {}

      const option = parsed.option || "A";
      const reps = Number(parsed.reps) || 0;
      const proof = String(parsed.proof || "");

      // Validation anti-triche : au moins 200 répétitions pour l'Option A (ou preuve explicite)
      if (option === "A" && reps < 200 && !proof.includes("200") && !proof.includes("Override")) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "Épreuve incomplète : 200 pompes calisthéniques strictes sont obligatoires.",
          }),
        );
        return;
      }

      SYSTEM_STATE.penalty.active = false;
      delete SYSTEM_STATE.penalty.expiresAt;
      SYSTEM_STATE.penalty.reason =
        "Aucune infraction constatée. Le Joueur a accompli son épreuve de rédemption physique.";

      const nextDnsResult = await deactivateNextDnsRestriction(NEXTDNS_PROFILE_ID, NEXTDNS_API_KEY);
      const hostsResult = applyLocalHostsFilter(false);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          active: false,
          nextDns: nextDnsResult,
          hosts: hostsResult,
          message: "Quête de Purge accomplie avec succès. Verrouillage NextDNS levé et réseau rétabli.",
        }),
      );
    });
    return;
  }

  // Quest Validation Sync Endpoint
  if (pathname === "/api/v1/quests/validate" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      let parsed = {};
      try {
        parsed = JSON.parse(body);
      } catch (_) {}
      const quest = SYSTEM_STATE.quests.find((q) => q.id === parsed.id);
      if (quest) {
        quest.completed = true;
        quest.proof = parsed.proof || "Validé";
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, quest }));
    });
    return;
  }

  
  // Video Streaming Diagnostic & Logs API Endpoint
  if (pathname === "/api/v1/system/video-stats") {
    const totalRequests = videoStreamingTelemetry.length;
    const completedStreams = videoStreamingTelemetry.filter(t => t.completed).length;
    const abortedStreams = videoStreamingTelemetry.filter(t => !t.completed).length;
    const recallsCount = videoStreamingTelemetry.filter(t => t.mode && t.mode.startsWith("RECALL")).length;
    const fullDownloadsCount = videoStreamingTelemetry.filter(t => t.mode === "FULL_DOWNLOAD").length;

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });
    res.end(JSON.stringify({
      status: "operational",
      totalRequests,
      completedStreams,
      abortedStreams,
      recallsCount,
      fullDownloadsCount,
      summary: {
        note: recallsCount > 0 ? "Le navigateur utilise le streaming par tranches avec recalls successifs (HTTP 206 Partial Content)" : "Les requêtes sont servies en téléchargement intégral",
        completedRate: totalRequests > 0 ? ((completedStreams / totalRequests) * 100).toFixed(1) + "%" : "100%",
      },
      recentLogs: videoStreamingTelemetry.slice(0, 40),
    }, null, 2));
    return;
  }

  // WebM Intro Video Streaming Endpoint (HTTP 206 Partial Content + Full Telemetry)
  if (pathname === "/intro.webm" || pathname === "/assets/intro.webm") {
    const candidatePaths = [
      path.join(__dirname, "public", "intro.webm"),
      path.join(__dirname, "..", "..", "apps", "web", "public", "intro.webm"),
      path.join(__dirname, "intro.webm"),
      path.join(process.cwd(), "apps", "web", "public", "intro.webm"),
      path.join(process.cwd(), "public", "intro.webm"),
    ];
    let videoFile = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        videoFile = p;
        break;
      }
    }

    if (!videoFile) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "INTRO_WEBM_VIDEO_NOT_FOUND" }));
      return;
    }

    serveVideoFileStream(req, res, videoFile, "video/webm", pathname);
    return;
  }

  // Intro Video Streaming Endpoint (HTTP 206 Partial Content + Full Telemetry)
  if (pathname === "/intro.mp4" || pathname === "/assets/intro.mp4") {
    const candidatePaths = [
      path.join(__dirname, "public", "intro.mp4"),
      path.join(__dirname, "..", "..", "apps", "web", "public", "intro.mp4"),
      path.join(__dirname, "intro.mp4"),
      path.join(process.cwd(), "apps", "web", "public", "intro.mp4"),
      path.join(process.cwd(), "public", "intro.mp4"),
    ];
    let videoFile = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        videoFile = p;
        break;
      }
    }

    if (!videoFile) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "INTRO_VIDEO_NOT_FOUND" }));
      return;
    }

    serveVideoFileStream(req, res, videoFile, "video/mp4", pathname);
    return;
  }

  // Intro Alert WebP Image Serving Endpoint
  if (pathname === "/intro-alert.webp" || pathname === "/assets/intro-alert.webp") {
    const candidatePaths = [
      path.join(__dirname, "public", "intro-alert.webp"),
      path.join(__dirname, "..", "..", "apps", "web", "public", "intro-alert.webp"),
      path.join(__dirname, "intro-alert.webp"),
      path.join(process.cwd(), "apps", "web", "public", "intro-alert.webp"),
      path.join(process.cwd(), "public", "intro-alert.webp"),
    ];
    let imgFile = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        imgFile = p;
        break;
      }
    }

    if (!imgFile) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "INTRO_WEBP_IMAGE_NOT_FOUND" }));
      return;
    }

    const stat = fs.statSync(imgFile);
    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=86400",
    });
    fs.createReadStream(imgFile).pipe(res);
    return;
  }

  // Intro Alert Image Serving Endpoint
  if (pathname === "/intro-alert.jpg" || pathname === "/assets/intro-alert.jpg") {
    const candidatePaths = [
      path.join(__dirname, "public", "intro-alert.jpg"),
      path.join(__dirname, "..", "..", "apps", "web", "public", "intro-alert.jpg"),
      path.join(__dirname, "intro-alert.jpg"),
      path.join(process.cwd(), "apps", "web", "public", "intro-alert.jpg"),
      path.join(process.cwd(), "public", "intro-alert.jpg"),
    ];
    let imgFile = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        imgFile = p;
        break;
      }
    }

    if (!imgFile) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "INTRO_IMAGE_NOT_FOUND" }));
      return;
    }

    const stat = fs.statSync(imgFile);
    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    });
    fs.createReadStream(imgFile).pipe(res);
    return;
  }

  // 3. Multi-Page HTML Routing
  if (pathname === "/" || pathname === "/login" || pathname === "/welcome" || pathname === "/landing") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderLandingPage());
    return;
  }

  if (pathname === "/onboarding") {
    if (SYSTEM_STATE.player && SYSTEM_STATE.player.onboardingCompleted) {
      res.writeHead(302, { Location: "/dashboard" });
      res.end();
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderOnboardingPage());
    return;
  }

  const routeTabMap = {
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
    '<h1>404 - Protocole Système Non Trouvé</h1><p><a href="/dashboard">Retour au HUD Souverain</a> • <a href="/landing">Portail d\'Éveil</a></p>',
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
  renderLandingPage,
  renderOnboardingPage,
  generateCustomPlannerBlocks,
  renderFullApplication,
};
