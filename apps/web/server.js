/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * LevelUp — The System (Master Server & Multi-Page Solo Leveling HUD)
 * Serves all 10 canonical screens specified in docs/03-APP_FLOW.md:
 * 1. /dashboard     - The Hunter's HUD
 * 2. /skills        - Arbre des 120 Compétences Canoniques (DAG)
 * 3. /quests        - Journal des Quêtes & Alertes Système
 * 4. /planner       - Planificateur Circadien Time-Blocking (06h - 22h)
 * 5. /notes         - Cerveau Numérique & Coffre Markdown (Second Brain)
 * 6. /audio         - Station Vocale & Évaluation Socratique (FFT Canvas)
 * 7. /opportunities - Veille Bourses & Hackathons Deerflow (Kanban)
 * 8. /shop          - La Boutique des Ombres (Shadow Shop & Cristaux)
 * 9. /penalty       - Zone de Pénalité & Verrouillage Réseau Inviolable
 * 10. /workout/camera - Salle d'Entraînement & Vision par Ordinateur
 */

const http = require("http");
const url = require("url");

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Global Single-User In-Memory State
const SYSTEM_STATE = {
  player: {
    id: "a5d8b74f-9e32-4d2b-98f5-19e48f029a1b",
    name: "Huriel",
    title: "Le Chasseur Souverain (Éveil Novice)",
    level: 14,
    rank: "D",
    currentXp: 18450,
    nextLevelXp: 22500,
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
  recentOrders: [
    {
      date: "05/11/2026",
      name: "Clavier Ergonomique",
      cost: 1800,
      code: "LVL-SHADOW-KYB-89",
    },
    {
      date: "28/10/2026",
      name: "Crédits RunPod Cloud",
      cost: 300,
      code: "LVL-SHADOW-RP-12",
    },
  ],
  penalty: {
    active: false,
    reason:
      "Échec de complétion de la Quête Journalière obligatoire [DAILY_FIT_100_CORPS] avant l'heure fatidique de 22h00.",
    remainingTime: "03:42:15",
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

// Calculate Harmonic Mean
function getHarmonicScore() {
  const bases = Object.values(SYSTEM_STATE.player.bases);
  const sumInverses = bases.reduce(
    (acc, b) => acc + 1 / Math.max(1, b.score),
    0,
  );
  return Math.round(bases.length / sumInverses);
}

// Master HTML Template with the 10 Full Holographic Screens
function renderFullApplication(initialTab = "dashboard") {
  const player = SYSTEM_STATE.player;
  const harmonicScore = getHarmonicScore();

  return `<!DOCTYPE html>
<html lang="fr" data-theme="dark-monarch">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LevelUp — The System (HUD Solo Leveling)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Rajdhani:wght@500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      /* ==========================================================================
         AUTHENTIC SOLO LEVELING SAPPHIRE GLASS & NEON SYSTEM PALETTE
         ========================================================================== */
      --bg-cosmic-0: #010614;
      --bg-cosmic-1: #020b22;
      --bg-cosmic-2: #05163e;
      --glass-panel: rgba(4, 18, 48, 0.78);
      --glass-panel-elevated: rgba(6, 26, 68, 0.85);
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
      --text-cyan: #38bdf8;

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
      --glass-panel: rgba(255, 255, 255, 0.90);
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
      position: relative;
    }

    /* Fixed Canvas for Floating Mana Particles (React Bits) */
    #mana-particles-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1;
    }

    /* ==========================================================================
       REACT BITS & UIVERSE COMPONENT STYLES
       ========================================================================== */

    /* 1. Solo Leveling Sapphire Glass Panel with React Bits Spotlight */
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
      transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
      z-index: 2;
    }

    /* Outer Cyber Notch & Energy Conduit Accents (Images 2 & 6) */
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

    /* React Bits Spotlight Overlay */
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
    .spotlight-card:hover::after {
      opacity: 1;
    }
    .spotlight-card:hover {
      border-color: rgba(0, 240, 255, 0.65);
      box-shadow: 
        0 12px 35px -5px rgba(0, 60, 160, 0.55),
        inset 0 0 25px rgba(0, 240, 255, 0.15),
        0 0 25px rgba(0, 240, 255, 0.25);
    }

    /* 2. Shiny / Shimmer Text (React Bits) */
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

    /* 3. Border Beam / Tracing Effect (React Bits & Uiverse) */
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

    /* 4. True Capsule Sliders (Solo Leveling Image 3) */
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

    /* 5. Uiverse / Shadcn Buttons */
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
      position: relative;
      overflow: hidden;
    }
    .btn-cyber:hover {
      background: var(--neon-cyan);
      color: #020c24;
      box-shadow: 0 0 22px rgba(0, 240, 255, 0.75);
      transform: translateY(-2px);
    }
    .btn-cyber:active {
      transform: translateY(0);
    }

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

    /* 6. Radar Ping Badge (Shadcn style with Uiverse glow) */
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
    .ping-circle {
      position: relative;
      display: flex;
      height: 8px;
      width: 8px;
    }
    .ping-circle .ping-wave {
      position: absolute;
      display: inline-flex;
      height: 100%;
      width: 100%;
      border-radius: 9999px;
      background-color: var(--neon-cyan);
      opacity: 0.75;
      animation: pingWave 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    .ping-circle .ping-dot {
      position: relative;
      display: inline-flex;
      border-radius: 9999px;
      height: 8px;
      width: 8px;
      background-color: var(--neon-cyan);
    }
    @keyframes pingWave {
      75%, 100% { transform: scale(2.2); opacity: 0; }
    }

    /* ==========================================================================
       HEADER & NAVIGATION BAR (SHADCN CLEAN ARCHITECTURE)
       ========================================================================== */
    .master-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(2, 10, 28, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--glass-inner-border);
      box-shadow: 0 4px 25px rgba(0, 20, 60, 0.6);
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 3px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-bar {
      background: rgba(2, 10, 28, 0.7);
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

    /* Layout Containers */
    .main-container {
      max-width: 1480px;
      margin: 0 auto;
      padding: 24px 20px 60px 20px;
      position: relative;
      z-index: 2;
    }

    .view-panel {
      display: none;
      animation: fadeInView 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .view-panel.active {
      display: block;
    }
    @keyframes fadeInView {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .grid-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px;
    }
    .grid-3col {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    @media (max-width: 1024px) {
      .grid-2col { grid-template-columns: 1fr; }
    }

    /* Top Holographic Alert Bar (Solo Leveling Image 4) */
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

    /* Modal Proof Dialog */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(1, 6, 20, 0.85);
      backdrop-filter: blur(16px);
      z-index: 200;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .modal-overlay.open {
      display: flex;
    }
    .modal-card {
      width: 90%;
      max-width: 540px;
      background: rgba(5, 20, 52, 0.95);
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
  </style>
</head>
<body>

  <!-- Floating Mana Particles Canvas -->
  <canvas id="mana-particles-canvas"></canvas>

  <!-- MASTER TOP HEADER -->
  <header class="master-header">
    <div class="brand-wrap">
      <div class="brand-logo">
        <span class="shiny-text">LEVELUP</span>
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
        <span>STREAK : ${player.streakDays}J</span>
      </div>
      <button class="btn-cyber" onclick="toggleTheme()" style="padding: 6px 12px; font-size: 11px;">
        🌓 THÈME
      </button>
    </div>
  </header>

  <!-- MASTER NAVIGATION BAR (10 CANONICAL SCREENS) -->
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

  <!-- MAIN HUD VIEWS CONTAINER -->
  <main class="main-container">

    <!-- =====================================================================
         SCREEN 1 : DASHBOARD HUD (HUNTER STATUS & VITALS)
         ===================================================================== -->
    <div id="view-dashboard" class="view-panel ${initialTab === "dashboard" ? "active" : ""}">
      
      <!-- System Notification Banner (Images 4 & 7) -->
      <div class="system-alert-banner">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="background: rgba(0, 240, 255, 0.2); border: 1px solid var(--neon-cyan); border-radius: 4px; padding: 3px 8px; font-size: 11px; font-weight: 800; font-family: var(--font-mono); color: var(--neon-cyan);">
            [!] ALERT
          </span>
          <span class="shiny-green" style="font-family: var(--font-display); font-size: 18px; font-weight: 800; letter-spacing: 2px;">
            [WELCOME, PLAYER.]
          </span>
          <span style="font-size: 12px; color: var(--text-secondary); margin-left: 6px;">
            Le Système du Monarque est synchronisé. Aucune pénalité active.
          </span>
        </div>
        <div style="font-size: 12px; font-family: var(--font-mono); color: var(--neon-cyan);">
          SCORE HARMONIQUE : <strong style="color: var(--imperial-gold); font-size: 16px;">Sh = ${harmonicScore}</strong>
        </div>
      </div>

      <div class="grid-2col">
        <!-- Left: Player Status & Vitals (Images 3 & 5) -->
        <div>
          <!-- Player Identity & Rank Card -->
          <div class="glass-card spotlight-card" style="padding: 24px; margin-bottom: 22px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px;">
              <div>
                <div style="font-size: 11px; letter-spacing: 2px; color: var(--neon-cyan); font-family: var(--font-mono); margin-bottom: 4px;">
                  STATUS // LE MONARQUE SOUVERAIN
                </div>
                <h1 class="shiny-text" style="font-size: 32px; font-weight: 900; font-family: var(--font-display); line-height: 1;">
                  ${player.name}
                </h1>
                <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                  ${player.title}
                </p>
              </div>

              <!-- Solo Leveling Rank Diamond Badge -->
              <div style="text-align: center; background: rgba(0, 81, 255, 0.3); border: 2px solid var(--neon-cyan); padding: 10px 18px; border-radius: var(--radius-md); box-shadow: 0 0 18px rgba(0, 240, 255, 0.35);">
                <div style="font-size: 10px; color: var(--neon-cyan); font-family: var(--font-display); letter-spacing: 1px;">RANG</div>
                <div class="shiny-gold" style="font-size: 32px; font-weight: 900; line-height: 1; font-family: var(--font-display);">${player.rank}</div>
              </div>
            </div>

            <!-- Level & XP Capsule Progress -->
            <div style="margin-top: 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono); margin-bottom: 6px;">
                <span style="color: var(--neon-cyan);">NIVEAU ${player.level} // PALIER ACTUEL</span>
                <span id="dash-xp-text" style="color: var(--text-white); font-weight: bold;">${player.currentXp} / ${player.nextLevelXp} XP (82%)</span>
              </div>
              <div class="capsule-slider-track">
                <div class="capsule-slider-fill capsule-fill-xp" id="dash-xp-bar" style="width: 82%;"></div>
              </div>
            </div>
          </div>

          <!-- True Solo Leveling Vital Gauges (Capsules from Image 3) -->
          <div class="glass-card spotlight-card" style="padding: 24px; margin-bottom: 22px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <span style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: var(--neon-cyan); font-family: var(--font-display);">
                ÉMETTEUR BIOPHYSIQUE SOUVERAIN (BORBÉLY & GANDEVIA)
              </span>
              <span class="radar-ping-badge" style="border-color: rgba(0, 255, 102, 0.4); color: var(--transcendent-green); font-size: 10px;">
                FATIGUE: 0% OPTIMAL
              </span>
            </div>

            <!-- HP Capsule Slider -->
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono); margin-bottom: 6px;">
                <span style="color: var(--transcendent-green); font-weight: bold;">+ HP // RÉSILIENCE BIOLOGIQUE</span>
                <span style="font-weight: bold;">${player.hp} / 100 (${player.hp}%)</span>
              </div>
              <div class="capsule-slider-track">
                <div class="capsule-slider-fill capsule-fill-hp" style="width: ${player.hp}%;"></div>
              </div>
            </div>

            <!-- MP Capsule Slider -->
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono); margin-bottom: 6px;">
                <span style="color: var(--neon-cyan); font-weight: bold;">⚡ MP // FOCUS COGNITIF INDOMPTABLE</span>
                <span style="font-weight: bold;">${player.mp} / 100 (${player.mp}%)</span>
              </div>
              <div class="capsule-slider-track">
                <div class="capsule-slider-fill capsule-fill-mp" style="width: ${player.mp}%;"></div>
              </div>
            </div>

            <!-- Sleep & Circadian Status -->
            <div style="display: flex; gap: 12px; margin-top: 14px; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary);">
              <div style="flex: 1; background: rgba(0, 240, 255, 0.06); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid rgba(0, 240, 255, 0.15);">
                PROCESS S (ÉVEIL) : <strong>${player.hoursAwake}H</strong>
              </div>
              <div style="flex: 1; background: rgba(0, 240, 255, 0.06); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid rgba(0, 240, 255, 0.15);">
                COUVRE-FEU FATIDIQUE : <strong style="color: var(--alert-crimson);">${player.curfewTime}</strong>
              </div>
            </div>
          </div>

          <!-- Octagonal Radar of the 8 Bases -->
          <div class="glass-card spotlight-card" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <span style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: var(--neon-cyan); font-family: var(--font-display);">
                RADAR DES 8 BASES DE VIE
              </span>
              <span class="shiny-gold" style="font-size: 14px; font-weight: bold; font-family: var(--font-mono);">
                Sh = ${harmonicScore}
              </span>
            </div>
            
            <div style="display: flex; justify-content: center; padding: 10px 0;">
              <svg width="290" height="250" viewBox="0 0 290 250">
                <polygon points="145,25 225,60 255,140 215,215 145,235 75,215 35,140 65,60" fill="none" stroke="rgba(56, 189, 248, 0.2)" stroke-width="1"/>
                <polygon points="145,55 200,80 220,140 190,190 145,205 100,190 70,140 90,80" fill="none" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1"/>
                <polygon points="145,70 195,90 210,140 185,180 145,190 110,180 85,140 100,90" fill="rgba(0, 240, 255, 0.25)" stroke="#00f0ff" stroke-width="2"/>
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

        <!-- Right Column: Quests & Active Blocks -->
        <div>
          <!-- Daily Quests List (Manhwa Image 2 Style) -->
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
                <div class="glass-card" style="padding: 16px; margin-bottom: 12px; background: rgba(3, 14, 38, 0.65); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: var(--text-white);">${q.title}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${q.description}</div>
                    <div style="font-size: 11px; color: var(--neon-cyan); margin-top: 6px; font-family: var(--font-mono);">
                      RÉCOMPENSE : +<strong>${q.xp} XP</strong> | +<strong>${q.crystals} 💎</strong>
                    </div>
                  </div>
                  <div>
                    ${
                      q.completed
                        ? `<span style="color: var(--transcendent-green); font-weight: bold; font-size: 12px; padding: 6px 14px; border: 1px solid var(--transcendent-green); border-radius: var(--radius-sm); background: rgba(0, 255, 102, 0.1);">ACCOMPLIE ✓</span>`
                        : `<button class="btn-cyber" onclick="openProofModal('${q.id}', '${q.title.replace(/'/g, "\\'")}', ${q.xp})">VALIDER</button>`
                    }
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>

          <!-- Active Circadian Block -->
          <div class="glass-card spotlight-card" style="padding: 24px; margin-bottom: 22px;">
            <div style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: var(--monarch-purple); font-family: var(--font-display); margin-bottom: 10px;">
              BLOC CIRCADIEN ACTIF // FOCUS SOUTENU
            </div>
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 6px; color: var(--text-white);">
              11:30 - 12:30 : 🚶 Pause Déjeuner & Restauration MP
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
              Marche régénératrice sans écran. Restauration de +15 MP pour le sprint de l'après-midi.
            </p>
            <div style="margin-top: 16px;">
              <button class="btn-cyber btn-gold" onclick="switchView('planner')">
                VOIR LE PLANNING TIME-BLOCKING COMPLET ➔
              </button>
            </div>
          </div>

          <!-- Last Socratic Evaluation -->
          <div class="glass-card spotlight-card" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: var(--imperial-gold); font-family: var(--font-display);">
                DERNIÈRE ÉVALUATION DE L'ARCHITECTE (GRILLE 20 PTS)
              </span>
              <span class="shiny-green" style="font-size: 22px; font-weight: 900; font-family: var(--font-display);">
                18.5 / 20
              </span>
            </div>
            <div style="font-size: 15px; font-weight: bold; margin-bottom: 6px; color: var(--text-white);">
              Sujet : Quantification INT8 & Moteur CTranslate2
            </div>
            <p style="font-size: 12px; color: var(--text-secondary); font-style: italic; line-height: 1.5;">
              "Démonstration rigoureuse du compromis latence/précision sur RTX 4070. Les tenseurs symétriques ont été parfaitement explicités."
            </p>
          </div>
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 2 : 120 SKILLS TREE (DAG)
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
            POINTS D'XP DISPONIBLES : 850 XP
          </div>
        </div>

        <!-- Filter tabs -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 22px;">
          <button class="btn-cyber" onclick="filterSkillGrid('ALL')">TOUTES (120)</button>
          <button class="btn-cyber" onclick="filterSkillGrid('AI_ENG')">IA & LLM (15)</button>
          <button class="btn-cyber" onclick="filterSkillGrid('CYBER')">CYBERSÉCURITÉ (15)</button>
          <button class="btn-cyber" onclick="filterSkillGrid('ACAD')">ACADÉMIQUE IA (15)</button>
          <button class="btn-cyber" onclick="filterSkillGrid('STR')">CALISTHÉNIE (15)</button>
          <button class="btn-cyber" onclick="filterSkillGrid('LNG')">ANGLAIS C1/C2 (15)</button>
          <button class="btn-cyber" onclick="filterSkillGrid('FIN')">FINANCES & BOURSES (15)</button>
        </div>

        <!-- Skills Grid -->
        <div class="grid-3col" id="skills-grid-container">
          ${SYSTEM_STATE.skillsList
            .map(
              (sk) => `
            <div class="glass-card spotlight-card skill-card-item" data-base="${sk.base}" style="padding: 18px; border-color: ${sk.status === "MASTERED" ? "rgba(0, 255, 102, 0.5)" : sk.status === "IN_PROGRESS" ? "var(--neon-cyan)" : "rgba(56, 189, 248, 0.2)"};">
              <div style="font-size: 11px; color: var(--imperial-gold); font-weight: bold; font-family: var(--font-mono);">
                ${sk.base} // TIER ${sk.tier} [${sk.status === "MASTERED" ? "MAÎTRISÉ 5/5" : sk.status === "IN_PROGRESS" ? "EN COURS 3/5" : "VERROUILLÉ"}]
              </div>
              <div style="font-size: 16px; font-weight: bold; margin: 6px 0; color: var(--text-white);">${sk.name}</div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${sk.dod}</p>
              <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                ${
                  sk.status === "MASTERED"
                    ? `<span style="font-size: 11px; color: var(--transcendent-green); font-weight: bold;">DOD VALIDÉE ✓ (+${sk.xp} XP)</span>`
                    : `<span style="font-size: 11px; color: var(--imperial-gold); font-family: var(--font-mono);">COÛT : ${sk.xp} XP</span>
                     <button class="btn-cyber" style="padding: 4px 10px; font-size: 11px;" onclick="unlockSkillNode('${sk.name.replace(/'/g, "\\'")}')">DÉVERROUILLER</button>`
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
      <!-- Emergency Quest Alert Box (Image 6) with Border Beam -->
      <div class="border-beam-box" style="margin-bottom: 24px;">
        <div class="border-beam-content" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="radar-ping-badge" style="border-color: rgba(255, 0, 60, 0.6); color: var(--alert-crimson);">
                [!] QUÊTE D'URGENCE DU SYSTÈME (RANG S)
              </span>
              <span style="font-size: 12px; color: var(--alert-crimson); font-weight: bold;">RÉVOLUTION OU ÉCHEC IRRÉVERSIBLE</span>
            </div>
            <div style="font-size: 24px; font-weight: 900; font-family: var(--font-mono); color: var(--alert-crimson); text-shadow: 0 0 15px rgba(255, 0, 60, 0.8);">
              [ 00:57:24 ]
            </div>
          </div>

          <h3 style="font-size: 20px; font-weight: 900; color: var(--text-white); margin-bottom: 8px; font-family: var(--font-display);">
            Audit de Sécurité : Faille Critique sur le SingleUserGuard
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
            Le Système détecte une vulnérabilité d'usurpation d'identité sur les endpoints du Chasseur. L'en-tête <code>x-player-id</code> doit être sanitisé immédiatement avant le verrouillage du récepteur.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="font-size: 12px; font-family: var(--font-mono); color: var(--transcendent-green);">
              GAIN : +500 XP | +100 CRISTAUX D'OMBRE 💎
            </div>
            <button class="btn-cyber btn-red" onclick="openProofModal('q-emergency-auth-bypass', 'Audit de Sécurité SingleUserGuard', 500)">
              SOUMETTRE LE COMMIT DE PATCH
            </button>
          </div>
        </div>
      </div>

      <!-- Quests Grid -->
      <div class="glass-card spotlight-card" style="padding: 26px;">
        <h3 class="shiny-text" style="font-size: 22px; font-weight: 900; font-family: var(--font-display); margin-bottom: 18px;">
          JOURNAL DES QUÊTES OBLIGATOIRES ACTIVES
        </h3>
        <div class="grid-2col">
          ${SYSTEM_STATE.quests
            .map(
              (q) => `
            <div class="glass-card spotlight-card" style="padding: 20px; background: rgba(3, 14, 38, 0.75);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span class="radar-ping-badge">${q.base} // ${q.type}</span>
                <span style="font-size: 12px; color: var(--imperial-gold); font-family: var(--font-mono);">+${q.xp} XP</span>
              </div>
              <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: var(--text-white);">${q.title}</h4>
              <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.4;">${q.description}</p>
              <div>
                ${
                  q.completed
                    ? `<div style="font-size: 12px; color: var(--transcendent-green); font-weight: bold;">ACCOMPLIE ✓ (PREUVE VÉRIFIÉE)</div>`
                    : `<button class="btn-cyber" onclick="openProofModal('${q.id}', '${q.title.replace(/'/g, "\\'")}', ${q.xp})">SOUMETTRE LA PREUVE</button>`
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
         SCREEN 4 : TIME-BLOCKING CIRCADIEN
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
          <div class="radar-ping-badge" style="border-color: rgba(0, 240, 255, 0.4); color: var(--neon-cyan);">
            RÈGLE D'OR : ZÉRO DISTRACTION HORS PAUSES
          </div>
        </div>

        <!-- Schedule Blocks Timeline -->
        <div>
          ${SYSTEM_STATE.plannerBlocks
            .map(
              (b) => `
            <div class="glass-card spotlight-card" style="padding: 16px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; ${b.status === "ACTIVE" ? "border-color: var(--neon-cyan); box-shadow: 0 0 20px rgba(0,240,255,0.4);" : ""}">
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
              <div>
                ${b.status === "COMPLETED" ? `<span style="color: var(--transcendent-green); font-size: 12px; font-weight: bold;">VALIDÉ ✓</span>` : ""}
                ${b.status === "ACTIVE" ? `<span class="radar-ping-badge" style="color: var(--neon-cyan);">EN COURS ⚡</span>` : ""}
                ${b.status === "UPCOMING" ? `<span style="color: var(--text-muted); font-size: 12px; font-family: var(--font-mono);">À VENIR</span>` : ""}
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 5 : SECOND BRAIN MARKDOWN VAULT
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
          <button class="btn-cyber" onclick="alert('Nouvelle note initialisée dans le coffre local.')">+ NOUVELLE NOTE</button>
        </div>

        <!-- Notes Search & Tags -->
        <div style="margin-bottom: 20px;">
          <input type="text" id="notes-search" placeholder="🔍 Rechercher dans le coffre (ex: FlashAttention, SVD, Buffer Overflow)..." style="width: 100%; background: rgba(3, 12, 34, 0.85); border: 1px solid var(--glass-inner-border); color: #fff; padding: 12px 16px; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 13px; outline: none;">
        </div>

        <div class="grid-2col">
          ${SYSTEM_STATE.notes
            .map(
              (n) => `
            <div class="glass-card spotlight-card" style="padding: 22px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span class="radar-ping-badge">${n.base}</span>
                <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${n.updatedAt.split("T")[0]}</span>
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
         SCREEN 6 : STATION VOCALE & ÉVALUATION SOCRATIQUE (FFT CANVAS)
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

        <!-- FFT Audio Spectrum Canvas Simulation -->
        <div class="glass-card" style="padding: 16px; margin-bottom: 22px; background: rgba(2, 8, 24, 0.85); text-align: center;">
          <div style="font-size: 11px; color: var(--neon-cyan); font-family: var(--font-mono); margin-bottom: 8px;">
            SPECTRE FRÉQUENTIEL FFT TEMPS RÉEL (64 BANDES // WEBAUDIO API)
          </div>
          <canvas id="audio-canvas" style="width: 100%; height: 140px; border-radius: var(--radius-sm);"></canvas>
        </div>

        <!-- Socratic Oral Defense Rubric -->
        <div class="glass-card spotlight-card" style="padding: 22px;">
          <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 14px; color: var(--neon-cyan); font-family: var(--font-display);">
            GRILLE D'ÉVALUATION ORALE SOCRATIQUE (20 POINTS)
          </h3>
          <div class="grid-2col">
            <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
              <div>🔹 <strong>Précision Conceptuelle & Mathématique :</strong> 6 / 6 pts</div>
              <div>🔹 <strong>Rigueur du Raisonnement & Falsifiabilité :</strong> 5 / 5 pts</div>
              <div>🔹 <strong>Clarté d'Élocution & Débit Cambridge C1 :</strong> 4.5 / 5 pts</div>
              <div>🔹 <strong>Pertinence des Exemples & Benchmarks :</strong> 3 / 4 pts</div>
            </div>
            <div style="text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">NOTE GLOBALE ESTIMÉE</div>
              <div class="shiny-green" style="font-size: 48px; font-weight: 900; font-family: var(--font-display); line-height: 1;">18.5 / 20</div>
              <div style="font-size: 12px; color: var(--transcendent-green); font-weight: bold; margin-top: 6px;">COMPÉTENCE VALIDÉE PAR L'ARCHITECTE ✓</div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 7 : VEILLE BOURSES & HACKATHONS DEERFLOW
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
          <button class="btn-cyber" onclick="alert('Scraping Deerflow déclenché. 4 nouvelles opportunités trouvées.')">🔄 SCRAPER NOUVELLES OPPORTUNITÉS</button>
        </div>

        <div class="grid-3col">
          ${SYSTEM_STATE.opportunities
            .map(
              (o) => `
            <div class="glass-card spotlight-card" style="padding: 20px;">
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
         SCREEN 8 : LA BOUTIQUE DES OMBRES (SHADOW SHOP)
         ===================================================================== -->
    <div id="view-shop" class="view-panel ${initialTab === "shop" ? "active" : ""}">
      <div class="glass-card spotlight-card" style="padding: 26px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 class="shiny-text" style="font-size: 26px; font-weight: 900; font-family: var(--font-display);">
              LA BOUTIQUE DES OMBRES (SHADOW SHOP)
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Convertissez vos Cristaux d'Ombre durement acquis en récompenses matérielles et logicielles.</p>
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
              <span style="font-size: 13px; color: var(--transcendent-green); font-weight: bold;">
                STATUT : CHASSEUR EN RÈGLE (AUCUN BLOCAGE ACTIF)
              </span>
            </div>
            <button class="btn-cyber btn-red" onclick="alert('Simulation protocole de pénalité : NextDNS appliqué.')">TESTER SIMULATION PÉNALITÉ</button>
          </div>

          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px;">
            En cas d'échec d'une quête journalière obligatoire à 22h00, le Système déclenche un verrouillage DNS automatique via NextDNS CLI sur tous les terminaux enregistrés.
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
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${SYSTEM_STATE.penalty.redemptionOptionA}</p>
            </div>
            <div class="glass-card" style="padding: 16px; border-color: rgba(0, 255, 102, 0.3);">
              <div style="font-size: 13px; font-weight: bold; color: var(--text-white); margin-bottom: 6px;">OPTION B : COURSE NOCTURNE GPS</div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${SYSTEM_STATE.penalty.redemptionOptionB}</p>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 10 : SALLE D'ENTRAÎNEMENT & VISION PAR ORDINATEUR
         ===================================================================== -->
    <div id="view-workout" class="view-panel ${initialTab === "workout" ? "active" : ""}">
      <div class="glass-card spotlight-card" style="padding: 26px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 class="shiny-text" style="font-size: 26px; font-weight: 900; font-family: var(--font-display);">
              SALLE D'ENTRAÎNEMENT & VISION PAR ORDINATEUR (MEDIAPIPE)
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Analyse cinématique des 33 repères squelettiques MediaPipe Pose WebAssembly.</p>
          </div>
          <button class="btn-cyber" id="cam-toggle-btn" onclick="toggleCamera()">📷 ACTIVER CAMÉRA</button>
        </div>

        <div class="grid-2col">
          <!-- Video Screen & Canvas Overlay -->
          <div class="glass-card" style="padding: 12px; background: rgba(1, 6, 18, 0.95); min-height: 380px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;">
            <video id="webcam-video" style="display: none; width: 100%; border-radius: var(--radius-sm);" autoplay playsinline></video>
            <div id="cam-placeholder" style="text-align: center; color: var(--text-muted); padding: 40px 20px;">
              <div style="font-size: 48px; margin-bottom: 12px;">📷</div>
              <div style="font-size: 15px; color: var(--text-white); font-weight: bold; margin-bottom: 6px;">Tracking Cinématique MediaPipe Prêt</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Cliquez sur "Activer Caméra" pour démarrer l'estimation de pose en temps réel.</div>
              <div style="font-size: 11px; margin-top: 10px; color: var(--neon-cyan); font-family: var(--font-mono);">
                Seuil strict de répétition : Flexion coude ≤ 75° ➔ Extension ≥ 160°
              </div>
            </div>
          </div>

          <!-- Routine Details & Reps Counter -->
          <div>
            <div class="glass-card spotlight-card" style="padding: 22px; margin-bottom: 18px;">
              <div style="font-size: 11px; color: var(--imperial-gold); font-weight: bold; font-family: var(--font-mono);">ROUTINE SÉLECTIONNÉE</div>
              <h3 style="font-size: 18px; font-weight: bold; margin: 4px 0; color: var(--text-white);">Routine Dos & Épaules (17 Étapes)</h3>
              <p style="font-size: 12px; color: var(--text-secondary);">Étape 3/17 : Pike Push-Ups stricts (focus deltoïdes)</p>
            </div>

            <!-- Big Reps Counter -->
            <div class="glass-card spotlight-card" style="padding: 26px; text-align: center; margin-bottom: 18px;">
              <div style="font-size: 12px; letter-spacing: 2px; color: var(--neon-cyan); font-family: var(--font-display);">
                RÉPÉTITIONS STRICTES COMPTABILISÉES
              </div>
              <div id="workout-rep-count" class="shiny-green" style="font-size: 72px; font-weight: 900; font-family: var(--font-display); line-height: 1.1; margin: 8px 0;">
                14 / 14
              </div>
              <div style="font-size: 13px; color: var(--transcendent-green); font-weight: bold;">
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

  <!-- Proof Submission Modal -->
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
        <input type="text" id="proof-input" placeholder="https://github.com/GeovanioH/LevelUp/commit/..." style="width: 100%; background: rgba(3, 12, 34, 0.9); border: 1px solid var(--neon-cyan); color: #fff; padding: 12px; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 13px; outline: none;">
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <button class="btn-cyber" onclick="closeProofModal()">ANNULER</button>
        <button class="btn-cyber btn-gold" onclick="submitQuestProof()">VALIDER AU NOM DU SYSTÈME</button>
      </div>
    </div>
  </div>

  <script>
    let activeQuestId = null;
    let activeQuestXp = 0;

    // Real-Time System Clock
    function updateClock() {
      const now = new Date();
      const el = document.getElementById('system-clock');
      if (el) el.textContent = now.toTimeString().split(' ')[0];
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Procedural Audio Synthesizer (Harmonic Chimes)
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

    // View Switcher (Client-side Routing)
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

      // Update URL without reload
      window.history.pushState({}, '', '/' + (viewId === 'dashboard' ? '' : viewId));
    }

    // Handle browser back/forward buttons
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

    // Modal Proof Functions
    function openProofModal(questId, title, xp) {
      activeQuestId = questId;
      activeQuestXp = xp;
      document.getElementById('modal-quest-title').textContent = title;
      document.getElementById('proof-modal').classList.add('open');
    }

    function closeProofModal() {
      document.getElementById('proof-modal').classList.remove('open');
    }

    function submitQuestProof() {
      const input = document.getElementById('proof-input').value.trim();
      if (!input) {
        alert("Une preuve valide (URL commit, Strava, attestation) est requise.");
        return;
      }

      playChime(784);
      alert("Quête validée avec succès ! +" + activeQuestXp + " XP et +20 Cristaux crédités.");
      closeProofModal();

      // Update HUD stats
      const xpEl = document.getElementById('dash-xp-text');
      if (xpEl) xpEl.textContent = "18650 / 22500 XP (83%)";
    }

    // Skills Filter
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

    function unlockSkillNode(name) {
      playChime(880);
      alert("Compétence déverrouillée au nom du Système : " + name + " ! -350 XP consommés.");
    }

    // Audio Visualizer Canvas Simulation (Screen 6)
    const audioCanvas = document.getElementById('audio-canvas');
    if (audioCanvas) {
      const ctx = audioCanvas.getContext('2d');
      audioCanvas.width = audioCanvas.parentElement.clientWidth || 500;
      audioCanvas.height = 140;

      function drawSpectrum() {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(2, 8, 24, 0.4)';
        ctx.fillRect(0, 0, audioCanvas.width, audioCanvas.height);

        const bars = 56;
        const barWidth = (audioCanvas.width / bars) - 2;
        for (let i = 0; i < bars; i++) {
          const h = Math.sin(Date.now() * 0.005 + i * 0.25) * 45 + 50 + Math.random() * 20;
          ctx.fillStyle = i % 2 === 0 ? '#00f0ff' : '#0284c7';
          ctx.fillRect(i * (barWidth + 2), audioCanvas.height - h, barWidth, h);
        }
        requestAnimationFrame(drawSpectrum);
      }
      drawSpectrum();
    }

    function toggleAudioRecording() {
      playChime(523);
      const btn = document.getElementById('record-toggle-btn');
      if (btn.textContent.includes('DÉMARRER')) {
        btn.textContent = '⏹ ARRÊTER & NOTER (ARCHITECTE)';
        btn.classList.add('btn-red');
      } else {
        btn.textContent = '🎙️ DÉMARRER ENREGISTREMENT';
        btn.classList.remove('btn-red');
        playChime(1046);
        alert('Évaluation Socratique terminée : Note 18.5/20 accordée par The Architect AI !');
      }
    }

    // Floating Mana Particles Simulation (React Bits)
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

    // React Bits Spotlight Card Dynamic Tracking
    document.addEventListener('mousemove', (e) => {
      document.querySelectorAll('.spotlight-card').forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });
    });

    // Notes Filter
    const notesInput = document.getElementById('notes-search');
    if (notesInput) {
      notesInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('#view-notes .glass-card.spotlight-card').forEach(c => {
          if (c.textContent.toLowerCase().includes(term)) {
            c.style.display = 'block';
          } else {
            c.style.display = 'none';
          }
        });
      });
    }

    // Shop Item Purchase
    function buyShopItem(id, name, cost) {
      playChime(880);
      alert("Article débloqué : " + name + " (-" + cost + " 💎)\\nCode de retrait : LVL-SHADOW-" + Date.now().toString(36).toUpperCase());
      const bal = document.getElementById('shop-balance-display');
      if (bal) bal.textContent = Math.max(0, parseInt(bal.textContent) - cost);
      const headBal = document.getElementById('header-crystals-val');
      if (headBal) headBal.textContent = Math.max(0, parseInt(headBal.textContent) - cost);
    }

    // Workout Rep Counter
    function addManualRep() {
      playChime(587);
      const el = document.getElementById('workout-rep-count');
      if (el) {
        const cur = parseInt(el.textContent.split('/')[0]) + 1;
        el.textContent = cur + " / 14";
      }
    }

    function validateWorkoutSet() {
      playChime(1046);
      alert("Série de calisthénie validée par le Système ! +120 XP STR attribués.");
    }

    // Toggle Camera Simulator
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
            alert('Caméra physique non détectée ou permission refusée. Mode simulation cinématique actif.');
          });
      }
    }

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
        version: "3.2.0",
      }),
    );
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
      `[LevelUp System HUD v3.2.0] Listening on http://0.0.0.0:${PORT}`,
    );
  });
}

module.exports = {
  server,
  SYSTEM_STATE,
  getHarmonicScore,
  renderFullApplication,
};
