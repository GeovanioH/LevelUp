/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("http");

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const PLAYER_STATE = {
  id: "huriel-monarch",
  name: "Huriel",
  title: "Le Chasseur Souverain (Éveil Novice)",
  level: 1,
  currentXp: 35,
  nextLevelXp: 100,
  rank: "E",
  shadowCrystals: 150,
  hp: 92,
  maxHp: 100,
  mp: 85,
  maxMp: 100,
  hoursAwake: 8,
  bases: {
    acad: 25,
    ai_eng: 30,
    cyber: 20,
    exp: 15,
    lng: 25,
    fin: 10,
    str: 35,
    dis: 40,
  },
  quests: [
    {
      id: "q-calisthenics-01",
      title: "Quête Matinale : 14 Pike Push-Ups Stricts",
      category: "SPORT",
      xp: 100,
      completed: true,
      description:
        "Validation cinématique MediaPipe Pose WASM (angles coude 75° / 160°).",
    },
    {
      id: "q-deep-work-ia",
      title: "Bloc Deep Work IA : Architecture & Soutenance Orale",
      category: "STUDY",
      xp: 250,
      completed: false,
      description:
        "Soutenance socratique 20 points sur les Transformers & régularisation.",
    },
    {
      id: "q-sm2-review",
      title: "Cerveau Numérique : Révisions Espacées SuperMemo SM-2",
      category: "BRAIN",
      xp: 75,
      completed: false,
      description:
        "Révision de 20 fiches Markdown Obsidian avec facteur d'aisance EF.",
    },
    {
      id: "q-scholarship-scan",
      title: "Veille Haute Valeur : Surveillance Deerflow Hackathons",
      category: "FINANCE",
      xp: 50,
      completed: true,
      description: "Scan automatisé Playwright des opportunités >= 5000 €.",
    },
  ],
};

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LevelUp — The System (HUD Solo Leveling)</title>
  <style>
    :root {
      --bg-abyss: #0a0a10;
      --bg-surface: rgba(12, 18, 34, 0.92);
      --neon-cyan: #00f0ff;
      --neon-purple: #8a2be2;
      --neon-gold: #ffd700;
      --neon-green: #10b981;
      --neon-red: #ff003c;
      --text-white: #ffffff;
      --text-muted: #94a3b8;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', -apple-system, sans-serif; }

    body {
      background-color: var(--bg-abyss);
      background-image: 
        radial-gradient(circle at 15% 15%, rgba(0, 240, 255, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 85% 85%, rgba(138, 43, 226, 0.08) 0%, transparent 40%),
        linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 30px 30px, 30px 30px;
      color: var(--text-white);
      min-height: 100vh;
      padding: 20px;
    }

    .container { max-width: 1300px; margin: 0 auto; }

    /* Top Bar */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 25px;
      background: var(--bg-surface);
      border: 1px solid var(--neon-cyan);
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
      border-radius: 8px;
      margin-bottom: 25px;
      clip-path: polygon(0 10px, 10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px));
    }

    .system-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 3px;
      color: var(--neon-cyan);
      text-shadow: 0 0 10px rgba(0, 240, 255, 0.7);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .pulse-dot {
      width: 10px;
      height: 10px;
      background: var(--neon-cyan);
      border-radius: 50%;
      box-shadow: 0 0 12px var(--neon-cyan);
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } }

    /* Grid Layout */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 25px;
    }

    @media (max-width: 950px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }

    /* Cards */
    .card {
      background: var(--bg-surface);
      border: 1px solid rgba(0, 240, 255, 0.3);
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
      position: relative;
      margin-bottom: 25px;
    }

    .card-title {
      font-size: 13px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--neon-cyan);
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid rgba(0, 240, 255, 0.2);
      padding-bottom: 8px;
    }

    /* Player Card */
    .player-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .rank-badge {
      background: linear-gradient(135deg, #0284c7, #0369a1);
      border: 1px solid var(--neon-cyan);
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
      padding: 8px 16px;
      border-radius: 6px;
      text-align: center;
    }

    .rank-badge .rank-val { font-size: 26px; font-weight: 900; line-height: 1; }
    .rank-badge .rank-lbl { font-size: 9px; letter-spacing: 1px; color: var(--neon-cyan); }

    .stat-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 15px;
    }

    .stat-box {
      background: rgba(10, 15, 30, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 10px;
      border-radius: 6px;
      text-align: center;
    }

    .stat-box .val { font-size: 18px; font-weight: bold; color: var(--neon-cyan); }
    .stat-box .lbl { font-size: 10px; color: var(--text-muted); text-transform: uppercase; }

    /* Vital Gauges */
    .status-banner {
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid var(--neon-cyan);
      color: var(--neon-cyan);
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 1px;
      text-align: center;
      margin-bottom: 20px;
      text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
    }

    .gauge-wrapper { margin-bottom: 18px; }
    .gauge-header { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
    .gauge-bar-outer {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      height: 16px;
      border-radius: 8px;
      overflow: hidden;
      padding: 2px;
    }

    .gauge-bar-fill-hp {
      background: linear-gradient(90deg, #059669, #10b981, #34d399);
      height: 100%;
      border-radius: 6px;
      box-shadow: 0 0 10px #10b981;
      transition: width 0.5s ease;
    }

    .gauge-bar-fill-mp {
      background: linear-gradient(90deg, #8a2be2, #00f0ff, #38bdf8);
      height: 100%;
      border-radius: 6px;
      box-shadow: 0 0 10px #00f0ff;
      transition: width 0.5s ease;
    }

    /* Quests List */
    .quest-item {
      background: rgba(10, 15, 30, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 14px;
      border-radius: 6px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;
    }

    .quest-item.completed {
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.05);
    }

    .quest-info h4 { font-size: 14px; margin-bottom: 4px; color: #fff; }
    .quest-info p { font-size: 12px; color: var(--text-muted); }

    .quest-btn {
      background: rgba(0, 240, 255, 0.15);
      border: 1px solid var(--neon-cyan);
      color: var(--neon-cyan);
      padding: 8px 14px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }

    .quest-btn:hover {
      background: var(--neon-cyan);
      color: #000;
      box-shadow: 0 0 15px var(--neon-cyan);
    }

    .quest-btn.done {
      background: rgba(16, 185, 129, 0.2);
      border-color: var(--neon-green);
      color: var(--neon-green);
      cursor: default;
    }

    /* Radar SVG */
    .radar-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px 0;
    }

    /* 120 Skills Grid */
    .skills-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 15px;
    }

    .tab-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-muted);
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
    }

    .tab-btn.active {
      background: rgba(0, 240, 255, 0.15);
      border-color: var(--neon-cyan);
      color: var(--neon-cyan);
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 12px;
      max-height: 280px;
      overflow-y: auto;
      padding-right: 5px;
    }

    .skill-card {
      background: rgba(10, 15, 30, 0.7);
      border: 1px solid rgba(0, 240, 255, 0.2);
      padding: 10px;
      border-radius: 6px;
      font-size: 12px;
    }

    .skill-card.unlocked { border-color: var(--neon-cyan); box-shadow: 0 0 8px rgba(0, 240, 255, 0.2); }
    .skill-card .skill-tier { font-size: 9px; color: var(--neon-gold); font-weight: bold; }
    .skill-card .skill-name { font-weight: bold; margin: 3px 0; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="system-title">
        <span class="pulse-dot"></span>
        <span>LEVELUP : THE SYSTEM</span>
      </div>
      <div style="font-size: 12px; color: var(--neon-cyan); font-family: monospace;">
        MONARCH PROTOCOL // ACTIVE
      </div>
    </header>

    <div class="dashboard-grid">
      <!-- Left Column : Player Card & Vitals -->
      <div>
        <!-- Player Card -->
        <div class="card">
          <div class="player-header">
            <div>
              <div style="font-size: 10px; letter-spacing: 2px; color: var(--neon-cyan);">CHASSEUR SOUVERAIN</div>
              <h2 style="font-size: 24px; font-weight: 900; margin: 2px 0;">${PLAYER_STATE.name}</h2>
              <p style="font-size: 11px; color: var(--text-muted); font-style: italic;">${PLAYER_STATE.title}</p>
            </div>
            <div class="rank-badge">
              <div class="rank-lbl">RANG</div>
              <div class="rank-val">${PLAYER_STATE.rank}</div>
            </div>
          </div>

          <div class="stat-row">
            <div class="stat-box">
              <div class="val" id="player-lvl">${PLAYER_STATE.level}</div>
              <div class="lbl">Niveau</div>
            </div>
            <div class="stat-box">
              <div class="val" id="player-xp">${PLAYER_STATE.currentXp} / ${PLAYER_STATE.nextLevelXp}</div>
              <div class="lbl">XP Palier</div>
            </div>
            <div class="stat-box">
              <div class="val" style="color: var(--neon-gold);">✦ ${PLAYER_STATE.shadowCrystals}</div>
              <div class="lbl">Cristaux</div>
            </div>
          </div>
        </div>

        <!-- Vital Gauges -->
        <div class="card">
          <div class="card-title">
            <span>État Biophysique (Borbély & Gandevia)</span>
            <span style="color: var(--text-muted);">Éveil: ${PLAYER_STATE.hoursAwake}h</span>
          </div>

          <div class="status-banner">
            RÉSILIENCE BIOLOGIQUE SOUVERAINE & FOCUS COGNITIF INDOMPTABLE
          </div>

          <!-- HP Gauge -->
          <div class="gauge-wrapper">
            <div class="gauge-header">
              <span style="color: var(--neon-green); font-weight: bold;">HP // RÉSILIENCE BIOLOGIQUE</span>
              <span id="hp-text">${PLAYER_STATE.hp} / ${PLAYER_STATE.maxHp} (${PLAYER_STATE.hp}%)</span>
            </div>
            <div class="gauge-bar-outer">
              <div class="gauge-bar-fill-hp" id="hp-bar" style="width: ${PLAYER_STATE.hp}%;"></div>
            </div>
          </div>

          <!-- MP Gauge -->
          <div class="gauge-wrapper">
            <div class="gauge-header">
              <span style="color: var(--neon-cyan); font-weight: bold;">MP // FOCUS COGNITIF</span>
              <span id="mp-text">${PLAYER_STATE.mp} / ${PLAYER_STATE.maxMp} (${PLAYER_STATE.mp}%)</span>
            </div>
            <div class="gauge-bar-outer">
              <div class="gauge-bar-fill-mp" id="mp-bar" style="width: ${PLAYER_STATE.mp}%;"></div>
            </div>
          </div>
        </div>

        <!-- Octagonal Radar of the 8 Bases -->
        <div class="card">
          <div class="card-title">
            <span>Score Harmonique $S_H$ // 8 Piliers</span>
          </div>
          <div class="radar-container">
            <svg width="280" height="240" viewBox="0 0 280 240">
              <!-- Background Grid -->
              <polygon points="140,20 220,55 250,135 210,210 140,230 70,210 30,135 60,55" fill="none" stroke="rgba(0,240,255,0.15)" stroke-width="1"/>
              <polygon points="140,50 195,75 215,135 185,185 140,200 95,185 65,135 85,75" fill="none" stroke="rgba(0,240,255,0.25)" stroke-width="1"/>
              <!-- Data Polygon -->
              <polygon points="140,65 190,85 205,135 180,175 140,185 105,175 80,135 95,85" fill="rgba(0,240,255,0.25)" stroke="#00f0ff" stroke-width="2"/>
              <!-- Base Labels -->
              <text x="140" y="15" fill="#00f0ff" font-size="10" font-family="monospace" text-anchor="middle">ACAD (25)</text>
              <text x="235" y="55" fill="#00f0ff" font-size="10" font-family="monospace">AI_ENG (30)</text>
              <text x="255" y="140" fill="#00f0ff" font-size="10" font-family="monospace">CYBER (20)</text>
              <text x="220" y="225" fill="#00f0ff" font-size="10" font-family="monospace">EXP (15)</text>
              <text x="140" y="240" fill="#00f0ff" font-size="10" font-family="monospace" text-anchor="middle">LNG (25)</text>
              <text x="45" y="225" fill="#00f0ff" font-size="10" font-family="monospace">FIN (10)</text>
              <text x="5" y="140" fill="#00f0ff" font-size="10" font-family="monospace">STR (35)</text>
              <text x="35" y="55" fill="#00f0ff" font-size="10" font-family="monospace">DIS (40)</text>
            </svg>
          </div>
        </div>
      </div>

      <!-- Right Column : Quests & 120 Skills Tree -->
      <div>
        <!-- Quests Panel -->
        <div class="card">
          <div class="card-title">
            <span>Quêtes Journalières Souveraines</span>
            <span style="color: var(--neon-gold);">RITUEL 06H00</span>
          </div>

          <div id="quests-list">
            ${PLAYER_STATE.quests
              .map(
                (q) => `
              <div class="quest-item ${q.completed ? "completed" : ""}" id="quest-${q.id}">
                <div class="quest-info">
                  <h4>${q.title}</h4>
                  <p>${q.description}</p>
                  <div style="font-size: 10px; color: var(--neon-cyan); margin-top: 4px; font-family: monospace;">
                    RECOMPENSE : +${q.xp} XP | +10 MP FOCUS
                  </div>
                </div>
                <div>
                  ${
                    q.completed
                      ? '<button class="quest-btn done">VALIDÉE ✓</button>'
                      : `<button class="quest-btn" onclick="completeQuest('${q.id}', ${q.xp})">ACCOMPLIR</button>`
                  }
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>

        <!-- 120 Skills Tree -->
        <div class="card">
          <div class="card-title">
            <span>Arbre des 120 Compétences Canoniques (DAG)</span>
            <span style="color: var(--neon-cyan);">8 PILIERS</span>
          </div>

          <div class="skills-tabs">
            <button class="tab-btn active" onclick="filterSkills('ALL')">TOUTES (120)</button>
            <button class="tab-btn" onclick="filterSkills('AI')">IA & LLM</button>
            <button class="tab-btn" onclick="filterSkills('CYBER')">CYBER</button>
            <button class="tab-btn" onclick="filterSkills('STR')">CALISTHÉNIE</button>
            <button class="tab-btn" onclick="filterSkills('LNG')">ANGLAIS C2</button>
          </div>

          <div class="skills-grid" id="skills-grid">
            <div class="skill-card unlocked">
              <div class="skill-tier">TIER 1 // AWAKENING</div>
              <div class="skill-name">Transformers & Attention QKV</div>
              <div style="color: var(--neon-green); font-size: 10px;">MAÎTRISÉ (100%)</div>
            </div>
            <div class="skill-card unlocked">
              <div class="skill-tier">TIER 1 // AWAKENING</div>
              <div class="skill-name">Chiffrement AES-256-GCM</div>
              <div style="color: var(--neon-green); font-size: 10px;">MAÎTRISÉ (100%)</div>
            </div>
            <div class="skill-card unlocked">
              <div class="skill-tier">TIER 1 // AWAKENING</div>
              <div class="skill-name">Pike Push-Ups Stricts (14 reps)</div>
              <div style="color: var(--neon-green); font-size: 10px;">MAÎTRISÉ (100%)</div>
            </div>
            <div class="skill-card">
              <div class="skill-tier">TIER 2 // ASCENSION</div>
              <div class="skill-name">Défense Orale Cambridge C1/C2</div>
              <div style="color: var(--neon-cyan); font-size: 10px;">EN COURS (45%)</div>
            </div>
            <div class="skill-card">
              <div class="skill-tier">TIER 2 // ASCENSION</div>
              <div class="skill-name">Arbre de Merkle & Audit Tamper-Proof</div>
              <div style="color: var(--neon-green); font-size: 10px;">MAÎTRISÉ (100%)</div>
            </div>
            <div class="skill-card">
              <div class="skill-tier">TIER 3 // MONARCH</div>
              <div class="skill-name">DARPA AIxCC Challenge (Rang S)</div>
              <div style="color: var(--text-muted); font-size: 10px;">VERROUILLÉ (PALLIER B)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Procedural Audio Synthesizer (Do5 523.25 Hz)
    function playDopamineTone() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 Do5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5 Sol5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {
        console.warn('Audio non initialise:', e);
      }
    }

    function completeQuest(questId, xpAward) {
      playDopamineTone();
      const item = document.getElementById('quest-' + questId);
      if (item) {
        item.classList.add('completed');
        const btn = item.querySelector('.quest-btn');
        btn.className = 'quest-btn done';
        btn.textContent = 'VALIDÉE ✓';
        btn.onclick = null;
      }

      // Update XP & MP
      const xpEl = document.getElementById('player-xp');
      const cur = parseInt(xpEl.textContent.split('/')[0]) + xpAward;
      xpEl.textContent = cur + ' / 100';

      const mpBar = document.getElementById('mp-bar');
      const mpText = document.getElementById('mp-text');
      mpBar.style.width = '100%';
      mpText.textContent = '100 / 100 (100%)';
    }

    function filterSkills(cat) {
      const btns = document.querySelectorAll('.tab-btn');
      btns.forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
    }
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health endpoint
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "HEALTHY", uptime: process.uptime() }));
    return;
  }

  // Player status API endpoint
  if (req.url === "/api/v1/player/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(PLAYER_STATE));
    return;
  }

  // Quests API endpoint
  if (req.url === "/api/v1/quests/daily") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(PLAYER_STATE.quests));
    return;
  }

  // Web HUD root
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(HTML_CONTENT);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `[LEVELUP : THE SYSTEM] Web HUD actif sur http://localhost:${PORT}`,
  );
});
