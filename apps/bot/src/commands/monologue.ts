/**
 * LevelUp Discord Command /monologue
 * Invites bot to voice channel to record and transcribe oral restitution for the Architect
 * Reference: docs/01-PRD.md Section 1.7 & docs/03-APP_FLOW.md Section 7.2
 */

import {
  assertMasterUser,
  type RepliableInteraction,
} from "../guards/discordGuard";
import { type DiscordEmbedData } from "../embeds/holographicEmbeds";

export interface CommandInteractionWithVoiceOption extends RepliableInteraction {
  options: {
    getString: (name: string, required?: boolean) => string | null;
  };
}

export async function handleMonologueCommand(
  interaction: CommandInteractionWithVoiceOption,
) {
  if (!assertMasterUser(interaction)) {
    throw new Error(
      "Ce Système est lié de façon exclusive à son Monarque. Accès formellement prohibé.",
    );
  }

  const channel =
    interaction.options?.getString?.("salon_vocal") || "#sanctuaire-vocal";

  const embed: DiscordEmbedData = {
    title: "🎙️ [STATION D'ENREGISTREMENT VOCAL DU MONARQUE]",
    description: `Bot connecté au salon **${channel}**. Ingestion audio UDP Opus 48kHz active.`,
    color: 0x00f0ff,
    fields: [
      {
        name: "Protocole Socratique",
        value:
          "Déclamez votre synthèse de cours (IA, Cyber, Anglais). Dès que vous quittez ou dites *'Fin du rapport'*, l'Architecte évaluera votre prestation sur 20 points.",
        inline: false,
      },
      {
        name: "Pipeline Audio Local",
        value:
          "Conversion Opus -> PCM 16kHz -> Faster-Whisper CUDA INT8 (100% Souverain, Zéro Fuite)",
        inline: false,
      },
      {
        name: "Seuil de Réussite",
        value: "Score >= 14/20 requis pour valider la quête de restitution.",
        inline: true,
      },
      {
        name: "Carillon Harmonique",
        value: "Signal sonore 1318 Hz émis à l'initialisation.",
        inline: true,
      },
    ],
    footer: {
      text: "L'Architecte écoute. Rigueur absolue exigée.",
    },
    timestamp: new Date().toISOString(),
  };

  return {
    embeds: [embed],
    recordingStarted: true,
    channel,
  };
}
