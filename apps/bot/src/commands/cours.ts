/**
 * LevelUp Discord Command /cours
 * Launches a timed Deep Work study block with distraction firewall notice
 * Reference: docs/01-PRD.md Section 1.7 & docs/03-APP_FLOW.md Section 7.1
 */

import {
  assertMasterUser,
  type RepliableInteraction,
} from "../guards/discordGuard";
import { createDeepWorkStartEmbed } from "../embeds/holographicEmbeds";

export interface CommandInteractionWithStudyOptions extends RepliableInteraction {
  options: {
    getString: (name: string, required?: boolean) => string | null;
    getInteger?: (name: string, required?: boolean) => number | null;
  };
}

export async function handleCoursCommand(
  interaction: CommandInteractionWithStudyOptions,
) {
  if (!assertMasterUser(interaction)) {
    throw new Error(
      "Ce Système est lié de façon exclusive à son Monarque. Accès formellement prohibé.",
    );
  }

  const sujet =
    interaction.options?.getString?.("sujet") || "Deep Learning & MLOps";
  const duree = interaction.options?.getInteger?.("duree") || 90;

  const embed = createDeepWorkStartEmbed(sujet, duree);

  return {
    embeds: [embed],
    sessionActive: true,
    subject: sujet,
    durationMinutes: duree,
  };
}
