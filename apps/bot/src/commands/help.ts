/**
 * LevelUp Discord Command /help
 * Displays comprehensive operational manual for all Slash Commands & System Laws
 * Reference: docs/01-PRD.md & docs/03-APP_FLOW.md
 */

import {
  assertMasterUser,
  type RepliableInteraction,
} from "../guards/discordGuard";
import { type DiscordEmbedData } from "../embeds/holographicEmbeds";

export async function handleHelpCommand(interaction: RepliableInteraction) {
  if (!assertMasterUser(interaction)) {
    throw new Error(
      "Ce Système est lié de façon exclusive à son Monarque. Accès formellement prohibé.",
    );
  }

  const embed: DiscordEmbedData = {
    title: "⚡ [LEVELUP THE SYSTEM : GUIDE OPÉRATIONNEL DISCORD]",
    description: "Manuel complet des 8 commandes Slash du Chasseur Souverain :",
    color: 0x00f0ff,
    fields: [
      {
        name: "`/status`",
        value: "Affiche le HUD holographique : Niveau, Rang, HP/MP, Cristaux.",
        inline: true,
      },
      {
        name: "`/valider id:<ID> preuve:<URL>`",
        value:
          "Valide l'accomplissement d'une quête avec lien de preuve irréfutable.",
        inline: true,
      },
      {
        name: "`/stats`",
        value: "Affiche l'Octogone des 8 Bases et la Moyenne Harmonique Sh.",
        inline: true,
      },
      {
        name: "`/programme [jour]`",
        value: "Consulte le planning Time-Blocking circadien (06h-22h).",
        inline: true,
      },
      {
        name: "`/cours sujet:<STR> duree:<MIN>`",
        value: "Lance une session chronométrée de Deep Work anti-distraction.",
        inline: true,
      },
      {
        name: "`/monologue [salon]`",
        value:
          "Connecte le bot en vocal pour enregistrement et évaluation socratique /20.",
        inline: true,
      },
      {
        name: "`/boutique [action] [item_id]`",
        value:
          "Accède au catalogue Shadow Shop et échange des Cristaux d'Ombres.",
        inline: true,
      },
      {
        name: "`/penalite`",
        value:
          "Inspecte l'état du pare-feu et les épreuves de purge en cas d'échec.",
        inline: true,
      },
      {
        name: "`/help`",
        value: "Affiche ce manuel opérationnel.",
        inline: true,
      },
    ],
    footer: {
      text: "Système Solo Leveling IRL — Conçu exclusivement pour Huriel.",
    },
    timestamp: new Date().toISOString(),
  };

  return {
    embeds: [embed],
  };
}
