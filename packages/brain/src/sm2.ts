/**
 * LevelUp Second Brain - SuperMemo 2 (SM-2) Spaced Repetition Engine
 * Implements Piotr Wozniak's canonical spaced repetition algorithm
 * Reference: docs/09-ROADMAP.md Section 21.4 & docs/08-IMPLEMENTATION_PLAN.md Tâche 3.4
 */

export class InvalidGradeException extends Error {
  constructor(
    message: string = "La note SM-2 doit être un entier compris entre 0 et 5.",
  ) {
    super(message);
    this.name = "InvalidGradeException";
  }
}

export class InvalidEaseFactorException extends Error {
  constructor(
    message: string = "Le facteur d'aisance (EF) ne peut être inférieur au seuil de 1.3.",
  ) {
    super(message);
    this.name = "InvalidEaseFactorException";
  }
}

export interface SM2ReviewResult {
  repetition: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: Date;
}

export class SM2Item {
  public readonly id: string;
  public repetition: number;
  public interval: number; // in days
  public easeFactor: number; // minimum 1.3, default 2.5
  public lastReviewDate?: Date | undefined;
  public nextReviewDate?: Date | undefined;

  constructor(
    id: string,
    repetition: number = 0,
    interval: number = 1,
    easeFactor: number = 2.5,
    lastReviewDate?: Date | undefined,
    nextReviewDate?: Date | undefined,
  ) {
    this.id = id;
    this.repetition = Math.max(0, repetition);
    this.interval = Math.max(1, interval);
    this.easeFactor = Math.max(1.3, easeFactor);
    this.lastReviewDate = lastReviewDate;
    this.nextReviewDate = nextReviewDate;
  }
}

/**
 * Calculates new SM-2 parameters after a review
 * @param item Current SM2Item or state
 * @param grade Performance rating from 0 (blackout) to 5 (perfect recall)
 * @param currentDate Reference date for computing next review date (defaults to now)
 */
export function calculateSM2(
  item: SM2Item,
  grade: number,
  currentDate: Date = new Date(),
): SM2ReviewResult {
  if (!Number.isInteger(grade) || grade < 0 || grade > 5) {
    throw new InvalidGradeException(
      `Note invalide : ${grade}. Doit être un entier entre 0 et 5.`,
    );
  }

  const { repetition, interval, easeFactor } = item;

  // 1. Calculate new Ease Factor (EF')
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const qFactor = 5 - grade;
  let newEaseFactor = easeFactor + (0.1 - qFactor * (0.08 + qFactor * 0.02));

  // Wozniak rule: EF cannot fall below 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  // 2. Calculate repetition count (n) and interval (I)
  let newRepetition: number;
  let newInterval: number;

  if (grade < 3) {
    // Failure: reset repetition sequence
    newRepetition = 0;
    newInterval = 1;
  } else {
    // Success: advance interval according to SM-2 formula
    if (repetition === 0) {
      newInterval = 1;
    } else if (repetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
    newRepetition = repetition + 1;
  }

  // 3. Calculate next review timestamp
  const nextReviewDate = new Date(
    currentDate.getTime() + newInterval * 24 * 60 * 60 * 1000,
  );

  return {
    repetition: newRepetition,
    interval: newInterval,
    easeFactor: Number(newEaseFactor.toFixed(4)),
    nextReviewDate,
  };
}
