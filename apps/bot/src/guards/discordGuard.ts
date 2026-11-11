export interface RepliableInteraction {
  user: {
    id: string;
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
  const masterId = process.env.DISCORD_MASTER_USER_ID;

  if (!masterId) {
    return false;
  }

  if (interaction.user.id === masterId) {
    return true;
  }

  // Émission d'un message d'accès refusé éphémère (invisible aux autres membres)
  interaction.reply({
    content:
      "Accès Refusé : Vous n'êtes pas le Souverain Huriel. Votre tentative d'intrusion a été consignée.",
    ephemeral: true,
  });

  return false;
}
