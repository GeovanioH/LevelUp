// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  SkillTreeDagViewer,
  buildCanonicalDag120,
  detectCyclesInDag,
} from "../../../src/components/SkillTreeDagViewer";

describe("SkillTreeDagViewer - Arbre des 120 Compétences & Détection de Cycles", () => {
  it("TC-2.2a : Doit générer exactement les 120 compétences officielles du DAG réparties sur les 8 bases", () => {
    const dag = buildCanonicalDag120();
    expect(dag.nodes.length).toBe(120);

    const baseCounts: Record<string, number> = {};
    for (const node of dag.nodes) {
      baseCounts[node.baseCode] = (baseCounts[node.baseCode] || 0) + 1;
    }

    // 8 bases x 15 compétences = 120
    expect(Object.keys(baseCounts).length).toBe(8);
    for (const base of [
      "ACAD",
      "AI_ENG",
      "CYBER",
      "EXP",
      "LNG",
      "FIN",
      "STR",
      "DIS",
    ]) {
      expect(baseCounts[base]).toBe(15);
    }
  });

  it("TC-2.2b : Ne doit comporter aucun cycle bloquant dans les arêtes de dépendance (DAG valide)", () => {
    const dag = buildCanonicalDag120();
    const hasCycle = detectCyclesInDag(dag.nodes, dag.edges);
    expect(hasCycle).toBe(false);
  });

  it("TC-2.2c : Rend le composant interactif avec les catégories et les états déverrouillé/verrouillé", () => {
    const dag = buildCanonicalDag120();
    // Déverrouille les nœuds racines
    const unlockedNodeCodes = new Set([
      "ACAD_01",
      "AI_01",
      "CYBER_01",
      "STR_01",
    ]);

    render(
      <SkillTreeDagViewer
        nodes={dag.nodes}
        edges={dag.edges}
        unlockedNodeCodes={unlockedNodeCodes}
      />,
    );

    expect(screen.getByText(/ARBRE DU MONARQUE/i)).toBeDefined();
    expect(screen.getByText(/120 COMPÉTENCES/i)).toBeDefined();
  });
});
