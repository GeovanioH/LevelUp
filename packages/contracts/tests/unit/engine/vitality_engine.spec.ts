import { describe, it, expect } from "vitest";
import { NeurobiologicalVitalityEngine } from "../../../src/math/vitalityEngine";

describe("NeurobiologicalVitalityEngine - Décroissance Lente & Bilan Psychologique", () => {
  it("devrait maintenir un niveau HP >= 80% après 16 heures de veille active (Modèle de Borbély)", () => {
    const hpAfter16h = NeurobiologicalVitalityEngine.calculateHp(16, 22);
    expect(hpAfter16h).toBeGreaterThanOrEqual(80);
  });

  it("ne devrait JAMAIS faire descendre les HP en dessous de 60% en journée normale", () => {
    for (let hours = 0; hours <= 24; hours++) {
      const hp = NeurobiologicalVitalityEngine.calculateHp(
        hours,
        (8 + hours) % 24,
      );
      expect(hp).toBeGreaterThanOrEqual(60);
      expect(hp).toBeLessThanOrEqual(100);
    }
  });

  it("devrait restaurer +10 MP lors de la complétion d'une quête journalière (Pulse Dopaminergique)", () => {
    const initialMp = 80;
    const restored = NeurobiologicalVitalityEngine.applyDopamineReward(
      initialMp,
      "DAILY",
    );
    expect(restored).toBe(90);
  });

  it("devrait plafonner MP à 100 lors d'un gain de mana supérieur au max", () => {
    const initialMp = 95;
    const restored = NeurobiologicalVitalityEngine.applyDopamineReward(
      initialMp,
      "BOSS",
    );
    expect(restored).toBe(100);
  });

  it("devrait calculer la consommation douce de MP par bloc de travail selon Boksem", () => {
    const mp45 = NeurobiologicalVitalityEngine.calculateMpConsumption(45);
    expect(mp45).toBeGreaterThan(0);
    expect(mp45).toBeLessThan(15);
  });

  it("ne devrait jamais renvoyer de message évoquant la fatigue ou la faiblesse", () => {
    const testCases = [
      { hp: 100, mp: 100 },
      { hp: 85, mp: 80 },
      { hp: 65, mp: 60 },
      { hp: 60, mp: 50 },
    ];

    for (const { hp, mp } of testCases) {
      const statusText =
        NeurobiologicalVitalityEngine.getPsychologicalStatusText(hp, mp);
      expect(statusText).not.toMatch(
        /fatigué|épuisé|faible|repos|burnout|faiblesse|épuisement/i,
      );
      expect(statusText).toMatch(
        /SOUVERAIN|INÉBRANLABLE|DÉTERMINATION|CLARTÉ|VIGILANCE|FOCUS/i,
      );
    }
  });
});
