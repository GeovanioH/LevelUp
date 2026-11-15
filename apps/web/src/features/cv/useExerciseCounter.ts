/**
 * LevelUp MediaPipe Exercise Repetition Counter
 * Dynamic Kinematic Profile Router & Strict Anti-Cheat Finite State Machine
 * Reference: docs/02-TRD.md Section 2.1.3 & docs/09-ROADMAP.md Section 21.4
 */

import { useState, useCallback, useRef } from "react";
import {
  calculateExerciseAngle,
  type ExerciseJointType,
  type PoseLandmark,
  DEFAULT_CONFIDENCE_THRESHOLD,
} from "./poseMath";

export enum ExerciseState {
  IDLE = "IDLE",
  REP_DOWN = "REP_DOWN",
  PEAK_CONTRACTION = "PEAK_CONTRACTION",
  REP_UP = "REP_UP",
  REP_COUNTED = "REP_COUNTED",
}

export type ExerciseKinematicType =
  | "PUSH_UP"
  | "ABDOMINAL"
  | "SQUAT"
  | "DIP"
  | "HYPEREXTENSION"
  | "CUSTOM";

export interface ExerciseKinematicConfig {
  type: ExerciseKinematicType;
  jointType: ExerciseJointType;
  minAngleThreshold: number; // Peak contraction threshold (e.g. <= 75° for pushups, <= 80° for abdos)
  maxAngleThreshold: number; // Full lockout / extension threshold (e.g. >= 160° for pushups, >= 155° for abdos)
  jointName: string;         // e.g. "Coude", "Hanche / Tronc", "Genou"
  description: string;
}

export const EXERCISE_PROFILES: Record<ExerciseKinematicType, ExerciseKinematicConfig> = {
  PUSH_UP: {
    type: "PUSH_UP",
    jointType: "ELBOW",
    minAngleThreshold: 75,
    maxAngleThreshold: 160,
    jointName: "Coude",
    description: "Flexion coude <= 75° | Extension complète >= 160°",
  },
  ABDOMINAL: {
    type: "ABDOMINAL",
    jointType: "HIP",
    minAngleThreshold: 80,
    maxAngleThreshold: 155,
    jointName: "Hanche / Tronc",
    description: "Contraction tronc <= 80° | Extension complète >= 155°",
  },
  SQUAT: {
    type: "SQUAT",
    jointType: "KNEE",
    minAngleThreshold: 90,
    maxAngleThreshold: 165,
    jointName: "Genou",
    description: "Flexion genou <= 90° | Extension complète >= 165°",
  },
  DIP: {
    type: "DIP",
    jointType: "ELBOW",
    minAngleThreshold: 80,
    maxAngleThreshold: 160,
    jointName: "Coude",
    description: "Flexion coude <= 80° | Verrouillage triceps >= 160°",
  },
  HYPEREXTENSION: {
    type: "HYPEREXTENSION",
    jointType: "HIP",
    minAngleThreshold: 145,
    maxAngleThreshold: 175,
    jointName: "Hanche / Dos",
    description: "Flexion hanche <= 145° | Extension rachidienne >= 175°",
  },
  CUSTOM: {
    type: "CUSTOM",
    jointType: "ELBOW",
    minAngleThreshold: 75,
    maxAngleThreshold: 160,
    jointName: "Coude",
    description: "Seuils cinématiques personnalisés",
  },
};

/**
 * Resolves an exercise name or kinematic type to its complete kinematic configuration
 */
