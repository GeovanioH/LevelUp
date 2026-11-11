import { describe, it, expect, beforeEach } from "vitest";
import {
  RoutineSequenceEngine,
  ROUTINE_DOS_EPAULES_17_STEPS,
  type RoutineStep,
} from "../../../apps/web/src/features/cv/routineSequenceEngine";

describe("Routine Dos & Épaules (17 Canonical Steps)", () => {
  let engine: RoutineSequenceEngine;

  beforeEach(() => {
    engine = new RoutineSequenceEngine(ROUTINE_DOS_EPAULES_17_STEPS);
  });

  it("contains exactly 17 canonical steps in immutable order", () => {
    expect(ROUTINE_DOS_EPAULES_17_STEPS).toHaveLength(17);
    expect(ROUTINE_DOS_EPAULES_17_STEPS[0].name).toBe("Jumping Jacks");
    expect(ROUTINE_DOS_EPAULES_17_STEPS[0].targetSeconds).toBe(30);
    expect(ROUTINE_DOS_EPAULES_17_STEPS[1].name).toBe("Hyperextensions au sol");
    expect(ROUTINE_DOS_EPAULES_17_STEPS[1].targetReps).toBe(14);
    expect(ROUTINE_DOS_EPAULES_17_STEPS[2].name).toBe("Pike Push-Ups");
    expect(ROUTINE_DOS_EPAULES_17_STEPS[2].targetReps).toBe(14);
    expect(ROUTINE_DOS_EPAULES_17_STEPS[3].name).toBe("Reverse Push-Ups");
    expect(ROUTINE_DOS_EPAULES_17_STEPS[3].targetReps).toBe(12);
    expect(ROUTINE_DOS_EPAULES_17_STEPS[4].name).toBe("Inchworms");
    expect(ROUTINE_DOS_EPAULES_17_STEPS[4].targetReps).toBe(16);
    expect(ROUTINE_DOS_EPAULES_17_STEPS[16].name).toBe("Child's Pose");
    expect(ROUTINE_DOS_EPAULES_17_STEPS[16].targetSeconds).toBe(30);
  });

  it("starts at step index 0 (Step 1)", () => {
    expect(engine.getCurrentStepIndex()).toBe(0);
    expect(engine.getCurrentStep().name).toBe("Jumping Jacks");
    expect(engine.isRoutineCompleted()).toBe(false);
  });

  it("advances sequentially only when target quota is reached", () => {
    // Step 0: Jumping Jacks (30s)
    engine.addProgress(15);
    expect(engine.getCurrentStepIndex()).toBe(0); // Not finished
    expect(engine.canAdvance()).toBe(false);

    engine.addProgress(15); // Total 30s
    expect(engine.canAdvance()).toBe(true);
    const advanced = engine.nextStep();
    expect(advanced).toBe(true);
    expect(engine.getCurrentStepIndex()).toBe(1);
    expect(engine.getCurrentStep().name).toBe("Hyperextensions au sol");
  });

  it("strictly forbids skipping steps", () => {
    expect(engine.getCurrentStepIndex()).toBe(0);
    // Attempting to advance without satisfying quota fails
    const advanced = engine.nextStep();
    expect(advanced).toBe(false);
    expect(engine.getCurrentStepIndex()).toBe(0);

    // Attempting jumpToStep without prior steps completed throws error
    expect(() => engine.jumpToStep(5)).toThrowError(
      /Saut d'étape strictement interdit/,
    );
  });

  it("completes the entire 17-step sequence and sets isRoutineCompleted to true", () => {
    for (let i = 0; i < 17; i++) {
      const step = engine.getCurrentStep();
      const quota = step.targetReps ?? step.targetSeconds ?? 1;
      engine.addProgress(quota);
      expect(engine.canAdvance()).toBe(true);
      engine.nextStep();
    }

    expect(engine.isRoutineCompleted()).toBe(true);
    expect(engine.getProgressPercentage()).toBe(100);
  });
});
