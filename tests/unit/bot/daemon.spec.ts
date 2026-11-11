import { describe, it, expect } from "vitest";
import { LevelUpDiscordBot } from "../../../apps/bot/src";
import { HURIEL_DISCORD_ID } from "../../../apps/bot/src/guards/discordGuard";

describe("LevelUpDiscordBot Daemon", () => {
  it("initializes with default config and voice receiver", () => {
    const bot = new LevelUpDiscordBot();
    expect(bot.config.masterUserId).toBe(HURIEL_DISCORD_ID);
    expect(bot.voiceReceiver).toBeDefined();
  });

  it("calculates exponential backoff delays with jitter", () => {
    const bot = new LevelUpDiscordBot({ initialBackoffMs: 1000 });
    const delay0 = bot.calculateBackoffDelay(0);
    const delay1 = bot.calculateBackoffDelay(1);
    const delay2 = bot.calculateBackoffDelay(2);

    expect(delay0).toBeGreaterThanOrEqual(1000);
    expect(delay1).toBeGreaterThanOrEqual(2000);
    expect(delay2).toBeGreaterThanOrEqual(4000);
  });

  it("connects successfully and returns connected status", async () => {
    const bot = new LevelUpDiscordBot();
    const connected = await bot.connect();
    expect(connected).toBe(true);
    expect(bot.getStatus().isConnected).toBe(true);
  });

  it("dispatches slash command to appropriate handler", async () => {
    const bot = new LevelUpDiscordBot();
    const mockInteraction = {
      commandName: "status",
      user: { id: HURIEL_DISCORD_ID },
      options: { getString: () => null },
      reply: () => {},
    };

    const res = await bot.handleInteraction(mockInteraction);
    expect(res.embeds).toBeDefined();
    expect(res.embeds[0].title).toContain("STATUT DU MONARQUE");
  });
});
