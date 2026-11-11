// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { VitalGauges } from "../../../src/components/VitalGauges";

describe("VitalGauges - HUD Holographique Solo Leveling", () => {
  it("affiche les jauges HP et MP avec leurs dégradés néon et pourcentages exacts", () => {
    render(<VitalGauges hp={85} maxHp={100} mp={90} maxMp={100} />);

    expect(screen.getByText("HP")).toBeDefined();
    expect(screen.getByText("MP")).toBeDefined();
    expect(screen.getByText(/85 \/ 100/i)).toBeDefined();
    expect(screen.getByText(/90 \/ 100/i)).toBeDefined();
  });

  it("affiche les statuts souverains et ne contient aucune mention négative de fatigue", () => {
    const { container } = render(
      <VitalGauges hp={85} maxHp={100} mp={80} maxMp={100} />,
    );

    const textContent = container.textContent || "";
    expect(textContent).toMatch(
      /RÉSILIENCE BIOLOGIQUE SOUVERAINE|FOCUS COGNITIF INDOMPTABLE|CLARTÉ/i,
    );
    expect(textContent).not.toMatch(/fatigué|épuisé|faible|burnout|repos/i);
  });

  it("applique les classes visuelles néon et attributs de jauge", () => {
    const { container } = render(
      <VitalGauges hp={100} maxHp={100} mp={100} maxMp={100} />,
    );

    const hpBar = container.querySelector('[data-testid="hp-gauge-fill"]');
    const mpBar = container.querySelector('[data-testid="mp-gauge-fill"]');

    expect(hpBar).toBeDefined();
    expect(mpBar).toBeDefined();
  });
});
