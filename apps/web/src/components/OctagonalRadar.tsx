import React from "react";

export interface BaseScoresMap {
  ACAD: number;
  AI_ENG: number;
  CYBER: number;
  EXP: number;
  LNG: number;
  FIN: number;
  STR: number;
  DIS: number;
}

export interface OctagonalRadarProps {
  scores: BaseScoresMap;
  size?: number;
}

const BASES: (keyof BaseScoresMap)[] = [
  "ACAD",
  "AI_ENG",
  "CYBER",
  "EXP",
  "LNG",
  "FIN",
  "STR",
  "DIS",
];

export const OctagonalRadar: React.FC<OctagonalRadarProps> = ({
  scores,
  size = 380,
}) => {
  const center = size / 2;
  const radius = size * 0.38;

  // Calcul des coordonnées polaires pour chaque sommet
  const getCoordinates = (index: number, valuePercentage: number) => {
    const angle = (index * 2 * Math.PI) / 8 - Math.PI / 2; // Commencer au sommet (12h)
    const r = radius * Math.min(1.0, Math.max(0, valuePercentage));
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Niveaux concentriques de la grille (20%, 40%, 60%, 80%, 100%)
  const concentricLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Points du polygone des scores du joueur
  const dataPoints = BASES.map((base, idx) => {
    const score = scores[base] || 0;
    const pct = score / 1000.0;
    return getCoordinates(idx, pct);
  });
  const dataPolygonString = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div
      className="hologram-card p-6 rounded-xl text-white font-sans flex flex-col items-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(8,12,25,0.96), rgba(5,6,15,0.98))",
        border: "1px solid #00f0ff",
        boxShadow: "0 0 20px rgba(0,240,255,0.2)",
      }}
    >
      <div className="w-full flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-2">
        <h2 className="text-sm font-bold font-mono tracking-widest text-cyan-300 uppercase flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#00f0ff", boxShadow: "0 0 6px #00f0ff" }}
          />
          Radar Octogonal des 8 Bases
        </h2>
        <span className="text-xs font-mono text-slate-400">
          Équilibre Harmonique
        </span>
      </div>

      <svg width={size} height={size} className="overflow-visible select-none">
        {/* Grilles concentriques octogonales */}
        {concentricLevels.map((lvl) => {
          const points = BASES.map((_, idx) => getCoordinates(idx, lvl))
            .map((p) => `${p.x},${p.y}`)
            .join(" ");
          return (
            <polygon
              key={lvl}
              points={points}
              fill="none"
              stroke="#00f0ff"
              strokeOpacity={lvl === 1.0 ? 0.35 : 0.12}
              strokeWidth={lvl === 1.0 ? 1.5 : 1}
            />
          );
        })}

        {/* Axes radiaux partant du centre */}
        {BASES.map((_, idx) => {
          const outer = getCoordinates(idx, 1.0);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#00f0ff"
              strokeOpacity={0.2}
              strokeWidth={1}
            />
          );
        })}

        {/* Polygone de données des scores du Chasseur */}
        <polygon
          points={dataPolygonString}
          fill="rgba(0, 240, 255, 0.28)"
          stroke="#00f0ff"
          strokeWidth={2}
          style={{ filter: "drop-shadow(0 0 8px rgba(0,240,255,0.6))" }}
        />

        {/* Points aux sommets et étiquettes */}
        {BASES.map((base, idx) => {
          const pt = dataPoints[idx];
          const labelPos = getCoordinates(idx, 1.18);
          const score = scores[base] || 0;

          return (
            <g key={base}>
              {/* Point lumineux sur la jauge */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill="#00f0ff"
                stroke="#ffffff"
                strokeWidth={1.5}
                style={{ filter: "drop-shadow(0 0 6px #00f0ff)" }}
              />

              {/* Étiquette textuelle */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-mono text-[11px] font-bold"
                fill="#e2e8f0"
              >
                {base}
              </text>
              <text
                x={labelPos.x}
                y={labelPos.y + 12}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-mono text-[9px] font-semibold"
                fill="#38bdf8"
              >
                {score}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
