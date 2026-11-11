export const HURIEL_DISCORD_ID =
  process.env.DISCORD_MASTER_USER_ID || "789123456789012345";

export interface RepliableInteraction {
  user: {
    id: string;
    username?: string;
  };
  isRepliable?: () => boolean;
  reply: (options: {
    content: string;
    ephemeral?: boolean;
  }) => Promise<unknown> | void;
}

/**
 * Garde-fou souverain interdisant toute interaction Discord venant d'un tiers.
 * Seul Huriel (DISCORD_MASTER_USER_ID) a le droit d'éveiller ou d'interagir avec le Système.
 */
export function assertMasterUser(interaction: RepliableInteraction): boolean {
  const masterId = process.env.DISCORD_MASTER_USER_ID || HURIEL_DISCORD_ID;

  if (interaction.user.id === masterId) {
    return true;
  }

  // Émission d'un message d'accès refusé éphémère (invisible aux autres membres)
  interaction.reply({
    content:
      "Accès Refusé : Ce Système est lié de façon exclusive à son Monarque. Accès formellement prohibé.",
    ephemeral: true,
  });

  return false;
}
