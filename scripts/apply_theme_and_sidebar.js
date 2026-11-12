const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../apps/web/server.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. UPDATE MONARCH_LOGO_SVG (White & Violet)
const oldLogoRegex = /const MONARCH_LOGO_SVG = `<svg class="monarch-crest-svg"[\s\S]*?<\/svg>`;/;
const newLogo = `const MONARCH_LOGO_SVG = \`<svg class="monarch-crest-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
</svg>\`;`;

if (!oldLogoRegex.test(code)) {
  console.error("FAIL: oldLogoRegex did not match");
  process.exit(1);
}
code = code.replace(oldLogoRegex, newLogo);
console.log("✓ Updated MONARCH_LOGO_SVG");

// 2. UPDATE :root CSS AND BODY STYLES
const oldRootRegex = /:root\s*\{[\s\S]*?\}\s*\[data-theme="light-awakening"\]\s*\{[\s\S]*?\}\s*\* \{ box-sizing: border-box; margin: 0; padding: 0; \}\s*body\s*\{[\s\S]*?\}/;

const newRootAndBody = `:root {
      /* Sovereign Obsidian-Amethyst Dark Foundations (No flat dull black!) */
      --bg-cosmic-0: #070414;
      --bg-cosmic-1: #0d0824;
      --bg-cosmic-2: #160d38;
      
      /* Glassmorphism Panels (Translucent Dark Violet Crystal) */
      --glass-panel: rgba(14, 9, 30, 0.82);
      --glass-panel-elevated: rgba(24, 15, 52, 0.90);
      --glass-inner-border: rgba(168, 85, 247, 0.35);
      --glass-inner-glow: rgba(192, 132, 252, 0.14);

      /* Sovereign White & Violet Palette */
      --primary-white: #ffffff;
      --pure-white: #ffffff;
      --primary-violet: #a855f7;
      --vibrant-purple: #9333ea;
      --neon-violet: #c084fc;
      --royal-violet: #7c3aed;
      --light-lavender: #ddd6fe;
      --soft-lavender: #e9d5ff;

      /* Mapping neon cyan to luminous violet so all existing badges, borders & accents become radiant violet & white */
      --neon-cyan: #c084fc;
      --neon-sky: #ddd6fe;
      --neon-blue: #9333ea;
      --deep-sapphire: #7c3aed;
      --monarch-purple: #a855f7;
      
      /* Vibrant Supporting Accents */
      --transcendent-green: #34d399;
      --emerald-green: #10b981;
      --imperial-gold: #fbbf24;
      --alert-crimson: #f43f5e;
      --danger-red: #ef4444;

      /* Text Hierarchy */
      --text-white: #ffffff;
      --text-secondary: #cbd5e1;
      --text-muted: #94a3b8;

      --font-display: 'Rajdhani', sans-serif;
      --font-body: 'Inter', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;

      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-pill: 9999px;
    }

    [data-theme="light-awakening"] {
      --bg-cosmic-0: #f5f3ff;
      --bg-cosmic-1: #ede9fe;
      --bg-cosmic-2: #ddd6fe;
      --glass-panel: rgba(255, 255, 255, 0.92);
      --glass-panel-elevated: #ffffff;
      --glass-inner-border: rgba(168, 85, 247, 0.35);
      --glass-inner-glow: rgba(192, 132, 252, 0.12);
      --neon-cyan: #7c3aed;
      --neon-sky: #6d28d9;
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
        radial-gradient(ellipse at 15% 15%, rgba(147, 51, 234, 0.25) 0%, transparent 45%),
        radial-gradient(circle at 85% 20%, rgba(192, 132, 252, 0.18) 0%, transparent 40%),
        radial-gradient(circle at 50% 85%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 0%, #170a38 0%, #0d0724 50%, #070414 100%);
      background-attachment: fixed;
      color: var(--text-white);
      font-family: var(--font-body);
      min-height: 100vh;
      overflow-x: hidden;
    }`;

