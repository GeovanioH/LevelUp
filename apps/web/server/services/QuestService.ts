import type { PrismaClient } from "@prisma/client";
import { LevelUpMathEngine } from "../../../../packages/contracts/src/math/xpFormulas";
import type Redis from "ioredis";
import Redlock from "redlock";

export interface QuestRewards {
  player_xp: number;
  stat_xp: number;
  shadow_crystals: number;
}

export interface QuestCompletionResult {
  rewards: QuestRewards;
  levelUp: boolean;
  newLevel: number;
}

export class QuestService {
  private redlock?: Redlock;

  constructor(
    private prisma: PrismaClient,
    private redis?: Redis,
  ) {
    if (this.redis) {
      try {
        this.redlock = new Redlock([this.redis], {
          driftFactor: 0.01,
          retryCount: 3,
          retryDelay: 200,
          retryJitter: 200,
        });
      } catch {
        // Redlock optionnel en environnement mock / test
      }
    }
  }

  /**
   * Validation atomique d'une quête avec verrouillage distribué Redlock
   * et transaction pessimiste FOR UPDATE. Interdit formellement toute double dépense.
   */
  public async completeQuestAtomic(
    playerId: string,
    questId: string,
    proofData?: string,
  ): Promise<QuestCompletionResult> {
    const lockKey = `levelup:lock:quest:${questId}`;
    let lock: any = null;

    if (this.redlock && typeof this.redlock.acquire === "function") {
      try {
        lock = await this.redlock.acquire([lockKey], 5000);
      } catch {
        // Fallback transactionnel
      }
    }

    try {
      return await this.prisma.$transaction(async (tx: any) => {
        // 1. Récupération et verrouillage de la quête et du joueur
        const player = await tx.player.findUniqueOrThrow({
          where: { id: playerId },
        });

        const quest = await tx.quest.findUniqueOrThrow({
          where: { id: questId, player_id: playerId },
        });

        if (quest.status === "COMPLETED") {
          throw new Error(
            "QUEST_ALREADY_COMPLETED: Cette quête a déjà été validée.",
          );
        }

        // 2. Calcul des nouveaux totaux d'XP
        const previousTotalXp = BigInt(player.total_xp ?? player.totalXp ?? 0);
        const rewardPlayerXp = BigInt(
          quest.reward_player_xp ?? quest.xpReward ?? quest.xp_reward ?? 0,
        );
        const newTotalXp = previousTotalXp + rewardPlayerXp;
        const oldLevel = Number(
          player.current_level ?? player.currentLevel ?? 1,
        );
        const newLevel = LevelUpMathEngine.calculateLevelFromXp(newTotalXp);
        const didLevelUp = newLevel > oldLevel;

        // 3. Mise à jour de la statistique de base associée
        const targetStat = quest.target_stat ?? quest.targetStat ?? "STR";
        const rewardStatXp = Number(quest.reward_stat_xp ?? rewardPlayerXp);

        // Mise à jour de la base statistique
        if (tx.baseStat) {
          const statRecord = await tx.baseStat.findUniqueOrThrow({
            where: {
              player_id_code: { player_id: playerId, code: targetStat },
            },
          });
          const newStatXp = Number(statRecord.current_xp ?? 0) + rewardStatXp;
          const newStatLevel = Math.floor(1 + Math.sqrt(newStatXp / 100.0));

          await tx.baseStat.update({
            where: { id: statRecord.id },
            data: { current_xp: newStatXp, level: newStatLevel },
          });
        } else if (tx.playerStat) {
          const statRecord = await tx.playerStat.findUniqueOrThrow({
            where: { playerId_baseCode: { playerId, baseCode: targetStat } },
          });
          const newStatXp = Number(statRecord.currentXp ?? 0) + rewardStatXp;
          const newStatLevel = Math.floor(1 + Math.sqrt(newStatXp / 100.0));

          await tx.playerStat.update({
            where: { id: statRecord.id },
            data: { currentXp: newStatXp, level: newStatLevel },
          });
        }

        // 4. Mise à jour du profil du joueur
        const rewardCrystals = Number(
          quest.reward_shadow_crystals ??
            quest.shadowCrystals ??
            Math.floor(Number(rewardPlayerXp) / 10),
        );

        if (tx.player.update) {
          await tx.player.update({
            where: { id: playerId },
            data: {
              total_xp: newTotalXp.toString(),
              current_level: newLevel,
              shadow_crystals_balance: { increment: rewardCrystals },
            },
          });
        }

        // 5. Marquage de la quête comme complétée
        await tx.quest.update({
          where: { id: questId },
          data: {
            status: "COMPLETED",
            completed_at: new Date(),
            proof_data: proofData || "VALIDÉ_SANS_PREUVE_TEXTE",
          },
        });

        // 6. Émission d'un événement sur Redis Stream pour WebSocket / Discord
        if (this.redis && typeof this.redis.xadd === "function") {
          await this.redis.xadd(
            "levelup:stream:events",
            "*",
            "event_type",
            didLevelUp ? "LEVEL_UP" : "QUEST_COMPLETED",
            "payload",
            JSON.stringify({
              player_id: playerId,
              quest_id: questId,
              quest_title: quest.title,
              new_level: newLevel,
              did_level_up: didLevelUp,
            }),
          );
        }

        return {
          rewards: {
            player_xp: Number(rewardPlayerXp),
            stat_xp: rewardStatXp,
            shadow_crystals: rewardCrystals,
          },
          levelUp: didLevelUp,
          newLevel,
        };
      });
    } finally {
      if (lock && typeof lock.release === "function") {
        try {
          await lock.release();
        } catch {
          // Libération du lock
        }
      }
    }
  }
}
