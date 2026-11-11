/**
 * LevelUp Calisthenics Routine Sequence Engine
 * 17-Step Strict Sequential State Machine for Huriel's Dos & Épaules Routine
 * Reference: docs/09-ROADMAP.md Section 21.4 & levelup-architect/SKILL.md
 */

export interface RoutineStep {
  id: string;
  name: string;
  targetReps?: number;
  targetSeconds?: number;
  description: string;
}

export const ROUTINE_DOS_EPAULES_17_STEPS: readonly RoutineStep[] = [
  {
    id: "step-01",
    name: "Jumping Jacks",
    targetSeconds: 30,
    description: "Activation cardiovasculaire et dynamique",
  },
  {
    id: "step-02",
    name: "Hyperextensions au sol",
    targetReps: 14,
    description: "Renforcement érecteurs du rachis et chaîne postérieure",
  },
  {
    id: "step-03",
    name: "Pike Push-Ups",
    targetReps: 14,
    description: "Focus deltoïdes antérieurs et trapèzes (angle coude <= 75°)",
  },
  {
    id: "step-04",
    name: "Reverse Push-Ups",
    targetReps: 12,
    description: "Activation rhomboïdes et deltoïdes postérieurs",
  },
  {
    id: "step-05",
    name: "Inchworms",
    targetReps: 16,
    description: "Mobilité ischios, gainage dynamique et force scapulaire",
  },
  {
    id: "step-06",
    name: "Side-Lying Floor Stretch Gauche",
    targetSeconds: 30,
    description: "Étirement latéral et décompression grand dorsal gauche",
  },
  {
    id: "step-07",
    name: "Side-Lying Floor Stretch Droit",
    targetSeconds: 30,
    description: "Étirement latéral et décompression grand dorsal droit",
  },
  {
    id: "step-08",
    name: "Hyperextensions au sol",
    targetReps: 12,
    description: "Seconde série érecteurs du rachis",
  },
  {
    id: "step-09",
    name: "Pike Push-Ups",
    targetReps: 12,
    description: "Seconde série deltoïdes",
  },
  {
    id: "step-10",
    name: "Reverse Push-Ups",
    targetReps: 10,
    description: "Seconde série scapulae",
  },
  {
    id: "step-11",
    name: "Inchworms",
    targetReps: 14,
    description: "Seconde série mobilité et core",
  },
  {
    id: "step-12",
    name: "Cat Cow Pose",
    targetSeconds: 35,
    description: "Décompression vertébrale et mobilité pelvienne",
  },
  {
    id: "step-13",
    name: "Supine Push-Up",
    targetReps: 14,
    description: "Rétraction scapulaire pure sur le dos",
  },
  {
    id: "step-14",
    name: "Floor Y-Raises",
    targetReps: 14,
    description: "Trapèzes inférieurs et stabilité scapulo-humérale",
  },
  {
    id: "step-15",
    name: "Supine Push-Up",
    targetReps: 13,
    description: "Seconde série rétraction scapulaire",
  },
  {
    id: "step-16",
    name: "Reverse Snow Angels",
    targetReps: 12,
    description: "Endurance rhomboïdes et deltoïdes postérieurs",
  },
  {
    id: "step-17",
    name: "Child's Pose",
    targetSeconds: 30,
    description: "Récupération souveraine et étirement myofascial final",
  },
] as const;

export class RoutineSequenceEngine {
  private readonly steps: readonly RoutineStep[];
  private currentStepIndex: number = 0;
  private currentProgress: number = 0;
  private completedSteps: Set<number> = new Set();
  private completed: boolean = false;

  constructor(steps: readonly RoutineStep[] = ROUTINE_DOS_EPAULES_17_STEPS) {
    if (steps.length === 0) {
      throw new Error("Une routine doit comporter au moins une étape.");
    }
    this.steps = steps;
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  public getCurrentStep(): RoutineStep {
    return this.steps[this.currentStepIndex];
  }

  public isRoutineCompleted(): boolean {
    return this.completed;
  }

  public getCurrentProgress(): number {
    return this.currentProgress;
  }

  public getTargetQuota(stepIndex: number = this.currentStepIndex): number {
    const step = this.steps[stepIndex];
    return step.targetReps ?? step.targetSeconds ?? 1;
  }

  public addProgress(amount: number): void {
    if (this.completed) return;
    this.currentProgress += amount;
  }

  public canAdvance(): boolean {
    if (this.completed) return false;
    return this.currentProgress >= this.getTargetQuota();
  }

  public nextStep(): boolean {
    if (!this.canAdvance()) {
      return false;
    }

    this.completedSteps.add(this.currentStepIndex);

    if (this.currentStepIndex + 1 < this.steps.length) {
      this.currentStepIndex++;
      this.currentProgress = 0;
      return true;
    } else {
      this.completed = true;
      return true;
    }
  }

  public jumpToStep(targetIndex: number): void {
    if (targetIndex < 0 || targetIndex >= this.steps.length) {
      throw new Error(`Index d'étape invalide : ${targetIndex}`);
    }

    // Anti-cheat: each step before targetIndex MUST be completed!
    for (let i = 0; i < targetIndex; i++) {
      if (!this.completedSteps.has(i)) {
        throw new Error(
          `Saut d'étape strictement interdit : l'étape précédente ${i + 1} (${this.steps[i].name}) n'est pas validée.`,
        );
      }
    }

    this.currentStepIndex = targetIndex;
    this.currentProgress = 0;
  }

  public getProgressPercentage(): number {
    if (this.completed) return 100;
    const completedRatio = this.completedSteps.size / this.steps.length;
    return Math.min(100, Math.round(completedRatio * 100));
  }
}
