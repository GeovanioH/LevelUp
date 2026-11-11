import { z } from "zod";

export const ExerciseTypeSchema = z.enum([
  "REPS",
  "DURATION",
  "STRETCH",
  "HOLD",
]);

export const WorkoutStepSchema = z.object({
  id: z.string().uuid().optional(),
  routineId: z.string().uuid().optional(),
  stepNumber: z.number().int().positive(),
  exerciseName: z.string().min(1).max(100),
  exerciseType: ExerciseTypeSchema,
  targetReps: z.number().int().positive().nullable().optional(),
  durationSeconds: z.number().int().positive().nullable().optional(),
  targetAngleMin: z.number().nullable().optional(),
  targetAngleMax: z.number().nullable().optional(),
  keyJointPoints: z.array(z.number().int()).default([]),
});

export const WorkoutRoutineSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().max(50),
  title: z.string().max(100),
  targetGroup: z.string().max(50),
  description: z.string(),
  totalSteps: z.number().int().nonnegative().default(0),
  steps: z.array(WorkoutStepSchema).default([]),
});

export type WorkoutStepDto = z.infer<typeof WorkoutStepSchema>;
export type WorkoutRoutineDto = z.infer<typeof WorkoutRoutineSchema>;
