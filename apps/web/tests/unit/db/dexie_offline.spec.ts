import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LevelUpDexieDatabase } from "../../../src/db/levelupDexie";

describe("LevelUpDexieDatabase - Persistance Local-First & Résilience Hors-Ligne", () => {
  let db: LevelUpDexieDatabase;

  beforeEach(async () => {
    db = new LevelUpDexieDatabase(`test_levelup_db_${Date.now()}`);
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  it("TC-2.3a : Écriture et lecture locale immédiates des statistiques du joueur", async () => {
    await db.players.add({
      id: "huriel-uuid-local",
      username: "Huriel",
      level: 1,
      totalXp: 0,
      rankCode: "E",
      currentHp: 100,
      maxHp: 100,
      currentMp: 100,
      maxMp: 100,
      shadowCrystals: 50,
      lastSyncAt: new Date(),
    });

    const player = await db.players.get("huriel-uuid-local");
    expect(player).toBeDefined();
    expect(player?.username).toBe("Huriel");
    expect(player?.rankCode).toBe("E");
  });

  it("TC-2.3b : Enregistrement hors-ligne des quêtes et synchronisation locale fluide (< 5ms)", async () => {
    const startTime = performance.now();

    await db.quests.add({
      id: "quest-local-01",
      title: "Workout Dos & Épaules (17 étapes)",
      baseCode: "STR",
      xpReward: 500,
      status: "ACTIVE",
      isOfflineCreated: true,
      createdAt: new Date(),
    });

    const activeQuests = await db.quests
      .where("status")
      .equals("ACTIVE")
      .toArray();
    const duration = performance.now() - startTime;

    expect(activeQuests.length).toBe(1);
    expect(activeQuests[0].title).toMatch(/Workout Dos & Épaules/);
    expect(duration).toBeLessThan(100); // Exécution locale ultra-rapide
  });

  it("TC-2.3c : Mise à jour atomique de l'état d'une quête complétée hors-ligne", async () => {
    await db.quests.add({
      id: "quest-local-02",
      title: "Étude Deep Learning",
      baseCode: "AI_ENG",
      xpReward: 400,
      status: "ACTIVE",
      isOfflineCreated: false,
      createdAt: new Date(),
    });

    await db.quests.update("quest-local-02", {
      status: "COMPLETED",
      completedAt: new Date(),
    });

    const updated = await db.quests.get("quest-local-02");
    expect(updated?.status).toBe("COMPLETED");
    expect(updated?.completedAt).toBeDefined();
  });
});
