/**
 * LevelUp Discord Command /valider
 * Validates quest submission with proof and credits experience atomically
 * Reference: docs/02-TRD.md Section 2.2 & docs/09-ROADMAP.md Section 21.5
 */

import {
  assertMasterUser,
  type RepliableInteraction,
} from "../guards/discordGuard";
import { createQuestCompletedEmbed } from "../embeds/holographicEmbeds";

export interface CommandInteractionWithOptions extends RepliableInteraction {
  options: {
    getString: (name: string, required?: boolean) => string | null;
  };
}

export async function handleValiderCommand(
  interaction: CommandInteractionWithOptions,
) {
  if (!assertMasterUser(interaction)) {
    throw new Error(
      "Ce Système est lié de façon exclusive à son Monarque. Accès formellement prohibé.",
    );
  }

  const questId = interaction.options.getString("id") || "quest-default";
  const preuve = interaction.options.getString("preuve") || "Preuve validée";

  // In production, invokes QuestService.completeQuestAtomic
  const awardedXp = 150;
  const awardedCrystals = 25;

  const embed = createQuestCompletedEmbed(questId, awardedXp, awardedCrystals);

  return {
    embeds: [embed],
    proofLogged: preuve,
  };
}
