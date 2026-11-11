/**
 * LevelUp MediaPipe Exercise Repetition Counter
 * Strict Anti-Cheat Hysteresis Finite State Machine
 * Reference: docs/02-TRD.md Section 2.1.3 & docs/09-ROADMAP.md Section 21.4
 */

import { useState, useCallback, useRef } from "react";
import {
  calculateElbowAngle,
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

export interface RepCounterResult {
  reps: number;
  currentAngle: number;
  state: ExerciseState;
}

export class MediaPipeRepCounter {
  private currentState: ExerciseState = ExerciseState.IDLE;
  private repCount: number = 0;
  private minAngleThreshold: number; // e.g. 75 degrees for pushup/pike/dip
  private maxAngleThreshold: number; // e.g. 160 degrees for full lockout
  private minConfidence: number;

  constructor(
    minAngle: number = 75,
    maxAngle: number = 160,
    minConfidence: number = DEFAULT_CONFIDENCE_THRESHOLD,
  ) {
    this.minAngleThreshold = minAngle;
    this.maxAngleThreshold = maxAngle;
    this.minConfidence = minConfidence;
  }

  public processFrame(landmarks: PoseLandmark[]): RepCounterResult {
    const currentAngle = calculateElbowAngle(
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
      };
    }

    // Strict Anti-Cheat Finite State Machine:
    // IDLE -> REP_DOWN -> PEAK_CONTRACTION -> REP_UP -> REP_COUNTED -> IDLE/REP_DOWN
    switch (this.currentState) {
      case ExerciseState.IDLE:
      case ExerciseState.REP_COUNTED:
        if (currentAngle <= this.minAngleThreshold) {
          this.currentState = ExerciseState.PEAK_CONTRACTION;
        } else if (currentAngle < this.maxAngleThreshold - 15) {
          // Starting descent
          this.currentState = ExerciseState.REP_DOWN;
        } else if (currentAngle >= this.maxAngleThreshold) {
          this.currentState = ExerciseState.IDLE;
        }
        break;

      case ExerciseState.REP_DOWN:
        if (currentAngle <= this.minAngleThreshold) {
          // Valid deep flexion reached (Anti-Cheat check: must hit <= 75 degrees)
          this.currentState = ExerciseState.PEAK_CONTRACTION;
        } else if (currentAngle >= this.maxAngleThreshold) {
          // Aborted repetition before reaching valid depth: reset to IDLE without counting!
          this.currentState = ExerciseState.IDLE;
        }
        break;

      case ExerciseState.PEAK_CONTRACTION:
        if (currentAngle >= this.maxAngleThreshold) {
          // Direct lockout from peak
          this.repCount++;
          this.currentState = ExerciseState.REP_COUNTED;
        } else if (currentAngle > this.minAngleThreshold + 15) {
          // Beginning ascent from bottom position
          this.currentState = ExerciseState.REP_UP;
        }
        break;

      case ExerciseState.REP_UP:
        if (currentAngle >= this.maxAngleThreshold) {
          // Full lockout reached (>= 160 degrees): rep successfully earned!
          this.repCount++;
          this.currentState = ExerciseState.REP_COUNTED;
        } else if (currentAngle <= this.minAngleThreshold) {
          // Dropped back down before full extension: back to peak contraction
          this.currentState = ExerciseState.PEAK_CONTRACTION;
        }
        break;
    }

    return {
      reps: this.repCount,
      currentAngle,
      state: this.currentState,
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
  minAngle: number = 75,
  maxAngle: number = 160,
) {
  const counterRef = useRef<MediaPipeRepCounter>(
    new MediaPipeRepCounter(minAngle, maxAngle),
  );
  const [result, setResult] = useState<RepCounterResult>({
    reps: 0,
    currentAngle: 0,
    state: ExerciseState.IDLE,
  });

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
    });
  }, []);

  return {
    reps: result.reps,
    currentAngle: result.currentAngle,
    state: result.state,
    processFrame,
    reset,
  };
}
