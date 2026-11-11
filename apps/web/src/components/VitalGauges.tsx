import React from "react";
import { NeurobiologicalVitalityEngine } from "@levelup/contracts";

export interface VitalGaugesProps {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  hoursAwake?: number;
}

export const VitalGauges: React.FC<VitalGaugesProps> = ({
  hp,
  maxHp,
  mp,
  maxMp,
  hoursAwake = 8,
}) => {
  const hpClamped = Math.max(0, Math.min(maxHp, hp));
  const mpClamped = Math.max(0, Math.min(maxMp, mp));

  const hpPercent = Math.round((hpClamped / (maxHp || 100)) * 100);
  const mpPercent = Math.round((mpClamped / (maxMp || 100)) * 100);

  // Titre souverain selon le modèle neurobiologique
  const statusTitle =
    hpPercent >= 80 && mpPercent >= 80
      ? "RÉSILIENCE BIOLOGIQUE SOUVERAINE & FOCUS COGNITIF INDOMPTABLE"
      : NeurobiologicalVitalityEngine.getPsychologicalStatusText(
          hpPercent,
          mpPercent,
        );

  return (
    <div
      className="hologram-card p-6 rounded-lg text-white font-sans"
      style={{
        background:
          "linear-gradient(135deg, rgba(10,15,30,0.95), rgba(5,5,15,0.98))",
        border: "1px solid #00f0ff",
        boxShadow: "0 0 20px rgba(0,240,255,0.25)",
      }}
    >
      {/* En-tête Statut Souverain */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <span
            className="w-3 h-3 rounded-full animate-pulse"
            style={{
              backgroundColor: "#00f0ff",
              boxShadow: "0 0 10px #00f0ff",
            }}
          />
          <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
            État Biophysique du Chasseur
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Éveil : {hoursAwake}h
        </span>
      </div>

      <div className="text-sm font-bold tracking-wide text-cyan-200 mb-6 font-mono text-center uppercase py-1 px-3 rounded bg-cyan-950/40 border border-cyan-500/30">
        {statusTitle}
      </div>

      {/* Jauge HP (Points de Vie / Résilience Biologique) */}
      <div className="mb-5">
        <div className="flex justify-between items-center text-xs font-mono mb-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-emerald-400">HP</span>
            <span className="text-slate-400">RÉSILIENCE BIOLOGIQUE</span>
          </div>
          <span className="text-emerald-300 font-semibold">
            {hpClamped} / {maxHp} ({hpPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-900/90 h-4 rounded-full overflow-hidden border border-emerald-500/30 p-[2px]">
          <div
            data-testid="hp-gauge-fill"
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${hpPercent}%`,
              background: "linear-gradient(90deg, #059669, #10b981, #34d399)",
              boxShadow: "0 0 12px rgba(16,185,129,0.7)",
            }}
          />
        </div>
      </div>

      {/* Jauge MP (Mana / Acuité & Focus Cognitif) */}
      <div>
        <div className="flex justify-between items-center text-xs font-mono mb-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-cyan-400">MP</span>
            <span className="text-slate-400">FOCUS COGNITIF</span>
          </div>
          <span className="text-cyan-300 font-semibold">
            {mpClamped} / {maxMp} ({mpPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-900/90 h-4 rounded-full overflow-hidden border border-cyan-500/30 p-[2px]">
          <div
            data-testid="mp-gauge-fill"
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${mpPercent}%`,
              background: "linear-gradient(90deg, #8a2be2, #00f0ff, #38bdf8)",
              boxShadow: "0 0 12px rgba(0,240,255,0.7)",
            }}
          />
        </div>
      </div>
    </div>
  );
};
