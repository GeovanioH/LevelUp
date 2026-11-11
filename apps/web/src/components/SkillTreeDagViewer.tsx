import React, { useState } from "react";

export interface DagNode {
  id: string;
  code: string;
  name: string;
  baseCode: string;
  tier: number; // 1 à 5
  requiredLevel: number;
  prerequisites: string[];
}

export interface DagEdge {
  from: string;
  to: string;
}

const BASES = [
  "ACAD",
  "AI_ENG",
  "CYBER",
  "EXP",
  "LNG",
  "FIN",
  "STR",
  "DIS",
] as const;

/**
 * Construit l'intégralité des 120 compétences officielles du DAG réparties sur les 8 bases (15 par base).
 */
export function buildCanonicalDag120(): { nodes: DagNode[]; edges: DagEdge[] } {
  const nodes: DagNode[] = [];
  const edges: DagEdge[] = [];

  for (const base of BASES) {
    for (let i = 1; i <= 15; i++) {
      const code = `${base}_${i < 10 ? "0" : ""}${i}`;
      const tier = Math.ceil(i / 3); // 5 paliers de 3 compétences
      const requiredLevel = (tier - 1) * 20 + ((i - 1) % 3) * 5 + 1;

      // Dépendance linéaire dans chaque branche pour garantir l'absence de cycles
      const prerequisites: string[] = [];
      if (i > 1) {
        const prevCode = `${base}_${i - 1 < 10 ? "0" : ""}${i - 1}`;
        prerequisites.push(prevCode);
        edges.push({ from: prevCode, to: code });
      }

      nodes.push({
        id: `node-${code}`,
        code,
        name: `Compétence ${code}`,
        baseCode: base,
        tier,
        requiredLevel,
        prerequisites,
      });
    }
  }

  return { nodes, edges };
}

/**
 * Détecte les cycles dans le graphe de dépendances (Tri Topologique / DFS).
 */
export function detectCyclesInDag(nodes: DagNode[], edges: DagEdge[]): boolean {
  const adj = new Map<string, string[]>();
  for (const node of nodes) {
    adj.set(node.code, []);
  }
  for (const edge of edges) {
    adj.get(edge.from)?.push(edge.to);
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function hasCycleDfs(code: string): boolean {
    visited.add(code);
    inStack.add(code);

    const neighbors = adj.get(code) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycleDfs(neighbor)) return true;
      } else if (inStack.has(neighbor)) {
        return true; // Cycle détecté
      }
    }

    inStack.delete(code);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.code)) {
      if (hasCycleDfs(node.code)) return true;
    }
  }

  return false;
}

export interface SkillTreeDagViewerProps {
  nodes?: DagNode[];
  edges?: DagEdge[];
  unlockedNodeCodes?: Set<string>;
  onSelectNode?: (node: DagNode) => void;
}

export const SkillTreeDagViewer: React.FC<SkillTreeDagViewerProps> = ({
  nodes,
  edges,
  unlockedNodeCodes = new Set(),
  onSelectNode,
}) => {
  const [selectedBase, setSelectedBase] = useState<string>("ALL");

  const dag = React.useMemo(() => {
    if (nodes && edges) return { nodes, edges };
    return buildCanonicalDag120();
  }, [nodes, edges]);

  const filteredNodes = dag.nodes.filter(
    (n) => selectedBase === "ALL" || n.baseCode === selectedBase,
  );

  return (
    <div
      className="hologram-card p-6 text-white font-sans rounded-xl"
      style={{
        background:
          "linear-gradient(135deg, rgba(8,12,24,0.96), rgba(4,6,14,0.98))",
        border: "1px solid #00f0ff",
        boxShadow: "0 0 25px rgba(0,240,255,0.2)",
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-cyan-500/30 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-widest text-cyan-300 uppercase flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: "#00f0ff",
                boxShadow: "0 0 8px #00f0ff",
              }}
            />
            ARBRE DU MONARQUE
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Graphe acyclique orienté • 120 COMPÉTENCES ÉLITES
          </p>
        </div>

        {/* Filtres par Base */}
        <div className="flex flex-wrap gap-1.5 mt-2 sm:mt-0">
          <button
            onClick={() => setSelectedBase("ALL")}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
              selectedBase === "ALL"
                ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_#00f0ff]"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            TOUTES
          </button>
          {BASES.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBase(b)}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                selectedBase === b
                  ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_#00f0ff]"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Grille Interactive des Nœuds du DAG */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-1">
        {filteredNodes.map((node) => {
          const isUnlocked = unlockedNodeCodes.has(node.code);

          return (
            <div
              key={node.code}
              onClick={() => onSelectNode?.(node)}
              className={`cursor-pointer p-3 rounded-lg border text-left transition-all duration-300 transform hover:scale-[1.02] ${
                isUnlocked
                  ? "bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.35)]"
                  : "bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-90"
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                <span
                  className={
                    isUnlocked ? "text-cyan-300 font-bold" : "text-slate-500"
                  }
                >
                  {node.baseCode}
                </span>
                <span className="text-slate-400">T{node.tier}</span>
              </div>
              <h3 className="text-xs font-bold font-mono tracking-wide text-white truncate">
                {node.code}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Lvl requis : {node.requiredLevel}
              </p>
              <div className="mt-2 text-[9px] font-mono uppercase font-semibold text-right">
                {isUnlocked ? (
                  <span className="text-emerald-400">DÉVERROUILLÉ</span>
                ) : (
                  <span className="text-slate-500">VERROUILLÉ</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
