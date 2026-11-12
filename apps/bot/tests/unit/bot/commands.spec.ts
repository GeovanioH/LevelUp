import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleStatusCommand,
  handleValiderCommand,
  handleStatsCommand,
  handleProgrammeCommand,
  handleCoursCommand,
  handleMonologueCommand,
  handleBoutiqueCommand,
  handlePenaliteCommand,
  handleHelpCommand,
} from "../../../src/commands";
import { HURIEL_DISCORD_ID } from "../../../src/guards/discordGuard";

describe("Discord Slash Commands (Complete V1.0 Suite)", () => {
  let mockInteraction: any;

  beforeEach(() => {
    mockInteraction = {
      user: {
        id: HURIEL_DISCORD_ID,
        username: "Huriel_Monarch",
      },
      options: {
        getString: vi.fn(),
        getInteger: vi.fn(),
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

    expect(duration).toBeLessThan(250);
    expect(result).toBeDefined();
    expect(result.embeds).toHaveLength(1);

    const embed = result.embeds[0];
    expect(embed.title).toContain("STATUT DU MONARQUE");
    expect(embed.description).toContain("Huriel");
    expect(embed.fields.some((f: any) => f.name.includes("HP"))).toBe(true);
    expect(embed.fields.some((f: any) => f.name.includes("MP"))).toBe(true);
    expect(embed.fields.some((f: any) => f.value.includes("█"))).toBe(true);
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
    const baseNames = embed.fields.map((f: any) => f.name);
    expect(baseNames).toContain("B1 : Calisthénie (STR)");
    expect(baseNames).toContain("B4 : Algorithmique (AI_ENG)");
  });

  it("/programme displays time-blocking daily schedule", async () => {
    mockInteraction.options.getString.mockReturnValue("demain");
    const result = await handleProgrammeCommand(mockInteraction);
    expect(result).toBeDefined();
    expect(result.embeds).toHaveLength(1);
    expect(result.embeds[0].title).toContain("PLANIFICATEUR DU MONARQUE");
    expect(result.embeds[0].fields.length).toBeGreaterThanOrEqual(8);
  });

  it("/cours initiates timed Deep Work session", async () => {
    mockInteraction.options.getString.mockReturnValue(
      "Architecture Transformers",
    );
    mockInteraction.options.getInteger.mockReturnValue(120);
    const result = await handleCoursCommand(mockInteraction);
    expect(result).toBeDefined();
    expect(result.sessionActive).toBe(true);
    expect(result.embeds[0].title).toContain("SESSION DE DEEP WORK ENGAGÉE");
  });

  it("/monologue prepares voice recording and socratic evaluation", async () => {
    mockInteraction.options.getString.mockReturnValue("#sanctuaire-vocal");
    const result = await handleMonologueCommand(mockInteraction);
    expect(result).toBeDefined();
    expect(result.recordingStarted).toBe(true);
    expect(result.embeds[0].title).toContain("STATION D'ENREGISTREMENT VOCAL");
  });

  it("/boutique handles catalog consultation and item purchase", async () => {
    const catalogResult = await handleBoutiqueCommand(mockInteraction);
    expect(catalogResult.embeds[0].title).toContain("LA BOUTIQUE DES OMBRES");

    mockInteraction.options.getString.mockImplementation((name: string) => {
      if (name === "action") return "acheter";
      if (name === "item_id") return "item-claude-pro";
      return null;
    });

    const buyResult = await handleBoutiqueCommand(mockInteraction);
    expect(buyResult.embeds[0].title).toContain("TRANSACTION CONFIRMÉE");
  });

  it("/penalite inspects Penalty Zone firewall status and survival quest", async () => {
    const result = await handlePenaliteCommand(mockInteraction);
    expect(result.embeds[0].title).toContain("ZONE DE PÉNALITÉ");
    expect(result.penaltyActive).toBe(false);
  });

  it("/help provides full command reference manual", async () => {
    const result = await handleHelpCommand(mockInteraction);
    expect(result.embeds[0].title).toContain("GUIDE OPÉRATIONNEL DISCORD");
    expect(result.embeds[0].fields.length).toBeGreaterThanOrEqual(8);
  });

  it("rejects unauthorized third-party user interactions strictly", async () => {
    mockInteraction.user.id = "999999999999999999";

    await expect(handleStatusCommand(mockInteraction)).rejects.toThrow(
      /Ce Système est lié de façon exclusive à son Monarque/,
    );
  });
});
