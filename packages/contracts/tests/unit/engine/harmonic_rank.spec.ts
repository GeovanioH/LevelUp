import { describe, it, expect } from "vitest";
import {
  HarmonicRankEngine,
  BaseScores,
  RealWorldAchievements,
} from "../../../src/math/harmonicRankEngine";

describe("HarmonicRankEngine - Moyenne Harmonique & Ancrage Réel des Rangs", () => {
  const balancedScores: BaseScores = {
    acad: 600,
    ai_eng: 650,
    cyber: 550,
    exp: 500,
    lng: 700,
    fin: 400,
    str: 600,
    dis: 600,
  };

  it("devrait sanctionner sévèrement le délaissement d'une seule base via la moyenne harmonique", () => {
    const neglectedScores: BaseScores = { ...balancedScores, str: 10 }; // STR délaissée
    const globalBalanced =
      HarmonicRankEngine.calculateGlobalScore(balancedScores);
    const globalNeglected =
      HarmonicRankEngine.calculateGlobalScore(neglectedScores);

    // Chute de plus de 60%
    expect(globalNeglected).toBeLessThan(globalBalanced * 0.4);
  });

  it("devrait calculer le score harmonique non pondéré strict (Sh = 8 / sum(1 / max(Sb, 1)))", () => {
    const shBalanced =
      HarmonicRankEngine.calculateHarmonicScoreSimple(balancedScores);
    const neglectedScores: BaseScores = { ...balancedScores, str: 1 };
    const shNeglected =
      HarmonicRankEngine.calculateHarmonicScoreSimple(neglectedScores);

    // Si une base tombe à 1, sum(1/max(Sb, 1)) dépasse 1, donc Sh chute sous 8
    expect(shNeglected).toBeLessThan(8);
    expect(shBalanced).toBeGreaterThan(400);
  });

  it("devrait vérifier que si 7 bases valent 800 mais que la 8ème vaut 10, Sh chute drastiquement et signale la base défaillante", () => {
    const scores7x800: BaseScores = {
      acad: 800,
      ai_eng: 800,
      cyber: 800,
      exp: 800,
      lng: 800,
      fin: 800,
      str: 800,
      dis: 10,
    };

    const sh = HarmonicRankEngine.calculateHarmonicScoreSimple(scores7x800);
    // 8 / (7/800 + 1/10) = 8 / (0.00875 + 0.1) = 8 / 0.10875 ≈ 73.56
    // Chute vertigineuse de plus de 90% par rapport à 800
    expect(sh).toBeLessThan(80);
    expect(sh).toBeGreaterThan(70);

    const failing = HarmonicRankEngine.identifyWeakestBase(scores7x800);
    expect(failing.base).toBe("dis");
    expect(failing.score).toBe(10);
  });

  it("ne doit JAMAIS attribuer le Rang B à un joueur sans victoire en hackathon (Invariant Réel Inviolable)", () => {
    const globalLevel = 55; // Niveau 55 suffisant théoriquement pour Rang B
    const withoutHackathon: RealWorldAchievements = {
      hackathonsWon: 0, // Pas de hackathon gagné
      cambridgeCertificationLevel: "C1",
      classRankPercentile: 0.05,
      calisthenicsRoutinesMastered: true,
      productionSaasUsers: 10,
      netWorthOrSponsorshipEur: 0,
    };

    const rank = HarmonicRankEngine.determineRank(
      globalLevel,
      withoutHackathon,
    );
    expect(rank).not.toBe("B");
    expect(rank).toBe("C"); // Reste plafonné au Rang C
  });

  it("devrait attribuer le Rang B si le joueur a un hackathon gagné, C1 Cambridge et calisthénie maîtrisée", () => {
    const globalLevel = 50;
    const withHackathon: RealWorldAchievements = {
      hackathonsWon: 1,
      cambridgeCertificationLevel: "C1",
      classRankPercentile: 0.08,
      calisthenicsRoutinesMastered: true,
      productionSaasUsers: 0,
      netWorthOrSponsorshipEur: 0,
    };

    const rank = HarmonicRankEngine.determineRank(globalLevel, withHackathon);
    expect(rank).toBe("B");
  });

  it("devrait exiger >= 2 hackathons, C1/C2 et calisthénie pour le Rang S", () => {
    const globalLevel = 90;
    const rankSReq: RealWorldAchievements = {
      hackathonsWon: 2,
      cambridgeCertificationLevel: "C1",
      classRankPercentile: 0.02,
      calisthenicsRoutinesMastered: true,
      productionSaasUsers: 100,
      netWorthOrSponsorshipEur: 20000,
    };
    expect(HarmonicRankEngine.determineRank(globalLevel, rankSReq)).toBe("S");
  });

  it("devrait exiger >= 3 hackathons, C2, top 1% et 100k€ pour le Rang MONARCH", () => {
    const globalLevel = 98;
    const monarchReq: RealWorldAchievements = {
      hackathonsWon: 3,
      cambridgeCertificationLevel: "C2",
      classRankPercentile: 0.01,
      calisthenicsRoutinesMastered: true,
      productionSaasUsers: 1000,
      netWorthOrSponsorshipEur: 150000,
    };
    expect(HarmonicRankEngine.determineRank(globalLevel, monarchReq)).toBe(
      "MONARCH",
    );
  });
});
