import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateJointAngle,
  calculateElbowAngle,
  calculateKneeAngle,
  type PoseLandmark,
} from "../../../apps/web/src/features/cv/poseMath";
import {
  MediaPipeRepCounter,
  ExerciseState,
} from "../../../apps/web/src/features/cv/useExerciseCounter";

describe("MediaPipe Kinematic Angle Calculation (poseMath)", () => {
  it("calculates exact 90 degree angle between orthogonal vectors", () => {
    // A=(0, 1, 0), B=(0, 0, 0), C=(1, 0, 0)
    const a: PoseLandmark = { x: 0, y: 1, z: 0 };
    const b: PoseLandmark = { x: 0, y: 0, z: 0 };
    const c: PoseLandmark = { x: 1, y: 0, z: 0 };

    const angle = calculateJointAngle(a, b, c);
    expect(angle).toBeCloseTo(90.0, 1);
  });

  it("calculates 180 degree angle for a straight line", () => {
    const a: PoseLandmark = { x: -1, y: 0, z: 0 };
    const b: PoseLandmark = { x: 0, y: 0, z: 0 };
    const c: PoseLandmark = { x: 1, y: 0, z: 0 };

    const angle = calculateJointAngle(a, b, c);
    expect(angle).toBeCloseTo(180.0, 1);
  });

  it("calculates acute angle (45 degrees)", () => {
    const a: PoseLandmark = { x: 0, y: 1, z: 0 };
    const b: PoseLandmark = { x: 0, y: 0, z: 0 };
    const c: PoseLandmark = { x: 1, y: 1, z: 0 };

    const angle = calculateJointAngle(a, b, c);
    expect(angle).toBeCloseTo(45.0, 1);
  });

  it("extracts elbow angle using MediaPipe indices 11, 13, 15 for left arm", () => {
    const landmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
      x: 0,
      y: 0,
      z: 0,
      visibility: 0.9,
    }));
    // Shoulder (11) = (0, 1, 0), Elbow (13) = (0, 0, 0), Wrist (15) = (1, 0, 0) -> 90 deg
    landmarks[11] = { x: 0, y: 1, z: 0, visibility: 0.95 };
    landmarks[13] = { x: 0, y: 0, z: 0, visibility: 0.95 };
    landmarks[15] = { x: 1, y: 0, z: 0, visibility: 0.95 };

    const angle = calculateElbowAngle(landmarks, "left");
    expect(angle).toBeCloseTo(90.0, 1);
  });

  it("returns 0 or rejects when landmarks are missing or confidence < 0.70", () => {
    const landmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
      x: 0,
      y: 0,
      z: 0,
      visibility: 0.5,
    }));
    landmarks[11] = { x: 0, y: 1, z: 0, visibility: 0.4 }; // Low confidence
    landmarks[13] = { x: 0, y: 0, z: 0, visibility: 0.9 };
    landmarks[15] = { x: 1, y: 0, z: 0, visibility: 0.9 };

    const angle = calculateElbowAngle(landmarks, "left");
    expect(angle).toBe(0);
  });
});

