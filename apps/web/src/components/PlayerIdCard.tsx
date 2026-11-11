import React from "react";

export interface PlayerIdCardProps {
  username: string;
  currentTitle: string;
  currentLevel: number;
  rankCode: "E" | "D" | "C" | "B" | "A" | "S" | "MONARCH";
  totalXp: bigint | number;
  shadowCrystals: number;
}

export const PlayerIdCard: React.FC<PlayerIdCardProps> = ({
  username,
  currentTitle,
  currentLevel,
  rankCode,
  totalXp,
  shadowCrystals,
}) => {
  const isHighRank = rankCode === "S" || rankCode === "MONARCH";
  const rankBorderColor = isHighRank
    ? "#ffd700"
    : rankCode === "A"
      ? "#00f0ff"
      : "#64748b";
  const rankGlow = isHighRank
    ? "0 0 20px rgba(255,215,0,0.5)"
    : rankCode === "A"
      ? "0 0 15px rgba(0,240,255,0.4)"
      : "0 0 10px rgba(100,116,139,0.2)";

  return (
    <div
      className="hologram-card p-6 rounded-xl text-white font-sans transition-all duration-300"
      style={{
        background:
          "linear-gradient(135deg, rgba(12,18,34,0.95), rgba(6,8,18,0.98))",
        border: `1px solid ${rankBorderColor}`,
        boxShadow: rankGlow,
      }}
    >
      <div className="flex items-start justify-between border-b border-cyan-500/20 pb-4 mb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
            Identifiant Système Officiel
          </span>
          <h1 className="text-2xl font-black font-mono tracking-wide text-white flex items-center gap-2">
            {username}
          </h1>
          <p className="text-xs font-mono text-cyan-300/80 italic mt-0.5">
            {currentTitle}
          </p>
        </div>

        {/* Badge de Rang Canonique */}
        <div
          className="flex flex-col items-center justify-center w-16 h-16 rounded-lg font-mono font-black"
          style={{
            background: isHighRank
              ? "linear-gradient(135deg, #ffd700, #b45309)"
              : "linear-gradient(135deg, #0284c7, #0369a1)",
            boxShadow: rankGlow,
            color: isHighRank ? "#000000" : "#ffffff",
          }}
        >
          <span className="text-[9px] uppercase tracking-tighter opacity-80">
            RANG
          </span>
          <span className="text-xl leading-none">{rankCode}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">
            Niveau
          </span>
          <span className="text-lg font-mono font-bold text-cyan-300">
            {currentLevel}
          </span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">
            XP Totale
          </span>
          <span className="text-lg font-mono font-bold text-slate-200">
            {totalXp.toString()}
          </span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">
            Cristaux
          </span>
          <span className="text-lg font-mono font-bold text-amber-400 flex items-center justify-center gap-1">
            <span>✦</span>
            <span>{shadowCrystals}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
