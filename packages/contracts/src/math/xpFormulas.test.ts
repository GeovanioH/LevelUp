import { describe, it, expect } from "vitest";
import {
  calculateNextLevelXp,
  calculatePlayerLevelFromTotalXp,
  calculateRankFromLevel,
  RankCode,
  LevelUpMathEngine,
} from "./xpFormulas";

describe("xpFormulas unit suite in @levelup/contracts", () => {
  it("calcule correctement les paliers d'XP", () => {
    expect(calculateNextLevelXp(1)).toBe(100);
    expect(calculateNextLevelXp(5)).toBe(1600);
    expect(calculateNextLevelXp(14)).toBe(10100);
  });

  it("calcule les niveaux à partir du total d'XP", () => {
    expect(calculatePlayerLevelFromTotalXp(0n)).toBe(1);
    expect(calculatePlayerLevelFromTotalXp(100n)).toBe(2);
    expect(calculatePlayerLevelFromTotalXp(18450n)).toBe(14);
  });

  it("attribue les 7 rangs canoniques de façon stricte", () => {
    expect(calculateRankFromLevel(1)).toBe(RankCode.E);
    expect(calculateRankFromLevel(10)).toBe(RankCode.E);
    expect(calculateRankFromLevel(11)).toBe(RankCode.D);
    expect(calculateRankFromLevel(25)).toBe(RankCode.D);
    expect(calculateRankFromLevel(26)).toBe(RankCode.C);
    expect(calculateRankFromLevel(45)).toBe(RankCode.C);
    expect(calculateRankFromLevel(46)).toBe(RankCode.B);
    expect(calculateRankFromLevel(65)).toBe(RankCode.B);
    expect(calculateRankFromLevel(66)).toBe(RankCode.A);
    expect(calculateRankFromLevel(85)).toBe(RankCode.A);
    expect(calculateRankFromLevel(86)).toBe(RankCode.S);
    expect(calculateRankFromLevel(95)).toBe(RankCode.S);
    expect(calculateRankFromLevel(96)).toBe(RankCode.MONARCH);
    expect(calculateRankFromLevel(100)).toBe(RankCode.MONARCH);
  });

  it("vérifie le LevelUpMathEngine et le calcul de niveau 14 à 18450 XP", () => {
    const progress = LevelUpMathEngine.getLevelProgress(18450n);
    expect(progress.currentLevel).toBe(14);
  });
});
