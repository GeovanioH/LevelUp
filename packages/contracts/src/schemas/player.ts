import { z } from "zod";
import { RankCode } from "../math/xpFormulas";

export const RankCodeSchema = z.nativeEnum(RankCode);

export const PlayerSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50),
  currentLevel: z.number().int().min(1).max(100),
  totalXp: z.bigint().nonnegative().or(z.number().int().nonnegative()),
  rankCode: RankCodeSchema,
  currentHp: z.number().int().min(0).max(100),
  maxHp: z.number().int().min(1).max(100),
  currentMp: z.number().int().min(0).max(100),
  maxMp: z.number().int().min(1).max(100),
  shadowCrystals: z.number().int().nonnegative(),
  currentTitle: z.string().max(100),
  themePreference: z.string().max(30),
  discordUserId: z.string().max(50).nullable().optional(),
});

export type PlayerDto = z.infer<typeof PlayerSchema>;
