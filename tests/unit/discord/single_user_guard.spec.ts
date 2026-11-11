import { describe, it, expect, vi, beforeEach } from "vitest";
import { assertMasterUser } from "../../../apps/bot/src/guards/discordGuard";
import type { ChatInputCommandInteraction } from "discord.js";

describe("Garde-Fou Single-User Discord (SingleUserGuard Security)", () => {
  const MASTER_USER_ID = "987654321012345678";

  beforeEach(() => {
    process.env.DISCORD_MASTER_USER_ID = MASTER_USER_ID;
  });

  it("TC-69 : Doit autoriser sans restriction le véritable propriétaire du Système", () => {
    const mockInteraction = {
      user: { id: MASTER_USER_ID },
      isRepliable: vi.fn().mockReturnValue(true),
      reply: vi.fn(),
    } as unknown as ChatInputCommandInteraction;

    const isAllowed = assertMasterUser(mockInteraction);
    expect(isAllowed).toBe(true);
    expect(mockInteraction.reply).not.toHaveBeenCalled();
  });

  it("TC-70 : Doit rejeter immédiatement et émettre un message éphémère si l'utilisateur est un tiers", () => {
    const mockInteraction = {
      user: { id: "111222333444555666" }, // ID Tiers Malveillant
      isRepliable: vi.fn().mockReturnValue(true),
      reply: vi.fn(),
    } as unknown as ChatInputCommandInteraction;

    const isAllowed = assertMasterUser(mockInteraction);
    expect(isAllowed).toBe(false);
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("Accès Refusé"),
        ephemeral: true, // Crucial : visible uniquement par l'attaquant
      }),
    );
  });

  it("TC-71 : Doit rejeter tout accès si la variable DISCORD_MASTER_USER_ID est absente", () => {
    delete process.env.DISCORD_MASTER_USER_ID;

    const mockInteraction = {
      user: { id: MASTER_USER_ID },
      isRepliable: vi.fn().mockReturnValue(true),
      reply: vi.fn(),
    } as unknown as ChatInputCommandInteraction;

    const isAllowed = assertMasterUser(mockInteraction);
    expect(isAllowed).toBe(false);
  });
});
