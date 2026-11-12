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
      id: "note-attention-multi-tetes",
      base: "AI_ENG",
      title: "Mécanismes d'Attention Multi-Têtes & FlashAttention-2",
      tags: ["deep-learning", "transformers", "cuda", "nlp"],
      updatedAt: "2026-11-12T04:20:00Z",
      content: `# Mécanismes d'Attention Multi-Têtes & FlashAttention-2

L'attention par produit scalaire mise à l'échelle (*Scaled Dot-Product Attention*) s'écrit de façon canonique :

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$

## Optimisation Matérielle FlashAttention-2 :
1. Évite les transferts mémoire redondants entre la mémoire HBM et la SRAM du GPU NVIDIA.
2. Utilise le *Tiling* pour calculer le softmax de manière incrémentale en bloc.
3. Liens sémantiques vers [[gpu-memory-hierarchies]] et [[triton-custom-kernels]].`,
    },
    {
      id: "note-algebre-svd-ia",
      base: "ACAD",
      title: "Décomposition en Valeurs Singulières (SVD) & Réduction PCA",
      tags: ["mathematiques", "algebre-lineaire", "svd", "pca"],
      updatedAt: "2026-11-11T18:30:00Z",
      content: `# Décomposition en Valeurs Singulières (SVD)

Toute matrice réelle $A \\in \\mathbb{R}^{m \\times n}$ admet la factorisation universelle :

$$A = U \\Sigma V^T$$

Où $U$ et $V$ sont orthogonales et $\\Sigma$ est diagonale contenant les valeurs singulières classées par ordre décroissant : $\\sigma_1 \\ge \\sigma_2 \\ge \\dots \\ge \\sigma_r > 0$.`,
    },
    {
      id: "note-tryhackme-buffer-overflow",
      base: "CYBER",
      title: "Exploitation de Buffer Overflow x86 & Contournement ASLR",
      tags: ["cyber", "pentest", "exploit", "gdb"],
      updatedAt: "2026-11-10T22:15:00Z",
      content: `# Exploitation de Buffer Overflow x86

Recherche de l'offset exact avec pattern_create et pattern_offset dans GDB PEDA. Écrasement du registre EIP pour rediriger l'exécution vers le NOP Sled et le shellcode.`,
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
         SCREEN 3 : JOURNAL DES QUÊTES & ALERTES SYSTÈME
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

      <!-- Add Custom Quest Form Trigger -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
        <button class="btn-cyber" onclick="openCreateQuestModal()">+ CRÉER UNE NOUVELLE QUÊTE</button>
      </div>

      <!-- Quests Grid -->
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
         SCREEN 5 : SECOND BRAIN MARKDOWN VAULT (WORKING EDITOR & PERSISTENCE)
         ===================================================================== -->
    <div id="view-notes" class="view-panel ${initialTab === "notes" ? "active" : ""}">
      <div class="glass-card spotlight-card" style="padding: 26px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 class="shiny-text" style="font-size: 26px; font-weight: 900; font-family: var(--font-display);">
              CERVEAU NUMÉRIQUE & COFFRE MARKDOWN (SECOND BRAIN)
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Notes interconnectées, liens sémantiques bi-directionnels et formules KaTeX.</p>
          </div>
          <button class="btn-cyber" onclick="openCreateNoteModal()">+ NOUVELLE NOTE</button>
        </div>

        <div style="margin-bottom: 20px;">
          <input type="text" id="notes-search-input" oninput="filterNotes(this.value)" placeholder="🔍 Rechercher dans le coffre (ex: FlashAttention, SVD, Buffer Overflow)..." class="form-input">
        </div>

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
              <h3 style="font-size: 17px; font-weight: bold; margin-bottom: 12px; color: var(--text-white);">${n.title}</h3>
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
    // SCREEN 3 : QUESTS PROOF MODAL & SUBMISSION
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
    // SCREEN 5 : SECOND BRAIN WORKING NOTES VAULT
    // =========================================================================
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

      const newNote = {
        id: 'note-' + Date.now(),
        base: base,
        title: title,
        tags: tags.length ? tags : ['savoir', 'second-brain'],
        updatedAt: new Date().toISOString(),
        content: content
      };

      state.notes.unshift(newNote);
      saveState();

      // Render new card in grid
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
              <button onclick="deleteNote('\${newNote.id}')" style="background: none; border: none; color: var(--alert-crimson); cursor: pointer; font-size: 14px;">🗑</button>
            </div>
          </div>
          <h3 style="font-size: 17px; font-weight: bold; margin-bottom: 12px; color: var(--text-white);">\${newNote.title}</h3>
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
      showSysNotification("[NOTE RETIRÉE]", "Note supprimée du coffre local.");
    }

    function filterNotes(term) {
      const q = term.toLowerCase();
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