if (!oldRootRegex.test(code)) {
  console.error("FAIL: oldRootRegex did not match");
  process.exit(1);
}
code = code.replace(oldRootRegex, newRootAndBody);
console.log("✓ Updated :root and body CSS");

// 3. UPDATE GLASS CARD, SPOTLIGHT, SHINY TEXT, BUTTONS, CAPSULES
const oldGlassSpotlightRegex = /\.glass-card\s*\{[\s\S]*?\.spotlight-card:hover\s*\{[\s\S]*?\}\s*\.shiny-text\s*\{[\s\S]*?\}\s*\.shiny-gold/;

const newGlassSpotlight = `.glass-card {
      position: relative;
      background: var(--glass-panel);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid var(--glass-inner-border);
      border-radius: var(--radius-md);
      box-shadow: 
        0 12px 35px -5px rgba(7, 3, 20, 0.7),
        inset 0 0 20px var(--glass-inner-glow),
        0 0 18px rgba(168, 85, 247, 0.16);
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
      background: linear-gradient(90deg, transparent 5%, #ffffff 30%, #c084fc 70%, transparent 95%);
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
      border-color: rgba(192, 132, 252, 0.7);
      box-shadow: 
        0 14px 40px -5px rgba(35, 15, 75, 0.65),
        inset 0 0 25px rgba(192, 132, 252, 0.2),
        0 0 25px rgba(168, 85, 247, 0.35);
    }

    .shiny-text {
      background: linear-gradient(110deg, #ffffff 15%, #c084fc 45%, #ffffff 75%, #ddd6fe 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: textShimmer 3.5s ease-in-out infinite;
      display: inline-block;
    }
    .shiny-gold`;

if (!oldGlassSpotlightRegex.test(code)) {
  console.error("FAIL: oldGlassSpotlightRegex did not match");
  process.exit(1);
}
code = code.replace(oldGlassSpotlightRegex, newGlassSpotlight);
console.log("✓ Updated glass-card, spotlight, and shiny-text CSS");

// 4. UPDATE HEADER AND NAVBAR CSS (LEFT GLASSMORPHIC SIDEBAR)
const oldNavCssRegex = /\.master-header\s*\{[\s\S]*?\.main-container\s*\{[\s\S]*?z-index: 2;\s*\}/;

const newNavCss = `/* =========================================================================
       LAYOUT ARCHITECTURE: FIXED LEFT GLASSMORPHIC SIDEBAR & MAIN WORKSPACE
       ========================================================================= */
    .app-layout {
      display: flex;
      min-height: 100vh;
      position: relative;
    }

    /* LEFT GLASSMORPHISM SIDEBAR NAVBAR */
    .left-sidebar-nav.nav-bar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 275px;
      height: 100vh;
      background: rgba(12, 7, 28, 0.84);
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      border-right: 1px solid rgba(168, 85, 247, 0.32);
      box-shadow: 4px 0 35px rgba(124, 58, 237, 0.22), inset -1px 0 15px rgba(192, 132, 252, 0.08);
      display: flex;
      flex-direction: column;
      padding: 20px 16px 16px 16px;
      z-index: 120;
      overflow-y: auto;
      overflow-x: hidden;
      gap: 4px;
    }

    /* Custom scrollbar for left sidebar */
    .left-sidebar-nav::-webkit-scrollbar {
      width: 5px;
    }
    .left-sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(168, 85, 247, 0.4);
      border-radius: 4px;
    }
    .left-sidebar-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-brand-block {
      padding-bottom: 18px;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(168, 85, 247, 0.22);
      display: flex;
      flex-direction: column;
      gap: 12px;
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
      width: 38px;
      height: 38px;
      filter: drop-shadow(0 0 10px rgba(192, 132, 252, 0.85));
      transition: all 0.3s ease;
      flex-shrink: 0;
    }
    .brand-logo-wrap:hover .monarch-crest-svg {
      filter: drop-shadow(0 0 18px rgba(192, 132, 252, 1)) drop-shadow(0 0 28px rgba(168, 85, 247, 0.8));
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
      color: #c084fc;
      opacity: 0.9;
      margin-top: 3px;
      line-height: 1;
    }

    .sidebar-online-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px 10px;
      border-radius: var(--radius-pill);
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(192, 132, 252, 0.35);
      font-size: 10.5px;
      font-weight: 700;
      color: #ffffff;
      font-family: var(--font-mono);
      letter-spacing: 1px;
      width: fit-content;
    }
    .sidebar-online-status .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #c084fc;
      box-shadow: 0 0 8px #c084fc, 0 0 14px #a855f7;
      animation: pulseGlow 2s infinite ease-in-out;
    }
    @keyframes pulseGlow {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    .sidebar-section-label {
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #a78bfa;
      padding: 4px 8px;
      margin-top: 2px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .sidebar-nav-menu {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .nav-tab {
      background: transparent;
      border: 1px solid transparent;
      color: #cbd5e1;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 1.2px;
      padding: 9px 12px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      width: 100%;
      text-align: left;
      position: relative;
    }
    .nav-tab-icon {
      font-size: 16px;
      width: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .nav-tab-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .nav-tab:hover {
      color: #ffffff;
      background: rgba(168, 85, 247, 0.14);
      border-color: rgba(192, 132, 252, 0.35);
      transform: translateX(4px);
      box-shadow: 0 0 16px rgba(168, 85, 247, 0.2);
    }
    .nav-tab.active {
      color: #ffffff;
      background: linear-gradient(90deg, rgba(168, 85, 247, 0.32), rgba(147, 51, 234, 0.18));
      border: 1px solid rgba(192, 132, 252, 0.6);
      border-left: 4px solid #ffffff;
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 12px rgba(192, 132, 252, 0.12);
    }
    .nav-tab.active .nav-tab-icon {
      filter: drop-shadow(0 0 8px #ffffff);
    }
    .nav-shortcut {
      font-size: 10px;
      font-family: var(--font-mono);
      opacity: 0.65;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(168, 85, 247, 0.25);
      padding: 2px 5px;
      border-radius: 4px;
      color: #ddd6fe;
      margin-left: auto;
    }

    .sidebar-player-footer {
      padding-top: 14px;
      margin-top: auto;
      border-top: 1px solid rgba(168, 85, 247, 0.22);
    }
    .sidebar-player-card {
      background: rgba(22, 13, 46, 0.75);
      border: 1px solid rgba(168, 85, 247, 0.35);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
    }
    .sidebar-player-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #a855f7, #6d28d9);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 0 10px rgba(168, 85, 247, 0.6);
      flex-shrink: 0;
    }
    .sidebar-player-meta {
      flex: 1;
      min-width: 0;
    }
    .sidebar-player-name {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 13px;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sidebar-player-rank {
      font-family: var(--font-mono);
      font-size: 9.5px;
      color: #c084fc;
    }
    .sidebar-player-sh {
      font-family: var(--font-mono);
      font-weight: 800;
      font-size: 11px;
      color: #fbbf24;
      background: rgba(251, 191, 36, 0.12);
      border: 1px solid rgba(251, 191, 36, 0.35);
      padding: 3px 6px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    /* MAIN APP AREA (OFFSET BY 275px FOR FIXED SIDEBAR) */
    .app-main-area {
      flex: 1;
      margin-left: 275px;
      min-width: 0;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 2;
    }

    .master-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(12, 7, 28, 0.85);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border-bottom: 1px solid rgba(168, 85, 247, 0.28);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.55);
      padding: 12px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .main-container {
      max-width: 1480px;
      width: 100%;
      margin: 0 auto;
      padding: 24px 28px 60px 28px;
      position: relative;
      z-index: 2;
    }

    @media (max-width: 1024px) {
      .left-sidebar-nav.nav-bar {
        position: relative;
        width: 100%;
        height: auto;
        border-right: none;
        border-bottom: 1px solid rgba(168, 85, 247, 0.3);
        flex-direction: row;
        overflow-x: auto;
        padding: 10px;
      }
      .sidebar-brand-block, .sidebar-section-label, .sidebar-player-footer {
        display: none;
      }
      .sidebar-nav-menu {
        flex-direction: row;
      }
      .nav-tab {
        width: auto;
      }
      .app-main-area {
        margin-left: 0;
      }
    }`;

if (!oldNavCssRegex.test(code)) {
  console.error("FAIL: oldNavCssRegex did not match");
  process.exit(1);
}
code = code.replace(oldNavCssRegex, newNavCss);
console.log("✓ Updated header and left sidebar navbar CSS");

// 5. UPDATE HTML STRUCTURE: WRAP IN app-layout AND PLACE left-sidebar-nav
const oldHtmlNavRegex = /<!-- MASTER TOP HEADER -->[\s\S]*?<!-- NAVIGATION TABS \(10 CANONICAL SCREENS\) -->[\s\S]*?<\/nav>\s*<main class="main-container">/;

const newHtmlNav = `<!-- APPLICATION WORKSPACE LAYOUT (LEFT GLASS SIDEBAR + MAIN AREA) -->
  <div class="app-layout">

    <!-- LEFT GLASSMORPHIC SIDEBAR NAVBAR (10 CANONICAL SCREENS) -->
    <aside class="left-sidebar-nav nav-bar">
      <!-- Brand Crest & Header -->
      <div class="sidebar-brand-block">
        <div class="brand-logo-wrap" onclick="switchView('dashboard')" title="LevelUp — Système du Monarque (Dashboard)">
          \${MONARCH_LOGO_SVG}
          <div class="brand-text-block">
            <div class="brand-logo">
              <span class="shiny-text">LEVELUP</span>
            </div>
            <span class="brand-subtext">THE MONARCH SYSTEM</span>
          </div>
        </div>
        <div class="sidebar-online-status">
          <span class="pulse-dot"></span>
          <span>SYSTEM ONLINE</span>
        </div>
      </div>

      <!-- Navigation Section Label -->
      <div class="sidebar-section-label">CANONICAL SCREENS</div>

      <!-- 10 Canonical Navigation Buttons -->
      <div class="sidebar-nav-menu">
        <button class="nav-tab \${initialTab === "dashboard" ? "active" : ""}" onclick="switchView('dashboard')">
          <span class="nav-tab-icon">📊</span>
          <span class="nav-tab-label">HUD SOUVERAIN</span>
          <span class="nav-shortcut">Alt+1</span>
        </button>
        <button class="nav-tab \${initialTab === "skills" ? "active" : ""}" onclick="switchView('skills')">
          <span class="nav-tab-icon">⚡</span>
          <span class="nav-tab-label">COMPÉTENCES DAG</span>
          <span class="nav-shortcut">Alt+2</span>
        </button>
        <button class="nav-tab \${initialTab === "quests" ? "active" : ""}" onclick="switchView('quests')">
          <span class="nav-tab-icon">📜</span>
          <span class="nav-tab-label">QUÊTES DU JOUR</span>
          <span class="nav-shortcut">Alt+3</span>
        </button>
        <button class="nav-tab \${initialTab === "planner" ? "active" : ""}" onclick="switchView('planner')">
          <span class="nav-tab-icon">📅</span>
          <span class="nav-tab-label">TIME-BLOCKING</span>
          <span class="nav-shortcut">Alt+4</span>
        </button>
        <button class="nav-tab \${initialTab === "notes" ? "active" : ""}" onclick="switchView('notes')">
          <span class="nav-tab-icon">🧠</span>
          <span class="nav-tab-label">SECOND BRAIN</span>
          <span class="nav-shortcut">Alt+5</span>
        </button>
        <button class="nav-tab \${initialTab === "audio" ? "active" : ""}" onclick="switchView('audio')">
          <span class="nav-tab-icon">🎙️</span>
          <span class="nav-tab-label">STATION VOCALE</span>
          <span class="nav-shortcut">Alt+6</span>
        </button>
        <button class="nav-tab \${initialTab === "opportunities" ? "active" : ""}" onclick="switchView('opportunities')">
          <span class="nav-tab-icon">🌐</span>
          <span class="nav-tab-label">VEILLE BOURSES</span>
          <span class="nav-shortcut">Alt+7</span>
        </button>
        <button class="nav-tab \${initialTab === "shop" ? "active" : ""}" onclick="switchView('shop')">
          <span class="nav-tab-icon">💎</span>
          <span class="nav-tab-label">BOUTIQUE D'OMBRE</span>
          <span class="nav-shortcut">Alt+8</span>
        </button>
        <button class="nav-tab \${initialTab === "penalty" ? "active" : ""}" onclick="switchView('penalty')">
          <span class="nav-tab-icon">⚠️</span>
          <span class="nav-tab-label">ZONE PÉNALITÉ</span>
          <span class="nav-shortcut">Alt+9</span>
        </button>
        <button class="nav-tab \${initialTab === "workout" ? "active" : ""}" onclick="switchView('workout')">
          <span class="nav-tab-icon">📷</span>
          <span class="nav-tab-label">VISION SPORT</span>
          <span class="nav-shortcut">Alt+0</span>
        </button>
      </div>

      <!-- Player Status Footer Mini-Card -->
      <div class="sidebar-player-footer">
        <div class="sidebar-player-card">
          <div class="sidebar-player-avatar">👑</div>
          <div class="sidebar-player-meta">
            <div class="sidebar-player-name">\${player.name}</div>
            <div class="sidebar-player-rank">RANG \${player.rank} // LVL \${player.level}</div>
          </div>
          <div class="sidebar-player-sh" title="Score Harmonique Sh">Sh \${harmonicScore}</div>
        </div>
      </div>
    </aside>

    <!-- MAIN APP AREA (WITH TOP UTILITY BAR & WORKSPACE) -->
    <div class="app-main-area">

      <!-- MASTER TOP HEADER -->
      <header class="master-header">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div class="sidebar-online-status" style="margin: 0; padding: 4px 10px;">
            <span class="pulse-dot"></span>
            <span style="font-size: 11px;">SYSTEM ONLINE</span>
          </div>
          <div style="font-family: var(--font-mono); font-size: 11.5px; letter-spacing: 1.5px; color: #c084fc; font-weight: 700;" id="active-view-indicator">
            // HUD SOUVERAIN & STATUTS
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="font-family: var(--font-mono); font-size: 13px; color: #ffffff; display: flex; align-items: center; gap: 6px; background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(192, 132, 252, 0.3); padding: 5px 12px; border-radius: var(--radius-pill);">
            <span>🕒</span>
            <span id="system-clock">--:--:--</span>
          </div>
          <div class="radar-ping-badge" style="border-color: rgba(251, 191, 36, 0.4); color: #fbbf24;">
            <span>💎 CRISTAUX :</span>
            <strong id="header-crystals-val">\${player.shadowCrystals}</strong>
          </div>
          <div class="radar-ping-badge" style="border-color: rgba(52, 211, 153, 0.4); color: #34d399;">
            <span>STREAK : <span id="header-streak-val">\${player.streakDays}</span>J</span>
          </div>
          <button class="btn-cyber" onclick="toggleTheme()" style="padding: 6px 12px; font-size: 11px;">
            🌓 THÈME
          </button>
        </div>
      </header>

      <main class="main-container">`;

if (!oldHtmlNavRegex.test(code)) {
  console.error("FAIL: oldHtmlNavRegex did not match");
  process.exit(1);
}
code = code.replace(oldHtmlNavRegex, newHtmlNav);
console.log("✓ Updated HTML header & left sidebar navbar structure");

// 6. UPDATE CLOSING TAGS FOR main-container, app-main-area, and app-layout
const oldClosingMainRegex = /<\/main>\s*<!-- HOLOGRAPHIC SYSTEM NOTIFICATION MODAL/;
const newClosingMain = `</main>
    </div> <!-- close app-main-area -->
  </div> <!-- close app-layout -->

  <!-- HOLOGRAPHIC SYSTEM NOTIFICATION MODAL`;

if (!oldClosingMainRegex.test(code)) {
  console.error("FAIL: oldClosingMainRegex did not match");
  process.exit(1);
}
code = code.replace(oldClosingMainRegex, newClosingMain);
console.log("✓ Updated closing tags for app-layout");

// 7. UPDATE switchView to update active-view-indicator
const oldSwitchViewRegex = /function switchView\(viewId\) \{[\s\S]*?window\.history\.pushState\(\{\}, '', '\/' \+ \(viewId === 'dashboard' \? '' : viewId\)\);\s*\}/;

const newSwitchView = `function switchView(viewId) {
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

      const viewNames = {
        dashboard: '// HUD SOUVERAIN & STATUTS',
        skills: '// ARBRE DES COMPÉTENCES DAG',
        quests: '// JOURNAL DES QUÊTES DU JOUR',
        planner: '// PLANIFICATEUR CIRCADIEN',
        notes: '// CERVEAU NUMÉRIQUE (OBSIDIAN)',
        audio: '// STATION VOCALE FFT & SOCRATE',
        opportunities: '// VEILLE BOURSES & HACKATHONS',
        shop: '// BOUTIQUE DES OMBRES',
        penalty: '// ZONE DE PÉNALITÉ INVIOLABLE',
        workout: '// VISION SPORT MEDIAPIPE'
      };
      const indicator = document.getElementById('active-view-indicator');
      if (indicator && viewNames[viewId]) indicator.textContent = viewNames[viewId];

      if (viewId === 'notes') {
        setTimeout(() => {
          if (typeof initObsidianVault === 'function' && !obsidianInitialized) initObsidianVault();
          if (typeof resizeCanvas === 'function') resizeCanvas('obsidian-graph-canvas');
        }, 50);
      }
      window.history.pushState({}, '', '/' + (viewId === 'dashboard' ? '' : viewId));
    }`;

if (!oldSwitchViewRegex.test(code)) {
  console.error("FAIL: oldSwitchViewRegex did not match");
  process.exit(1);
}
code = code.replace(oldSwitchViewRegex, newSwitchView);
console.log("✓ Updated switchView function");

// 8. UPDATE MANA PARTICLES ANIMATION (Alternating White & Luminous Violet)
const oldManaFillRegex = /bgCtx\.fillStyle = 'rgba\(0, 240, 255, ' \+ p\.alpha \+ '\)';\s*bgCtx\.shadowBlur = 8;\s*bgCtx\.shadowColor = '#00f0ff';/;

const newManaFill = `const isWhite = (i % 2 === 0);
          bgCtx.fillStyle = isWhite ? 'rgba(255, 255, 255, ' + (p.alpha * 0.9) + ')' : 'rgba(192, 132, 252, ' + p.alpha + ')';
          bgCtx.shadowBlur = isWhite ? 6 : 10;
          bgCtx.shadowColor = isWhite ? '#ffffff' : '#c084fc';`;

if (!oldManaFillRegex.test(code)) {
  console.warn("WARN: oldManaFillRegex did not match, checking variant");
} else {
  code = code.replace(oldManaFillRegex, newManaFill);
  console.log("✓ Updated mana particles fill to white & violet");
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log("\n🚀 SUCCÈS : Patch White & Violet + Left Glassmorphism Navbar appliqué !");
