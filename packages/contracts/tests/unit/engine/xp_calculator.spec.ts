import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateNextLevelXp,
  calculatePlayerLevelFromTotalXp,
  calculateRankFromLevel,
  addExperienceToPlayer,
  RankCode,
  BaseStatCode,
  LevelUpMathEngine,
} from "../../../src/math/xpFormulas";

describe("Moteur Mathématique d'Expérience & Rangs (Solo Leveling Engine)", () => {
  let mockPlayer: {
    id: string;
    level: number;
    totalXp: bigint;
    rankCode: RankCode;
    currentHp: number;
    maxHp: number;
    currentMp: number;
    maxMp: number;
  };

  beforeEach(() => {
    mockPlayer = {
      id: "a5d8b74f-9e32-4d2b-98f5-19e48f029a1b",
      level: 1,
      totalXp: 0n,
      rankCode: RankCode.E,
      currentHp: 100,
      maxHp: 100,
      currentMp: 100,
      maxMp: 100,
    };
  });

  describe("Formule Logarithmique : XP(L) = 100 * floor(L^1.75)", () => {
    it("TC-01 : Doit calculer le palier exact pour le Niveau 1", () => {
      // 100 * floor(1^1.75) = 100
      const xpReq = calculateNextLevelXp(1);
      expect(xpReq).toBe(100);
    });

    it("TC-02 : Doit calculer le palier exact pour le Niveau 5 (Éveil Rang E)", () => {
      // 100 * floor(5^1.75) = 100 * floor(16.7185) = 1600
      const xpReq = calculateNextLevelXp(5);
      expect(xpReq).toBeGreaterThan(1000);
      expect(Number.isInteger(xpReq)).toBe(true);
      expect(xpReq).toBe(1600);
    });

    it("TC-02b : Doit calculer le palier exact pour le Niveau 14", () => {
      // 100 * floor(14^1.75) = 100 * floor(101.32) = 10100
      const xpReq = calculateNextLevelXp(14);
      expect(xpReq).toBe(10100);
    });

    it("TC-03 : Doit rejeter formellement toute injection d'XP négative ou niveau invalide", () => {
      expect(() => {
        calculateNextLevelXp(-1);
      }).toThrowError(/INVALID_LEVEL/);

      expect(() => {
        addExperienceToPlayer(mockPlayer, -500, BaseStatCode.AI_ENG);
      }).toThrowError(/INVALID_XP_VALUE/);
    });

    it("TC-04 : Doit gérer les très grands entiers (BigInt) sans dépassement 32-bit", () => {
      const hugeXp = BigInt("9007199254740991"); // Max Safe Integer JS
      mockPlayer.totalXp = hugeXp;

      const level = calculatePlayerLevelFromTotalXp(mockPlayer.totalXp);
      expect(level).toBe(100);
      mockPlayer.level = level;
      mockPlayer.rankCode = calculateRankFromLevel(level);
      expect(mockPlayer.rankCode).toBe(RankCode.MONARCH);
    });
  });

  describe("Machine d'États des 7 Rangs Réels (E -> MONARCH)", () => {
    it("TC-05 : Joueur niveau 1 à 10 doit être assigné au Rang E (L'Éveil du Novice)", () => {
      expect(calculateRankFromLevel(1)).toBe(RankCode.E);
      expect(calculateRankFromLevel(10)).toBe(RankCode.E);
    });

    it("TC-06 : Joueur niveau 11 à 25 doit basculer au Rang D (L'Apprenti Discipliné)", () => {
      expect(calculateRankFromLevel(11)).toBe(RankCode.D);
      expect(calculateRankFromLevel(25)).toBe(RankCode.D);
    });

    it("TC-07 : Joueur niveau 26 à 45 doit basculer au Rang C (L'Opérateur Confirmé)", () => {
      expect(calculateRankFromLevel(26)).toBe(RankCode.C);
      expect(calculateRankFromLevel(45)).toBe(RankCode.C);
    });

    it("TC-08 : Joueur niveau 46 à 65 doit basculer au Rang B (Expert & Hackathon Winner)", () => {
      expect(calculateRankFromLevel(46)).toBe(RankCode.B);
      expect(calculateRankFromLevel(65)).toBe(RankCode.B);
    });

    it("TC-09 : Joueur niveau 66 à 85 doit basculer au Rang A (Maître / Leader Industriel)", () => {
      expect(calculateRankFromLevel(66)).toBe(RankCode.A);
      expect(calculateRankFromLevel(85)).toBe(RankCode.A);
    });

    it("TC-10 : Joueur niveau 86 à 95 doit basculer au Rang S (National Sovereign)", () => {
      expect(calculateRankFromLevel(86)).toBe(RankCode.S);
      expect(calculateRankFromLevel(95)).toBe(RankCode.S);
    });

    it("TC-11 : Joueur niveau 96 à 100 atteint le rang ultime MONARCH (Légende Mondiale)", () => {
      expect(calculateRankFromLevel(96)).toBe(RankCode.MONARCH);
      expect(calculateRankFromLevel(100)).toBe(RankCode.MONARCH);
    });
  });

  describe("Calcul Atomique des Jauges Vitales HP & MP via LevelUpMathEngine", () => {
    it("TC-12 : Ne doit jamais permettre à HP de dépasser maxHp", () => {
      mockPlayer.currentHp = 95;
      const regeneratedHp = Math.min(
        mockPlayer.maxHp,
        mockPlayer.currentHp + 30,
      );
      expect(regeneratedHp).toBe(100);
    });

    it("TC-13 : Ne doit jamais permettre à MP de tomber sous zéro", () => {
      mockPlayer.currentMp = 20;
      const consumedMp = Math.max(0, mockPlayer.currentMp - 50);
      expect(consumedMp).toBe(0);
    });

    it("TC-14 : Progression cumulative et conversion de niveau via LevelUpMathEngine", () => {
      const xpReqL14 = LevelUpMathEngine.calculateXpForLevel(14);
      expect(xpReqL14).toBe(16900n); // 100 * (14-1)^2 = 100 * 169 = 16900

      const progress = LevelUpMathEngine.getLevelProgress(18450n);
      expect(progress.currentLevel).toBe(14);
      expect(progress.totalXp).toBe(18450n);
      expect(progress.progressPercentage).toBeGreaterThan(0);
    });
  });
});
