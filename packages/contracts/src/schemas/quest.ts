import { z } from "zod";
import { BaseStatCode } from "../math/xpFormulas";

export const QuestTypeSchema = z.enum([
  "DAILY",
  "EMERGENCY",
  "BOSS",
  "JOB_CHANGE",
  "PENALTY",
]);
export const QuestStatusSchema = z.enum([
  "PENDING",
  "ACTIVE",
  "COMPLETED",
  "FAILED",
  "EXPIRED",
]);
export const ProofTypeSchema = z.enum([
  "AUDIO_SUMMARY",
  "GITHUB_URL",
  "SCREENSHOT",
  "TEXT_LOG",
  "NONE",
]);

export const QuestSchema = z.object({
  id: z.string().uuid(),
  playerId: z.string().uuid(),
  questCode: z.string().max(100),
  title: z.string().max(200),
  description: z.string(),
  questType: QuestTypeSchema,
  targetStat: z.nativeEnum(BaseStatCode),
  xpReward: z.number().int().positive(),
  availableAt: z.date(),
  expiresAt: z.date(),
  status: QuestStatusSchema,
  proofType: ProofTypeSchema,
  proofData: z.string().nullable().optional(),
  architectScore: z.number().int().min(0).max(20).nullable().optional(),
  architectFeedback: z.string().nullable().optional(),
  completedAt: z.date().nullable().optional(),
});

export const CompleteQuestRequestSchema = z.object({
  questId: z.string().uuid(),
  proofData: z.string().optional(),
});

export const CreateTimeBlockRequestSchema = z.object({
  block_date: z.string(),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  title: z.string().min(1).max(150),
  target_stat: z.nativeEnum(BaseStatCode),
  notes: z.string().optional(),
});

export type QuestDto = z.infer<typeof QuestSchema>;
export type CompleteQuestRequest = z.infer<typeof CompleteQuestRequestSchema>;
export type CreateTimeBlockRequest = z.infer<
  typeof CreateTimeBlockRequestSchema
>;
