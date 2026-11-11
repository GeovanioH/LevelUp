export interface BaseScores {
  acad: number;
  ai_eng: number;
  cyber: number;
  exp: number;
  lng: number;
  fin: number;
  str: number;
  dis: number;
}

export interface RealWorldAchievements {
  hackathonsWon: number;
  cambridgeCertificationLevel: "NONE" | "B2" | "C1" | "C2";
  classRankPercentile: number; // Ex: 0.05 = Top 5%
  calisthenicsRoutinesMastered: boolean;
  productionSaasUsers: number;
  netWorthOrSponsorshipEur: number;
}

export type HunterRank = "E" | "D" | "C" | "B" | "A" | "S" | "MONARCH";

export class HarmonicRankEngine {
  public static readonly WEIGHTS: Record<keyof BaseScores, number> = {
    acad: 0.15,
    ai_eng: 0.2,
    cyber: 0.1,
    exp: 0.1,
    lng: 0.15,
    fin: 0.05,
    str: 0.15,
    dis: 0.1,
  };

  /**
   * Calcule le niveau individuel d'une base (0 - 100) :
   * L_b = min(100, floor(sqrt(max(0, S_b) / 1000) * 100))
   */
  public static calculateBaseLevel(baseScore: number): number {
    return Math.min(
      100,
      Math.floor(Math.sqrt(Math.max(0, baseScore) / 1000.0) * 100),
    );
  }

  /**
   * Moyenne Harmonique Pondérée des 8 bases :
   * S_global = sum(w_b) / sum(w_b / (S_b + epsilon))
   */
  public static calculateGlobalScore(scores: BaseScores): number {
    const epsilon = 0.01;
    let invertedWeightedSum = 0;
    let totalWeight = 0;

    for (const [key, weight] of Object.entries(this.WEIGHTS) as [
      keyof BaseScores,
      number,
    ][]) {
      const score = Math.max(0, scores[key] || 0);
      invertedWeightedSum += weight / (score + epsilon);
      totalWeight += weight;
    }

    return totalWeight / invertedWeightedSum;
  }

  /**
   * Formule dogmatique stricte : Sh = 8 / sum(1 / max(S_b, 1))
   */
  public static calculateHarmonicScoreSimple(
    scores: BaseScores | Record<string, number>,
  ): number {
    const values = [
      scores.acad ?? 0,
      scores.ai_eng ?? 0,
      scores.cyber ?? 0,
      scores.exp ?? 0,
      scores.lng ?? 0,
      scores.fin ?? 0,
      scores.str ?? 0,
      scores.dis ?? 0,
    ];

    let invertedSum = 0;
    for (const val of values) {
      const bounded = Math.max(1, val);
      invertedSum += 1.0 / bounded;
    }

    return 8.0 / invertedSum;
  }

  /**
   * Calcule le niveau global à partir du score harmonique global.
   */
  public static calculateGlobalLevel(globalScore: number): number {
    return Math.min(
      100,
      Math.floor(Math.sqrt(Math.max(0, globalScore) / 1000.0) * 100),
    );
  }

  /**
   * Détermine le rang officiel en appliquant strictement les critères de rang et les invariants réels.
   */
  public static determineRank(
    globalLevel: number,
    real: RealWorldAchievements,
  ): HunterRank {
    // 1. Rang MONARCH (96 - 100) : Sommet absolu
    if (
      globalLevel >= 96 &&
      real.hackathonsWon >= 3 &&
      real.cambridgeCertificationLevel === "C2" &&
      real.classRankPercentile <= 0.01 &&
      real.calisthenicsRoutinesMastered &&
      real.netWorthOrSponsorshipEur >= 100000
    ) {
      return "MONARCH";
    }

    // 2. Rang S (86 - 95) : Souverain National
    if (
      globalLevel >= 86 &&
      real.hackathonsWon >= 2 &&
      (real.cambridgeCertificationLevel === "C1" ||
        real.cambridgeCertificationLevel === "C2") &&
      real.classRankPercentile <= 0.03 &&
      real.calisthenicsRoutinesMastered
    ) {
      return "S";
    }

    // 3. Rang A (66 - 85) : Maître & Leader Industriel
    if (
      globalLevel >= 66 &&
      real.hackathonsWon >= 1 &&
      (real.cambridgeCertificationLevel === "C1" ||
        real.cambridgeCertificationLevel === "C2") &&
      real.classRankPercentile <= 0.1 &&
      real.productionSaasUsers >= 50
    ) {
      return "A";
    }

    // 4. Rang B (46 - 65) : Invariant Réel Inviolable (Au moins 1 hackathon remporté obligatoire)
    if (
      globalLevel >= 46 &&
      real.hackathonsWon >= 1 &&
      (real.cambridgeCertificationLevel === "C1" ||
        real.cambridgeCertificationLevel === "C2") &&
      real.calisthenicsRoutinesMastered
    ) {
      return "B";
    }

    // 5. Rang C (26 - 45) : Opérateur Confirmé
    if (globalLevel >= 26) {
      return "C";
    }

    // 6. Rang D (11 - 25) : Apprenti Discipliné
    if (globalLevel >= 11) {
      return "D";
    }

    // 7. Rang E (1 - 10) : L'Éveil du Novice
    return "E";
  }
}
