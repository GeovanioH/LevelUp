import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleStatusCommand,
  handleValiderCommand,
  handleStatsCommand,
} from "../../../apps/bot/src/commands";
import { HURIEL_DISCORD_ID } from "../../../apps/bot/src/guards/discordGuard";

describe("Discord Slash Commands (/status, /valider, /stats)", () => {
  let mockInteraction: any;

  beforeEach(() => {
    mockInteraction = {
      user: {
        id: HURIEL_DISCORD_ID,
        username: "Huriel_Monarch",
      },
      options: {
        getString: vi.fn(),
      },
      reply: vi.fn().mockResolvedValue(undefined),
      deferReply: vi.fn().mockResolvedValue(undefined),
      editReply: vi.fn().mockResolvedValue(undefined),
    };
  });

  it("/status generates Solo Leveling HUD embed in under 250ms", async () => {
    const startTime = performance.now();
    const result = await handleStatusCommand(mockInteraction);
    const duration = performance.now() - startTime;

    // DoD: Execution time under 250ms
    expect(duration).toBeLessThan(250);
    expect(result).toBeDefined();
    expect(result.embeds).toHaveLength(1);

    const embed = result.embeds[0];
    expect(embed.title).toContain("STATUT DU MONARQUE");
    expect(embed.description).toContain("Huriel");
    expect(embed.fields.some((f: any) => f.name.includes("HP"))).toBe(true);
    expect(embed.fields.some((f: any) => f.name.includes("MP"))).toBe(true);
    expect(embed.fields.some((f: any) => f.value.includes("█"))).toBe(true); // ASCII gauge
  });

  it("/valider completes quest with proof and credits experience", async () => {
    mockInteraction.options.getString.mockImplementation((name: string) => {
      if (name === "id") return "quest-calisthenics-01";
      if (name === "preuve")
        return "Validation vidéo 17 étapes Dos & Épaules MediaPipe WASM";
      return null;
    });

    const result = await handleValiderCommand(mockInteraction);
    expect(result).toBeDefined();
    expect(result.embeds).toHaveLength(1);

    const embed = result.embeds[0];
    expect(embed.title).toContain("QUÊTE ACCOMPLIE");
    expect(embed.description).toContain("quest-calisthenics-01");
    expect(embed.fields.some((f: any) => f.name.includes("XP"))).toBe(true);
  });

  it("/stats displays 8 harmonic bases and weakest base alert", async () => {
    const result = await handleStatsCommand(mockInteraction);
    expect(result).toBeDefined();

    const embed = result.embeds[0];
    expect(embed.title).toContain("OCTOGONE DES 8 BASES");
    expect(embed.fields).toHaveLength(8);
    // Verifies all 8 bases are presented
    const baseNames = embed.fields.map((f: any) => f.name);
    expect(baseNames).toContain("B1 : Calisthénie (STR)");
    expect(baseNames).toContain("B4 : Algorithmique (AI_ENG)");
  });

  it("rejects unauthorized third-party user interactions strictly", async () => {
    mockInteraction.user.id = "999999999999999999"; // Intruder ID

    await expect(handleStatusCommand(mockInteraction)).rejects.toThrow(
      /Ce Système est lié de façon exclusive à son Monarque/,
    );
  });
});
