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
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&family=Rajdhani:wght@500;600;700;900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-abyss: #05050A;
      --bg-surface: rgba(10, 15, 30, 0.85);
      --bg-surface-elevated: #0C1222;
      --border-cyan: #00E5FF;
      --border-glow: rgba(0, 229, 255, 0.35);
      --accent-blue: #0051FF;
      --accent-gold: #FFD700;
      --accent-red: #FF003C;
      --accent-green: #10B981;
      --accent-purple: #9D00FF;
      --text-white: #FFFFFF;
      --text-secondary: #94A3B8;
      --text-muted: #64748B;
      --font-display: 'Rajdhani', sans-serif;
      --font-body: 'Inter', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    [data-theme="light-awakening"] {
      --bg-abyss: #F1F5F9;
      --bg-surface: rgba(255, 255, 255, 0.95);
      --bg-surface-elevated: #FFFFFF;
      --border-cyan: #FF6B00;
      --border-glow: rgba(255, 107, 0, 0.35);
      --accent-blue: #EA580C;
      --accent-gold: #D97706;
      --accent-red: #DC2626;
      --accent-green: #059669;
      --accent-purple: #7C3AED;
      --text-white: #0F172A;
      --text-secondary: #334155;
      --text-muted: #64748B;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background-color: var(--bg-abyss);
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(0, 229, 255, 0.07) 0%, transparent 45%),
        radial-gradient(circle at 90% 80%, rgba(157, 0, 255, 0.07) 0%, transparent 45%),
        linear-gradient(rgba(0, 229, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 229, 255, 0.02) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
      color: var(--text-white);
      font-family: var(--font-body);
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Angular Holographic Cards */
    .hologram-box {
      background: var(--bg-surface);
      backdrop-filter: blur(14px);
      border: 1px solid var(--border-cyan);
      box-shadow: 0 0 15px var(--border-glow);
      clip-path: polygon(0 10px, 10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px));
      transition: all 0.25s ease;
    }

    .hologram-box:hover {
      box-shadow: 0 0 25px var(--border-cyan);
    }

    /* Master Top Bar */
    .master-header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-cyan);
      box-shadow: 0 4px 20px var(--border-glow);
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 3px;
      color: var(--border-cyan);
      text-shadow: 0 0 12px var(--border-cyan);
    }

    .pulse-dot {
      width: 10px;
      height: 10px;
      background: var(--border-cyan);
      border-radius: 50%;
      box-shadow: 0 0 12px var(--border-cyan);
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.3); } }

    .header-stats {
      display: flex;
      align-items: center;
      gap: 18px;
      font-family: var(--font-mono);
      font-size: 13px;
    }

    .stat-badge {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 5px 12px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Navigation Bar */
    .nav-bar {
      background: rgba(5, 10, 20, 0.95);
      border-bottom: 1px solid rgba(0, 229, 255, 0.2);
      display: flex;
      overflow-x: auto;
      padding: 0 20px;
      scrollbar-width: none;
    }

    .nav-tab {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 1.5px;
      padding: 14px 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 3px solid transparent;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .nav-tab:hover {
      color: var(--border-cyan);
      background: rgba(0, 229, 255, 0.05);
    }

    .nav-tab.active {
      color: var(--border-cyan);
      border-bottom-color: var(--border-cyan);
      background: rgba(0, 229, 255, 0.1);
      text-shadow: 0 0 8px var(--border-cyan);
    }

    .main-container {
      max-width: 1480px;
      margin: 25px auto;
      padding: 0 20px 40px;
    }

    .view-panel { display: none; }
    .view-panel.active { display: block; animation: fadeIn 0.25s ease; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

    /* Buttons */
    .btn-hologram {
      background: rgba(0, 229, 255, 0.15);
      border: 1px solid var(--border-cyan);
      color: var(--border-cyan);
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 1.5px;
      padding: 8px 16px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-hologram:hover {
      background: var(--border-cyan);
      color: #000;
      box-shadow: 0 0 15px var(--border-cyan);
    }

    .btn-gold {
      background: rgba(255, 215, 0, 0.15);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }

    .btn-gold:hover {
      background: var(--accent-gold);
      color: #000;
      box-shadow: 0 0 15px var(--accent-gold);
    }

    .btn-red {
      background: rgba(255, 0, 60, 0.2);
      border-color: var(--accent-red);
      color: var(--accent-red);
    }

    .btn-red:hover {
      background: var(--accent-red);
      color: #fff;
      box-shadow: 0 0 20px var(--accent-red);
    }

    /* Grids */
    .grid-2col { display: grid; grid-template-columns: 380px 1fr; gap: 24px; }
    .grid-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .grid-4col { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

    @media (max-width: 1024px) {
      .grid-2col, .grid-3col, .grid-4col { grid-template-columns: 1fr; }
    }

    /* Progress Bars */
    .progress-bar-wrap {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      height: 18px;
      border-radius: 9px;
      overflow: hidden;
      padding: 2px;
      margin-top: 6px;
    }

    .fill-hp { background: linear-gradient(90deg, #059669, #10B981, #34D399); height: 100%; border-radius: 7px; box-shadow: 0 0 10px #10B981; }
    .fill-mp { background: linear-gradient(90deg, #7C3AED, #00E5FF, #38BDF8); height: 100%; border-radius: 7px; box-shadow: 0 0 10px #00E5FF; }
    .fill-xp { background: linear-gradient(90deg, #D97706, #FFD700); height: 100%; border-radius: 7px; box-shadow: 0 0 10px #FFD700; }

    /* Modals */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px);
      display: none; justify-content: center; align-items: center; z-index: 200;
    }
    .modal-overlay.open { display: flex; }
    .modal-card { width: 90%; max-width: 600px; padding: 25px; }

    /* Audio Spectrum Canvas */
    #audio-canvas { width: 100%; height: 140px; background: rgba(0,0,0,0.6); border-radius: 6px; margin: 15px 0; }
  </style>
</head>
<body>

  <!-- Top Master Bar -->
  <header class="master-header">
    <div class="brand">
      <div class="pulse-dot"></div>
      <span>LEVELUP // THE SYSTEM</span>
    </div>

    <div class="header-stats">
      <div class="stat-badge">
        <span style="color: var(--accent-gold); font-weight: bold;">RANG ${player.rank}</span>
        <span>| Nv. ${player.level}</span>
      </div>
      <div class="stat-badge" style="color: var(--border-cyan);">
        <span>HP ${player.hp}%</span>
        <span>•</span>
        <span>MP ${player.mp}%</span>
      </div>
      <div class="stat-badge" style="color: var(--accent-gold);">
        <span>💎 ${player.shadowCrystals} OC</span>
      </div>
      <div class="stat-badge" style="color: #F97316;">
        <span>🔥 ${player.streakDays} Jours</span>
      </div>
      <div class="stat-badge" id="system-clock">
        00:00:00
      </div>

      <button class="btn-hologram" style="padding: 4px 10px;" onclick="toggleTheme()">🌓 Thème</button>
      <button class="btn-hologram" style="padding: 4px 10px;" onclick="playChime(1318)">🔔 Audio</button>
    </div>
  </header>

  <!-- Navigation Bar (10 Canonical Screens) -->
  <nav class="nav-bar">
    <button class="nav-tab ${initialTab === "dashboard" ? "active" : ""}" onclick="switchView('dashboard')">
      🛡️ HUD DASHBOARD
    </button>
    <button class="nav-tab ${initialTab === "skills" ? "active" : ""}" onclick="switchView('skills')">
      🌲 120 COMPÉTENCES (DAG)
    </button>
    <button class="nav-tab ${initialTab === "quests" ? "active" : ""}" onclick="switchView('quests')">
      📜 JOURNAL DES QUÊTES
    </button>
    <button class="nav-tab ${initialTab === "planner" ? "active" : ""}" onclick="switchView('planner')">
      ⏱️ TIME-BLOCKING
    </button>
    <button class="nav-tab ${initialTab === "notes" ? "active" : ""}" onclick="switchView('notes')">
      🧠 SECOND BRAIN (VAULT)
    </button>
    <button class="nav-tab ${initialTab === "audio" ? "active" : ""}" onclick="switchView('audio')">
      🎙️ STATION VOCALE & SOCRATIQUE
    </button>
    <button class="nav-tab ${initialTab === "opportunities" ? "active" : ""}" onclick="switchView('opportunities')">
      🌐 BOURSES & HACKATHONS
    </button>
    <button class="nav-tab ${initialTab === "shop" ? "active" : ""}" onclick="switchView('shop')">
      🏪 SHADOW SHOP
    </button>
    <button class="nav-tab ${initialTab === "penalty" ? "active" : ""}" onclick="switchView('penalty')">
      ☠️ ZONE DE PÉNALITÉ
    </button>
    <button class="nav-tab ${initialTab === "workout" ? "active" : ""}" onclick="switchView('workout')">
      📹 CALISTHÉNIE CV
    </button>
  </nav>

  <main class="main-container">

    <!-- =====================================================================
         SCREEN 1 : DASHBOARD HUD
         ===================================================================== -->
    <div id="view-dashboard" class="view-panel ${initialTab === "dashboard" ? "active" : ""}">
      <div class="grid-2col">
        
        <!-- Left: Player Profile & Vitals -->
        <div>
          <!-- Player Identity Card -->
          <div class="hologram-box" style="padding: 22px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <div>
                <div style="font-size: 11px; letter-spacing: 2px; color: var(--border-cyan);">LE MONARQUE SOUVERAIN</div>
                <h1 style="font-size: 26px; font-weight: 900; font-family: var(--font-display);">${player.name}</h1>
                <p style="font-size: 12px; color: var(--text-muted); font-style: italic;">${player.title}</p>
              </div>
              <div style="text-align: center; background: rgba(0, 81, 255, 0.25); border: 2px solid var(--border-cyan); padding: 8px 16px; border-radius: 6px;">
                <div style="font-size: 10px; color: var(--border-cyan); font-family: var(--font-display);">RANG</div>
                <div style="font-size: 28px; font-weight: 900; line-height: 1;">${player.rank}</div>
              </div>
            </div>

            <!-- XP Progression Bar -->
            <div style="margin-top: 15px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono);">
                <span>PROGRESSION DU PALIER</span>
                <span id="dash-xp-text">${player.currentXp} / ${player.nextLevelXp} XP (82%)</span>
              </div>
              <div class="progress-bar-wrap">
                <div class="fill-xp" id="dash-xp-bar" style="width: 82%;"></div>
              </div>
            </div>
          </div>

          <!-- Vital Gauges (Borbély & Gandevia Model) -->
          <div class="hologram-box" style="padding: 22px; margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: bold; letter-spacing: 1.5px; color: var(--border-cyan); margin-bottom: 12px;">
              ÉTAT BIOPHYSIQUE SOUVERAIN (BORBÉLY & GANDEVIA)
            </div>
            
            <div style="background: rgba(0, 229, 255, 0.08); border: 1px solid var(--border-cyan); padding: 8px 12px; border-radius: 4px; font-size: 11px; font-weight: bold; color: var(--border-cyan); text-align: center; margin-bottom: 16px;">
              RÉSILIENCE BIOLOGIQUE MAXIMALE & FOCUS COGNITIF INDOMPTABLE
            </div>

            <div style="margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono);">
                <span style="color: var(--accent-green); font-weight: bold;">HP // RÉSILIENCE BIOLOGIQUE</span>
                <span>${player.hp} / 100 (${player.hp}%)</span>
              </div>
              <div class="progress-bar-wrap">
                <div class="fill-hp" style="width: ${player.hp}%;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono);">
                <span style="color: var(--border-cyan); font-weight: bold;">MP // FOCUS COGNITIF</span>
                <span>${player.mp} / 100 (${player.mp}%)</span>
              </div>
              <div class="progress-bar-wrap">
                <div class="fill-mp" style="width: ${player.mp}%;"></div>
              </div>
            </div>
          </div>

          <!-- Octagonal Radar SVG -->
          <div class="hologram-box" style="padding: 22px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 12px; font-weight: bold; letter-spacing: 1.5px; color: var(--border-cyan);">RADAR DES 8 BASES DE VIE</span>
              <span style="font-size: 12px; color: var(--accent-gold); font-family: var(--font-mono);">Sh = ${harmonicScore}</span>
            </div>
            <div style="display: flex; justify-content: center;">
              <svg width="280" height="240" viewBox="0 0 280 240">
                <polygon points="140,20 220,55 250,135 210,210 140,230 70,210 30,135 60,55" fill="none" stroke="rgba(0,229,255,0.15)" stroke-width="1"/>
                <polygon points="140,50 195,75 215,135 185,185 140,200 95,185 65,135 85,75" fill="none" stroke="rgba(0,229,255,0.25)" stroke-width="1"/>
                <polygon points="140,65 190,85 205,135 180,175 140,185 105,175 80,135 95,85" fill="rgba(0,229,255,0.25)" stroke="#00E5FF" stroke-width="2"/>
                <text x="140" y="15" fill="#00E5FF" font-size="10" font-family="monospace" text-anchor="middle">ACAD (55)</text>
                <text x="235" y="55" fill="#00E5FF" font-size="10" font-family="monospace">AI (62)</text>
                <text x="255" y="140" fill="#00E5FF" font-size="10" font-family="monospace">CYBER (48)</text>
                <text x="220" y="225" fill="#00E5FF" font-size="10" font-family="monospace">EXP (42)</text>
                <text x="140" y="240" fill="#00E5FF" font-size="10" font-family="monospace" text-anchor="middle">LNG (50)</text>
                <text x="45" y="225" fill="#00E5FF" font-size="10" font-family="monospace">FIN (38)</text>
                <text x="5" y="140" fill="#00E5FF" font-size="10" font-family="monospace">STR (52)</text>
                <text x="35" y="55" fill="#00E5FF" font-size="10" font-family="monospace">DIS (65)</text>
              </svg>
            </div>
          </div>
        </div>

        <!-- Right: Quests & Next Blocks -->
        <div>
          <!-- Daily Quests List -->
          <div class="hologram-box" style="padding: 22px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <span style="font-size: 14px; font-weight: bold; letter-spacing: 1.5px; color: var(--border-cyan);">QUÊTES OBLIGATOIRES DU JOUR</span>
              <span style="font-size: 12px; color: var(--accent-red); font-weight: bold;">COUVRE-FEU : 22H00</span>
            </div>

            <div id="dash-quests-container">
              ${SYSTEM_STATE.quests
                .map(
                  (q) => `
                <div class="hologram-box" style="padding: 14px; margin-bottom: 12px; background: rgba(0,0,0,0.4); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">${q.title}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${q.description}</div>
                    <div style="font-size: 11px; color: var(--border-cyan); margin-top: 4px; font-family: var(--font-mono);">
                      GAIN : +${q.xp} XP | +${q.crystals} CRISTAUX 💎
                    </div>
                  </div>
                  <div>
                    ${
                      q.completed
                        ? `<span style="color: var(--accent-green); font-weight: bold; font-size: 12px; padding: 6px 12px; border: 1px solid var(--accent-green); border-radius: 4px;">ACCOMPLIE ✓</span>`
                        : `<button class="btn-hologram" onclick="openProofModal('${q.id}', '${q.title}', ${q.xp})">VALIDER</button>`
                    }
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>

          <!-- Next Deep Work Block -->
          <div class="hologram-box" style="padding: 22px; margin-bottom: 24px;">
            <div style="font-size: 13px; font-weight: bold; letter-spacing: 1.5px; color: var(--accent-purple); margin-bottom: 10px;">
              BLOC CIRCADIEN ACTIF // FOCUS SOUTENU
            </div>
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 6px;">11:30 - 12:30 : 🚶 Pause Déjeuner & Restauration MP</div>
            <p style="font-size: 13px; color: var(--text-secondary);">Marche régénératrice sans écran. Restauration de +15 MP pour le sprint de l'après-midi.</p>
            <div style="margin-top: 15px;">
              <button class="btn-hologram btn-gold" onclick="switchView('planner')">VOIR LE PLANNING TIME-BLOCKING COMPLET ➔</button>
            </div>
          </div>

          <!-- Last Socratic Evaluation -->
          <div class="hologram-box" style="padding: 22px;">
            <div style="font-size: 13px; font-weight: bold; letter-spacing: 1.5px; color: var(--accent-gold); margin-bottom: 8px;">
              DERNIÈRE ÉVALUATION DE L'ARCHITECTE (GRILLE 20 PTS)
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 16px; font-weight: bold;">Sujet : Quantification INT8 & Moteur CTranslate2</span>
              <span style="font-size: 20px; font-weight: 900; color: var(--accent-green); font-family: var(--font-display);">18.5 / 20</span>
            </div>
            <p style="font-size: 12px; color: var(--text-secondary); font-style: italic;">
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
      <div class="hologram-box" style="padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <div>
            <h2 style="font-size: 24px; font-weight: 900; font-family: var(--font-display); color: var(--border-cyan);">
              ARBRE DES 120 COMPÉTENCES CANONIQUES (DAG)
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Graphe orienté acyclique strict réparti sur les 8 Piliers de l'Éveillé.</p>
          </div>
          <div class="btn-hologram btn-gold">
            POINTS D'XP DISPONIBLES : 850 XP
          </div>
        </div>

        <!-- Filter tabs -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
          <button class="btn-hologram" onclick="filterSkillGrid('ALL')">TOUTES (120)</button>
          <button class="btn-hologram" onclick="filterSkillGrid('AI_ENG')">IA & LLM (15)</button>
          <button class="btn-hologram" onclick="filterSkillGrid('CYBER')">CYBERSÉCURITÉ (15)</button>
          <button class="btn-hologram" onclick="filterSkillGrid('ACAD')">ACADÉMIQUE IA (15)</button>
          <button class="btn-hologram" onclick="filterSkillGrid('STR')">CALISTHÉNIE (15)</button>
          <button class="btn-hologram" onclick="filterSkillGrid('LNG')">ANGLAIS C1/C2 (15)</button>
          <button class="btn-hologram" onclick="filterSkillGrid('FIN')">FINANCES & BOURSES (15)</button>
        </div>

        <!-- Skills Grid -->
        <div class="grid-3col" id="skills-grid-container">
          <div class="hologram-box" style="padding: 16px; border-color: var(--accent-green);">
            <div style="font-size: 10px; color: var(--accent-gold); font-weight: bold;">AI_ENG // TIER 1 [MAÎTRISÉ 5/5]</div>
            <div style="font-size: 16px; font-weight: bold; margin: 4px 0;">Transformers & Scaled Dot-Product</div>
            <p style="font-size: 12px; color: var(--text-secondary);">Implémentation manuelle du mécanisme QKV sans couche nn.MultiheadAttention.</p>
            <div style="margin-top: 10px; font-size: 11px; color: var(--accent-green); font-weight: bold;">DOD VALIDÉE ✓ (+200 XP)</div>
          </div>

          <div class="hologram-box" style="padding: 16px; border-color: var(--accent-green);">
            <div style="font-size: 10px; color: var(--accent-gold); font-weight: bold;">CYBER // TIER 1 [MAÎTRISÉ 5/5]</div>
            <div style="font-size: 16px; font-weight: bold; margin: 4px 0;">Chiffrement AES-256-GCM & Argon2id</div>
            <p style="font-size: 12px; color: var(--text-secondary);">Protection inviolable des flux vocaux et intégrité tamper-proof.</p>
            <div style="margin-top: 10px; font-size: 11px; color: var(--accent-green); font-weight: bold;">DOD VALIDÉE ✓ (+180 XP)</div>
          </div>

          <div class="hologram-box" style="padding: 16px; border-color: var(--border-cyan);">
            <div style="font-size: 10px; color: var(--accent-gold); font-weight: bold;">STR // TIER 2 [EN COURS 3/5]</div>
            <div style="font-size: 16px; font-weight: bold; margin: 4px 0;">Routine Dos & Épaules 17 Étapes</div>
            <p style="font-size: 12px; color: var(--text-secondary);">Contrôle cinématique MediaPipe WASM : 14 Pike Push-Ups stricts (≤75° à ≥160°).</p>
            <div style="margin-top: 10px;"><button class="btn-hologram" onclick="switchView('workout')">LANCER ENTRAÎNEMENT CV</button></div>
          </div>

          <div class="hologram-box" style="padding: 16px; border-color: var(--border-cyan);">
            <div style="font-size: 10px; color: var(--accent-gold); font-weight: bold;">LNG // TIER 2 [EN COURS 2/5]</div>
            <div style="font-size: 16px; font-weight: bold; margin: 4px 0;">Cambridge English C1 Advanced (CAE)</div>
            <p style="font-size: 12px; color: var(--text-secondary);">Listening & Speaking sans hésitation lexicale devant l'Architecte.</p>
            <div style="margin-top: 10px;"><button class="btn-hologram" onclick="switchView('audio')">PASSER SOUTENANCE ORALE</button></div>
          </div>

          <div class="hologram-box" style="padding: 16px; border-color: var(--border-cyan);">
            <div style="font-size: 10px; color: var(--accent-gold); font-weight: bold;">FIN // TIER 1 [EN COURS 1/5]</div>
            <div style="font-size: 16px; font-weight: bold; margin: 4px 0;">Veille Bourses d'Excellence Deerflow</div>
            <p style="font-size: 12px; color: var(--text-secondary);">Scraping automatisé des opportunités Eiffel et Erasmus Mundus.</p>
            <div style="margin-top: 10px;"><button class="btn-hologram" onclick="switchView('opportunities')">CONSULTER KANBAN</button></div>
          </div>

          <div class="hologram-box" style="padding: 16px; opacity: 0.6; border-color: rgba(255,255,255,0.2);">
            <div style="font-size: 10px; color: var(--text-muted); font-weight: bold;">AI_ENG // TIER 4 [VERROUILLÉ]</div>
            <div style="font-size: 16px; font-weight: bold; margin: 4px 0;">Essaim Multi-Agents & Swarm Raft-Lite</div>
            <p style="font-size: 12px; color: var(--text-secondary);">Déploiement de Bellion, Igris, Beru et Iron. Requis : Rang B.</p>
            <div style="margin-top: 10px; font-size: 11px; color: var(--text-muted);">🔒 VERROUILLÉ (RANG B REQUIS)</div>
          </div>
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 3 : QUESTS JOURNAL
         ===================================================================== -->
    <div id="view-quests" class="view-panel ${initialTab === "quests" ? "active" : ""}">
      <!-- Emergency Quest Alert Box -->
      <div class="hologram-box" style="padding: 22px; margin-bottom: 24px; border-color: var(--accent-red); background: rgba(255, 0, 60, 0.08); box-shadow: 0 0 25px rgba(255, 0, 60, 0.35);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">🚨</span>
            <div>
              <div style="font-size: 12px; font-weight: 900; color: var(--accent-red); letter-spacing: 2px;">AVERTISSEMENT DU SYSTÈME : QUÊTE D'URGENCE</div>
              <h3 style="font-size: 18px; font-weight: bold;">Audit de Sécurité : Faille Critique SingleUserGuard</h3>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--text-secondary);">COMPTE À REBOURS AVANT PÉNALITÉ</div>
            <div style="font-size: 22px; font-weight: 900; color: var(--accent-red); font-family: var(--font-mono);">00:58:12</div>
          </div>
        </div>
        <div style="margin-top: 12px; font-size: 13px; color: var(--text-secondary);">
          Une tentative de contournement a été détectée sur le middleware. Rédigez le test d'étanchéité Vitest et soumettez le lien GitHub.
        </div>
        <div style="margin-top: 16px;">
          <button class="btn-hologram btn-red" onclick="openProofModal('q-emergency-auth-bypass', 'Audit de Sécurité SingleUserGuard', 500)">SOUMETTRE LE COMMIT GITHUB (+500 XP)</button>
        </div>
      </div>

      <!-- Quests Catalog by Type -->
      <div class="hologram-box" style="padding: 24px;">
        <h2 style="font-size: 20px; font-weight: 900; font-family: var(--font-display); color: var(--border-cyan); margin-bottom: 18px;">
          REGISTRE DES 5 CATÉGORIES DE QUÊTES DU CHASSEUR
        </h2>

        <div style="display: grid; gap: 14px;">
          ${SYSTEM_STATE.quests
            .map(
              (q) => `
            <div class="hologram-box" style="padding: 16px; background: rgba(0,0,0,0.4); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; background: ${q.type === "EMERGENCY" ? "var(--accent-red)" : "var(--accent-blue)"};">${q.type}</span>
                  <span style="font-size: 15px; font-weight: bold;">${q.title}</span>
                </div>
                <p style="font-size: 12px; color: var(--text-secondary);">${q.description}</p>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 12px; color: var(--accent-gold); font-weight: bold; margin-bottom: 6px;">+${q.xp} XP | +${q.crystals} 💎</div>
                ${
                  q.completed
                    ? `<span style="color: var(--accent-green); font-size: 12px; font-weight: bold;">COMPLÉTÉE ✓</span>`
                    : `<button class="btn-hologram" onclick="openProofModal('${q.id}', '${q.title}', ${q.xp})">SOUMETTRE PREUVE</button>`
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
         SCREEN 4 : TIME-BLOCKING PLANNER
         ===================================================================== -->
    <div id="view-planner" class="view-panel ${initialTab === "planner" ? "active" : ""}">
      <div class="hologram-box" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 24px; font-weight: 900; font-family: var(--font-display); color: var(--border-cyan);">
              PLANIFICATEUR CIRCADIEN (TIME-BLOCKING STRICT)
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Structure de journée inviolable de 06:00 à 22:00 sans dispersion cognitive.</p>
          </div>
          <button class="btn-hologram" onclick="alert('Session Deep Work 90 min configurée dans l\'agenda.')">+ AJOUTER UN BLOC</button>
        </div>

        <div style="display: grid; gap: 12px;">
          ${SYSTEM_STATE.plannerBlocks
            .map(
              (b) => `
            <div class="hologram-box" style="padding: 14px 20px; background: rgba(0,0,0,0.5); display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${b.status === "COMPLETED" ? "var(--accent-green)" : b.status === "ACTIVE" ? "var(--border-cyan)" : "var(--text-muted)"};">
              <div style="display: flex; align-items: center; gap: 20px;">
                <span style="font-family: var(--font-mono); font-size: 13px; color: var(--border-cyan); min-width: 110px;">${b.time}</span>
                <div>
                  <div style="font-size: 15px; font-weight: bold;">${b.title}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Pilier : \`${b.base}\` | Type : ${b.type}</div>
                </div>
              </div>
              <div>
                <span style="font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 4px; ${b.status === "COMPLETED" ? "color: var(--accent-green); border: 1px solid var(--accent-green);" : b.status === "ACTIVE" ? "color: var(--border-cyan); border: 1px solid var(--border-cyan); background: rgba(0,229,255,0.1);" : "color: var(--text-muted); border: 1px solid var(--text-muted);"}">
                  ${b.status}
                </span>
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
      <div class="hologram-box" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 24px; font-weight: 900; font-family: var(--font-display); color: var(--border-cyan);">
              CERVEAU NUMÉRIQUE // SECOND BRAIN (VAULT MARKDOWN)
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Coffre-fort de connaissances synchronisé Obsidian, indexation pg_trgm et KaTeX.</p>
          </div>
          <button class="btn-hologram" onclick="alert('Nouvelle note initialisée dans /vault/AI_ENG/')">+ NOUVELLE NOTE</button>
        </div>

        <div class="grid-2col">
          <!-- Left: Vault Tree & Notes List -->
          <div>
            <div style="font-size: 12px; font-weight: bold; color: var(--border-cyan); margin-bottom: 10px;">ARBORESCENCE DU VAULT</div>
            <div style="display: grid; gap: 8px;">
              ${SYSTEM_STATE.notes
                .map(
                  (n) => `
                <div class="hologram-box" style="padding: 12px; cursor: pointer; background: rgba(0,0,0,0.5);" onclick="loadNote('${n.id}')">
                  <div style="font-size: 10px; color: var(--accent-gold); font-family: var(--font-mono);">${n.base} // [[${n.tags.join(", ")}]]</div>
                  <div style="font-size: 13px; font-weight: bold; margin-top: 2px;">${n.title}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>

          <!-- Right: Note Editor & Markdown Viewer -->
          <div class="hologram-box" style="padding: 20px; background: rgba(5,10,20,0.9);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,229,255,0.2); padding-bottom: 10px; margin-bottom: 15px;">
              <span id="note-title-display" style="font-size: 16px; font-weight: bold; color: var(--border-cyan);">
                ${SYSTEM_STATE.notes[0].title}
              </span>
              <button class="btn-hologram" onclick="saveNote()">💾 SAUVEGARDER</button>
            </div>
            
            <textarea id="note-editor-content" style="width: 100%; height: 280px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #fff; font-family: var(--font-mono); font-size: 12px; padding: 12px; line-height: 1.6; resize: vertical;">${SYSTEM_STATE.notes[0].content}</textarea>

            <div style="margin-top: 15px; font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between;">
              <span>Tags : #transformers #cuda #deep-learning</span>
              <span style="color: var(--accent-green);">✓ Synchronisé avec Obsidian & PostgreSQL</span>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 6 : AUDIO HUB & SOCRATIC EVALUATION
         ===================================================================== -->
    <div id="view-audio" class="view-panel ${initialTab === "audio" ? "active" : ""}">
      <div class="hologram-box" style="padding: 24px;">
        <h2 style="font-size: 24px; font-weight: 900; font-family: var(--font-display); color: var(--border-cyan); margin-bottom: 8px;">
          STATION VOCALE & ÉVALUATION SOCRATIQUE DE L'ARCHITECTE
        </h2>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">
          Microphone Yeti Pro connecté. Enregistrement direct analysé par Faster-Whisper CUDA INT8 et noté sur la grille de 20 points.
        </p>

        <div class="grid-2col">
          <!-- Left: Audio Controller & Spectrum Canvas -->
          <div>
            <div style="margin-bottom: 12px;">
              <label style="font-size: 12px; color: var(--border-cyan); display: block; margin-bottom: 4px;">DISCIPLINE ÉVALUÉE :</label>
              <select id="eval-subject-select" style="width: 100%; background: #0A0F1E; border: 1px solid var(--border-cyan); color: #fff; padding: 10px; border-radius: 4px; font-family: var(--font-body);">
                <option value="AI_ENG">Intelligence Artificielle & Deep Learning (AI_ENG)</option>
                <option value="CYBER">Cybersécurité Offensive & Pentest (CYBER)</option>
                <option value="LNG">Anglais C1/C2 Cambridge Oral (LNG)</option>
                <option value="ACAD">Mathématiques & Algèbre Linéaire (ACAD)</option>
              </select>
            </div>

            <canvas id="audio-canvas"></canvas>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
              <button class="btn-hologram" id="record-btn" onclick="toggleAudioRecording()">🎙️ DÉMARRER ENREGISTREMENT</button>
              <span id="record-timer" style="font-family: var(--font-mono); font-size: 16px; color: var(--accent-red);">00:00 / 03:00</span>
              <button class="btn-hologram btn-gold" onclick="submitAudioEvaluation()">SOUMETTRE À L'ARCHITECTE</button>
            </div>
          </div>

          <!-- Right: Evaluation Report Card -->
          <div class="hologram-box" style="padding: 20px; background: rgba(5,10,20,0.85);" id="eval-result-card">
            <div style="font-size: 12px; font-weight: bold; letter-spacing: 1.5px; color: var(--accent-gold); margin-bottom: 6px;">
              RAPPORT DE SOUTENANCE OFFICIEL
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <span style="font-size: 18px; font-weight: bold;">Note de Synthèse Socratique :</span>
              <span style="font-size: 28px; font-weight: 900; color: var(--accent-green); font-family: var(--font-display);">18.5 / 20</span>
            </div>

            <div style="display: grid; gap: 8px; font-size: 12px; margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between;">
                <span>• Exactitude & Précision des Démonstrations :</span>
                <strong style="color: var(--border-cyan);">5.5 / 6.0</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>• Richesse Lexicale & Terminologie Spécialisée :</span>
                <strong style="color: var(--border-cyan);">4.8 / 5.0</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>• Clarté Rhétorique & Transition Logique :</span>
                <strong style="color: var(--border-cyan);">4.2 / 5.0</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>• Implication Pratique & Ingénierie Réelle :</span>
                <strong style="color: var(--border-cyan);">4.0 / 4.0</strong>
              </div>
            </div>

            <div style="background: rgba(0,0,0,0.4); border-left: 3px solid var(--accent-gold); padding: 10px; font-size: 12px; color: var(--text-secondary); font-style: italic;">
              "Démonstration fluide et sans hésitation conceptuelle. Les repères matriciels sont irréprochables. Continuez à appliquer ce niveau de rigueur pour l'épreuve de Rang C."
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 7 : OPPORTUNITIES & DEERFLOW KANBAN
         ===================================================================== -->
    <div id="view-opportunities" class="view-panel ${initialTab === "opportunities" ? "active" : ""}">
      <div class="hologram-box" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 24px; font-weight: 900; font-family: var(--font-display); color: var(--border-cyan);">
              VEILLE BOURSES & HACKATHONS (DEERFLOW AI)
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Scraper Playwright actif sur Campus France, Devpost et plateformes universitaires.</p>
          </div>
          <div class="btn-hologram btn-gold">
            VALEUR TOTALE POURSUIVIE : 48 000 €
          </div>
        </div>

        <div class="grid-3col">
          <!-- Column 1: Detected -->
          <div class="hologram-box" style="padding: 16px; background: rgba(0,0,0,0.4);">
            <div style="font-size: 13px; font-weight: bold; color: var(--border-cyan); margin-bottom: 12px; border-bottom: 1px solid rgba(0,229,255,0.2); padding-bottom: 6px;">
              NOUVELLES DÉTECTÉES (${SYSTEM_STATE.opportunities.filter((o) => o.status === "NOUVELLE").length})
            </div>
            ${SYSTEM_STATE.opportunities
              .filter((o) => o.status === "NOUVELLE")
              .map(
                (o) => `
              <div class="hologram-box" style="padding: 12px; margin-bottom: 10px; background: rgba(10,15,30,0.7);">
                <span style="font-size: 9px; padding: 2px 6px; background: var(--accent-blue); border-radius: 3px;">${o.type}</span>
                <div style="font-size: 14px; font-weight: bold; margin: 4px 0;">${o.title}</div>
                <div style="font-size: 12px; color: var(--accent-gold); font-weight: bold;">Dotation : ${o.amount}</div>
                <div style="font-size: 11px; color: var(--text-muted);">Échéance : ${o.deadline}</div>
                <div style="margin-top: 10px;"><a href="${o.url}" target="_blank" class="btn-hologram" style="padding: 4px 10px; font-size: 10px; text-decoration: none;">POSTULER ↗</a></div>
              </div>
            `,
              )
              .join("")}
          </div>

          <!-- Column 2: In Progress -->
          <div class="hologram-box" style="padding: 16px; background: rgba(0,0,0,0.4);">
            <div style="font-size: 13px; font-weight: bold; color: var(--accent-gold); margin-bottom: 12px; border-bottom: 1px solid rgba(255,215,0,0.2); padding-bottom: 6px;">
              DOSSIERS EN COURS (${SYSTEM_STATE.opportunities.filter((o) => o.status === "EN_COURS").length})
            </div>
            ${SYSTEM_STATE.opportunities
              .filter((o) => o.status === "EN_COURS")
              .map(
                (o) => `
              <div class="hologram-box" style="padding: 12px; margin-bottom: 10px; background: rgba(10,15,30,0.7);">
                <span style="font-size: 9px; padding: 2px 6px; background: var(--accent-gold); color: #000; font-weight: bold; border-radius: 3px;">${o.type}</span>
                <div style="font-size: 14px; font-weight: bold; margin: 4px 0;">${o.title}</div>
                <div style="font-size: 12px; color: var(--accent-gold); font-weight: bold;">Prix : ${o.amount}</div>
                <div style="font-size: 11px; color: var(--text-muted);">Échéance : ${o.deadline}</div>
                <div style="margin-top: 10px;"><button class="btn-hologram" style="padding: 4px 10px; font-size: 10px;" onclick="switchView('planner')">VOIR BLOCS DÉDIÉS</button></div>
              </div>
            `,
              )
              .join("")}
          </div>

          <!-- Column 3: Submitted -->
          <div class="hologram-box" style="padding: 16px; background: rgba(0,0,0,0.4);">
            <div style="font-size: 13px; font-weight: bold; color: var(--accent-green); margin-bottom: 12px; border-bottom: 1px solid rgba(16,185,129,0.2); padding-bottom: 6px;">
              CANDIDATURES SOUMISES (${SYSTEM_STATE.opportunities.filter((o) => o.status === "SOUMIS").length})
            </div>
            ${SYSTEM_STATE.opportunities
              .filter((o) => o.status === "SOUMIS")
              .map(
                (o) => `
              <div class="hologram-box" style="padding: 12px; margin-bottom: 10px; background: rgba(10,15,30,0.7);">
                <span style="font-size: 9px; padding: 2px 6px; background: var(--accent-green); border-radius: 3px;">${o.type}</span>
                <div style="font-size: 14px; font-weight: bold; margin: 4px 0;">${o.title}</div>
                <div style="font-size: 12px; color: var(--accent-green); font-weight: bold;">Statut : Dossier Confirmé</div>
                <div style="font-size: 11px; color: var(--text-muted);">Résultat attendu : Fin Décembre 2026</div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 8 : SHADOW SHOP
         ===================================================================== -->
    <div id="view-shop" class="view-panel ${initialTab === "shop" ? "active" : ""}">
      <div class="hologram-box" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 24px; font-weight: 900; font-family: var(--font-display); color: var(--border-cyan);">
              LA BOUTIQUE DES OMBRES // SHADOW SHOP
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Convertissez vos Cristaux d'Ombres en équipement matériel et récompenses de prestige.</p>
          </div>
          <div class="btn-hologram btn-gold" style="font-size: 16px;">
            💎 SOLDE : <span id="shop-balance-display">${player.shadowCrystals}</span> CRISTAUX D'OMBRES
          </div>
        </div>

        <div class="grid-3col" style="margin-bottom: 24px;">
          ${SYSTEM_STATE.shopItems
            .map(
              (item) => `
            <div class="hologram-box" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; background: var(--accent-purple);">${item.category}</span>
                  <span style="font-size: 11px; color: var(--border-cyan); font-weight: bold;">RANG ${item.rank} REQUIS</span>
                </div>
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 6px;">${item.name}</h3>
                <p style="font-size: 12px; color: var(--text-secondary);">${item.desc}</p>
              </div>
              <div style="margin-top: 18px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 16px; font-weight: 900; color: var(--accent-gold); font-family: var(--font-mono);">💎 ${item.cost} OC</span>
                <button class="btn-hologram" onclick="buyShopItem('${item.id}', '${item.name}', ${item.cost})">DÉBLOQUER</button>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>

        <div class="hologram-box" style="padding: 16px;">
          <div style="font-size: 12px; font-weight: bold; color: var(--border-cyan); margin-bottom: 10px;">HISTORIQUE DES TRANSACTIONS</div>
          ${SYSTEM_STATE.recentOrders
            .map(
              (o) => `
            <div style="display: flex; justify-content: space-between; font-size: 12px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <span>${o.date} — ${o.name} (-${o.cost} 💎)</span>
              <span style="color: var(--accent-green); font-family: var(--font-mono);">${o.code}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 9 : PENALTY ZONE
         ===================================================================== -->
    <div id="view-penalty" class="view-panel ${initialTab === "penalty" ? "active" : ""}">
      <div class="hologram-box" style="padding: 30px; border-color: var(--accent-red); background: rgba(255, 0, 60, 0.06); box-shadow: 0 0 35px rgba(255, 0, 60, 0.4);">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="font-size: 40px; margin-bottom: 8px;">☠️</div>
          <h1 style="font-size: 32px; font-weight: 900; font-family: var(--font-display); color: var(--accent-red); letter-spacing: 3px;">
            ZONE DE PÉNALITÉ // DISPOSITIF DE SURVIE INVIOLABLE
          </h1>
          <p style="font-size: 14px; color: var(--text-secondary); max-width: 700px; margin: 0 auto;">
            Protection anti-procrastination active. Pare-feu réseau NextDNS et blocage hosts engagés.
          </p>
        </div>

        <div class="grid-2col" style="margin-bottom: 25px;">
          <div class="hologram-box" style="padding: 20px; background: rgba(0,0,0,0.6);">
            <div style="font-size: 13px; font-weight: bold; color: var(--accent-red); margin-bottom: 10px;">DOMAINS BLOQUÉS PAR LE PARE-FEU WFP</div>
            <ul style="font-size: 12px; color: var(--text-secondary); line-height: 1.8; list-style-position: inside;">
              ${SYSTEM_STATE.penalty.blockedDomains.map((d) => `<li><code>${d}</code></li>`).join("")}
            </ul>
          </div>

          <div class="hologram-box" style="padding: 20px; background: rgba(0,0,0,0.6);">
            <div style="font-size: 13px; font-weight: bold; color: var(--accent-gold); margin-bottom: 10px;">ÉPREUVES DE RACHAT POUR PURGER LA PÉNALITÉ</div>
            <div style="font-size: 13px; margin-bottom: 10px;">
              <strong>Option A :</strong> ${SYSTEM_STATE.penalty.redemptionOptionA}
            </div>
            <div style="font-size: 13px; margin-bottom: 15px;">
              <strong>Option B :</strong> ${SYSTEM_STATE.penalty.redemptionOptionB}
            </div>
            <button class="btn-hologram btn-red" onclick="alert('Preuve de rachat soumise à l\'Architecte. Levée du pare-feu après vérification.')">SOUMETTRE PREUVE DE SURVIE</button>
          </div>
        </div>
      </div>
    </div>


    <!-- =====================================================================
         SCREEN 10 : WORKOUT CAMERA ARENA (CALISTHÉNIE CV)
         ===================================================================== -->
    <div id="view-workout" class="view-panel ${initialTab === "workout" ? "active" : ""}">
      <div class="hologram-box" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 24px; font-weight: 900; font-family: var(--font-display); color: var(--border-cyan);">
              SALLE D'ENTRAÎNEMENT DU MONARQUE // VISION PAR ORDINATEUR (60 FPS)
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Analyse cinématique des 33 repères squelettiques MediaPipe Pose WebAssembly.</p>
          </div>
          <button class="btn-hologram" id="cam-toggle-btn" onclick="toggleCamera()">📹 ACTIVER CAMÉRA</button>
        </div>

        <div class="grid-2col">
          <!-- Video Screen & Canvas Overlay -->
          <div class="hologram-box" style="padding: 10px; background: #000; min-height: 380px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;">
            <video id="webcam-video" style="display: none; width: 100%; border-radius: 6px;" autoplay playsinline></video>
            <div id="cam-placeholder" style="text-align: center; color: var(--text-muted);">
              <div style="font-size: 40px; margin-bottom: 10px;">📷</div>
              <div>Cliquez sur "Activer Caméra" pour démarrer le tracking cinématique</div>
              <div style="font-size: 11px; margin-top: 5px; color: var(--border-cyan);">Seuil de validation : Flexion coude &le; 75&deg; &rarr; Extension &ge; 160&deg;</div>
            </div>
          </div>

          <!-- Routine Details & Reps Counter -->
          <div>
            <div class="hologram-box" style="padding: 20px; margin-bottom: 15px;">
              <div style="font-size: 11px; color: var(--accent-gold); font-weight: bold;">ROUTINE SÉLECTIONNÉE</div>
              <h3 style="font-size: 18px; font-weight: bold; margin: 4px 0;">Routine Dos & Épaules (17 Étapes)</h3>
              <p style="font-size: 12px; color: var(--text-secondary);">Étape 3/17 : Pike Push-Ups stricts (focus deltoïdes)</p>
            </div>

            <!-- Big Reps Counter -->
            <div class="hologram-box" style="padding: 24px; text-align: center; margin-bottom: 15px;">
              <div style="font-size: 12px; letter-spacing: 2px; color: var(--border-cyan);">RÉPÉTITIONS STRICTES COMPTABILISÉES</div>
              <div id="workout-rep-count" style="font-size: 64px; font-weight: 900; font-family: var(--font-display); color: var(--accent-green); line-height: 1.1;">
                14 / 14
              </div>
              <div style="font-size: 12px; color: var(--accent-green); font-weight: bold;">POSTURE STRICTE VALIDÉE ✓</div>
            </div>

            <div style="display: flex; gap: 10px;">
              <button class="btn-hologram" style="flex: 1;" onclick="addManualRep()">+ 1 RÉPÉTITION (TEST)</button>
              <button class="btn-hologram btn-gold" style="flex: 1;" onclick="validateWorkoutSet()">VALIDER LA SÉRIE</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- Proof Submission Modal -->
  <div id="proof-modal" class="modal-overlay">
    <div class="hologram-box modal-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 id="modal-quest-title" style="font-size: 18px; font-weight: bold; color: var(--border-cyan);">SOUMISSION DE PREUVE DE QUÊTE</h3>
        <button onclick="closeProofModal()" style="background: none; border: none; color: #fff; font-size: 20px; cursor: pointer;">✕</button>
      </div>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 15px;">
        Règle d'or : Toute attribution d'expérience exige une preuve réelle et indiscutable (Lien Commit GitHub, Trace Strava GPS, Relevé de notes).
      </p>
      <div style="margin-bottom: 15px;">
        <label style="font-size: 12px; color: var(--border-cyan); display: block; margin-bottom: 6px;">LIEN OU RAPPORT DE PREUVE :</label>
        <input type="text" id="proof-input" placeholder="https://github.com/GeovanioH/LevelUp/commit/..." style="width: 100%; background: #0A0F1E; border: 1px solid var(--border-cyan); color: #fff; padding: 10px; border-radius: 4px; font-family: var(--font-mono); font-size: 13px;">
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn-hologram" onclick="closeProofModal()">ANNULER</button>
        <button class="btn-hologram btn-gold" onclick="submitQuestProof()">VALIDER AU NOM DU SYSTÈME</button>
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
        if (t.getAttribute('onclick')?.includes(viewId)) t.classList.add('active');
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

    // Audio Visualizer Canvas Simulation
    const canvas = document.getElementById('audio-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.parentElement.clientWidth || 500;
      canvas.height = 140;

      function drawSpectrum() {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(5, 10, 20, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const bars = 48;
        const barWidth = (canvas.width / bars) - 2;
        for (let i = 0; i < bars; i++) {
          const h = Math.sin(Date.now() * 0.005 + i * 0.3) * 40 + 50 + Math.random() * 20;
          ctx.fillStyle = i % 2 === 0 ? '#00E5FF' : '#9D00FF';
          ctx.fillRect(i * (barWidth + 2), canvas.height - h, barWidth, h);
        }
        requestAnimationFrame(drawSpectrum);
      }
      drawSpectrum();
    }

    // Shop Item Purchase
    function buyShopItem(id, name, cost) {
      playChime(880);
      alert("Article débloqué : " + name + " (-" + cost + " 💎)\\nCode de retrait : LVL-SHADOW-" + Date.now().toString(36).toUpperCase());
      const bal = document.getElementById('shop-balance-display');
      if (bal) bal.textContent = Math.max(0, parseInt(bal.textContent) - cost);
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
        version: "3.0.0",
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

  // Fallback to Dashboard SPA
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(renderFullApplication("dashboard"));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `[LEVELUP // THE SYSTEM] Master Multi-Page Web Platform active sur http://localhost:${PORT}`,
  );
});