export function resolveExerciseConfig(
  input: string | Partial<ExerciseKinematicConfig>,
): ExerciseKinematicConfig {
  if (typeof input === "object" && input !== null) {
    const base = EXERCISE_PROFILES[input.type ?? "CUSTOM"] || EXERCISE_PROFILES.CUSTOM;
    return {
      type: input.type ?? base.type,
      jointType: input.jointType ?? base.jointType,
      minAngleThreshold: input.minAngleThreshold ?? base.minAngleThreshold,
      maxAngleThreshold: input.maxAngleThreshold ?? base.maxAngleThreshold,
      jointName: input.jointName ?? base.jointName,
      description: input.description ?? base.description,
    };
  }

  const normalized = String(input).trim().toLowerCase();

  // Abdominal exercises (Crunches, V-Ups, Leg Raises, Hollow, Sit-ups)
  if (
    normalized.includes("abdo") ||
    normalized.includes("crunch") ||
    normalized.includes("v-up") ||
    normalized.includes("relev") ||
    normalized.includes("jambe") ||
    normalized.includes("sit-up") ||
    normalized.includes("hollow") ||
    normalized.includes("climber") ||
    normalized.includes("bassin")
  ) {
    return { ...EXERCISE_PROFILES.ABDOMINAL };
  }

  // Squats & Lower Body
  if (
    normalized.includes("squat") ||
    normalized.includes("fente") ||
    normalized.includes("lunge")
  ) {
    return { ...EXERCISE_PROFILES.SQUAT };
  }

  // Dips & Triceps extensions
  if (normalized.includes("dip") || normalized.includes("extension tricep")) {
    return { ...EXERCISE_PROFILES.DIP };
  }

  // Hyperextensions & Back
  if (normalized.includes("hyperextension")) {
    return { ...EXERCISE_PROFILES.HYPEREXTENSION };
  }

  // Default / Push-ups / Pompes / Pike Push-ups
  return { ...EXERCISE_PROFILES.PUSH_UP };
}

export interface RepCounterResult {
  reps: number;
  currentAngle: number;
  state: ExerciseState;
  jointName: string;
  exerciseType: ExerciseKinematicType;
}

export class MediaPipeRepCounter {
  private currentState: ExerciseState = ExerciseState.IDLE;
  private repCount: number = 0;
  private config: ExerciseKinematicConfig;
  private minConfidence: number;

  constructor(
    configOrMinAngle: string | Partial<ExerciseKinematicConfig> | number = "PUSH_UP",
    maxAngleOrMinConfidence?: number,
    minConfidenceOverride?: number,
  ) {
    if (typeof configOrMinAngle === "number") {
      // Backwards compatibility with: new MediaPipeRepCounter(75, 160, minConfidence)
      this.config = {
        type: "PUSH_UP",
        jointType: "ELBOW",
        minAngleThreshold: configOrMinAngle,
        maxAngleThreshold: maxAngleOrMinConfidence ?? 160,
        jointName: "Coude",
        description: `Flexion <= ${configOrMinAngle}° | Extension >= ${maxAngleOrMinConfidence ?? 160}°`,
      };
      this.minConfidence = minConfidenceOverride ?? DEFAULT_CONFIDENCE_THRESHOLD;
    } else {
      this.config = resolveExerciseConfig(configOrMinAngle);
      this.minConfidence =
        typeof maxAngleOrMinConfidence === "number"
          ? maxAngleOrMinConfidence
          : DEFAULT_CONFIDENCE_THRESHOLD;
    }
  }

  public setExercise(exercise: string | Partial<ExerciseKinematicConfig>): void {
    this.config = resolveExerciseConfig(exercise);
    this.currentState = ExerciseState.IDLE;
  }

  public getConfig(): ExerciseKinematicConfig {
    return { ...this.config };
  }

