import { z } from "zod";
import { BaseStatCode } from "../math/xpFormulas";

export const BaseStatCodeSchema = z.nativeEnum(BaseStatCode);

export const BaseScoresSchema = z.object({
  acad: z.number().min(0).max(1000),
  ai_eng: z.number().min(0).max(1000),
  cyber: z.number().min(0).max(1000),
  exp: z.number().min(0).max(1000),
  lng: z.number().min(0).max(1000),
  fin: z.number().min(0).max(1000),
  str: z.number().min(0).max(1000),
  dis: z.number().min(0).max(1000),
});

export const PlayerStatSchema = z.object({
  id: z.string().uuid(),
  playerId: z.string().uuid(),
  baseCode: BaseStatCodeSchema,
  level: z.number().int().min(1).max(100),
  currentXp: z.number().int().nonnegative(),
  nextLevelXp: z.number().int().positive(),
  totalPointsInvested: z.number().int().nonnegative(),
});

export type BaseScoresDto = z.infer<typeof BaseScoresSchema>;
export type PlayerStatDto = z.infer<typeof PlayerStatSchema>;
