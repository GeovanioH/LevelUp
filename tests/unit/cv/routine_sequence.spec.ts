import { describe, it, expect, beforeEach } from "vitest";
import {
  RoutineSequenceEngine,
  ROUTINE_DOS_EPAULES_17_STEPS,
  ROUTINE_BRAS_TRICEPS,
  ROUTINE_ABDOS_ACIER,
  ROUTINE_DAILY_COMPLETE,
  ROUTINE_PURGE_200_PUSHUPS,
  ROUTINE_CATALOG,
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

describe("Routine Bras & Triceps Calisthenics (6 Étapes - Profil Personnel)", () => {
  it("contains exactly 6 arm exercises matching personal profile", () => {
    expect(ROUTINE_BRAS_TRICEPS).toHaveLength(6);
    expect(ROUTINE_BRAS_TRICEPS[0].name).toBe("Push-Ups Classiques");
    expect(ROUTINE_BRAS_TRICEPS[1].name).toBe("Decline Push-Ups");
    expect(ROUTINE_BRAS_TRICEPS[2].name).toBe("Diamond Push-Ups");
    expect(ROUTINE_BRAS_TRICEPS[3].name).toBe("Pike Push-Ups");
    expect(ROUTINE_BRAS_TRICEPS[4].name).toBe("Wide Push-Ups");
    expect(ROUTINE_BRAS_TRICEPS[5].name).toBe("Tricep Cross Extensions au sol");
  });
});

describe("Routine Abdos & Core d'Acier (5 Étapes - Profil Personnel)", () => {
  it("contains exactly 5 abdominal core exercises matching personal profile", () => {
    expect(ROUTINE_ABDOS_ACIER).toHaveLength(5);
    expect(ROUTINE_ABDOS_ACIER[0].name).toBe("V-Ups Synchronisés");
    expect(ROUTINE_ABDOS_ACIER[1].name).toBe("Mountain Climbers Rapides");
    expect(ROUTINE_ABDOS_ACIER[2].name).toBe("Relevés de Jambes au sol");
    expect(ROUTINE_ABDOS_ACIER[3].name).toBe("Gainage Planche Classique");
    expect(ROUTINE_ABDOS_ACIER[4].name).toBe("Gainage Latéral");
  });
});

describe("Trinité Calisthénique Quotidienne Complète (28 Étapes)", () => {
  it("concatenates Dos & Épaules (17), Bras (6) et Abdos (5) into a unified 28-step engine", () => {
    expect(ROUTINE_DAILY_COMPLETE).toHaveLength(28);
    const fullEngine = new RoutineSequenceEngine(ROUTINE_DAILY_COMPLETE);

    // Initial step is Jumping Jacks (from Dos & Épaules)
    expect(fullEngine.getCurrentStep().name).toBe("Jumping Jacks");

    // Fast-forward through first 17 steps (Dos & Épaules)
    for (let i = 0; i < 17; i++) {
      const q = fullEngine.getCurrentStep().targetReps ?? fullEngine.getCurrentStep().targetSeconds ?? 1;
      fullEngine.addProgress(q);
      fullEngine.nextStep();
    }

    // Step 17 is the start of Bras & Triceps
    expect(fullEngine.getCurrentStepIndex()).toBe(17);
    expect(fullEngine.getCurrentStep().name).toBe("Push-Ups Classiques");

    // Fast-forward through Bras (6 steps)
    for (let i = 0; i < 6; i++) {
      const q = fullEngine.getCurrentStep().targetReps ?? fullEngine.getCurrentStep().targetSeconds ?? 1;
      fullEngine.addProgress(q);
      fullEngine.nextStep();
    }

    // Step 23 is the start of Abdos & Core
    expect(fullEngine.getCurrentStepIndex()).toBe(23);
    expect(fullEngine.getCurrentStep().name).toBe("V-Ups Synchronisés");

    // Fast-forward through Abdos (5 steps)
    for (let i = 0; i < 5; i++) {
      const q = fullEngine.getCurrentStep().targetReps ?? fullEngine.getCurrentStep().targetSeconds ?? 1;
      fullEngine.addProgress(q);
      fullEngine.nextStep();
    }

    expect(fullEngine.isRoutineCompleted()).toBe(true);
  });
});

describe("Quête de Purge & Rachat Physique (200 Pompes Strictes)", () => {
  it("defines the canonical 200 push-up redemption quest", () => {
    expect(ROUTINE_PURGE_200_PUSHUPS).toHaveLength(1);
    expect(ROUTINE_PURGE_200_PUSHUPS[0].name).toContain("200 Pompes");
    expect(ROUTINE_PURGE_200_PUSHUPS[0].targetReps).toBe(200);
    expect(ROUTINE_CATALOG.PURGE_200).toBeDefined();
    expect(ROUTINE_CATALOG.PURGE_200.steps[0].targetReps).toBe(200);
  });

  it("requires full 200 repetitions before allowing completion", () => {
    const purgeEngine = new RoutineSequenceEngine(ROUTINE_PURGE_200_PUSHUPS);
    expect(purgeEngine.getTargetQuota()).toBe(200);

    // 199 reps is not enough (anti-cheat)
    purgeEngine.addProgress(199);
    expect(purgeEngine.canAdvance()).toBe(false);
    expect(purgeEngine.nextStep()).toBe(false);
    expect(purgeEngine.isRoutineCompleted()).toBe(false);

    // 200th rep unlocks redemption
    purgeEngine.addProgress(1);
    expect(purgeEngine.canAdvance()).toBe(true);
    expect(purgeEngine.nextStep()).toBe(true);
    expect(purgeEngine.isRoutineCompleted()).toBe(true);
  });
});