describe("MediaPipeRepCounter Anti-Cheat & Finite State Machine", () => {
  let counter: MediaPipeRepCounter;

  // Helper to build 33 landmarks with given left elbow angle
  function createFrameWithElbowAngle(
    degrees: number,
    confidence: number = 0.95,
  ): PoseLandmark[] {
    const landmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
      x: 0,
      y: 0,
      z: 0,
      visibility: confidence,
    }));
    // Shoulder at (0, 1, 0)
    landmarks[11] = { x: 0, y: 1, z: 0, visibility: confidence };
    // Elbow at (0, 0, 0)
    landmarks[13] = { x: 0, y: 0, z: 0, visibility: confidence };
    // Wrist rotated by degrees relative to shoulder vector
    const rad = (degrees * Math.PI) / 180;
    // Vector u is (0, 1), so wrist at (sin(rad), cos(rad)) gives dot product cos(rad) -> angle = degrees
    landmarks[15] = {
      x: Math.sin(rad),
      y: Math.cos(rad),
      z: 0,
      visibility: confidence,
    };
    return landmarks;
  }

  beforeEach(() => {
    counter = new MediaPipeRepCounter(75, 160);
  });

  it("starts in IDLE state with 0 repetitions", () => {
    expect(counter.getReps()).toBe(0);
    expect(counter.getState()).toBe(ExerciseState.IDLE);
  });

  it("validates a strict repetition: full extension (170) -> flexion under 75 -> full extension (165)", () => {
    // 1. Initial extended position
    counter.processFrame(createFrameWithElbowAngle(170));
    expect(counter.getReps()).toBe(0);

    // 2. Descending
    counter.processFrame(createFrameWithElbowAngle(120));
    expect(counter.getState()).toBe(ExerciseState.REP_DOWN);
    expect(counter.getReps()).toBe(0);

    // 3. Peak contraction (<= 75 deg)
    counter.processFrame(createFrameWithElbowAngle(70));
    expect(counter.getState()).toBe(ExerciseState.PEAK_CONTRACTION);
    expect(counter.getReps()).toBe(0);

    // 4. Ascending
    counter.processFrame(createFrameWithElbowAngle(110));
    expect(counter.getState()).toBe(ExerciseState.REP_UP);
    expect(counter.getReps()).toBe(0);

    // 5. Full lockout (>= 160 deg) -> Rep validated!
    counter.processFrame(createFrameWithElbowAngle(165));
    expect(counter.getReps()).toBe(1);
    expect(counter.getState()).toBe(ExerciseState.REP_COUNTED);
  });

  it("strictly rejects partial repetitions (demi-répétitions): does not reach <= 75 degrees", () => {
    // Start extended
    counter.processFrame(createFrameWithElbowAngle(170));

    // Descends only to 85 deg (cheating / incomplete flexion)
    counter.processFrame(createFrameWithElbowAngle(85));
    expect(counter.getState()).toBe(ExerciseState.REP_DOWN);

    // Returns to full lockout at 165 deg without hitting <= 75 deg
    counter.processFrame(createFrameWithElbowAngle(165));
    expect(counter.getReps()).toBe(0); // MUST NOT COUNT
  });

  it("strictly rejects incomplete extension: hits 70 deg but only returns to 145 deg", () => {
    // Start extended
    counter.processFrame(createFrameWithElbowAngle(170));

    // Valid bottom position
    counter.processFrame(createFrameWithElbowAngle(70));
    expect(counter.getState()).toBe(ExerciseState.PEAK_CONTRACTION);

    // Ascends only to 145 deg (fails to reach >= 160 deg lockout)
    counter.processFrame(createFrameWithElbowAngle(145));
    expect(counter.getState()).toBe(ExerciseState.REP_UP);
    expect(counter.getReps()).toBe(0);

    // Goes down again
    counter.processFrame(createFrameWithElbowAngle(70));
    expect(counter.getReps()).toBe(0);
  });

  it("ignores low confidence frames without corrupting state machine", () => {
    counter.processFrame(createFrameWithElbowAngle(170));
    counter.processFrame(createFrameWithElbowAngle(70));
    expect(counter.getState()).toBe(ExerciseState.PEAK_CONTRACTION);

    // Corrupted / noisy camera frame (confidence 0.3)
    counter.processFrame(createFrameWithElbowAngle(170, 0.3));
    expect(counter.getState()).toBe(ExerciseState.PEAK_CONTRACTION);
    expect(counter.getReps()).toBe(0);

    // Clean frame with full extension
    counter.processFrame(createFrameWithElbowAngle(165, 0.95));
    expect(counter.getReps()).toBe(1);
  });

  it("resets counter and state when reset() is called", () => {
    counter.processFrame(createFrameWithElbowAngle(170));
    counter.processFrame(createFrameWithElbowAngle(70));
    counter.processFrame(createFrameWithElbowAngle(165));
    expect(counter.getReps()).toBe(1);

    counter.reset();
    expect(counter.getReps()).toBe(0);
    expect(counter.getState()).toBe(ExerciseState.IDLE);
  });
});
