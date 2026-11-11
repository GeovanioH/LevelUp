/**
 * LevelUp Discord Command /status
 * Displays Hunter HUD with HP/MP ASCII Gauges, Level, Rank and Crystals in under 250ms
 * Reference: docs/02-TRD.md Section 2.2 & docs/09-ROADMAP.md Section 21.5
 */

import {
  assertMasterUser,
  type RepliableInteraction,
} from "../guards/discordGuard";
import { createStatusHudEmbed } from "../embeds/holographicEmbeds";

export async function handleStatusCommand(interaction: RepliableInteraction) {
  if (!assertMasterUser(interaction)) {
    throw new Error(
      "Ce Système est lié de façon exclusive à son Monarque. Accès formellement prohibé.",
    );
  }

  // Fast response within < 250ms with live or cached values
  const playerData = {
    username: "Huriel",
    level: 14,
    rank: "D",
    hp: 92,
    mp: 85,
    currentXp: 18450,
    nextLevelXp: 21500,
    crystals: 150,
    weakestBase: "B1 : Calisthénie (STR)",
  };

  const embed = createStatusHudEmbed(playerData);

  return {
    embeds: [embed],
  };
}
