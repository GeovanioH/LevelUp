export enum RankCode {
  E = "E",
  D = "D",
  C = "C",
  B = "B",
  A = "A",
  S = "S",
  MONARCH = "MONARCH",
}

export enum BaseStatCode {
  ACAD = "ACAD",
  AI_ENG = "AI_ENG",
  CYBER = "CYBER",
  EXP = "EXP",
  LNG = "LNG",
  FIN = "FIN",
  STR = "STR",
  DIS = "DIS",
}

export class InvalidExperienceValueException extends Error {
  constructor(
    message = "INVALID_XP_VALUE: Le montant d'XP doit être strictement positif.",
  ) {
    super(message);
    this.name = "InvalidExperienceValueException";
  }
}

export class InvalidLevelException extends Error {
  constructor(
    message = "INVALID_LEVEL: Le niveau doit être un entier supérieur ou égal à 1.",
  ) {
    super(message);
    this.name = "InvalidLevelException";
  }
}

/**
 * Calcule l'XP requise pour atteindre le niveau suivant depuis le niveau L :
 * XP(L) = 100 * floor(L^1.75)
 */
export function calculateNextLevelXp(level: number): number {
  if (level < 1 || !Number.isInteger(level)) {
    throw new InvalidLevelException();
  }
  return 100 * Math.floor(Math.pow(level, 1.75));
}

/**
 * Calcule le rang canonique strict selon l'échelle des 7 rangs (100 niveaux).
 */
export function calculateRankFromLevel(level: number): RankCode {
  if (level >= 96) return RankCode.MONARCH;
  if (level >= 86) return RankCode.S;
  if (level >= 66) return RankCode.A;
  if (level >= 46) return RankCode.B;
  if (level >= 26) return RankCode.C;
  if (level >= 11) return RankCode.D;
  return RankCode.E;
}

/**
 * Calcule le niveau du joueur à partir du montant total d'expérience.
 * L = min(100, max(1, floor(1 + sqrt(totalXp / 100))))
 */
export function calculatePlayerLevelFromTotalXp(
  totalXp: bigint | number,
): number {
  const xpBigInt =
    typeof totalXp === "bigint"
      ? totalXp
      : BigInt(Math.max(0, Math.floor(totalXp)));
  if (xpBigInt <= 0n) return 1;
  const xpNum = Number(xpBigInt);
  const calculatedLevel = Math.floor(1 + Math.sqrt(xpNum / 100.0));
  return Math.max(1, Math.min(100, calculatedLevel));
}

export interface PlayerLike {
  id: string;
  level: number;
  totalXp: bigint;
  rankCode: RankCode;
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
}

/**
 * Ajoute de l'expérience à un joueur et met à jour ses attributs de niveau et rang.
 */
export function addExperienceToPlayer(
  player: PlayerLike,
  xp: number,
  baseCode: BaseStatCode,
): { didLevelUp: boolean; newLevel: number; newRank: RankCode } {
  if (!Number.isFinite(xp) || xp <= 0) {
    throw new InvalidExperienceValueException();
  }

  const prevLevel = player.level;
  player.totalXp = player.totalXp + BigInt(Math.floor(xp));
  const newLevel = calculatePlayerLevelFromTotalXp(player.totalXp);
  const newRank = calculateRankFromLevel(newLevel);

  player.level = newLevel;
  player.rankCode = newRank;

  return {
    didLevelUp: newLevel > prevLevel,
    newLevel,
    newRank,
  };
}

export interface LevelProgress {
  currentLevel: number;
  totalXp: bigint;
  xpForCurrentLevel: bigint;
  xpForNextLevel: bigint;
  progressPercentage: number;
}

export class LevelUpMathEngine {
  private static readonly ALPHA = 2.0;
  private static readonly BETA = 100.0;

  /**
   * Calcule l'XP cumulative requise pour atteindre un niveau donné L :
   * XP_total(L) = floor(BETA * (L - 1)^ALPHA)
   */
  public static calculateXpForLevel(level: number): bigint {
    if (level <= 1) return 0n;
    const xpFloat = this.BETA * Math.pow(level - 1, this.ALPHA);
    return BigInt(Math.floor(xpFloat));
  }

  /**
   * Détermine le niveau atteint à partir d'un total d'XP :
   * L = min(100, floor(1 + sqrt(XP / BETA)))
   */
  public static calculateLevelFromXp(totalXp: bigint): number {
    return calculatePlayerLevelFromTotalXp(totalXp);
  }

  /**
   * Calcule la progression détaillée au sein du niveau courant.
   */
  public static getLevelProgress(totalXp: bigint): LevelProgress {
    const currentLevel = this.calculateLevelFromXp(totalXp);
    const xpCurrent = this.calculateXpForLevel(currentLevel);
    const xpNext = this.calculateXpForLevel(currentLevel + 1);

    const levelSpan = Number(xpNext - xpCurrent);
    const xpInLevel = Number(totalXp - xpCurrent);
    const progressPct = levelSpan > 0 ? (xpInLevel / levelSpan) * 100.0 : 100.0;

    return {
      currentLevel,
      totalXp,
      xpForCurrentLevel: xpCurrent,
      xpForNextLevel: xpNext,
      progressPercentage: Number(progressPct.toFixed(2)),
    };
  }

  /**
   * Calcule les points de vie (HP) au réveil selon les heures de sommeil :
   * HP_reveil = min(100, floor((sommeil / 8.0) * 80 + qualite * 4))
   */
  public static calculateWakeHp(
    sleepHours: number,
    perceivedQuality: number,
  ): number {
    const clampedSleep = Math.max(0, Math.min(14, sleepHours));
    const clampedQuality = Math.max(
      1,
      Math.min(5, Math.round(perceivedQuality)),
    );
    const calculated = (clampedSleep / 8.0) * 80.0 + clampedQuality * 4.0;
    return Math.max(0, Math.min(100, Math.floor(calculated)));
  }

  /**
   * Calcule la consommation d'énergie mentale (Delta MP) lors d'une session de Deep Work :
   * Delta_MP = floor(duree_minutes * 0.15 * multiplicateur_difficulte)
   */
  public static calculateCognitiveMpConsumption(
    durationMinutes: number,
    difficultyMultiplier = 1.0,
  ): number {
    const consumed = durationMinutes * 0.15 * difficultyMultiplier;
    return Math.max(0, Math.min(100, Math.floor(consumed)));
  }
}
