import { describe, it, expect, vi, beforeEach } from "vitest";
import { QuestService } from "../../apps/web/server/services/QuestService";

describe("QuestService - Attribution Atomique & Anti-Double Dépense (Redlock & Concurrence)", () => {
  let mockPrisma: any;
  let mockRedis: any;
  let questService: QuestService;

  beforeEach(() => {
    mockPrisma = {
      $transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => {
        const tx = {
          player: {
            findUniqueOrThrow: vi.fn().mockResolvedValue({
              id: "player-uuid-1",
              total_xp: "100",
              current_level: 1,
            }),
            update: vi.fn().mockResolvedValue({
              id: "player-uuid-1",
              total_xp: "600",
              current_level: 3,
            }),
          },
          quest: {
            findUniqueOrThrow: vi.fn().mockResolvedValue({
              id: "quest-uuid-1",
              player_id: "player-uuid-1",
              title: "Routine Matinale Calisthénie",
              status: "ACTIVE",
              reward_player_xp: 500,
              reward_stat_xp: 500,
              reward_shadow_crystals: 50,
              target_stat: "STR",
            }),
            update: vi.fn().mockResolvedValue({
              id: "quest-uuid-1",
              status: "COMPLETED",
            }),
          },
          baseStat: {
            findUniqueOrThrow: vi.fn().mockResolvedValue({
              id: "stat-uuid-1",
              code: "STR",
              current_xp: 0,
              level: 1,
            }),
            update: vi.fn().mockResolvedValue({
              id: "stat-uuid-1",
              current_xp: 500,
              level: 3,
            }),
          },
        };
        return cb(tx);
      }),
    };

    mockRedis = {
      xadd: vi.fn().mockResolvedValue("1700000000000-0"),
    };

    questService = new QuestService(mockPrisma, mockRedis);
  });

  it("devrait attribuer l'XP atomiquement et marquer la quête complétée", async () => {
    const result = await questService.completeQuestAtomic(
      "player-uuid-1",
      "quest-uuid-1",
      "VALIDATION_REPS_OK",
    );

    expect(result.levelUp).toBe(true);
    expect(result.newLevel).toBe(3);
    expect(result.rewards.player_xp).toBe(500);
    expect(mockRedis.xadd).toHaveBeenCalledWith(
      "levelup:stream:events",
      "*",
      "event_type",
      "LEVEL_UP",
      "payload",
      expect.any(String),
    );
  });

  it("devrait rejeter formellement la tentative de compléter une quête déjà validée (Anti-Double Dépense)", async () => {
    mockPrisma.$transaction = vi.fn(async (cb: (tx: any) => Promise<any>) => {
      const tx = {
        player: {
          findUniqueOrThrow: vi
            .fn()
            .mockResolvedValue({
              id: "player-uuid-1",
              total_xp: "600",
              current_level: 3,
            }),
        },
        quest: {
          findUniqueOrThrow: vi.fn().mockResolvedValue({
            id: "quest-uuid-1",
            player_id: "player-uuid-1",
            status: "COMPLETED",
          }),
        },
      };
      return cb(tx);
    });

    await expect(
      questService.completeQuestAtomic("player-uuid-1", "quest-uuid-1"),
    ).rejects.toThrowError(/QUEST_ALREADY_COMPLETED/);
  });
});
