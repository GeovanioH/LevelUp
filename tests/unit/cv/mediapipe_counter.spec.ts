import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateJointAngle,
  calculateElbowAngle,
  calculateKneeAngle,
  calculateHipAngle,
  calculateExerciseAngle,
  type PoseLandmark,
} from "../../../apps/web/src/features/cv/poseMath";
import {
  MediaPipeRepCounter,
  ExerciseState,
  resolveExerciseConfig,
  EXERCISE_PROFILES,
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

describe("MediaPipe Hip Angle & Exercise Resolver (poseMath & useExerciseCounter)", () => {
  it("extracts hip angle using MediaPipe indices 11 (shoulder), 23 (hip), 25 (knee) for left side", () => {
    const landmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
      x: 0,
      y: 0,
      z: 0,
      visibility: 0.9,
    }));
    // Shoulder (11) = (0, 1, 0), Hip (23) = (0, 0, 0), Knee (25) = (1, 0, 0) -> 90 deg
    landmarks[11] = { x: 0, y: 1, z: 0, visibility: 0.95 };
    landmarks[23] = { x: 0, y: 0, z: 0, visibility: 0.95 };
    landmarks[25] = { x: 1, y: 0, z: 0, visibility: 0.95 };

    const angle = calculateHipAngle(landmarks, "left");
    expect(angle).toBeCloseTo(90.0, 1);
  });

  it("calculates hip angle for right side and averages both when side='both'", () => {
    const landmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
      x: 0,
      y: 0,
      z: 0,
      visibility: 0.9,
    }));
    // Left hip = 90 deg
    landmarks[11] = { x: 0, y: 1, z: 0, visibility: 0.95 };
    landmarks[23] = { x: 0, y: 0, z: 0, visibility: 0.95 };
    landmarks[25] = { x: 1, y: 0, z: 0, visibility: 0.95 };
    // Right hip = 90 deg
    landmarks[12] = { x: 0, y: 1, z: 0, visibility: 0.95 };
    landmarks[24] = { x: 0, y: 0, z: 0, visibility: 0.95 };
    landmarks[26] = { x: 1, y: 0, z: 0, visibility: 0.95 };

    const rightAngle = calculateHipAngle(landmarks, "right");
    expect(rightAngle).toBeCloseTo(90.0, 1);

    const bothAngle = calculateHipAngle(landmarks, "both");
    expect(bothAngle).toBeCloseTo(90.0, 1);
  });

  it("resolves correct kinematic profiles for pushups, abdos, and squats", () => {
    const pushupConfig = resolveExerciseConfig("Pike Push-Ups");
    expect(pushupConfig.type).toBe("PUSH_UP");
    expect(pushupConfig.jointType).toBe("ELBOW");
    expect(pushupConfig.minAngleThreshold).toBe(75);

    const abdoConfig = resolveExerciseConfig("V-Ups Synchronisés");
    expect(abdoConfig.type).toBe("ABDOMINAL");
    expect(abdoConfig.jointType).toBe("HIP");
    expect(abdoConfig.minAngleThreshold).toBe(80);

    const crunchConfig = resolveExerciseConfig("Crunchs Bicyclette");
    expect(crunchConfig.type).toBe("ABDOMINAL");
    expect(crunchConfig.jointType).toBe("HIP");

    const squatConfig = resolveExerciseConfig("Squats");
    expect(squatConfig.type).toBe("SQUAT");
    expect(squatConfig.jointType).toBe("KNEE");
  });
});

describe("MediaPipeRepCounter - Abdominal Exercise Anti-Cheat & Rep Counting", () => {
  let abCounter: MediaPipeRepCounter;

  function createFrameWithHipAngle(
    degrees: number,
    confidence: number = 0.95,
  ): PoseLandmark[] {
    const landmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
      x: 0,
      y: 0,
      z: 0,
      visibility: confidence,
    }));
    // Shoulder (11) at (0, 1, 0)
    landmarks[11] = { x: 0, y: 1, z: 0, visibility: confidence };
    // Hip (23) at (0, 0, 0)
    landmarks[23] = { x: 0, y: 0, z: 0, visibility: confidence };
    // Knee (25) rotated by degrees relative to shoulder vector
    const rad = (degrees * Math.PI) / 180;
    landmarks[25] = {
      x: Math.sin(rad),
      y: Math.cos(rad),
      z: 0,
      visibility: confidence,
    };
    return landmarks;
  }

  beforeEach(() => {
    abCounter = new MediaPipeRepCounter("V-Ups Synchronisés");
  });

  it("initializes with ABDOMINAL profile and HIP joint tracking", () => {
    expect(abCounter.getReps()).toBe(0);
    expect(abCounter.getState()).toBe(ExerciseState.IDLE);
    const config = abCounter.getConfig();
    expect(config.type).toBe("ABDOMINAL");
    expect(config.jointType).toBe("HIP");
    expect(config.jointName).toContain("Hanche");
  });

  it("validates a strict abdominal rep: flat (170°) -> crunch below 80° (70°) -> return flat (165°)", () => {
    // 1. Lying flat / extended
    abCounter.processFrame(createFrameWithHipAngle(170));
    expect(abCounter.getReps()).toBe(0);

    // 2. Rising / flexing torso
    abCounter.processFrame(createFrameWithHipAngle(120));
    expect(abCounter.getState()).toBe(ExerciseState.REP_DOWN);
    expect(abCounter.getReps()).toBe(0);

    // 3. Peak contraction (<= 80 deg)
    abCounter.processFrame(createFrameWithHipAngle(70));
    expect(abCounter.getState()).toBe(ExerciseState.PEAK_CONTRACTION);
    expect(abCounter.getReps()).toBe(0);

    // 4. Lowering back down
    abCounter.processFrame(createFrameWithHipAngle(110));
    expect(abCounter.getState()).toBe(ExerciseState.REP_UP);
    expect(abCounter.getReps()).toBe(0);

    // 5. Full extension back to ground (>= 155 deg) -> Rep validated!
    abCounter.processFrame(createFrameWithHipAngle(165));
    expect(abCounter.getReps()).toBe(1);
    expect(abCounter.getState()).toBe(ExerciseState.REP_COUNTED);
  });

  it("rejects incomplete abdo crunch: fails to hit <= 80 deg", () => {
    abCounter.processFrame(createFrameWithHipAngle(170));

    // Only reaches 95 deg (lazy crunch)
    abCounter.processFrame(createFrameWithHipAngle(95));
    expect(abCounter.getState()).toBe(ExerciseState.REP_DOWN);

    // Returns flat
    abCounter.processFrame(createFrameWithHipAngle(165));
    expect(abCounter.getReps()).toBe(0); // Must NOT count
  });

  it("allows dynamic exercise switching between Pompes and Abdos", () => {
    const counter = new MediaPipeRepCounter("Pompes");
    expect(counter.getConfig().jointType).toBe("ELBOW");

    counter.setExercise("Crunchs Bicyclette");
    expect(counter.getConfig().jointType).toBe("HIP");
    expect(counter.getConfig().type).toBe("ABDOMINAL");
  });
});
