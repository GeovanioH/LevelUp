/**
 * LevelUp Spaced Repetition Engine Service
 * Re-exports and wraps @levelup/brain SM-2 calculation for web services
 * Reference: docs/08-IMPLEMENTATION_PLAN.md Tâche 3.4
 */

export {
  calculateSM2,
  SM2Item,
  InvalidGradeException,
  InvalidEaseFactorException,
  type SM2ReviewResult,
} from "@levelup/brain";