  public processFrame(landmarks: PoseLandmark[]): RepCounterResult {
    const currentAngle = calculateExerciseAngle(
      this.config.jointType,
      landmarks,
      "left",
      this.minConfidence,
    );

    // If landmarks are missing or confidence is inadequate, do not change state
    if (currentAngle === 0) {
      return {
        reps: this.repCount,
        currentAngle: 0,
        state: this.currentState,
        jointName: this.config.jointName,
        exerciseType: this.config.type,
      };
    }

    const min = this.config.minAngleThreshold;
    const max = this.config.maxAngleThreshold;

    // Strict Anti-Cheat Finite State Machine:
    // IDLE -> REP_DOWN -> PEAK_CONTRACTION -> REP_UP -> REP_COUNTED -> IDLE/REP_DOWN
    switch (this.currentState) {
      case ExerciseState.IDLE:
      case ExerciseState.REP_COUNTED:
        if (currentAngle <= min) {
          this.currentState = ExerciseState.PEAK_CONTRACTION;
        } else if (currentAngle < max - 15) {
          // Starting descent / contraction
          this.currentState = ExerciseState.REP_DOWN;
        } else if (currentAngle >= max) {
          this.currentState = ExerciseState.IDLE;
        }
        break;

      case ExerciseState.REP_DOWN:
        if (currentAngle <= min) {
          // Valid deep flexion / contraction reached (Anti-Cheat check: must hit <= minAngleThreshold)
          this.currentState = ExerciseState.PEAK_CONTRACTION;
        } else if (currentAngle >= max) {
          // Aborted repetition before reaching valid depth: reset to IDLE without counting!
          this.currentState = ExerciseState.IDLE;
        }
        break;

      case ExerciseState.PEAK_CONTRACTION:
        if (currentAngle >= max) {
          // Direct lockout / full extension from peak
          this.repCount++;
          this.currentState = ExerciseState.REP_COUNTED;
        } else if (currentAngle > min + 15) {
          // Beginning ascent / return from bottom position
          this.currentState = ExerciseState.REP_UP;
        }
        break;

      case ExerciseState.REP_UP:
        if (currentAngle >= max) {
          // Full lockout / extension reached: rep successfully earned!
          this.repCount++;
          this.currentState = ExerciseState.REP_COUNTED;
        } else if (currentAngle <= min) {
          // Dropped back down before full extension: back to peak contraction
          this.currentState = ExerciseState.PEAK_CONTRACTION;
        }
        break;
    }

    return {
      reps: this.repCount,
      currentAngle,
      state: this.currentState,
      jointName: this.config.jointName,
      exerciseType: this.config.type,
    };
  }

  public getReps(): number {
    return this.repCount;
  }

  public getState(): ExerciseState {
    return this.currentState;
  }

  public reset(): void {
    this.repCount = 0;
    this.currentState = ExerciseState.IDLE;
  }
}

/**
 * React 19 Hook for MediaPipe Exercise Counting
 */
export function useExerciseCounter(
  initialExerciseOrMinAngle: string | number = "PUSH_UP",
  maxAngle?: number,
) {
  const counterRef = useRef<MediaPipeRepCounter>(
    new MediaPipeRepCounter(initialExerciseOrMinAngle, maxAngle),
  );
  const [result, setResult] = useState<RepCounterResult>(() => ({
    reps: 0,
    currentAngle: 0,
    state: ExerciseState.IDLE,
    jointName: counterRef.current.getConfig().jointName,
    exerciseType: counterRef.current.getConfig().type,
  }));

  const setExercise = useCallback(
    (exercise: string | Partial<ExerciseKinematicConfig>) => {
      counterRef.current.setExercise(exercise);
      setResult((prev) => ({
        ...prev,
        jointName: counterRef.current.getConfig().jointName,
        exerciseType: counterRef.current.getConfig().type,
      }));
    },
    [],
  );

  const processFrame = useCallback((landmarks: PoseLandmark[]) => {
    const updated = counterRef.current.processFrame(landmarks);
    setResult(updated);
    return updated;
  }, []);

  const reset = useCallback(() => {
    counterRef.current.reset();
    setResult({
      reps: 0,
      currentAngle: 0,
      state: ExerciseState.IDLE,
      jointName: counterRef.current.getConfig().jointName,
      exerciseType: counterRef.current.getConfig().type,
    });
  }, []);

  return {
    reps: result.reps,
    currentAngle: result.currentAngle,
    state: result.state,
    jointName: result.jointName,
    exerciseType: result.exerciseType,
    config: counterRef.current.getConfig(),
    setExercise,
    processFrame,
    reset,
  };
}
