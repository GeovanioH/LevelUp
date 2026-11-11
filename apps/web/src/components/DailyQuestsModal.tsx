import React, { useState } from "react";

export interface DailyQuestItem {
  id: string;
  title: string;
  category: string;
  targetStat: string;
  xpReward: number;
  isCompleted: boolean;
}

export interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: DailyQuestItem[];
  onCompleteQuest: (questId: string) => Promise<void> | void;
}

export const DailyQuestsModal: React.FC<DailyQuestsModalProps> = ({
  isOpen,
  onClose,
  quests,
  onCompleteQuest,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const completedCount = quests.filter((q) => q.isCompleted).length;
  const progressPct =
    quests.length > 0 ? Math.round((completedCount / quests.length) * 100) : 0;

  const handleComplete = async (questId: string) => {
    setLoadingId(questId);
    try {
      await onCompleteQuest(questId);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="hologram-card w-full max-w-xl text-white font-sans p-6 rounded-2xl relative animate-in fade-in zoom-in-95 duration-200"
        style={{
          background:
            "linear-gradient(135deg, rgba(12,16,30,0.98), rgba(6,7,16,0.99))",
          border: "1.5px solid #00f0ff",
          boxShadow: "0 0 35px rgba(0,240,255,0.3)",
        }}
      >
        {/* Header avec Alerte Système */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <span
              className="w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: "#ff003c" }}
            />
            <h2 className="text-lg font-black font-mono tracking-widest text-cyan-300 uppercase">
              [QUÊTE JOURNALIÈRE DU SYSTÈME]
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-sm px-2 py-0.5 rounded border border-slate-700 hover:border-cyan-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Barre de Progression Journalière */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="text-slate-300">PROGRESSION DE L'ÉPREUVE</span>
            <span className="text-cyan-300 font-bold">
              {completedCount} / {quests.length} ({progressPct}%)
            </span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-cyan-500/20">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #0284c7, #00f0ff)",
                boxShadow: "0 0 10px rgba(0,240,255,0.7)",
              }}
            />
          </div>
        </div>

        {/* Liste des Objectifs */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                quest.isCompleted
                  ? "bg-emerald-950/20 border-emerald-500/40 opacity-80"
                  : "bg-slate-900/60 border-slate-800 hover:border-cyan-500/50"
              }`}
            >
              <div>
                <div className="flex items-center space-x-2 text-[10px] font-mono mb-1">
                  <span className="text-cyan-400 font-bold">
                    {quest.targetStat}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{quest.category}</span>
                </div>
                <h3
                  className={`text-sm font-semibold tracking-wide ${
                    quest.isCompleted
                      ? "text-slate-400 line-through"
                      : "text-slate-100"
                  }`}
                >
                  {quest.title}
                </h3>
                <span className="text-[11px] font-mono text-amber-400 font-medium">
                  +{quest.xpReward} XP
                </span>
              </div>

              <div>
                {quest.isCompleted ? (
                  <span className="text-xs font-mono font-bold text-emerald-400 px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-lg">
                    ✓ VALIDÉ
                  </span>
                ) : (
                  <button
                    disabled={loadingId === quest.id}
                    onClick={() => handleComplete(quest.id)}
                    className="text-xs font-mono font-bold text-black bg-cyan-400 hover:bg-cyan-300 px-3.5 py-1.5 rounded-lg shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all transform active:scale-95 disabled:opacity-50"
                  >
                    {loadingId === quest.id ? "Validation..." : "Valider"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pied d'Avertissement Zone de Pénalité */}
        <div className="mt-5 pt-3 border-t border-red-500/20 flex items-center justify-between text-[11px] font-mono">
          <span className="text-red-400 flex items-center gap-1.5">
            <span>⚠</span>
            <span>
              Échec avant 22h00 : Déclenchement de la Zone de Pénalité.
            </span>
          </span>
          <span className="text-slate-400">NextDNS Watchdog Actif</span>
        </div>
      </div>
    </div>
  );
};
