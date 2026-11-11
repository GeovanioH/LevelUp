// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayerIdCard } from "../../../src/components/PlayerIdCard";
import { OctagonalRadar } from "../../../src/components/OctagonalRadar";
import { DailyQuestsModal } from "../../../src/components/DailyQuestsModal";
import { ProceduralAudioEngine } from "../../../src/audio/proceduralAudioEngine";

describe("Composants Additionnels HUD Solo Leveling", () => {
  it("PlayerIdCard : Affiche le profil de Huriel, le badge de rang et les cristaux", () => {
    render(
      <PlayerIdCard
        username="Huriel"
        currentTitle="L'Éveillé Novice"
        currentLevel={1}
        rankCode="E"
        totalXp={100n}
        shadowCrystals={50}
      />,
    );

    expect(screen.getByText("Huriel")).toBeDefined();
    expect(screen.getByText("L'Éveillé Novice")).toBeDefined();
    expect(screen.getByText("E")).toBeDefined();
    expect(screen.getByText("50")).toBeDefined();
  });

  it("PlayerIdCard : Adapte la bordure dorée pour le Rang S ou MONARCH", () => {
    const { container } = render(
      <PlayerIdCard
        username="Huriel"
        currentTitle="Monarque des Ombres"
        currentLevel={98}
        rankCode="MONARCH"
        totalXp={900000n}
        shadowCrystals={1500}
      />,
    );

    expect(screen.getByText("MONARCH")).toBeDefined();
    expect(container.innerHTML).toContain("rgb(255, 215, 0)");
  });

  it("OctagonalRadar : Calcule et dessine le polygone SVG des 8 bases", () => {
    const { container } = render(
      <OctagonalRadar
        scores={{
          ACAD: 800,
          AI_ENG: 900,
          CYBER: 750,
          EXP: 600,
          LNG: 850,
          FIN: 700,
          STR: 800,
          DIS: 850,
        }}
      />,
    );

    expect(screen.getByText(/Radar Octogonal/i)).toBeDefined();
    expect(screen.getByText("AI_ENG")).toBeDefined();
    expect(screen.getByText("900")).toBeDefined();

    const polygon = container.querySelector(
      'polygon[fill*="rgba(0, 240, 255"]',
    );
    expect(polygon).toBeDefined();
  });

  it("DailyQuestsModal : Affiche les quêtes actives et déclenche l'action de validation", () => {
    const onComplete = vi.fn();
    const mockQuests = [
      {
        id: "q1",
        title: "Calisthénie Dos & Épaules",
        category: "SPORT",
        targetStat: "STR",
        xpReward: 500,
        isCompleted: false,
      },
      {
        id: "q2",
        title: "Revue Article NeurIPS",
        category: "IA",
        targetStat: "AI_ENG",
        xpReward: 400,
        isCompleted: true,
      },
    ];

    render(
      <DailyQuestsModal
        isOpen={true}
        onClose={vi.fn()}
        quests={mockQuests}
        onCompleteQuest={onComplete}
      />,
    );

    expect(screen.getByText(/Calisthénie Dos & Épaules/i)).toBeDefined();
    expect(screen.getByText(/Revue Article NeurIPS/i)).toBeDefined();
    expect(screen.getByText("✓ VALIDÉ")).toBeDefined();

    const validerBtn = screen.getByText("Valider");
    fireEvent.click(validerBtn);
    expect(onComplete).toHaveBeenCalledWith("q1");
  });

  it("ProceduralAudioEngine : Synthétise les effets sans exception", () => {
    const audio = new ProceduralAudioEngine();
    expect(() => audio.playSystemNotification()).not.toThrow();
    expect(() => audio.playLevelUpFanfare()).not.toThrow();
    expect(() => audio.playPenaltyAlarm()).not.toThrow();
  });
});
